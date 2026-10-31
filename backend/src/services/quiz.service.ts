import { Prisma } from '@prisma/client';
import { HttpError } from '../lib/http-error';
import { prisma } from '../lib/prisma';
import type { CreateQuizInput, QuestionInput, UpdateQuizInput } from '../schemas/quiz.schema';
import type { QuestionDto, QuizDetailsDto, QuizSummaryDto } from '../types/quiz';

const quizDetailsInclude = {
  questions: {
    orderBy: { position: 'asc' },
    include: { options: { orderBy: { position: 'asc' } } },
  },
} satisfies Prisma.QuizInclude;

type QuizWithDetails = Prisma.QuizGetPayload<{ include: typeof quizDetailsInclude }>;
type QuestionWithOptions = QuizWithDetails['questions'][number];

function toQuestionCreateInput(
  question: QuestionInput,
  position: number,
): Prisma.QuestionCreateWithoutQuizInput {
  const base = { type: question.type, text: question.text, position };

  switch (question.type) {
    case 'BOOLEAN':
      return { ...base, correctBoolean: question.correctAnswer };
    case 'INPUT':
      return { ...base, correctText: question.correctAnswer };
    case 'CHECKBOX':
      return {
        ...base,
        options: {
          create: question.options.map((option, index) => ({
            text: option.text,
            isCorrect: option.isCorrect,
            position: index,
          })),
        },
      };
  }
}

function toQuestionDto(question: QuestionWithOptions): QuestionDto {
  const { id, text } = question;

  switch (question.type) {
    case 'BOOLEAN':
      return { id, type: 'BOOLEAN', text, correctAnswer: question.correctBoolean ?? false };
    case 'INPUT':
      return { id, type: 'INPUT', text, correctAnswer: question.correctText ?? '' };
    case 'CHECKBOX':
      return {
        id,
        type: 'CHECKBOX',
        text,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      };
    default:
      throw new Error(`Unknown question type "${question.type}" (question ${id})`);
  }
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

function toQuizDetailsDto(quiz: QuizWithDetails): QuizDetailsDto {
  return {
    id: quiz.id,
    title: quiz.title,
    createdAt: quiz.createdAt,
    questions: quiz.questions.map(toQuestionDto),
  };
}

export async function createQuiz(input: CreateQuizInput): Promise<QuizDetailsDto> {
  const quiz = await prisma.quiz.create({
    data: {
      title: input.title,
      questions: {
        create: input.questions.map((question, index) => toQuestionCreateInput(question, index)),
      },
    },
    include: quizDetailsInclude,
  });

  return toQuizDetailsDto(quiz);
}

export async function listQuizzes(): Promise<QuizSummaryDto[]> {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: { select: { questions: true } },
    },
  });

  return quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    questionCount: quiz._count.questions,
    createdAt: quiz.createdAt,
  }));
}

export async function getQuizById(id: string): Promise<QuizDetailsDto> {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: quizDetailsInclude,
  });

  if (!quiz) {
    throw new HttpError(404, 'Quiz not found');
  }

  return toQuizDetailsDto(quiz);
}

export async function updateQuiz(id: string, input: UpdateQuizInput): Promise<QuizDetailsDto> {
  try {
    const [, quiz] = await prisma.$transaction([
      prisma.question.deleteMany({ where: { quizId: id } }),
      prisma.quiz.update({
        where: { id },
        data: {
          title: input.title,
          questions: {
            create: input.questions.map((question, index) =>
              toQuestionCreateInput(question, index),
            ),
          },
        },
        include: quizDetailsInclude,
      }),
    ]);

    return toQuizDetailsDto(quiz);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new HttpError(404, 'Quiz not found');
    }
    throw error;
  }
}

export async function deleteQuiz(id: string): Promise<void> {
  try {
    await prisma.quiz.delete({ where: { id } });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new HttpError(404, 'Quiz not found');
    }
    throw error;
  }
}
