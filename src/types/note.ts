export type EducationLevel = 'school' | 'college' | 'engineering' | 'general';

export type NoteType =
  | 'detailed'
  | 'revision'
  | 'summary'
  | 'definitions'
  | 'qa'
  | 'viva'
  | 'flashcards'
  | 'quiz'
  | 'formula'
  | 'step_by_step';

export type NoteLength = 'short' | 'medium' | 'detailed';

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  category?: string;
  mastered?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  userSelected?: number;
}

export interface NoteDocument {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  educationLevel: EducationLevel;
  noteType: NoteType;
  length: NoteLength;
  sourceLanguage: string;
  outputLanguage: string;
  content: string; // Markdown formatted
  flashcards?: FlashcardItem[];
  quiz?: QuizQuestion[];
  sourceSnippet?: string;
  sourceWordCount?: number;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  isFavorite?: boolean;
}

export interface GenerationParams {
  sourceText: string;
  subject: string;
  topic?: string;
  educationLevel: EducationLevel;
  noteType: NoteType;
  length: NoteLength;
  sourceLanguage: string;
  outputLanguage: string;
}

export interface UserPreferences {
  defaultEducationLevel: EducationLevel;
  defaultOutputLanguage: string;
  defaultNoteLength: NoteLength;
  defaultNoteType: NoteType;
}

export type ActivityActionType =
  | 'create_note'
  | 'update_note'
  | 'delete_note'
  | 'practice_flashcards'
  | 'complete_quiz'
  | 'export_note'
  | 'ask_assistant';

export interface ActivityItem {
  id: string;
  action: ActivityActionType;
  title: string;
  targetId?: string;
  targetType?: 'note' | 'flashcards' | 'quiz';
  timestamp: number;
  details?: string;
}
