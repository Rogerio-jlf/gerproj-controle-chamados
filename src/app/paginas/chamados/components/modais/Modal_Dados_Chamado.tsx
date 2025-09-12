'use client';

import { useState } from 'react';
// ================================================================================
import { TabelaChamadosProps } from '../../../../../types/types';
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';
// ================================================================================
import { FaCalendarAlt, FaUser, FaFileAlt, FaTags } from 'react-icons/fa';
import {
   IoDocumentText,
   IoClose,
   IoTime,
   IoPersonCircle,
} from 'react-icons/io5';
import { FaClock } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa';
import { FaUserTie } from 'react-icons/fa';
import { MdDescription } from 'react-icons/md';
// ================================================================================

interface ModalChamadoProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: TabelaChamadosProps | null;
}
// ================================================================================

export default function ModalVisualizarChamado({
   isOpen,
   onClose,
   chamado,
}: ModalChamadoProps) {
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
   const getStyleStatus = (status: string | undefined) => {
      switch (status?.toUpperCase()) {
         case 'NAO FINALIZADO':
            return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border border-yellow-300 shadow-yellow-500/30';

         case 'EM ATENDIMENTO':
            return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-300 shadow-blue-500/30';

         case 'FINALIZADO':
            return 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-300 shadow-green-500/30';

         case 'NAO INICIADO':
            return 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-300 shadow-red-500/30';

         case 'STANDBY':
            return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border border-orange-300 shadow-orange-500/30';

         case 'ATRIBUIDO':
            return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-300 shadow-blue-500/30';

         case 'AGUARDANDO VALIDACAO':
            return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border border-purple-300 shadow-purple-500/30';

         default:
            return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border border-gray-300 shadow-gray-500/30';
      }
   };
   // ================================================================================

   const getPriorityStyle = (priority: string | number | undefined | null) => {
      if (priority === undefined || priority === null) {
         return 'bg-gray-100 text-gray-800 border border-gray-200';
      }

      const priorityStr = String(priority).toUpperCase();
      switch (priorityStr) {
         case 'ALTA':
            return 'bg-red-100 text-red-800 border border-red-200';
         case 'MÉDIA':
         case 'MEDIA':
            return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
         case 'BAIXA':
            return 'bg-green-100 text-green-800 border border-green-200';
         default:
            return 'bg-gray-100 text-gray-800 border border-gray-200';
      }
   };

   if (!isOpen || !chamado) return null;
   // ================================================================================

   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xl"
            onClick={handleClose}
         />

         {/* ===== CONTAINER ===== */}
         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-white transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 p-6 shadow-sm shadow-black">
               <section className="flex items-center justify-between">
                  <div className="flex items-center justify-between gap-6">
                     <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                        <FaFileAlt className="text-white" size={32} />
                     </div>

                     <div className="flex flex-col items-center justify-center">
                        <h1 className="text-2xl font-extrabold tracking-wider text-black select-none">
                           Dados Chamado
                        </h1>

                        <div className="rounded-full bg-black px-6 py-1">
                           <p className="text-center text-base font-extrabold tracking-widest text-white italic select-none">
                              #{chamado.COD_CHAMADO}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Botão fechar modal */}
                  <button
                     onClick={handleClose}
                     disabled={isLoading}
                     className="group cursor-pointer rounded-full bg-red-500/50 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     <IoClose size={24} />
                  </button>
               </section>
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
                                       className={`py-1text-lg inline-block rounded-full px-3 font-bold tracking-wider text-black select-none ${getStyleStatus(
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
                                    <p
                                       className={`inline-block rounded-full px-3 py-1 text-lg font-bold tracking-wider text-black select-none ${getPriorityStyle(
                                          chamado.PRIOR_CHAMADO
                                       )}`}
                                    >
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
                                       {chamado.NOME_RECURSO ?? '-'}
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
                                    Descrição
                                 </h3>
                              </div>
                           </div>

                           <div className="p-4">
                              <div className="space-y-2">
                                 <div className="flex flex-col">
                                    <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                       Assunto:
                                    </p>
                                    <p className="text-lg font-bold tracking-wider text-black select-none">
                                       {corrigirTextoCorrompido(
                                          chamado.ASSUNTO_CHAMADO
                                       ) ?? '-'}
                                    </p>
                                 </div>

                                 {corrigirTextoCorrompido(
                                    chamado.ASSUNTO_CHAMADO
                                 ) && (
                                    <div className="mt-3 flex flex-col">
                                       <p className="text-sm font-semibold tracking-wider text-black italic select-none">
                                          Descrição:
                                       </p>
                                       <p className="mt-1 rounded-md border-none bg-gray-50 p-3 text-lg font-bold tracking-wider text-black shadow-sm shadow-black select-none">
                                          {corrigirTextoCorrompido(
                                             chamado.ASSUNTO_CHAMADO
                                          ) ?? '-'}
                                       </p>
                                    </div>
                                 )}
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
