import * as yup from 'yup';

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
    .required('Email is required')
    .email('Enter a valid email address'),
  password: yup.string().required('Password is required'),
});

export type LoginValues = yup.InferType<typeof loginSchema>;

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Enter a valid email address'),
  // Held as national digits; the +20 chip is presentational and toE164() runs on submit.
  phone: yup
    .string()
    .required('Phone number is required')
    .test(
      'eg-mobile',
      `Enter a ${EG_NATIONAL_DIGITS}-digit mobile number`,
      value => nationalDigits(value).length === EG_NATIONAL_DIGITS,
    ),
  password: yup
    .string()
    .required('Password is required')
    .min(MIN_PASSWORD, `Password must be at least ${MIN_PASSWORD} characters`),
  confirm: yup
    .string()
    .required('Confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

export type RegisterValues = yup.InferType<typeof registerSchema>;
