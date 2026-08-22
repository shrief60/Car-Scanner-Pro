import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken } from '@/services/api';
import {
  otpRegister,
  otpLogin,
  passwordRegister,
  passwordLogin,
  googleLogin,
  logoutApi,
} from '@/services/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthMethod = 'phone' | 'password' | 'google';

interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  phone: string | null;
  username: string | null; // display name from server
  email: string | null;
  authMethod: AuthMethod | null;
  isLoading: boolean;
}

interface SessionData {
  isAuthenticated: boolean;
  userId: number;
  phone: string | null;
  username: string | null;
  email: string | null;
  authMethod: AuthMethod;
  token: string;
}

interface AuthContextType extends AuthState {
  /** OTP register — new phone user */
  loginWithOtp: (phone: string, code: string, isNew: boolean) => Promise<void>;
  /** Password register */
  register: (params: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) => Promise<void>;
  /** Password login */
  loginWithPassword: (email: string, password: string) => Promise<void>;
  /** Google login with a verified Google ID token */
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const SESSION_KEY = '@qar_session_v2';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    phone: null,
    username: null,
    email: null,
    authMethod: null,
    isLoading: true,
  });

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        const session: SessionData = JSON.parse(raw);
        setToken(session.token); // hydrate API client
        setState({
          isAuthenticated: true,
          userId: session.userId,
          phone: session.phone,
          username: session.username,
          email: session.email,
          authMethod: session.authMethod,
          isLoading: false,
        });
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }
    } catch {
      setState(s => ({ ...s, isLoading: false }));
    }
  }

  async function persistSession(session: SessionData) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setToken(session.token);
    setState({
      isAuthenticated: true,
      userId: session.userId,
      phone: session.phone,
      username: session.username,
      email: session.email,
      authMethod: session.authMethod,
      isLoading: false,
    });
  }

  // ── Auth methods ─────────────────────────────────────────────────────────────

  async function loginWithOtp(
    phone: string,
    code: string,
    isNew: boolean,
  ) {
    const res = isNew
      ? await otpRegister(phone, code)
      : await otpLogin(phone, code);

    await persistSession({
      isAuthenticated: true,
      userId: res.user.id,
      phone,
      username: res.user.name ?? null,
      email: res.user.email ?? null,
      authMethod: 'phone',
      token: res.token,
    });
  }

  async function register(params: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) {
    const res = await passwordRegister(params);
    await persistSession({
      isAuthenticated: true,
      userId: res.user.id,
      phone: params.phone ?? null,
      username: res.user.name,
      email: res.user.email ?? params.email,
      authMethod: 'password',
      token: res.token,
    });
  }

  async function loginWithPassword(email: string, password: string) {
    const res = await passwordLogin(email, password);
    await persistSession({
      isAuthenticated: true,
      userId: res.user.id,
      phone: res.user.phone ?? null,
      username: res.user.name,
      email: email,
      authMethod: 'password',
      token: res.token,
    });
  }

  async function loginWithGoogle(idToken: string) {
    const res = await googleLogin(idToken);
    await persistSession({
      isAuthenticated: true,
      userId: res.user.id,
      phone: res.user.phone ?? null,
      username: res.user.name,
      email: res.user.email ?? null,
      authMethod: 'google',
      token: res.token,
    });
  }

  async function logout() {
    try {
      await logoutApi();
    } catch {
      // ignore server errors on logout
    }
    setToken(null);
    await AsyncStorage.removeItem(SESSION_KEY);
    setState({
      isAuthenticated: false,
      userId: null,
      phone: null,
      username: null,
      email: null,
      authMethod: null,
      isLoading: false,
    });
  }

  return (
    <AuthContext.Provider
      value={{ ...state, loginWithOtp, register, loginWithPassword, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
