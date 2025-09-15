'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as jwtDecode from 'jwt-decode';

interface UserToken {
   id: number;
   nome: string;
   tipo: string;
   recurso: {
      id: number;
      nome: string;
      email: string;
      ativo: number;
   };
   exp: number;
}

interface UseAuthReturn {
   user: UserToken | null;
   loading: boolean;
   isTokenExpired: boolean;
   logout: () => void;
}

export function useAuth(): UseAuthReturn {
   const router = useRouter();
   const [user, setUser] = useState<UserToken | null>(null);
   const [loading, setLoading] = useState(true);
   const [isTokenExpired, setIsTokenExpired] = useState(false);

   const logout = () => {
      localStorage.removeItem('token');
      setUser(null);
      setIsTokenExpired(false);
      router.push('/');
   };

   const isTokenReallyExpired = (token: string): boolean => {
      try {
         const decoded = (jwtDecode as any).default(token) as UserToken;
         const currentTimeInSeconds = Math.floor(Date.now() / 1000);
         return decoded.exp < currentTimeInSeconds;
      } catch (error) {
         console.error('Erro ao decodificar token:', error);
         return true;
      }
   };

   useEffect(() => {
      const token = localStorage.getItem('token');

      if (!token) {
         setLoading(false);
         router.push('/');
         return;
      }

      try {
         const decoded = (jwtDecode as any).default(token) as UserToken;

         if (isTokenReallyExpired(token)) {
            localStorage.removeItem('token');
            setIsTokenExpired(true);
            setLoading(false);
            setTimeout(() => {
               router.push('/');
            }, 5000);
            return;
         }

         setUser(decoded);
         setLoading(false);
      } catch (err) {
         console.error('Erro ao processar token:', err);
         localStorage.removeItem('token');
         setLoading(false);
         router.push('/');
      }
   }, [router]);

   useEffect(() => {
      if (!user) return;

      const originalFetch = window.fetch;

      window.fetch = async (...args) => {
         const response = await originalFetch(...args);

         if (response.status === 401) {
            const token = localStorage.getItem('token');
            if (token && user) {
               localStorage.removeItem('token');
               setIsTokenExpired(true);
               setUser(null);
               setTimeout(() => {
                  setIsTokenExpired(false);
                  router.push('/');
               }, 5000);
            }
         }

         return response;
      };

      return () => {
         window.fetch = originalFetch;
      };
   }, [user, router]);

   return {
      user,
      loading,
      isTokenExpired,
      logout,
   };
}
