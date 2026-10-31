import type { CreateQuizPayload, QuizDetails, QuizSummary } from '@/types/quiz';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  error?: { message?: string; details?: ApiErrorDetail[] };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check that the backend is running.');
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    throw new ApiError(
      response.status,
      body?.error?.message ?? `Request failed with status ${response.status}`,
      body?.error?.details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getQuizzes(): Promise<QuizSummary[]> {
  return request<QuizSummary[]>('/quizzes');
}

export function getQuiz(id: string): Promise<QuizDetails> {
  return request<QuizDetails>(`/quizzes/${encodeURIComponent(id)}`);
}

export function createQuiz(payload: CreateQuizPayload): Promise<QuizDetails> {
  return request<QuizDetails>('/quizzes', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateQuiz(id: string, payload: CreateQuizPayload): Promise<QuizDetails> {
  return request<QuizDetails>(`/quizzes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteQuiz(id: string): Promise<void> {
  return request<void>(`/quizzes/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}
