'use client';

import { useState } from 'react';
// ====================
import { IoClose } from 'react-icons/io5';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { MdDeleteSweep } from 'react-icons/md';
import { IoIosInformationCircle } from 'react-icons/io';
// ================================================================================

interface ModalExcluirOSProps {
   isOpen: boolean;
   onClose: () => void;
   codOS: string | null;
   onSuccess?: () => void;
}
// ================================================================================

// ===== COMPONENTE PRINCIPAL =====
export function ModalExcluirOS({
   isOpen,
   onClose,
   codOS,
   onSuccess,
}: ModalExcluirOSProps) {
   // ===== ESTADOS =====
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   // ====================

   // ===== FUNÇÃO EXCLUIR =====
   const handleConfirm = async () => {
      if (!codOS) return;

      setIsLoading(true);
      setError(null);

      try {
         const response = await fetch(`/api/apontamentos/delete/${codOS}`, {
            method: 'DELETE',
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao excluir OS');
         }

         setSuccess(true);

         setTimeout(() => {
            setSuccess(false);
            onClose();
            onSuccess?.();
         }, 2000);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Erro ao excluir OS');
      } finally {
         setIsLoading(false);
      }
   };
   // ====================

   // Função para fechar o modal
   const handleClose = () => {
      if (!isLoading) {
         setError(null);
         setSuccess(false);
         onClose();
      }
   };
   // ====================

   if (!isOpen) return null;
   // ================================================================================

   // ===== RENDERIZAÇÃO DO COMPONENTE =====
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
            <header className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-6 shadow-sm shadow-black">
               <section className="flex items-center justify-between">
                  <div className="flex items-center justify-between gap-6">
                     <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                        <FaExclamationTriangle
                           className="text-black"
                           size={36}
                        />
                     </div>

                     <div className="flex flex-col items-center justify-center">
                        <h1 className="text-2xl font-extrabold tracking-wider text-black select-none">
                           Excluir OS
                        </h1>

                        <div className="rounded-full bg-black px-6 py-1">
                           <p className="text-base font-extrabold tracking-widest text-white italic select-none">
                              #{codOS}
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
            {/* ==================== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="max-h-[calc(95vh-140px)] space-y-6 overflow-y-auto bg-gray-100 p-6">
               {/* Alerta de sucesso */}
               {success && (
                  <div className="mb-6 rounded-full border border-green-200 bg-green-600 px-6 py-2">
                     <div className="flex items-center gap-3">
                        <FaCheckCircle className="text-green-500" size={20} />

                        <p className="text-base font-semibold tracking-wider text-white select-none">
                           OS excluída com sucesso!
                        </p>
                     </div>
                  </div>
               )}

               {/* Alerta de erro */}
               {error && (
                  <div className="mb-6 rounded-full border border-red-200 bg-red-600 px-6 py-2">
                     <div className="flex items-center gap-3">
                        <FaExclamationTriangle
                           className="text-red-500"
                           size={20}
                        />

                        <p className="text-base font-semibold tracking-wider text-white select-none">
                           {error}
                        </p>
                     </div>
                  </div>
               )}
               {/* ==================== */}

               {/* ===== SEÇÃO DE CONFIRMAÇÃO ===== */}
               <section className="overflow-hidden rounded-md bg-white shadow-md shadow-black">
                  <div className="bg-black px-4 py-2">
                     <div className="flex items-center gap-4">
                        <MdDeleteSweep className="text-white" size={32} />

                        <h3 className="text-lg font-bold tracking-wider text-white select-none">
                           Confirmação
                        </h3>
                     </div>
                  </div>

                  <div className="flex flex-col items-start justify-center gap-10 p-6">
                     <div className="flex items-center justify-center gap-3">
                        <FaExclamationTriangle
                           className="text-amber-500"
                           size={28}
                        />

                        <p className="text-xl font-extrabold tracking-wider text-black select-none">
                           {`Tem certeza que deseja excluir a OS #${codOS}?`}
                        </p>
                     </div>

                     <div className="flex items-center justify-center gap-3">
                        <IoIosInformationCircle
                           className="text-red-600"
                           size={32}
                        />

                        <p className="text-sm font-semibold tracking-wider text-gray-800 italic select-none">
                           Todos os dados relacionados a essa OS serão
                           permanentemente removidos do sistema.
                        </p>
                     </div>
                  </div>
               </section>
               {/* ==================== */}

               {/* ===== SEÇÃO BOTÕES DE AÇÃO ===== */}
               <section className="flex items-center justify-end gap-6">
                  {/* Botão Cancelar */}
                  <button
                     onClick={handleClose}
                     disabled={isLoading}
                     className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold text-white shadow-md shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
                  >
                     Cancelar
                  </button>

                  {/* Botão Confirmar Exclusão */}
                  <button
                     onClick={handleConfirm}
                     disabled={isLoading || !codOS}
                     className="cursor-pointer rounded-xl border-none bg-blue-500 px-6 py-2 text-lg font-extrabold text-white shadow-md shadow-black transition-all select-none hover:scale-105 hover:bg-blue-900 hover:shadow-md hover:shadow-black active:scale-95"
                  >
                     {isLoading ? (
                        <>
                           <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                           <span>Excluindo...</span>
                        </>
                     ) : (
                        <span>Confirmar Exclusão</span>
                     )}
                  </button>
               </section>
            </main>
         </div>
      </div>
   );
}
