import { useState } from 'react';
// ================================================================================
import {
   AlertDialog,
   AlertDialogContent,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogCancel,
   AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
// ================================================================================
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
// ================================================================================
import { FaEdit, FaExclamationTriangle, FaSave } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
// ================================================================================

// Simple LoadingSpinner component
function LoadingSpinner({ size = 16 }: { size?: number }) {
   return (
      <div
         style={{
            width: size,
            height: size,
            border: `${size! / 8}px solid #3b82f6`,
            borderTop: `${size! / 8}px solid transparent`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
         }}
      />
   );
}

// Add keyframes for spin animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes spin {
   0% { transform: rotate(0deg); }
   100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

interface Props {
   assunto: string;
   codChamado: number;
   onUpdateAssunto?: (codChamado: number, novoAssunto: string) => Promise<void>;
   onClose: () => void;
}
// ================================================================================

export default function AssuntoCellEditavel({
   onClose,
   assunto,
   codChamado,
   onUpdateAssunto,
}: Props) {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [novoAssunto, setNovoAssunto] = useState(assunto);
   const [isLoading, setIsLoading] = useState(false);

   const removerAcentos = (texto: string): string => {
      return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
   };

   const handleSave = async () => {
      if (!onUpdateAssunto) {
         console.warn('Função onUpdateAssunto não foi fornecida');
         return;
      }

      if (novoAssunto.trim() === assunto.trim()) {
         setIsModalOpen(false);
         return;
      }

      if (novoAssunto.trim().length === 0) {
         return;
      }

      const novoAssuntoSemAcentos = removerAcentos(novoAssunto);

      setIsLoading(true);
      try {
         await onUpdateAssunto(codChamado, novoAssuntoSemAcentos.trim());

         // Pequeno delay para garantir que o usuário veja o feedback de sucesso
         await new Promise(resolve => setTimeout(resolve, 800));

         setIsModalOpen(false);
      } catch (error) {
         console.error('Erro ao atualizar assunto:', error);
         // Não feche o modal em caso de erro para que o usuário possa tentar novamente
      } finally {
         setIsLoading(false);
      }
   };

   const handleCancel = () => {
      setNovoAssunto(assunto);
      setIsModalOpen(false);
   };

   const handleOpenModal = () => {
      setNovoAssunto(assunto);
      setIsModalOpen(true);
   };

   const handleClose = () => {
      setTimeout(() => {
         setIsModalOpen(false);
         onClose();
      }, 300);
   };

   return (
      <>
         <Tooltip>
            <TooltipTrigger asChild>
               <div
                  className={`group relative cursor-pointer truncate rounded-md p-2 text-left transition-all ${
                     isLoading ? 'pointer-events-none opacity-60' : ''
                  }`}
                  onClick={handleOpenModal}
               >
                  <span className="block pr-6 font-medium">
                     {corrigirTextoCorrompido(assunto)}
                  </span>

                  {/* Mostrar spinner ou ícone de edit */}
                  {isLoading ? (
                     <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <LoadingSpinner size={16} />
                     </div>
                  ) : (
                     <FaEdit
                        className="absolute top-1/2 right-2 -translate-y-1/2 text-black opacity-0 transition-opacity group-hover:opacity-100"
                        size={20}
                     />
                  )}
               </div>
            </TooltipTrigger>

            <TooltipContent
               side="left"
               align="end"
               sideOffset={8}
               className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
            >
               <div>
                  <div className="max-w-xs break-words">
                     {corrigirTextoCorrompido(assunto)}
                  </div>
                  <div className="mt-1 text-xs font-semibold tracking-wider text-gray-700 italic select-none">
                     {isLoading
                        ? 'Salvando alterações...'
                        : 'Clique para editar'}
                  </div>
               </div>
            </TooltipContent>
         </Tooltip>
         <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <AlertDialogContent className="max-w-3xl overflow-hidden rounded-2xl border-0 bg-white/95 p-0 shadow-2xl backdrop-blur-md">
               <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
                  <AlertDialogHeader className="space-y-0">
                     <AlertDialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                              <FaEdit className="text-white" size={20} />
                           </div>
                           <div>
                              <h3 className="text-xl font-bold">
                                 Editar Assunto
                              </h3>
                              <p className="text-sm font-medium text-green-100">
                                 Chamado #{codChamado}
                              </p>
                           </div>
                        </div>
                        <button
                           onClick={handleClose}
                           disabled={isLoading}
                           className="group rounded-xl bg-white/10 p-2 transition-all duration-200 hover:rotate-90 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                           <IoClose size={20} />
                        </button>
                     </AlertDialogTitle>
                  </AlertDialogHeader>
               </div>

               <div className="space-y-6 p-6">
                  {/* Informações do Chamado */}
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                     <div className="space-y-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <div className="rounded-lg bg-blue-100 p-2">
                              <FaEdit className="text-blue-600" size={18} />
                           </div>
                           <h4 className="text-lg font-bold text-slate-700">
                              Edição de Assunto
                           </h4>
                        </div>

                        <div className="inline-block rounded-xl border border-slate-200 bg-white px-6 py-3 shadow-lg">
                           <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                              Chamado
                           </p>
                           <div className="text-2xl font-bold text-slate-900">
                              #{codChamado}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Editor de Assunto */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-slate-700">
                        <div className="rounded-lg bg-green-100 p-2">
                           <FaSave className="text-green-600" size={18} />
                        </div>
                        <label htmlFor="assunto" className="text-lg font-bold">
                           Assunto do Chamado
                        </label>
                     </div>

                     <Textarea
                        id="assunto"
                        value={novoAssunto}
                        onChange={e => setNovoAssunto(e.target.value)}
                        placeholder="Digite o assunto do chamado..."
                        className="min-h-[140px] resize-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isLoading}
                        maxLength={1000}
                     />

                     {/* Contador de Caracteres */}
                     <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                           <span className="text-sm font-medium text-slate-600">
                              Máximo de 1000 caracteres
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div
                              className={`h-2 w-2 rounded-full ${
                                 novoAssunto.length > 800
                                    ? 'bg-red-500'
                                    : novoAssunto.length > 500
                                      ? 'bg-amber-500'
                                      : 'bg-green-500'
                              }`}
                           ></div>
                           <span
                              className={`text-sm font-semibold ${
                                 novoAssunto.length > 800
                                    ? 'text-red-600'
                                    : novoAssunto.length > 500
                                      ? 'text-amber-600'
                                      : 'text-green-600'
                              }`}
                           >
                              {novoAssunto.length}/1000
                           </span>
                        </div>
                     </div>
                  </div>

                  <AlertDialogDescription asChild>
                     <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                           <FaExclamationTriangle
                              className="mt-0.5 flex-shrink-0 text-amber-600"
                              size={16}
                           />
                           <p className="text-sm font-medium text-amber-800">
                              Esta alteração será salva permanentemente no
                              sistema.
                           </p>
                        </div>
                     </div>
                  </AlertDialogDescription>
               </div>

               <AlertDialogFooter className="gap-3 bg-slate-50 px-6 py-4">
                  <AlertDialogCancel
                     onClick={handleCancel}
                     disabled={isLoading}
                     className="rounded-xl border-2 border-slate-200 bg-white px-6 py-2.5 font-semibold text-slate-700 transition-all duration-200 hover:scale-105 hover:border-slate-300 hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                     Cancelar
                  </AlertDialogCancel>

                  <AlertDialogAction
                     onClick={handleSave}
                     disabled={isLoading || novoAssunto.trim().length === 0}
                     className="rounded-xl bg-gradient-to-r from-green-600 to-blue-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-green-700 hover:to-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                     {isLoading ? (
                        <div className="flex items-center gap-2">
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                           <span>Salvando...</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <FaSave size={14} />
                           <span>Salvar</span>
                        </div>
                     )}
                  </AlertDialogAction>
               </AlertDialogFooter>

               {/* Overlay de Loading */}
               {isLoading && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
                     <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <div className="text-lg font-bold text-slate-900">
                           Salvando alterações...
                        </div>
                        <div className="text-sm text-slate-600">
                           Por favor, aguarde...
                        </div>
                     </div>
                  </div>
               )}
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
