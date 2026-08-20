export type ThemeId =
  | "sophisticated-dark"
  | "light-minimal"
  | "dark-obsidian"
  | "tokyo-neon"
  | "sepia-academia"
  | "nordic-frost"
  | "emerald-forest"
  | "cyberpunk-gold"
  | "sunset-rose";

export type FontStyle = "sans" | "serif" | "mono" | "dyslexic";
export type PaperPattern = "blank" | "ruled" | "grid" | "dots" | "cornell";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  isDark: boolean;
  accentColor: string;
  fontStyle: FontStyle;
  paperPattern: PaperPattern;
}

export interface Notebook {
  id: string;
  title: string;
  icon: string;
  color: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Section {
  id: string;
  notebookId: string;
  title: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NoteSummary {
  mode: "key_points" | "executive" | "cornell" | "cheat_sheet" | "eli5";
  text: string;
  generatedAt: string;
}

export interface Note {
  id: string;
  notebookId: string;
  sectionId: string;
  title: string;
  content: string;
  cornellCues?: string;
  cornellSummary?: string;
  tags: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  status: "draft" | "in-progress" | "mastered" | "review-needed";
  drawingData?: string; // base64 / svg image data
  summary?: NoteSummary;
  audioNote?: {
    durationSec: number;
    transcription?: string;
    recordedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  noteId: string;
  question: string;
  answer: string;
  hint?: string;
  category?: string;
  difficulty: "easy" | "medium" | "hard";
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: string;
  lastReviewedDate?: string;
  masteryScore?: number; // 0 to 100
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "true_false" | "fill_blank";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface Quiz {
  id: string;
  noteId: string;
  noteTitle: string;
  title: string;
  estimatedMinutes?: number;
  questions: QuizQuestion[];
  score?: number;
  totalQuestions?: number;
  createdAt?: string;
  completedAt?: string;
}

export interface ConceptNode {
  id: string;
  label: string;
  category: "core" | "subtopic" | "example" | "principle";
  description?: string;
  x?: number;
  y?: number;
}

export interface ConceptLink {
  source: string;
  target: string;
  relation: string;
}

export interface ConceptMap {
  centralTheme: string;
  nodes: ConceptNode[];
  links: ConceptLink[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface StudyStats {
  streakDays: number;
  lastStudiedDate: string;
  totalCardsStudied: number;
  cardsMastered: number;
  quizzesCompleted: number;
  quizzesTaken?: number;
  averageQuizScore: number;
  totalStudyMinutes: number;
  activityHistory: { date: string; count: number }[];
}

export type ActiveView =
  | "notes"
  | "flashcards"
  | "quizzes"
  | "concept-map"
  | "study-stats";
