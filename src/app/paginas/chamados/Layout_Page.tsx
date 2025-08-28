'use client';

import Tabela from './components/Tabela_Chamados';
import Header from '../../../components/Header';
import { HiDocumentPlus } from 'react-icons/hi2';
// ================================================================================

export default function LayoutPage() {
  return (
    <main className="bg-gray-100">
      <div className="h-screen w-screen overflow-hidden">
        <div className="flex flex-col space-y-6 p-6">
          <Header
            titulo="Chamados"
            icon={<HiDocumentPlus className="text-white" size={40} />}
          />
          {/* ===== */}

          <div>
            <Tabela />
          </div>
          {/* ===== */}
        </div>
      </div>
    </main>
  );
}
