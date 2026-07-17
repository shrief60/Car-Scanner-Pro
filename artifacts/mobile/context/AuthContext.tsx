import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthMethod = 'phone' | 'password';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  phone: string | null;
  username: string | null;
  authMethod: AuthMethod | null;
  isLoading: boolean;
}

interface StoredUser {
  userId: string;
  username: string;
  password: string; // plain text — replace with bcrypt in production
}

interface AuthContextType extends AuthState {
  /** Phone OTP flow */
  login: (phone: string, userId: string) => Promise<void>;
  /** Username/password flows */
  register: (username: string, password: string) => Promise<void>;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const SESSION_KEY = '@qar_auth';
const USERS_KEY = '@qar_users';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    phone: null,
    username: null,
    authMethod: null,
    isLoading: true,
  });

  useEffect(() => {
    loadSession();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  async function getUsers(): Promise<StoredUser[]> {
    try {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async function saveUsers(users: StoredUser[]) {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async function loadSession() {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw) as Partial<AuthState>;
        setState({
          isAuthenticated: true,
          userId: session.userId ?? null,
          phone: session.phone ?? null,
          username: session.username ?? null,
          authMethod: session.authMethod ?? null,
          isLoading: false,
        });
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }
    } catch {
      setState(s => ({ ...s, isLoading: false }));
    }
  }

  async function persistSession(partial: Omit<AuthState, 'isLoading'>) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(partial));
    setState({ ...partial, isLoading: false });
  }

  // ── Auth methods ───────────────────────────────────────────────────────────

  /** Phone OTP login (simulated) */
  async function login(phone: string, userId: string) {
    await persistSession({
      isAuthenticated: true,
      userId,
      phone,
      username: null,
      authMethod: 'phone',
    });
  }

  /** Create a new account with username + password */
  async function register(username: string, password: string) {
    const users = await getUsers();
    const exists = users.some(
      u => u.username.toLowerCase() === username.toLowerCase(),
    );
    if (exists) throw new Error('Username already taken');

    const userId =
      Date.now().toString() + Math.random().toString(36).substr(2, 6);
    await saveUsers([...users, { userId, username, password }]);

    await persistSession({
      isAuthenticated: true,
      userId,
      phone: null,
      username,
      authMethod: 'password',
    });
  }

  /** Sign in with username + password */
  async function loginWithPassword(username: string, password: string) {
    const users = await getUsers();
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase(),
    );
    if (!user) throw new Error('Username not found');
    if (user.password !== password) throw new Error('Incorrect password');

    await persistSession({
      isAuthenticated: true,
      userId: user.userId,
      phone: null,
      username: user.username,
      authMethod: 'password',
    });
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setState({
      isAuthenticated: false,
      userId: null,
      phone: null,
      username: null,
      authMethod: null,
      isLoading: false,
    });
  }

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, loginWithPassword, logout }}
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
