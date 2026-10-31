import { useFieldArray, useFormContext } from 'react-hook-form';
import { LIMITS } from '@/schemas/quiz-form';
import type { QuizFormValues } from '@/schemas/quiz-form';
import { TrashIcon } from '../icons';
import { getArrayError } from './form-errors';
import styles from './QuizForm.module.css';

interface CheckboxOptionsProps {
  questionIndex: number;
}

/** Dynamic list of answer options for a multiple-choice question. */
export default function CheckboxOptions({ questionIndex }: CheckboxOptionsProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<QuizFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const optionsError = getArrayError(errors, `questions.${questionIndex}.options`);

  return (
    <fieldset className={styles.optionsGroup}>
      <legend className={styles.label}>Options (tick every correct one)</legend>

      <ul className={styles.optionList}>
        {fields.map((field, optionIndex) => {
          const textError =
            errors.questions?.[questionIndex]?.options?.[optionIndex]?.text?.message;

          return (
            <li key={field.id} className={styles.optionRow}>
              <input
                type="checkbox"
                className={styles.optionCheckbox}
                aria-label={`Option ${optionIndex + 1} is correct`}
                {...register(`questions.${questionIndex}.options.${optionIndex}.isCorrect`)}
              />
              <div className={styles.optionInput}>
                <input
                  type="text"
                  className="input"
                  placeholder={`Option ${optionIndex + 1}`}
                  aria-label={`Option ${optionIndex + 1} text`}
                  aria-invalid={textError ? true : undefined}
                  {...register(`questions.${questionIndex}.options.${optionIndex}.text`)}
                />
                {textError && (
                  <p className={styles.error} role="alert">
                    {textError}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-icon btn-danger-ghost"
                onClick={() => remove(optionIndex)}
                disabled={fields.length <= LIMITS.minOptions}
                aria-label={`Remove option ${optionIndex + 1}`}
                title="Remove option"
              >
                <TrashIcon />
              </button>
            </li>
          );
        })}
      </ul>

      {optionsError && (
        <p className={styles.error} role="alert">
          {optionsError}
        </p>
      )}

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => append({ text: '', isCorrect: false })}
        disabled={fields.length >= LIMITS.maxOptions}
      >
        + Add option
      </button>
    </fieldset>
  );
}
