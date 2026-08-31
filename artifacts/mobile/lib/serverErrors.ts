import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { t } from '@/i18n';

type LaravelError = Error & {
  details?: { errors?: Record<string, string[] | string>; message?: string };
};

/**
 * Route a Laravel 422 onto the form.
 *
 * The payload is `{ message, errors: { field: [msg] } }`, where `message` is only the
 * first problem plus "(and 2 more errors)". Showing just `message` hides most of what
 * is wrong and points at no particular input, so map each key to its own field and
 * park anything unrecognised on `root`.
 *
 * @param fields  form field names this screen actually renders
 * @param aliases API key -> form field name, e.g. password_confirmation -> confirm
 */
export function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
  aliases: Record<string, string> = { password_confirmation: 'confirm' },
): void {
  const e = err as LaravelError;
  const serverErrors = e.details?.errors;

  if (!serverErrors || typeof serverErrors !== 'object') {
    setError('root', { message: e.message || t('common.somethingWentWrong') });
    return;
  }

  const leftovers: string[] = [];
  let matched = 0;

  for (const [key, value] of Object.entries(serverErrors)) {
    const message = Array.isArray(value) ? value[0] : String(value);
    const field = aliases[key] ?? key;
    if (fields.includes(field)) {
      setError(field as Path<T>, { message });
      matched += 1;
    } else {
      leftovers.push(message);
    }
  }

  if (leftovers.length) setError('root', { message: leftovers.join('\n') });
  else if (matched === 0) setError('root', { message: e.message || t('common.somethingWentWrong') });
}
