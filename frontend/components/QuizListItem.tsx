import Link from 'next/link';
import type { QuizSummary } from '@/types/quiz';
import { TrashIcon } from './icons';
import styles from './QuizListItem.module.css';

interface QuizListItemProps {
  quiz: QuizSummary;
  isDeleting: boolean;
  onDelete: () => void;
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function QuizListItem({ quiz, isDeleting, onDelete }: QuizListItemProps) {
  const questionLabel = quiz.questionCount === 1 ? 'question' : 'questions';

  return (
    <li className={styles.item}>
      <Link href={`/quizzes/${quiz.id}`} className={styles.link}>
        <span className={styles.title}>{quiz.title}</span>
        <span className={styles.meta}>
          {quiz.questionCount} {questionLabel} &middot;{' '}
          {dateFormatter.format(new Date(quiz.createdAt))}
        </span>
      </Link>
      <button
        type="button"
        className="btn btn-icon btn-danger-ghost"
        onClick={onDelete}
        disabled={isDeleting}
        aria-label={`Delete quiz ${quiz.title}`}
        title="Delete quiz"
      >
        <TrashIcon />
      </button>
    </li>
  );
}
