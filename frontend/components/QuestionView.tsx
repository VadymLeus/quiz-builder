import { QUESTION_LABELS } from '@/types/quiz';
import type { Question } from '@/types/quiz';
import styles from './QuestionView.module.css';

interface QuestionViewProps {
  question: Question;
  index: number;
}

/** Read-only rendering of one question. The correct answers are pre-selected. */
export default function QuestionView({ question, index }: QuestionViewProps) {
  const groupName = `question-${question.id}`;

  return (
    <li className={styles.card}>
      <div className={styles.header}>
        <span className={styles.number}>{index + 1}</span>
        <span className={styles.badge}>{QUESTION_LABELS[question.type]}</span>
      </div>

      <p className={styles.text}>{question.text}</p>

      {question.type === 'BOOLEAN' && (
        <fieldset className={styles.choices} disabled>
          <legend className="visually-hidden">Correct answer</legend>
          <label className={styles.choice}>
            <input type="radio" name={groupName} defaultChecked={question.correctAnswer === true} />
            True
          </label>
          <label className={styles.choice}>
            <input
              type="radio"
              name={groupName}
              defaultChecked={question.correctAnswer === false}
            />
            False
          </label>
        </fieldset>
      )}

      {question.type === 'INPUT' && (
        <label className={styles.inputLabel}>
          <span className="muted">Expected answer</span>
          <input type="text" className="input" defaultValue={question.correctAnswer} readOnly />
        </label>
      )}

      {question.type === 'CHECKBOX' && (
        <fieldset className={styles.choices} disabled>
          <legend className="visually-hidden">Options</legend>
          {question.options.map((option) => (
            <label key={option.id} className={styles.choice}>
              <input type="checkbox" defaultChecked={option.isCorrect} />
              {option.text}
            </label>
          ))}
        </fieldset>
      )}
    </li>
  );
}
