import * as yup from 'yup';
import { t } from '@/i18n';

/**
 * Messages are passed as thunks, not strings.
 *
 * This module evaluates at import time — before the locale is resolved — so a plain
 * `t(...)` here would bake in whichever catalogue loaded first. Yup calls the function
 * when validation actually runs, by which point the locale is settled.
 */

/**
 * `POST /api/auth/password/register` rejects anything shorter — keep this in step with
 * the API or every short submit round-trips to a 422.
 * See .claude/docs/api/README.md → "Password registration requirements".
 */
export const MIN_PASSWORD = 8;

/** Egyptian mobiles carry 10 national digits after the +20 dialling code. */
const EG_NATIONAL_DIGITS = 10;

/** "01013161388" and "1013161388" both reduce to "1013161388". */
export function nationalDigits(local: string | undefined): string {
  return (local ?? '').replace(/\D/g, '').replace(/^0+/, '');
}

/** The API wants E.164: "1013161388" -> "+201013161388". */
export function toE164(local: string | undefined): string {
  const digits = nationalDigits(local);
  return digits ? `+20${digits}` : '';
}

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required(() => t('errors.emailRequired'))
    .email(() => t('errors.emailInvalid')),
  password: yup.string().required(() => t('errors.passwordRequired')),
});

export type LoginValues = yup.InferType<typeof loginSchema>;

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required(() => t('errors.nameRequired'))
    .min(2, () => t('errors.nameTooShort')),
  email: yup
    .string()
    .trim()
    .required(() => t('errors.emailRequired'))
    .email(() => t('errors.emailInvalid')),
  // Held as national digits; the +20 chip is presentational and toE164() runs on submit.
  phone: yup
    .string()
    .required(() => t('errors.phoneRequired'))
    .test(
      'eg-mobile',
      () => t('errors.phoneInvalid'),
      value => nationalDigits(value).length === EG_NATIONAL_DIGITS,
    ),
  password: yup
    .string()
    .required(() => t('errors.passwordRequired'))
    .min(MIN_PASSWORD, () => t('errors.passwordTooShort')),
  confirm: yup
    .string()
    .required(() => t('errors.confirmRequired'))
    .oneOf([yup.ref('password')], () => t('errors.passwordsDoNotMatch')),
  // Consent is recorded client-side only — the API has no field for it. See
  // .claude/docs/known-issues.md if that ever needs to be persisted.
  acceptedTerms: yup
    .boolean()
    .required()
    .oneOf([true], () => t('errors.acceptTerms')),
});

export type RegisterValues = yup.InferType<typeof registerSchema>;
