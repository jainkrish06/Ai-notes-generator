import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
const PORT = 3000;

// Support large file uploads (PDF, DOCX) as base64 in JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please add your key in the Secrets panel.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Robust Gemini execution helper with fast timeout fallback
async function generateWithGeminiRobust(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout on ${model}`)), 7000)
      );

      const response = await Promise.race([callPromise, timeoutPromise]);
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini] Model ${model} failed or timed out:`, err?.message || err);
    }
  }

  throw lastError || new Error('The AI service is temporarily busy. Please try again in a few moments.');
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Document Text Extraction API
app.post('/api/extract-text', async (req, res) => {
  try {
    const { fileName, fileType, base64Data } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'No file data received.' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    let extractedText = '';
    let pageCount = 1;
    let warning: string | undefined;

    const lowerName = (fileName || '').toLowerCase();

    if (lowerName.endsWith('.pdf') || fileType === 'application/pdf') {
      try {
        const data = await pdfParse(buffer);
        extractedText = data.text || '';
        pageCount = data.numpages || 1;

        const trimmed = extractedText.trim();
        if (trimmed.length < 30) {
          warning = 'This PDF contains very little extractable text. It may be a scanned image or bitmap without an embedded text layer (OCR required).';
        }
      } catch (pdfErr: any) {
        return res.status(422).json({
          error: `Failed to parse PDF document: ${pdfErr.message || 'Corrupted or password-protected PDF.'}`,
        });
      }
    } else if (
      lowerName.endsWith('.docx') ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
        if (result.messages && result.messages.length > 0) {
          console.warn('Mammoth warnings:', result.messages);
        }
      } catch (docxErr: any) {
        return res.status(422).json({
          error: `Failed to parse DOCX document: ${docxErr.message || 'Invalid Word document.'}`,
        });
      }
    } else if (lowerName.endsWith('.txt') || fileType === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    } else {
      return res.status(400).json({
        error: `Unsupported file format. Supported formats are .pdf, .docx, and .txt.`,
      });
    }

    const cleanText = extractedText.replace(/\r\n/g, '\n').trim();
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

    if (cleanText.length === 0) {
      return res.status(422).json({
        error: warning || 'The uploaded file does not contain readable text.',
        warning,
      });
    }

    return res.json({
      text: cleanText,
      wordCount,
      pageCount,
      fileName,
      warning,
    });
  } catch (err: any) {
    console.error('Text extraction error:', err);
    return res.status(500).json({
      error: `Error extracting text: ${err.message || 'Internal server error'}`,
    });
  }
});

// AI Note Generation API
app.post('/api/generate-notes', async (req, res) => {
  try {
    const {
      sourceText,
      subject,
      topic,
      educationLevel = 'college',
      noteType = 'detailed',
      length = 'medium',
      sourceLanguage = 'Auto-detect',
      outputLanguage = 'English',
    } = req.body;

    if (!sourceText || typeof sourceText !== 'string' || sourceText.trim().length < 15) {
      return res.status(400).json({
        error: 'Please provide at least 15 characters of source text, lecture notes, or document content.',
      });
    }

    const ai = getGeminiClient();

    // Prepare length guidelines
    let lengthInstruction = '';
    if (length === 'short') {
      lengthInstruction = 'Keep the output concise, high-yield, punchy, and focused on essential points.';
    } else if (length === 'detailed') {
      lengthInstruction = 'Provide deep, comprehensive, and exhaustive coverage with clear examples, nuances, edge cases, and derivations.';
    } else {
      lengthInstruction = 'Provide a balanced, thorough, and well-structured coverage without unnecessary fluff.';
    }

    // Prepare education level perspective
    const educationPerspective: Record<string, string> = {
      school: 'Tailor explanations for a K-12 school student (grades 6-12). Use simple everyday analogies, intuitive breakdowns, and avoid overly dense academic jargon without explanation.',
      college: 'Tailor explanations for an undergraduate college student. Maintain academic rigor, precise terminology, logical structures, and practical illustrations.',
      engineering: 'Tailor explanations for engineering and technical students. Include technical accuracy, mathematical formulations, architecture diagrams or pseudocode/schematics where applicable, edge cases, and practical implementation context.',
      general: 'Tailor explanations for a general adult learner or professional. Focus on clarity, real-world utility, conceptual understanding, and engaging structure.',
    };

    const targetPerspective = educationPerspective[educationLevel] || educationPerspective.college;

    // Handle Flashcards generation specifically as structured JSON
    if (noteType === 'flashcards') {
      const flashcardPrompt = `
You are NoteMind AI, an expert educational content generator.
Convert the following source material into a high-quality study deck of interactive flashcards.

Subject: ${subject || 'General'}
Topic: ${topic || 'Key Concepts'}
Target Audience: ${targetPerspective}
Source Language: ${sourceLanguage}
Output Language: ${outputLanguage}
Deck Depth: ${lengthInstruction}

Source Material:
"""
${sourceText.slice(0, 75000)}
"""

CRITICAL INSTRUCTIONS:
1. Generate between 8 to 20 comprehensive flashcards covering all core concepts, definitions, formulas, and tricky nuances.
2. Front: A crisp question, concept prompt, or scenario that tests active recall.
3. Back: A clear, accurate, complete explanation with bullet points if helpful.
4. Distinguish facts found directly in the source from logical extrapolations. Do not hallucinate false information.
5. Provide the response strictly in JSON format matching this schema:
{
  "title": "Clear deck title",
  "summary": "Brief 1-2 sentence overview of the flashcard deck",
  "cards": [
    {
      "id": "1",
      "front": "Question or prompt",
      "back": "Answer and concise explanation",
      "category": "e.g., Core Concept / Definition / Application / Formula"
    }
  ]
}
`;

      const response = await generateWithGeminiRobust(ai, {
        contents: flashcardPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (pErr) {
        // Fallback cleanup if markdown backticks were returned
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      return res.json({
        type: 'flashcards',
        title: parsed.title || `${subject || 'Study'} Flashcards`,
        summary: parsed.summary || '',
        flashcards: (parsed.cards || []).map((c: any, idx: number) => ({
          id: c.id || String(idx + 1),
          front: c.front || '',
          back: c.back || '',
          category: c.category || 'General',
          mastered: false,
        })),
        content: `### ${parsed.title || 'Flashcards'}\n\n${parsed.summary || ''}\n\n*Deck contains ${(parsed.cards || []).length} interactive cards.*`,
      });
    }

    // Handle Quiz generation specifically as structured JSON
    if (noteType === 'quiz') {
      const quizPrompt = `
You are NoteMind AI, an expert exam creator.
Create a challenging, high-yield Multiple Choice Quiz (MCQ) based strictly on the provided source content.

Subject: ${subject || 'General'}
Topic: ${topic || 'Comprehensive'}
Target Audience: ${targetPerspective}
Output Language: ${outputLanguage}
Length/Detail: ${lengthInstruction}

Source Material:
"""
${sourceText.slice(0, 75000)}
"""

CRITICAL INSTRUCTIONS:
1. Create 5 to 15 thoughtful multiple-choice questions testing both conceptual understanding and practical application.
2. Provide exactly 4 options per question.
3. Specify answerIndex (0, 1, 2, or 3) indicating the single correct option.
4. Provide a thorough, educational explanation for why that answer is correct and why other choices are wrong.
5. Strictly adhere to facts in the source.
6. Provide the response strictly in JSON format matching this schema:
{
  "title": "Quiz Title",
  "description": "Brief description of topics tested",
  "questions": [
    {
      "id": "1",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Detailed explanation of correct answer"
    }
  ]
}
`;

      const response = await generateWithGeminiRobust(ai, {
        contents: quizPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (pErr) {
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      return res.json({
        type: 'quiz',
        title: parsed.title || `${subject || 'Topic'} Mastery Quiz`,
        description: parsed.description || '',
        quiz: (parsed.questions || []).map((q: any, idx: number) => ({
          id: q.id || String(idx + 1),
          question: q.question,
          options: q.options || [],
          answerIndex: typeof q.answerIndex === 'number' ? q.answerIndex : 0,
          explanation: q.explanation || '',
        })),
        content: `### ${parsed.title || 'Mastery Quiz'}\n\n${parsed.description || ''}\n\n*Interactive quiz with ${(parsed.questions || []).length} questions.*`,
      });
    }

    // Specific note type directives
    const noteTypeDirectives: Record<string, string> = {
      detailed: `Generate comprehensive, structured study notes.
Include:
- An Executive Overview and core importance.
- Clear Section Headings (##) and Subheadings (###).
- Key Concepts with in-depth breakdowns.
- Exact Definitions with contextual explanations.
- Real-world Examples, Case Studies, or Code/Pseudocode/Formulas where relevant.
- Important Distinctions & Common Misconceptions.
- Summary Table or Key Takeaways bullet list.`,

      revision: `Generate high-yield Quick Revision Notes (Cram Sheet).
Include:
- ⚡ Quick Recap / 60-Second Summary.
- 📌 Must-Know Bullet Points organized by topic.
- ⚠️ High-Frequency Exam Traps & Common Mistakes.
- 💡 Rapid Memory Mnemonics or Shortcuts.
- 🎯 Last-Minute Cheat Sheet bullet points.`,

      summary: `Generate a structured Chapter Summary.
Include:
- Core Thesis and Central Themes.
- Logical Section-by-Section narrative progression.
- Major Findings, Deductions, or Arguments.
- Synthesis of key outcomes and implications.`,

      definitions: `Generate a definitive Glossary & Key Definitions sheet.
Include:
- Terms arranged alphabetically or conceptually grouped.
- Term name in bold.
- Formal academic definition.
- Plain-English layman explanation.
- Formula/Notation if applicable.
- Concrete illustrative example for each.`,

      qa: `Generate Important Questions & Answers.
Include:
- High-probability conceptual exam questions.
- Short-answer questions with concise model answers.
- Long-form essay/analytical questions with structured answers (introduction, key points, conclusion).
- Marking scheme / key keywords required for full credit.`,

      viva: `Generate Viva / Oral Exam Preparation Guide.
Include:
- Rapid-Fire Oral Questions examiners love to ask.
- Tricky 'Why' and 'What If' follow-up questions.
- Model spoken answers that sound confident, concise, and academically sound.
- Red Flags: What NOT to say to the examiner.
- Pro Tips on body language, diagram sketching on the whiteboard, and handling unfamiliar questions.`,

      formula: `Generate a dedicated Formula & Equations Sheet.
Include:
- Clean mathematical/scientific expressions using standard notation.
- Variable definitions with their respective SI units or dimensions.
- Conditions, assumptions, and domain of applicability for each formula.
- Quick worked numerical example demonstrating formula usage.`,

      step_by_step: `Generate Step-by-Step Procedural Explanations.
Include:
- Algorithm, workflow, or derivation broken down into numbered sequential phases.
- Input requirements and preconditions for each step.
- What happens at each step with internal logic clarified.
- Verification checkpoint or expected output.
- Potential edge cases and troubleshooting tips.`,
    };

    const typeInstruction = noteTypeDirectives[noteType] || noteTypeDirectives.detailed;

    const systemPrompt = `
You are NoteMind AI, an elite academic tutor, research assistant, and educational writer.
Your mission is to transform raw documents, lecture notes, transcripts, or textbook chapters into crystal-clear, accurate, and beautifully formatted educational notes.

Subject: ${subject || 'General Study'}
Topic: ${topic || 'Key Concepts'}
Target Education Level: ${targetPerspective}
Target Note Format: ${noteType}
Output Language: ${outputLanguage}
Output Depth: ${lengthInstruction}

SOURCE CONTENT:
"""
${sourceText.slice(0, 85000)}
"""

ACCURACY AND FACTUAL INTEGRITY:
1. Preserve absolute factual accuracy based strictly on the source material provided.
2. Do NOT invent citations, false authors, or non-existent page numbers.
3. If an explanation requires introducing an intuitive real-world analogy not explicitly in the text, present it clearly as an illustrative example.
4. If the source material is sparse or missing context on a critical subtopic, state: "[Note: The source text briefly touches upon this; standard domain context indicates...]" to clearly distinguish source facts from external clarification.
5. Format output using clean, elegant Markdown:
   - Use # for the main document title.
   - Use ## for main thematic sections.
   - Use ### for subsections.
   - Use bold text for key terms.
   - Use tables for comparative analysis.
   - Use blockquotes (>) for definitions, golden rules, or exam warnings.
   - Use backticks for equations, code, or technical parameters.
   - End with a dedicated "### Key Takeaways" section.

FORMATTING REQUIREMENT:
The first line of the output MUST be the document title as: "# <Title of Notes>".
Followed immediately by a 2-line subtitle stating subject, target level, and summary.
`;

    const response = await generateWithGeminiRobust(ai, {
      contents: systemPrompt,
      config: {
        temperature: 0.3,
      },
    });

    const markdownOutput = response.text || '';
    if (!markdownOutput.trim()) {
      return res.status(502).json({
        error: 'The AI model returned an empty response. Please check your source text and try again.',
      });
    }

    // Extract title from the first heading if present
    const firstLineMatch = markdownOutput.match(/^#\s+(.+)$/m);
    const generatedTitle = firstLineMatch ? firstLineMatch[1].trim() : `${subject || topic || 'Study'} Notes`;

    return res.json({
      type: noteType,
      title: generatedTitle,
      content: markdownOutput,
      wordCount: markdownOutput.split(/\s+/).length,
    });
  } catch (err: any) {
    console.error('Note generation error:', err);
    return res.status(500).json({
      error: `Failed to generate notes: ${err.message || 'Internal AI service error'}`,
    });
  }
});

// Note Refinement & Follow-up Q&A API
app.post('/api/refine-note', async (req, res) => {
  try {
    const {
      noteContent,
      sourceText = '',
      action, // 'expand' | 'shorten' | 'simplify' | 'elaborate' | 'regenerate' | 'qa'
      selection,
      question,
      outputLanguage = 'English',
    } = req.body;

    if (!noteContent) {
      return res.status(400).json({ error: 'Note content is required for refinement.' });
    }

    const ai = getGeminiClient();

    let prompt = '';
    if (action === 'qa') {
      if (!question) {
        return res.status(400).json({ error: 'Please provide a question.' });
      }
      prompt = `
You are NoteMind AI. A student is asking a follow-up question regarding their notes and the original study material.

ORIGINAL SOURCE MATERIAL (if available):
"""
${(sourceText || '').slice(0, 30000)}
"""

CURRENT NOTES:
"""
${noteContent.slice(0, 30000)}
"""

STUDENT'S QUESTION:
"${question}"

ANSWER INSTRUCTIONS:
- Answer directly, clearly, and concisely in ${outputLanguage}.
- Base your answer on the provided notes and source material.
- If the answer cannot be determined from the material, politely explain what information is missing.
- Do NOT fabricate citations or external sources.
- Use markdown formatting with bullet points where appropriate.
`;
    } else {
      const actionDescriptions: Record<string, string> = {
        expand: 'Expand this section with deeper technical depth, additional real-world examples, and detailed explanations.',
        shorten: 'Condense and summarize this section into high-yield, punchy bullet points without losing critical definitions.',
        simplify: 'Explain this concept using simple language, intuitive everyday analogies, and clear step-by-step logic (ELIF5 style).',
        elaborate: 'Provide comprehensive mathematical or conceptual elaboration for this section.',
        regenerate: 'Regenerate this section for maximum clarity, readability, and academic polish.',
      };

      const actionText = actionDescriptions[action] || 'Improve and refine this section.';

      prompt = `
You are NoteMind AI, an expert academic editor.
Your task is to refine the following selected section from a student's study notes.

Goal: ${actionText}
Target Language: ${outputLanguage}

SELECTED SECTION TO REFINE:
"""
${selection || noteContent.slice(0, 10000)}
"""

FULL NOTE CONTEXT:
"""
${noteContent.slice(0, 20000)}
"""

INSTRUCTIONS:
- Return ONLY the updated, polished section in clean Markdown.
- Preserve factual accuracy.
- Do not repeat the entire document, just the improved version of the target section.
`;
    }

    const response = await generateWithGeminiRobust(ai, {
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    const resultText = response.text || '';
    return res.json({ result: resultText.trim() });
  } catch (err: any) {
    console.error('Refine note error:', err);
    return res.status(500).json({
      error: `Refinement error: ${err.message || 'Failed to refine note'}`,
    });
  }
});

// Configure Vite middleware in development or serve static in production
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NoteMind AI server listening on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start NoteMind server:', err);
  process.exit(1);
});
