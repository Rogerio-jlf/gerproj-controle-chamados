'use client';
// ================================================================================
import { toast } from 'sonner';
import { useState } from 'react';
// ================================================================================
import { ToastCustom } from '../../../../../components/Toast_Custom';
// ================================================================================
import { IoClose } from 'react-icons/io5';
import { IoIosSave } from 'react-icons/io';
import { MdDeleteSweep } from 'react-icons/md';
import { FaExclamationTriangle } from 'react-icons/fa';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================
interface ModalExcluirOSProps {
   isOpen: boolean;
   onClose: () => void;
   codOS: number | null;
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
   const handleSubmitDelete = async () => {
      if (!codOS) return;

      setIsLoading(true);
      setError(null);

      try {
         const response = await fetch(
            `/api/apontamentos-tarefa/delete/${codOS}`,
            {
               method: 'DELETE',
            }
         );

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao excluir OS');
         }

         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Operação realizada com sucesso!"
               description={`A Ordem de Serviço #${codOS} foi deletada com sucesso!`}
            />
         ));
      } catch (error) {
         console.error('Erro ao deletar OS:', error);

         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro ao tentar deletar OS"
               description="Tente novamente em instantes."
            />
         ));
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

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-slate-50 shadow-xl shadow-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-6 shadow-md shadow-black">
               {/* Título do modal */}
               <div className="flex items-center justify-center gap-6">
                  <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                     <FaExclamationTriangle className="text-black" size={36} />
                  </div>
                  <div className="flex flex-col">
                     <h1 className="text-3xl font-extrabold tracking-wider text-black select-none">
                        Excluir OS
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-black select-none">
                        OS #{codOS}
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
            {/* ==================== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="flex flex-col gap-12 p-6">
               <div className="flex flex-col items-center justify-center gap-10 rounded-md border-l-8 border-red-600 bg-slate-50 p-6 text-center shadow-sm shadow-black">
                  {/* Cabeçalho do card */}
                  <div className="flex flex-col items-center justify-center">
                     <div className="flex items-center justify-center gap-3">
                        <MdDeleteSweep className="text-black" size={28} />
                        <h4 className="text-xl font-extrabold tracking-wider text-black select-none">
                           Exclusão de OS
                        </h4>
                     </div>
                     <p className="text-2xl font-extrabold tracking-widest text-black italic select-none">
                        Ordem de Serviço - #{codOS}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               {/* Aviso de exclusão */}
               <div className="w-full rounded-lg border-l-4 border-red-600 bg-red-200 p-4 shadow-sm shadow-black">
                  <div className="flex items-start gap-3">
                     <FaExclamationTriangle
                        className="mt-0.5 text-red-600"
                        size={16}
                     />
                     <p className="text-sm font-semibold tracking-widest text-black italic select-none">
                        Esta operação será executada de forma permanente no
                        banco de dados.
                     </p>
                  </div>
               </div>
            </main>
            {/* ==================== */}

            {/* ===== FOOTER ===== */}
            <footer className="relative flex justify-end gap-4 border-t-4 border-red-600 p-6">
               {/* Botão cancelar */}
               <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
               >
                  Cancelar
               </button>
               {/* ===== */}

               {/* Botão excluir */}
               <button
                  onClick={handleSubmitDelete}
                  disabled={isLoading || !codOS}
                  className="cursor-pointer rounded-xl border-none bg-blue-500 px-6 py-2 text-lg font-extrabold text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-blue-900 hover:shadow-md hover:shadow-black active:scale-95"
               >
                  {isLoading ? (
                     <div className="flex items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Excluindo...</span>
                     </div>
                  ) : (
                     <div className="flex items-center gap-1">
                        <IoIosSave className="mr-2 inline-block" size={20} />
                        <span>Excluir</span>
                     </div>
                  )}
               </button>
            </footer>
         </div>
      </div>
   );
}
