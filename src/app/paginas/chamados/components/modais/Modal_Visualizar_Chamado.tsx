'use client';

import { useState } from 'react';
// ================================================================================
import { TabelaChamadosProps } from '../../../../../types/types';
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';
import { getStylesStatus } from '../../../../../utils/formatters';
// ================================================================================
import {
   FaCalendarAlt,
   FaUser,
   FaClock,
   FaTag,
   FaUserTie,
   FaDatabase,
} from 'react-icons/fa';
import { IoClose, IoCall } from 'react-icons/io5';
import { MdDescription } from 'react-icons/md';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================
interface ModalVisualizarChamadoProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: TabelaChamadosProps | null;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export default function ModalVisualizarChamado({
   isOpen,
   onClose,
   chamado,
}: ModalVisualizarChamadoProps) {
   const [isLoading] = useState(false);

   // ================================================================================
   const handleClose = () => {
      if (!isLoading) {
         onClose();
      }
   };
   // ================================================================================

   // ================================================================================
   const formateDateISO = (dataISO: string | null) => {
      if (!dataISO) return '-';
      const data = new Date(dataISO);
      if (isNaN(data.getTime())) return '-';

      return data.toLocaleDateString('pt-BR');
   };
   // ================================================================================

   // ================================================================================
   const formateTime = (horario: number | string) => {
      const horarioFormatado = horario.toString().padStart(4, '0');
      const horas = horarioFormatado.slice(0, 2);
      const minutos = horarioFormatado.slice(2, 4);
      return `${horas}:${minutos}`;
   };
   // ================================================================================

   // ================================================================================

   if (!isOpen || !chamado) return null;
   // ================================================================================

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================

   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xl"
            onClick={handleClose}
         />
         {/* ========== */}

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-white shadow-xl shadow-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 p-6 shadow-md shadow-black">
               {/* Título do modal */}
               <div className="flex items-center justify-center gap-6">
                  <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                     <FaDatabase className="text-black" size={36} />
                  </div>
                  <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                     <IoCall className="text-black" size={36} />
                  </div>

                  <div className="flex flex-col items-start justify-center">
                     <h1 className="text-3xl font-extrabold tracking-wider text-black select-none">
                        Dados Chamado
                     </h1>

                     <p className="text-xl font-extrabold tracking-widest text-black select-none">
                        Chamado #{chamado.COD_CHAMADO}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               {/* Botão fechar modal */}
               <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <IoClose size={24} />
               </button>
            </header>

            {/* ===== CONTEÚDO ===== */}
            <main className="flex h-full overflow-hidden">
               {/* ===== DADOS DO CHAMADO ===== */}
               <section className="w-full overflow-y-auto bg-gray-50">
                  <div className="p-6">
                     {/* ===== CARDS DADOS INFORMATIVOS ===== */}
                     <div className="mb-8 grid grid-cols-3 gap-4">
                        {/* Card Data e hora */}
                        <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md shadow-black">
                           <div className="border-0 bg-gradient-to-r from-blue-100 to-blue-200 p-4 shadow-xs shadow-black">
                              <div className="flex items-center gap-3">
                                 <FaCalendarAlt
                                    className="text-blue-600"
                                    size={20}
                                 />
                                 <h3 className="text-lg font-extrabold tracking-wider text-black select-none">
                                    Data & Hora
                                 </h3>
                              </div>
                           </div>

                           <div className="p-4">
                              <div className="space-y-2">
                                 <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                       Data:
                                    </p>
                                    <p className="text-lg font-bold tracking-wider text-black select-none">
                                       {formateDateISO(chamado.DATA_CHAMADO)}
                                    </p>
                                 </div>

                                 <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                       Horário:
                                    </p>
                                    <p className="text-lg font-bold tracking-wider text-black select-none">
                                       {chamado.HORA_CHAMADO !== undefined &&
                                       chamado.HORA_CHAMADO !== null
                                          ? formateTime(chamado.HORA_CHAMADO)
                                          : '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Status */}
                        <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md shadow-black">
                           <div className="border-0 bg-gradient-to-r from-blue-100 to-blue-200 p-4 shadow-xs shadow-black">
                              <div className="flex items-center gap-3">
                                 <FaClock className="text-blue-600" size={20} />
                                 <h3 className="text-lg font-extrabold tracking-wider text-black select-none">
                                    Status
                                 </h3>
                              </div>
                           </div>

                           <div className="p-4">
                              <div className="space-y-2">
                                 <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                       Status:
                                    </p>
                                    <p
                                       className={`inline-block rounded-full px-3 py-1 text-lg font-bold tracking-wider text-black select-none ${getStylesStatus(
                                          chamado.STATUS_CHAMADO
                                       )}`}
                                    >
                                       {chamado.STATUS_CHAMADO ?? '-'}
                                    </p>
                                 </div>

                                 <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                       Prioridade:
                                    </p>
                                    <p className="inline-block rounded-full bg-gray-200 px-3 py-1 text-lg font-bold tracking-wider text-black select-none">
                                       {chamado.PRIOR_CHAMADO ?? '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Identificação */}
                        <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md shadow-black">
                           <div className="border-0 bg-gradient-to-r from-blue-100 to-blue-200 p-4 shadow-xs shadow-black">
                              <div className="flex items-center gap-3">
                                 <FaTag className="text-blue-600" size={20} />
                                 <h3 className="text-lg font-extrabold tracking-wider text-black select-none">
                                    Identificação
                                 </h3>
                              </div>
                           </div>

                           <div className="p-4">
                              <div className="space-y-2">
                                 <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                       Cód. Tarefa:
                                    </p>
                                    <p className="text-lg font-bold tracking-wider text-black select-none">
                                       {chamado.CODTRF_CHAMADO ?? '-'}
                                    </p>
                                 </div>

                                 <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                       Classificação:
                                    </p>
                                    <p className="text-lg font-bold tracking-wider text-black select-none">
                                       {chamado.COD_CLASSIFICACAO ?? '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Cliente */}
                        <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md shadow-black">
                           <div className="border-0 bg-gradient-to-r from-blue-100 to-blue-200 p-4 shadow-xs shadow-black">
                              <div className="flex items-center gap-3">
                                 <FaUserTie
                                    className="text-blue-600"
                                    size={20}
                                 />
                                 <h3 className="text-lg font-extrabold tracking-wider text-black select-none">
                                    Cliente
                                 </h3>
                              </div>
                           </div>

                           <div className="p-4">
                              <div className="space-y-2">
                                 <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                       Nome:
                                    </p>
                                    <p className="text-lg font-bold tracking-wider text-black select-none">
                                       {chamado.NOME_CLIENTE ?? '-'}
                                    </p>
                                 </div>

                                 <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                       Email:
                                    </p>
                                    <p className="truncate text-sm font-semibold tracking-wider text-blue-600 select-none">
                                       {chamado.EMAIL_CHAMADO ?? '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Recurso */}
                        <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md shadow-black">
                           <div className="border-0 bg-gradient-to-r from-blue-100 to-blue-200 p-4 shadow-xs shadow-black">
                              <div className="flex items-center gap-3">
                                 <FaUser className="text-blue-600" size={20} />
                                 <h3 className="text-lg font-extrabold tracking-wider text-black select-none">
                                    Recurso
                                 </h3>
                              </div>
                           </div>

                           <div className="p-4">
                              <div className="space-y-2">
                                 <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                       Responsável:
                                    </p>
                                    <p className="text-lg font-bold tracking-wider text-black select-none">
                                       {corrigirTextoCorrompido(
                                          chamado.NOME_RECURSO
                                       ) ?? '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        {/* ===== */}

                        {/* Card Assunto */}
                        <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md shadow-black md:col-span-2 lg:col-span-3">
                           <div className="border-0 bg-gradient-to-r from-blue-100 to-blue-200 p-4 shadow-xs shadow-black">
                              <div className="flex items-center gap-3">
                                 <MdDescription
                                    className="text-blue-600"
                                    size={20}
                                 />
                                 <h3 className="text-lg font-extrabold tracking-wider text-black select-none">
                                    Assunto
                                 </h3>
                              </div>
                           </div>

                           <div className="p-4">
                              <div className="space-y-2">
                                 <div className="flex flex-col">
                                    <p className="text-lg font-bold tracking-wider text-black select-none">
                                       {corrigirTextoCorrompido(
                                          chamado.ASSUNTO_CHAMADO
                                       ) ?? '-'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>
            </main>
         </div>
      </div>
   );
}
