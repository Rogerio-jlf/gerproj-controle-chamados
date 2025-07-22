'use client';

import { DatabaseBackup } from 'lucide-react';

export default function Footer() {
  return (
    <div className="relative z-10 w-full border-t border-black pt-2">
      <div className="flex items-center justify-between text-base tracking-wider text-gray-800 italic">
        <div className="flex items-center gap-3">
          <DatabaseBackup className="h-8 w-8 animate-pulse text-gray-600" />
          <span className="font-semibold">Dados atualizados em tempo real</span>
        </div>
      </div>
    </div>
  );
}
