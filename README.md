# NoteMind AI 🧠📚

**NoteMind AI** is an intelligent, full-stack educational study workspace that transforms dense PDFs, Word documents, textbooks, and lecture transcripts into structured study notes, active recall flashcards, and multiple-choice quizzes.

Powered by Google's Gemini models (`gemini-3.8-flash` with resilient fallback) and built with a modern React + Node.js full-stack architecture.

---

## ✨ Features

- **Document Text Extraction**: Upload `.pdf`, `.docx`, or `.txt` files (up to 20MB) with real server-side text extraction and scanned document/OCR detection.
- **10 Dedicated Study Formats**:
  1. Detailed Study Notes (structured headings, comparative tables, definitions)
  2. Quick Revision (Cram sheets, mnemonics, exam pitfalls)
  3. Chapter Summaries (chronological flow and deductions)
  4. Key Definitions (formal glossary with everyday layman analogies)
  5. Important Questions & Answers (short-form and long-form essay Q&A)
  6. Viva & Oral Exam Preparation (rapid-fire oral questions, examiner tips)
  7. Interactive Flashcards (active recall flip cards with spaced repetition)
  8. Multiple-Choice Quizzes (MCQs with answer validation and comprehensive explanations)
  9. Formula & Equations Sheets (variables, units, and worked derivations)
  10. Step-by-Step Explanations (sequential breakdown and verification checkpoints)
- **4 Education Levels**: Tailored outputs for School (K-12), College / Undergraduate, Engineering / Technical, or General Learning.
- **Grounded AI Study Assistant**: Interactive contextual Q&A drawer strictly grounded in the source material without fabricated citations.
- **In-Place Section Refinement**: Transform sections on the fly—Simplify (ELIF5), Expand in-depth, Condense into bullet points, or Elaborate derivations.
- **Full-Featured Export**:
  - Formatted PDF with headers, margins, and page numbers
  - Markdown (`.md`)
  - Plain Text (`.txt`)
- **Interactive Flashcard Deck Viewer**: 3D flip card animation, keyboard navigation (`Space` to flip, arrows to navigate, `M` to mark mastered), shuffle, and progress bars.
- **Interactive Quiz Player**: Instant feedback or exam mode with detailed explanations for every question.
- **Recent Activity Tracking**: Chronological learning progress timeline tracking note creation, revisions, flashcards mastered, and quiz scores.
- **Persistent Local Library & Cloud Readiness**: Automatic browser storage persistence, search, tag filters, and portable JSON backup/restore.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, jsPDF
- **Backend**: Node.js, Express, tsx
- **AI Engine**: Google Gen AI SDK (`@google/genai`), Gemini 3.8 Flash
- **Document Processing**: `pdf-parse`, `mammoth`
- **Build Tool**: Vite

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/notemind-ai.git
cd notemind-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Add your Gemini API Key:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```
> You can obtain a free API key from [Google AI Studio](https://aistudio.google.com/).

### 4. Start the development server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📦 Production Build

To build the client and prepare for deployment:
```bash
npm run build
npm start
```

---

## 🔒 Security & Privacy

- All Gemini API calls run strictly on the Node.js backend.
- API keys and user credentials are never exposed to the client or browser bundles.
- All study notes are stored securely on the user's device with optional JSON backup.

---

## 📄 License

This project is licensed under the Apache 2.0 License.
