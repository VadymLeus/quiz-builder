export type QuestionType = 'BOOLEAN' | 'INPUT' | 'CHECKBOX';

export interface OptionDto {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type QuestionDto =
  | { id: string; type: 'BOOLEAN'; text: string; correctAnswer: boolean }
  | { id: string; type: 'INPUT'; text: string; correctAnswer: string }
  | { id: string; type: 'CHECKBOX'; text: string; options: OptionDto[] };

export interface QuizSummaryDto {
  id: string;
  title: string;
  questionCount: number;
  createdAt: Date;
}

export interface QuizDetailsDto {
  id: string;
  title: string;
  createdAt: Date;
  questions: QuestionDto[];
}
