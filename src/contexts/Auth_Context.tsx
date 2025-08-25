'use client';
import { createContext, useContext } from 'react';

interface UserData {
  isAdmin: boolean;
  codCliente?: number;
  codRecurso?: number;
  token: string;
}

interface AuthContextType {
  login: (email: string, password: string) => Promise<UserData | null>;
}

const AuthContext = createContext<AuthContextType>({
  login: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const login = async (email: string, password: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: email, senha: password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data;
  };

  return (
    <AuthContext.Provider value={{ login }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
