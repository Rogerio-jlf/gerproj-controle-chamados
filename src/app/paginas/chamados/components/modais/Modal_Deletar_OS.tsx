'use client';
// ================================================================================
import { toast } from 'sonner';
import { useState } from 'react';
// ================================================================================
import { ToastCustom } from '../../../../../components/Toast_Custom';
// ================================================================================
import { IoClose } from 'react-icons/io5';
import { RiDeleteBin5Fill } from 'react-icons/ri';

// ================================================================================
// INTERFACES
// ================================================================================
interface ModalExcluirOSProps {
   isOpen: boolean;
   onClose: () => void;
   codOS: number | null;
   onSuccess?: () => void;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function ModalExcluirOS({
   isOpen,
   onClose,
   codOS,
   onSuccess,
}: ModalExcluirOSProps) {
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   // ====================

   // Função para fechar o modal
   const handleCloseModalExcluirOS = () => {
      if (!isLoading) {
         setError(null);
         setSuccess(false);
         onClose();
      }
   };
   // ====================

   // Função para excluir OS
   const handleSubmitExcluirOS = async () => {
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
               title="Sucesso!"
               description={`A OS #${codOS} foi deletada com sucesso!!!`}
            />
         ));

         handleCloseModalExcluirOS();

         if (onSuccess) {
            onSuccess();
         }
      } catch (error) {
         console.error('Erro ao deletar OS:', error);

         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro"
               description={`Não foi possível deletar a OS #${codOS}.`}
            />
         ));
      } finally {
         setIsLoading(false);
      }
   };
   // ====================

   if (!isOpen) return null;

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xl"
            // onClick={handleCloseModalExcluirOS}
         />
         {/* ========== */}

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-white shadow-xl shadow-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-black p-6">
               <div className="flex items-center justify-center gap-6">
                  <RiDeleteBin5Fill className="text-white" size={60} />
                  {/* ===== */}
                  <div className="flex flex-col">
                     <h1 className="text-3xl font-extrabold tracking-wider text-white select-none">
                        Excluir OS
                     </h1>
                     {/* ===== */}
                     <p className="text-xl font-extrabold tracking-widest text-white select-none">
                        OS #{codOS}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               {/* Botão fechar modal */}
               <button
                  onClick={handleCloseModalExcluirOS}
                  disabled={isLoading}
                  className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <IoClose size={24} />
               </button>
            </header>
            {/* ==================== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="flex flex-col gap-12 px-6 py-16">
               <div className="flex flex-col items-center justify-center gap-10 rounded-md border-l-8 border-red-600 bg-red-100 p-6 text-center shadow-sm shadow-black">
                  <div className="flex flex-col items-center justify-center">
                     <div className="flex items-center justify-center gap-3">
                        <h3 className="text-xl font-extrabold tracking-wider text-black italic select-none">
                           Você selecionou a{' '}
                           <span className="text-2xl font-bold tracking-widest text-red-600 italic select-none">
                              OS #{codOS}
                           </span>{' '}
                           para exclusão. Caso deseje continuar com a operação,
                           clique no botão "Excluir" abaixo.
                        </h3>
                     </div>
                  </div>
               </div>
            </main>
            {/* ==================== */}

            {/* ===== FOOTER ===== */}
            <footer className="relative flex justify-end gap-8 border-t-4 border-red-600 p-6">
               {/* Botão cancelar */}
               <button
                  onClick={handleCloseModalExcluirOS}
                  disabled={isLoading}
                  className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-wider text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
               >
                  Cancelar
               </button>
               {/* ===== */}

               {/* Botão excluir */}
               <button
                  onClick={handleSubmitExcluirOS}
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
                        <RiDeleteBin5Fill
                           className="mr-2 inline-block"
                           size={20}
                        />
                        <span>Excluir</span>
                     </div>
                  )}
               </button>
            </footer>
         </div>
      </div>
   );
}
