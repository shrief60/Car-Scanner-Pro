import { api } from './api';

// ─── OTP flow (client / phone users) ─────────────────────────────────────────

export interface OtpChallengeResponse {
  message: string;
}

export interface OtpAuthResponse {
  token: string;
  user: UserProfile;
}

/**
 * Step 1 – request an OTP SMS.
 * purpose: "register" for new users, "login" for existing users.
 */
export function sendOtpChallenge(
  phone: string,
  purpose: 'register' | 'login',
): Promise<OtpChallengeResponse> {
  return api.post('/api/auth/otp/challenge', { phone, purpose }, false);
}

/** Step 2a – verify OTP and create account (new user). */
export function otpRegister(
  phone: string,
  code: string,
): Promise<OtpAuthResponse> {
  return api.post('/api/auth/otp/register', { phone, code, user_type: 'client' }, false);
}

/** Step 2b – verify OTP and sign in (existing user). */
export function otpLogin(
  phone: string,
  code: string,
): Promise<OtpAuthResponse> {
  return api.post('/api/auth/otp/login', { phone, code }, false);
}

// ─── Password flow (merchant / email users) ───────────────────────────────────

export interface PasswordAuthResponse {
  token: string;
  user: UserProfile;
}

export interface GoogleAuthResponse {
  token: string;
  token_type?: string;
  abilities?: string[];
  mode?: string;
  is_new_user?: boolean;
  needs_profile?: boolean;
  needs_phone?: boolean;
  user: UserProfile;
}

export function googleLogin(idToken: string): Promise<GoogleAuthResponse> {
  return api.post(
    '/api/auth/google/login',
    { id_token: idToken, user_type: 'client' },
    false,
  );
}

export function passwordRegister(params: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}): Promise<PasswordAuthResponse> {
  return api.post(
    '/api/auth/password/register',
    {
      name: params.name,
      email: params.email,
      password: params.password,
      password_confirmation: params.password_confirmation,
      phone: params.phone ?? '',
      remember_me: true,
      user_type: 'client',
    },
    false,
  );
}

export function passwordLogin(
  email: string,
  password: string,
): Promise<PasswordAuthResponse> {
  return api.post('/api/auth/password/login', { email, password }, false);
}

// ─── Authenticated ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export function getMe(): Promise<{ user: UserProfile }> {
  return api.get('/api/auth/me');
}

export function logoutApi(): Promise<{ message: string }> {
  return api.post('/api/auth/logout');
}
