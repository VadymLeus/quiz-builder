import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http-error';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({
      error: { message: error.message, details: error.details },
    });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: { message: 'Request body is not valid JSON' } });
    return;
  }

  console.error(error);
  res.status(500).json({ error: { message: 'Internal server error' } });
};
