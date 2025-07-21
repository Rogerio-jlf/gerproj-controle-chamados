// src/app/ClientProviders.tsx
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { FiltersProvider } from '@/contexts/FiltersContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { Toaster } from 'sonner';

export function ClientProviders({ children }: { children: ReactNode }) {
  // useState garante que o QueryClient não seja recriado a cada render
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* FiltersProvider deve envolver AuthProviderRecurso para acessar filtros */}
        <FiltersProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </FiltersProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
