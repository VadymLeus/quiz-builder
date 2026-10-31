import { z } from 'zod';
import { QUESTION_TYPES } from '@/types/quiz';
import type {
  CreateQuestionPayload,
  CreateQuizPayload,
  QuestionType,
  QuizDetails,
} from '@/types/quiz';

export const LIMITS = {
  title: 200,
  questionText: 500,
  answer: 200,
  option: 200,
  minOptions: 2,
  maxOptions: 10,
  maxQuestions: 50,
} as const;

const optionSchema = z.object({
  text: z.string(),
  isCorrect: z.boolean(),
});

const questionSchema = z
  .object({
    type: z.enum(QUESTION_TYPES),
    text: z.string().trim().min(1, 'Question text is required').max(LIMITS.questionText),
    booleanAnswer: z.enum(['true', 'false']),
    textAnswer: z.string(),
    options: z.array(optionSchema),
  })
  .superRefine((question, ctx) => {
    if (question.type === 'INPUT') {
      const answer = question.textAnswer.trim();
      if (!answer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['textAnswer'],
          message: 'Expected answer is required',
        });
      } else if (answer.length > LIMITS.answer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['textAnswer'],
          message: `Answer must be at most ${LIMITS.answer} characters`,
        });
      }
    }

    if (question.type === 'CHECKBOX') {
      question.options.forEach((option, optionIndex) => {
        const text = option.text.trim();
        if (!text) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['options', optionIndex, 'text'],
            message: 'Option text is required',
          });
        } else if (text.length > LIMITS.option) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['options', optionIndex, 'text'],
            message: `Option must be at most ${LIMITS.option} characters`,
          });
        }
      });

      if (question.options.length < LIMITS.minOptions) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options'],
          message: `Add at least ${LIMITS.minOptions} options`,
        });
      }

      if (!question.options.some((option) => option.isCorrect)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options'],
          message: 'Mark at least one option as correct',
        });
      }
    }
  });

export const quizFormSchema = z.object({
  title: z.string().trim().min(1, 'Quiz title is required').max(LIMITS.title),
  questions: z
    .array(questionSchema)
    .min(1, 'Add at least one question')
    .max(LIMITS.maxQuestions, `At most ${LIMITS.maxQuestions} questions are allowed`),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;
export type QuestionFormValues = QuizFormValues['questions'][number];

export function createEmptyQuestion(type: QuestionType): QuestionFormValues {
  return {
    type,
    text: '',
    booleanAnswer: 'true',
    textAnswer: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
  };
}

export function toQuizFormValues(quiz: QuizDetails): QuizFormValues {
  return {
    title: quiz.title,
    questions: quiz.questions.map((question): QuestionFormValues => {
      const base = { ...createEmptyQuestion(question.type), text: question.text };

      switch (question.type) {
        case 'BOOLEAN':
          return { ...base, booleanAnswer: question.correctAnswer ? 'true' : 'false' };
        case 'INPUT':
          return { ...base, textAnswer: question.correctAnswer };
        case 'CHECKBOX':
          return {
            ...base,
            options: question.options.map((option) => ({
              text: option.text,
              isCorrect: option.isCorrect,
            })),
          };
      }
    }),
  };
}

export function toCreateQuizPayload(values: QuizFormValues): CreateQuizPayload {
  return {
    title: values.title.trim(),
    questions: values.questions.map((question): CreateQuestionPayload => {
      const text = question.text.trim();

      switch (question.type) {
        case 'BOOLEAN':
          return { type: 'BOOLEAN', text, correctAnswer: question.booleanAnswer === 'true' };
        case 'INPUT':
          return { type: 'INPUT', text, correctAnswer: question.textAnswer.trim() };
        case 'CHECKBOX':
          return {
            type: 'CHECKBOX',
            text,
            options: question.options.map((option) => ({
              text: option.text.trim(),
              isCorrect: option.isCorrect,
            })),
          };
      }
    }),
  };
}
