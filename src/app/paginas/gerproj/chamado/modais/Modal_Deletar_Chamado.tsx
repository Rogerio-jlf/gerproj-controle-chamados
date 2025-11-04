'use client';
// IMPORTS
import { toast } from 'sonner';
import { useState } from 'react';

// COMPONENTS
import { LoadingButton } from '../../../../../components/Loading';
import { ToastCustom } from '../../../../../components/Toast_Custom';

// FORMATTERS
import { formatarCodNumber } from '../../../../../utils/formatters';

// ICONS
import { IoClose } from 'react-icons/io5';
import { RiDeleteBin5Fill } from 'react-icons/ri';

// ================================================================================
// INTERFACES
// ================================================================================
interface ModalExcluirChamadoProps {
   isOpen: boolean;
   onClose: () => void;
   codChamado: number | null;
   onSuccess?: () => void;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function ModalExcluirChamado({
   isOpen,
   onClose,
   codChamado,
   onSuccess,
}: ModalExcluirChamadoProps) {
   const [isLoading, setIsLoading] = useState(false);

   // Função para fechar o modal
   const handleCloseModalExcluirChamado = () => {
      if (!isLoading) {
         onClose();
      }
   };

   // Função para excluir Chamado
   const handleSubmitExcluirChamado = async () => {
      if (!codChamado) {
         console.error('COD_CHAMADO não encontrado:', codChamado);
         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro"
               description="Código do chamado inválido"
            />
         ));
         return;
      }

      setIsLoading(true);

      try {
         const response = await fetch(`/api/chamado/delete/${codChamado}`, {
            method: 'DELETE',
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao excluir chamado');
         }

         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Sucesso!"
               description={`O Chamado #${formatarCodNumber(codChamado)} foi excluído com sucesso!!!`}
            />
         ));

         handleCloseModalExcluirChamado();

         if (onSuccess) {
            onSuccess();
         }
      } catch (error) {
         console.error('Erro ao deletar chamado:', error);

         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro"
               description={`Não foi possível deletar o Chamado #${formatarCodNumber(codChamado)}.`}
            />
         ));
      } finally {
         setIsLoading(false);
      }
   };

   // Se o modal não estiver aberto ou o chamado for nulo, não renderiza nada
   if (!isOpen || !codChamado) return null;

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
         {/* ========== */}

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-teal-900 bg-white transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-teal-700 p-6 shadow-sm shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <RiDeleteBin5Fill className="text-gray-300" size={72} />
                  <div className="flex flex-col">
                     <h1 className="text-4xl font-extrabold tracking-widest text-gray-300 select-none">
                        EXCLUIR CHAMADO
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-gray-300 italic select-none">
                        CÓDIGO {formatarCodNumber(codChamado)}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               <button
                  onClick={handleCloseModalExcluirChamado}
                  disabled={isLoading}
                  className="group active::scale-95 cursor-pointer rounded-full bg-white/20 p-3 transition-all hover:scale-110 hover:rotate-180 hover:bg-red-500"
               >
                  <IoClose
                     className="text-white group-hover:scale-110"
                     size={24}
                  />
               </button>
            </header>
            {/* ==================== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="flex flex-col gap-12 px-6 py-16">
               <div className="flex flex-col items-center justify-center gap-10 rounded-xl border-l-8 border-red-600 bg-white p-6 text-center shadow-sm shadow-black">
                  <div className="flex flex-col items-center justify-center">
                     <div className="flex items-center justify-center gap-3">
                        <h3 className="text-xl font-extrabold tracking-wider text-black italic select-none">
                           Você selecionou o{' '}
                           <span className="text-2xl font-bold tracking-widest text-red-600 italic select-none">
                              Chamado {formatarCodNumber(codChamado)}
                           </span>{' '}
                           para exclusão. Se você deseja continuar com a
                           operação, clique no botão excluir, abaixo.
                        </h3>
                     </div>
                  </div>
               </div>
            </main>

            {/* ===== FOOTER ===== */}
            <footer className="relative flex justify-end gap-8 border-t-4 border-red-600 p-6">
               {/* Botão cancelar */}
               <button
                  onClick={handleCloseModalExcluirChamado}
                  disabled={isLoading}
                  className="w-[200px] cursor-pointer rounded-md border-none bg-gradient-to-r from-red-600 to-red-700 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-sm shadow-black transition-all hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  Cancelar
               </button>

               {/* Botão submit */}
               <button
                  onClick={handleSubmitExcluirChamado}
                  disabled={isLoading || !codChamado}
                  className="w-[200px] cursor-pointer rounded-md border-none bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-sm shadow-black transition-all hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  {isLoading ? (
                     <span className="flex items-center justify-center gap-3">
                        <LoadingButton size={24} />
                        Excluindo...
                     </span>
                  ) : (
                     <div className="flex items-center justify-center gap-3">
                        <RiDeleteBin5Fill
                           className="mr-2 inline-block"
                           size={24}
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
