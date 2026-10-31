import Head from 'next/head';
import Link from 'next/link';
import QuizForm from '@/components/QuizForm/QuizForm';
import StatusMessage from '@/components/StatusMessage';
import { useQuiz } from '@/hooks/useQuiz';
import styles from '@/styles/quizzes.module.css';

export default function EditQuizPage() {
  const { id, quiz, error } = useQuiz();

  return (
    <>
      <Head>
        <title>Modify quiz | Quiz Builder</title>
      </Head>

      <Link href={id ? `/quizzes/${id}` : '/quizzes'} className={styles.back}>
        &larr; Back to quiz
      </Link>

      <div className="page-header">
        <h1 className="page-title">Modify quiz</h1>
      </div>

      {error ? (
        <StatusMessage variant="error">{error}</StatusMessage>
      ) : !quiz ? (
        <StatusMessage variant="loading">Loading quiz...</StatusMessage>
      ) : (
        <QuizForm key={quiz.id} quiz={quiz} />
      )}
    </>
  );
}
