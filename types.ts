export interface Note {
  summary: string;
}

export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface GeneratedContent {
  notes: Note;
  questions: Question[];
  flashcards: Flashcard[];
}

export interface HistoryItem {
  id: string;
  prompt: string;
  content: GeneratedContent;
  timestamp: string;
}

export interface FileData {
  name: string;
  type: 'text' | 'image' | 'audio' | 'pdf' | 'ppt';
  content: string; // For text, this is the raw text. For files, this is base64.
  mimeType?: string; // Only for files
}