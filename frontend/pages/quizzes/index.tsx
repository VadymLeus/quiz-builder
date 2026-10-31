import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import QuizListItem from '@/components/QuizListItem';
import StatusMessage from '@/components/StatusMessage';
import { deleteQuiz, getErrorMessage, getQuizzes } from '@/services/api';
import type { QuizSummary } from '@/types/quiz';
import styles from '@/styles/quizzes.module.css';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Guard against setting state after the component unmounted (also covers React Strict Mode).
    let cancelled = false;

    getQuizzes()
      .then((data) => {
        if (!cancelled) setQuizzes(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(getErrorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(quiz: QuizSummary) {
    if (!window.confirm(`Delete the quiz "${quiz.title}"? This cannot be undone.`)) {
      return;
    }

    setDeleteError(null);
    setDeletingId(quiz.id);

    try {
      await deleteQuiz(quiz.id);
      // Remove it from the page only after the server confirmed the deletion.
      setQuizzes((current) => current?.filter((item) => item.id !== quiz.id) ?? null);
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Quizzes | Quiz Builder</title>
      </Head>

      <div className="page-header">
        <h1 className="page-title">Quizzes</h1>
        <Link href="/create" className="btn btn-primary">
          + Create quiz
        </Link>
      </div>

      {deleteError && <StatusMessage variant="error">{deleteError}</StatusMessage>}

      {loadError ? (
        <StatusMessage variant="error">{loadError}</StatusMessage>
      ) : quizzes === null ? (
        <StatusMessage variant="loading">Loading quizzes...</StatusMessage>
      ) : quizzes.length === 0 ? (
        <StatusMessage variant="empty">
          No quizzes yet. <Link href="/create">Create your first quiz</Link>.
        </StatusMessage>
      ) : (
        <ul className={styles.list}>
          {quizzes.map((quiz) => (
            <QuizListItem
              key={quiz.id}
              quiz={quiz}
              isDeleting={deletingId === quiz.id}
              onDelete={() => handleDelete(quiz)}
            />
          ))}
        </ul>
      )}
    </>
  );
}
