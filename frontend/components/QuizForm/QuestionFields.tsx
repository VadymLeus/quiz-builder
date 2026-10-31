import { useFormContext } from 'react-hook-form';
import type { QuizFormValues } from '@/schemas/quiz-form';
import { QUESTION_LABELS } from '@/types/quiz';
import type { QuestionType } from '@/types/quiz';
import { TrashIcon } from '../icons';
import CheckboxOptions from './CheckboxOptions';
import styles from './QuizForm.module.css';

interface QuestionFieldsProps {
  index: number;
  type: QuestionType;
  onRemove: () => void;
}

/** One question card. The fields shown depend on the question type. */
export default function QuestionFields({ index, type, onRemove }: QuestionFieldsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<QuizFormValues>();

  const questionErrors = errors.questions?.[index];
  const textId = `question-${index}-text`;
  const answerId = `question-${index}-answer`;

  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>
          Question {index + 1} <span className={styles.badge}>{QUESTION_LABELS[type]}</span>
        </h2>
        <button
          type="button"
          className="btn btn-icon btn-danger-ghost"
          onClick={onRemove}
          aria-label={`Remove question ${index + 1}`}
          title="Remove question"
        >
          <TrashIcon />
        </button>
      </div>

      {/* The type never changes after the question is added, but it must be part of the form data. */}
      <input type="hidden" {...register(`questions.${index}.type`)} />

      <div className={styles.field}>
        <label htmlFor={textId} className={styles.label}>
          Question text
        </label>
        <input
          id={textId}
          type="text"
          className="input"
          placeholder="Type your question"
          aria-invalid={questionErrors?.text ? true : undefined}
          {...register(`questions.${index}.text`)}
        />
        {questionErrors?.text && (
          <p className={styles.error} role="alert">
            {questionErrors.text.message}
          </p>
        )}
      </div>

      {type === 'BOOLEAN' && (
        <fieldset className={styles.radioGroup}>
          <legend className={styles.label}>Correct answer</legend>
          <label className={styles.radio}>
            <input type="radio" value="true" {...register(`questions.${index}.booleanAnswer`)} />
            True
          </label>
          <label className={styles.radio}>
            <input type="radio" value="false" {...register(`questions.${index}.booleanAnswer`)} />
            False
          </label>
        </fieldset>
      )}

      {type === 'INPUT' && (
        <div className={styles.field}>
          <label htmlFor={answerId} className={styles.label}>
            Expected short answer
          </label>
          <input
            id={answerId}
            type="text"
            className="input"
            placeholder="Correct answer"
            aria-invalid={questionErrors?.textAnswer ? true : undefined}
            {...register(`questions.${index}.textAnswer`)}
          />
          {questionErrors?.textAnswer && (
            <p className={styles.error} role="alert">
              {questionErrors.textAnswer.message}
            </p>
          )}
        </div>
      )}

      {type === 'CHECKBOX' && <CheckboxOptions questionIndex={index} />}
    </li>
  );
}
