import Head from 'next/head';
import Link from 'next/link';
import QuestionView from '@/components/QuestionView';
import StatusMessage from '@/components/StatusMessage';
import { useQuiz } from '@/hooks/useQuiz';
import styles from '@/styles/quizzes.module.css';

export default function QuizDetailPage() {
  const { quiz, error } = useQuiz();

  return (
    <>
      <Head>
        <title>{quiz ? `${quiz.title} | Quiz Builder` : 'Quiz | Quiz Builder'}</title>
      </Head>

      <Link href="/quizzes" className={styles.back}>
        &larr; All quizzes
      </Link>

      {error ? (
        <StatusMessage variant="error">{error}</StatusMessage>
      ) : !quiz ? (
        <StatusMessage variant="loading">Loading quiz...</StatusMessage>
      ) : (
        <>
          <div className="page-header">
            <div>
              <h1 className="page-title">{quiz.title}</h1>
              <p className={`muted ${styles.subtitle}`}>
                {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
              </p>
            </div>
            <Link href={`/quizzes/${quiz.id}/edit`} className="btn btn-secondary">
              Modify
            </Link>
          </div>
          <ol className={styles.questions}>
            {quiz.questions.map((question, index) => (
              <QuestionView key={question.id} question={question} index={index} />
            ))}
          </ol>
        </>
      )}
    </>
  );
}
