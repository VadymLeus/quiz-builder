import { get } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import type { QuizFormValues } from '@/schemas/quiz-form';

/**
 * Message for an error that belongs to a whole field array (for example "add at least 2 options").
 * react-hook-form stores those either on the path itself or under `.root`, depending on the
 * resolver version, so both places are checked.
 */
export function getArrayError(
  errors: FieldErrors<QuizFormValues>,
  path: string,
): string | undefined {
  return get(errors, `${path}.root.message`) ?? get(errors, `${path}.message`);
}
