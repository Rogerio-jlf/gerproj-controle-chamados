'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';

interface UserData {
   isAdmin: boolean;
   codCliente?: number;
   codRecurso?: number;
   token: string;
   id?: number;
   nome?: string;
   tipo?: string;
}

interface AuthContextType {
   user: UserData | null;
   isAuthenticated: boolean;
   isAdmin: boolean;
   login: (email: string, password: string) => Promise<UserData | null>;
   logout: () => void;
   loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
   user: null,
   isAuthenticated: false,
   isAdmin: false,
   login: async () => null,
   logout: () => {},
   loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<UserData | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
         try {
            const decoded = jwtDecode(token) as any;

            if (decoded.exp * 1000 > Date.now()) {
               setUser({
                  token,
                  isAdmin: decoded.tipo === 'ADM',
                  codCliente: undefined,
                  codRecurso: decoded.recurso?.id,
                  id: decoded.id,
                  nome: decoded.nome,
                  tipo: decoded.tipo,
               });
            } else {
               localStorage.removeItem('token');
            }
         } catch (error) {
            localStorage.removeItem('token');
         }
      }
      setLoading(false);
   }, []);

   const login = async (email: string, password: string) => {
      try {
         const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: email, senha: password }),
         });

         if (!res.ok) return null;

         const data = await res.json();
         localStorage.setItem('token', data.token);

         const userData: UserData = {
            token: data.token,
            isAdmin: data.isAdmin,
            codCliente: data.codCliente,
            codRecurso: data.codRecurso,
         };

         setUser(userData);
         return userData;
      } catch (error) {
         console.error('Erro no login:', error);
         return null;
      }
   };

   const logout = () => {
      localStorage.removeItem('token');
      setUser(null);
   };

   return (
      <AuthContext.Provider
         value={{
            user,
            isAuthenticated: !!user,
            isAdmin: user?.isAdmin || false,
            login,
            logout,
            loading,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth() {
   return useContext(AuthContext);
}
