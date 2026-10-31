import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getErrorMessage, getQuiz } from '@/services/api';
import type { QuizDetails } from '@/types/quiz';

export function useQuiz() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;

  const [quiz, setQuiz] = useState<QuizDetails | null>(null);
  const [failure, setFailure] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getQuiz(id)
      .then((data) => {
        if (!cancelled) setQuiz(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) setFailure({ id, message: getErrorMessage(error) });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return {
    id,
    quiz: quiz && quiz.id === id ? quiz : null,
    error: failure && failure.id === id ? failure.message : null,
  };
}
