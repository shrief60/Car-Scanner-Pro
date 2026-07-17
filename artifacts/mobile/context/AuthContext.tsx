import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  phone: string | null;
  userId: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (phone: string, userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const AUTH_KEY = '@qar_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    phone: null,
    userId: null,
    isLoading: true,
  });

  useEffect(() => {
    loadAuth();
  }, []);

  async function loadAuth() {
    try {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      if (stored) {
        const { phone, userId } = JSON.parse(stored);
        setState({ isAuthenticated: true, phone, userId, isLoading: false });
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }
    } catch {
      setState(s => ({ ...s, isLoading: false }));
    }
  }

  async function login(phone: string, userId: string) {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ phone, userId }));
    setState({ isAuthenticated: true, phone, userId, isLoading: false });
  }

  async function logout() {
    await AsyncStorage.removeItem(AUTH_KEY);
    setState({
      isAuthenticated: false,
      phone: null,
      userId: null,
      isLoading: false,
    });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
