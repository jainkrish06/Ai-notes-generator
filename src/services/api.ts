import { GenerationParams, NoteDocument } from '../types/note';

export interface ExtractResult {
  text: string;
  wordCount: number;
  pageCount: number;
  fileName: string;
  warning?: string;
}

// Convert a File object to base64 string
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip metadata prefix e.g. "data:application/pdf;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Extract real text on server from PDF, DOCX, or TXT
export async function extractDocumentText(file: File): Promise<ExtractResult> {
  // Validate file size (max 20MB)
  const maxBytes = 20 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('File exceeds the 20MB limit. Please upload a smaller document.');
  }

  const base64Data = await fileToBase64(file);

  const response = await fetch('/api/extract-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      base64Data,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to extract text from document.');
  }

  return data as ExtractResult;
}

// Generate notes with Gemini on the server
export async function generateNotesApi(params: GenerationParams): Promise<Partial<NoteDocument>> {
  const response = await fetch('/api/generate-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate notes. Please try again.');
  }

  return data;
}

// Refine a section (expand, shorten, simplify, regenerate)
export async function refineNoteApi(params: {
  noteContent: string;
  sourceText?: string;
  action: 'expand' | 'shorten' | 'simplify' | 'elaborate' | 'regenerate';
  selection: string;
  outputLanguage?: string;
}): Promise<string> {
  const response = await fetch('/api/refine-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to refine section.');
  }

  return data.result;
}

// Ask follow-up question grounded in the note and source
export async function askQuestionApi(params: {
  noteContent: string;
  sourceText?: string;
  question: string;
  outputLanguage?: string;
}): Promise<string> {
  const response = await fetch('/api/refine-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      action: 'qa',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get answer.');
  }

  return data.result;
}

// Health check
export async function checkServerHealth(): Promise<{ status: string; hasGeminiKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (e: any) {
    return { status: 'error', hasGeminiKey: false, model: 'unknown' };
  }
}
