import { Router } from 'express';
import * as quizController from '../controllers/quiz.controller';
import { asyncHandler } from '../lib/async-handler';

export const quizRouter = Router();

quizRouter.post('/', asyncHandler(quizController.createQuiz));
quizRouter.get('/', asyncHandler(quizController.listQuizzes));
quizRouter.get('/:id', asyncHandler(quizController.getQuiz));
quizRouter.put('/:id', asyncHandler(quizController.updateQuiz));
quizRouter.delete('/:id', asyncHandler(quizController.deleteQuiz));
