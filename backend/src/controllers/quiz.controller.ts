import type { Request, Response } from 'express';
import { createQuizSchema, updateQuizSchema } from '../schemas/quiz.schema';
import * as quizService from '../services/quiz.service';

export async function createQuiz(req: Request, res: Response): Promise<void> {
  const input = createQuizSchema.parse(req.body);
  const quiz = await quizService.createQuiz(input);
  res.status(201).json(quiz);
}

export async function listQuizzes(_req: Request, res: Response): Promise<void> {
  const quizzes = await quizService.listQuizzes();
  res.json(quizzes);
}

export async function getQuiz(req: Request, res: Response): Promise<void> {
  const quiz = await quizService.getQuizById(req.params.id);
  res.json(quiz);
}

export async function updateQuiz(req: Request, res: Response): Promise<void> {
  const input = updateQuizSchema.parse(req.body);
  const quiz = await quizService.updateQuiz(req.params.id, input);
  res.json(quiz);
}

export async function deleteQuiz(req: Request, res: Response): Promise<void> {
  await quizService.deleteQuiz(req.params.id);
  res.status(204).send();
}
