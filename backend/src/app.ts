import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { quizRouter } from './routes/quiz.routes';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/quizzes', quizRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
