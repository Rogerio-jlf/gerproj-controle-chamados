'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as jwtDecode from 'jwt-decode'; // Import correto para TypeScript

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

export function useAuth() {
   const router = useRouter();
   const [user, setUser] = useState<UserToken | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const token = localStorage.getItem('token');

      if (!token) {
         router.push('/');
         return;
      }

      try {
         // Aqui usamos .default porque jwt-decode é CommonJS
         const decoded = (jwtDecode as any).default(token) as UserToken;

         // Verifica se o token expirou
         if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            router.push('/');
         } else {
            setUser(decoded);
         }
      } catch (err) {
         localStorage.removeItem('token');
         router.push('/');
      } finally {
         setLoading(false);
      }
   }, [router]);

   return { user, loading };
}
