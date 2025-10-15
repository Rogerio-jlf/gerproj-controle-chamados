'use client';
// ================================================================================
import { TabelaChamadoProps } from '../../../../../types/types';
// ================================================================================
import {
   formatCodChamado,
   getStylesStatus,
} from '../../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../../lib/corrigirTextoCorrompido';
// ================================================================================
import {
   FaCalendarAlt,
   FaUser,
   FaClock,
   FaTag,
   FaUserTie,
   FaDatabase,
   FaTasks,
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { FaDiagramProject } from 'react-icons/fa6';
import { MdSubject, MdPriorityHigh, MdEmail } from 'react-icons/md';

// ================================================================================
// INTERFACES
// ================================================================================
interface ModalVisualizarChamadoProps {
   isOpen: boolean;
   onClose: () => void;
   chamado: TabelaChamadoProps | null;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function ModalVisualizarChamado({
   isOpen,
   onClose,
   chamado,
}: ModalVisualizarChamadoProps) {
   // ==========

   // Função para fechar o modal
   const handleCloseModalVisualizarChamado = () => {
      onClose();
   };
   // ==========

   // Se o modal não estiver aberto ou o chamado for nulo, não renderiza nada
   if (!isOpen || !chamado) return null;

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
         {/* ========== */}

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-white/70 shadow-sm shadow-white transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-teal-600 p-6 shadow-sm shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <FaDatabase className="text-black" size={60} />
                  {/* ===== */}
                  <div className="flex flex-col">
                     <h1 className="text-3xl font-extrabold tracking-wider text-black select-none">
                        Dados do Chamado
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                        Chamado #{formatCodChamado(chamado.COD_CHAMADO)}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               {/* Botão fechar modal */}
               <button
                  onClick={handleCloseModalVisualizarChamado}
                  className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-sm shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <IoClose size={24} />
               </button>
            </header>
            {/* ============================== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="flex h-full overflow-hidden">
               {/* ===== DADOS DO CHAMADO ===== */}
               <section className="w-full overflow-y-auto bg-white/10 p-6">
                  <div className="space-y-0 overflow-hidden rounded-xl border-t-2 border-gray-200 bg-white/70 shadow-sm shadow-black">
                     {/* Data */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <FaCalendarAlt className="text-blue-600" size={24} />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Data & Hora Abertura
                           </span>
                           <span className="text-lg font-bold tracking-wider text-black italic select-none">
                              {chamado.DATA_HORA_CHAMADO ?? '-'}
                           </span>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* Status */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <FaClock className="text-blue-600" size={24} />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Status
                           </span>
                           <span
                              className={`inline-block rounded-full px-6 py-1 text-base font-bold tracking-wider italic select-none ${getStylesStatus(
                                 chamado.STATUS_CHAMADO
                              )}`}
                           >
                              {chamado.STATUS_CHAMADO ?? '-'}
                           </span>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* Data Atribuição */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <FaCalendarAlt className="text-blue-600" size={24} />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Data & Hora Atribuição
                           </span>
                           <span className="text-lg font-bold tracking-wider text-black italic select-none">
                              {chamado.DTENVIO_CHAMADO ?? '-'}
                           </span>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* Consultor */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <FaUser className="text-blue-600" size={24} />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Consultor
                           </span>
                           <span className="text-lg font-bold tracking-wider text-black italic select-none">
                              {corrigirTextoCorrompido(
                                 chamado.NOME_RECURSO?.split(' ')
                                    .slice(0, 2)
                                    .join(' ') ?? ''
                              ) ?? '-'}
                           </span>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* Tarefa */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <FaTasks className="text-blue-600" size={24} />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Tarefa
                           </span>
                           <span className="text-lg font-bold tracking-wider text-black italic select-none">
                              {chamado.TAREFA_COMPLETA ?? '-'}
                           </span>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* Projeto */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <FaDiagramProject
                              className="text-blue-600"
                              size={24}
                           />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Projeto
                           </span>
                           <span className="text-lg font-bold tracking-wider text-black italic select-none">
                              {chamado.PROJETO_COMPLETO ?? '-'}
                           </span>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* Cliente */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <FaUserTie className="text-blue-600" size={24} />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Cliente
                           </span>
                           <span className="text-lg font-bold tracking-wider text-black italic select-none">
                              {chamado.NOME_CLIENTE?.split(' ')
                                 .slice(0, 2)
                                 .join(' ') ?? '-'}
                           </span>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* Assunto */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <MdSubject className="text-blue-600" size={24} />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Assunto
                           </span>
                           <span className="text-lg font-bold tracking-wider text-black italic select-none">
                              {corrigirTextoCorrompido(
                                 chamado.ASSUNTO_CHAMADO ?? ''
                              ) ?? '-'}
                           </span>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* Email */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <MdEmail className="text-blue-600" size={24} />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Email
                           </span>
                           <span className="text-lg font-bold tracking-wider text-black italic select-none">
                              {chamado.EMAIL_CHAMADO ?? '-'}
                           </span>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* Prioridade */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <MdPriorityHigh
                              className="text-blue-600"
                              size={24}
                           />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Prioridade
                           </span>
                           <span className="inline-block rounded-full bg-gray-300 px-6 py-1 text-base font-bold tracking-wider text-black italic select-none">
                              {chamado.PRIOR_CHAMADO ?? '-'}
                           </span>
                        </div>
                     </div>
                     {/* ========== */}

                     {/* Classificação */}
                     <div className="group flex items-center gap-4 border-b border-gray-200 px-6 py-3">
                        <div className="flex w-16 items-center justify-center rounded-md border-r border-gray-200 bg-blue-200 p-3">
                           <FaTag className="text-blue-600" size={24} />
                        </div>
                        {/* ===== */}
                        <div className="flex flex-1 items-center justify-between">
                           <span className="text-sm font-semibold tracking-wider text-black select-none">
                              Classificação
                           </span>
                           <span className="text-lg font-bold tracking-wider text-black italic select-none">
                              {chamado.NOME_CLASSIFICACAO ?? '-'}
                           </span>
                        </div>
                     </div>
                  </div>
               </section>
            </main>
         </div>
      </div>
   );
}
