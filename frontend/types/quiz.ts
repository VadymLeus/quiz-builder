export const QUESTION_TYPES = ['BOOLEAN', 'INPUT', 'CHECKBOX'] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_LABELS: Record<QuestionType, string> = {
  BOOLEAN: 'True / False',
  INPUT: 'Short answer',
  CHECKBOX: 'Multiple choice',
};

/** Item of GET /quizzes. */
export interface QuizSummary {
  id: string;
  title: string;
  questionCount: number;
  createdAt: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type Question =
  | { id: string; type: 'BOOLEAN'; text: string; correctAnswer: boolean }
  | { id: string; type: 'INPUT'; text: string; correctAnswer: string }
  | { id: string; type: 'CHECKBOX'; text: string; options: QuizOption[] };

/** Response of GET /quizzes/:id and POST /quizzes. */
export interface QuizDetails {
  id: string;
  title: string;
  createdAt: string;
  questions: Question[];
}

/** Body of POST /quizzes. */
export type CreateQuestionPayload =
  | { type: 'BOOLEAN'; text: string; correctAnswer: boolean }
  | { type: 'INPUT'; text: string; correctAnswer: string }
  | { type: 'CHECKBOX'; text: string; options: { text: string; isCorrect: boolean }[] };

export interface CreateQuizPayload {
  title: string;
  questions: CreateQuestionPayload[];
}
