'use client';

import { TabelaChamado } from './chamado/Tabela_Chamado';
import Header from '../../../components/Header';
import { HiDocumentPlus } from 'react-icons/hi2';
// ================================================================================

export default function LayoutPage() {
   return (
      <main className="flex h-screen w-screen flex-col overflow-hidden bg-teal-900">
         <div>
            <Header
               titulo="GERPROJ"
               subtitulo="Controle de Chamados"
               icon={<HiDocumentPlus className="text-white" size={40} />}
            />
            {/* ===== */}

            <div>
               <TabelaChamado />
            </div>
            {/* ===== */}
         </div>
      </main>
   );
}
