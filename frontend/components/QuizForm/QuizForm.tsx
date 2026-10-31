import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import {
  LIMITS,
  createEmptyQuestion,
  quizFormSchema,
  toCreateQuizPayload,
  toQuizFormValues,
} from '@/schemas/quiz-form';
import type { QuizFormValues } from '@/schemas/quiz-form';
import { ApiError, createQuiz, getErrorMessage, updateQuiz } from '@/services/api';
import type { QuestionType, QuizDetails } from '@/types/quiz';
import { getArrayError } from './form-errors';
import QuestionFields from './QuestionFields';
import styles from './QuizForm.module.css';

const ADD_BUTTONS: { type: QuestionType; label: string }[] = [
  { type: 'BOOLEAN', label: '+ True / False' },
  { type: 'INPUT', label: '+ Short answer' },
  { type: 'CHECKBOX', label: '+ Multiple choice' },
];

interface SubmitError {
  message: string;
  details: string[];
}

interface QuizFormProps {
  quiz?: QuizDetails;
}

export default function QuizForm({ quiz }: QuizFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: quiz
      ? toQuizFormValues(quiz)
      : { title: '', questions: [createEmptyQuestion('INPUT')] },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  const questionsError = getArrayError(errors, 'questions');

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      const payload = toCreateQuizPayload(values);
      const saved = quiz ? await updateQuiz(quiz.id, payload) : await createQuiz(payload);
      await router.push(`/quizzes/${saved.id}`);
    } catch (error) {
      setSubmitError({
        message: getErrorMessage(error),
        details:
          error instanceof ApiError && error.details
            ? error.details.map((detail) => `${detail.path}: ${detail.message}`)
            : [],
      });
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate className={styles.form}>
        <div className={styles.card}>
          <div className={styles.field}>
            <label htmlFor="quiz-title" className={styles.label}>
              Quiz title
            </label>
            <input
              id="quiz-title"
              type="text"
              className="input"
              placeholder="e.g. JavaScript Basics"
              aria-invalid={errors.title ? true : undefined}
              {...register('title')}
            />
            {errors.title && (
              <p className={styles.error} role="alert">
                {errors.title.message}
              </p>
            )}
          </div>
        </div>

        <ul className={styles.questionList}>
          {fields.map((field, index) => (
            <QuestionFields
              key={field.id}
              index={index}
              type={field.type}
              onRemove={() => remove(index)}
            />
          ))}
        </ul>

        {questionsError && (
          <p className={styles.error} role="alert">
            {questionsError}
          </p>
        )}

        <div className={styles.addRow}>
          {ADD_BUTTONS.map((button) => (
            <button
              key={button.type}
              type="button"
              className="btn btn-secondary"
              onClick={() => append(createEmptyQuestion(button.type))}
              disabled={fields.length >= LIMITS.maxQuestions}
            >
              {button.label}
            </button>
          ))}
        </div>

        {submitError && (
          <div className={styles.submitError} role="alert">
            <strong>{submitError.message}</strong>
            {submitError.details.length > 0 && (
              <ul>
                {submitError.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {quiz && (
            <Link href={`/quizzes/${quiz.id}`} className="btn btn-secondary">
              Cancel
            </Link>
          )}
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : quiz ? 'Save changes' : 'Create quiz'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
