import { z } from 'zod';

const questionText = z.string().trim().min(1, 'Question text is required').max(500);

const booleanQuestionSchema = z.object({
  type: z.literal('BOOLEAN'),
  text: questionText,
  correctAnswer: z.boolean(),
});

const inputQuestionSchema = z.object({
  type: z.literal('INPUT'),
  text: questionText,
  correctAnswer: z.string().trim().min(1, 'Expected answer is required').max(200),
});

const optionSchema = z.object({
  text: z.string().trim().min(1, 'Option text is required').max(200),
  isCorrect: z.boolean(),
});

const checkboxQuestionSchema = z.object({
  type: z.literal('CHECKBOX'),
  text: questionText,
  options: z
    .array(optionSchema)
    .min(2, 'Add at least 2 options')
    .max(10, 'At most 10 options are allowed')
    .refine((options) => options.some((option) => option.isCorrect), {
      message: 'Mark at least one option as correct',
    }),
});

const questionSchema = z.discriminatedUnion('type', [
  booleanQuestionSchema,
  inputQuestionSchema,
  checkboxQuestionSchema,
]);

export const createQuizSchema = z.object({
  title: z.string().trim().min(1, 'Quiz title is required').max(200),
  questions: z
    .array(questionSchema)
    .min(1, 'Add at least one question')
    .max(50, 'At most 50 questions are allowed'),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type QuestionInput = CreateQuizInput['questions'][number];
