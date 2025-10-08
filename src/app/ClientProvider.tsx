// src/app/ClientProviders.tsx
'use client';

import { AuthProvider } from '@/contexts/Auth_Context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { PrimeReactProvider } from 'primereact/api';

export function ClientProviders({ children }: { children: ReactNode }) {
   const [queryClient] = useState(() => new QueryClient());

   return (
      <PrimeReactProvider>
         <QueryClientProvider client={queryClient}>
            <AuthProvider>
               {children}
               <Toaster position="top-center" richColors closeButton expand />
            </AuthProvider>
         </QueryClientProvider>
      </PrimeReactProvider>
   );
}
