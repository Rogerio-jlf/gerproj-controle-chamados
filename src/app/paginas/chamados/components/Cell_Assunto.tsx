import { useState, useMemo } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
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
} from '../../../../components/ui/alert-dialog';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
import { Textarea } from '../../../../components/ui/textarea';
// ================================================================================
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import { ToastCustom } from '../../../../components/Toast_Custom';
// ================================================================================
import { FaEdit, FaExclamationTriangle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
// ================================================================================

// Schema de validação com Zod
const assuntoSchema = z.object({
   assunto: z
      .string()
      .min(1, 'O assunto não pode estar vazio')
      .max(200, 'O assunto não pode ter mais de 200 caracteres')
      .trim()
      .refine(
         value => value.length > 0,
         'O assunto deve conter pelo menos um caractere válido'
      ),
});

type AssuntoValidation = z.infer<typeof assuntoSchema>;

interface Props {
   assunto: string;
   codChamado: number;
   onUpdateAssunto?: (codChamado: number, novoAssunto: string) => Promise<void>;
   onClose: () => void;
   // NOVA PROP: Callback para notificar quando o assunto foi atualizado
   onAssuntoUpdated?: (codChamado: number, novoAssunto: string) => void;
}
// ================================================================================

export default function AssuntoCellEditavel({
   onClose,
   assunto,
   codChamado,
   onUpdateAssunto,
   onAssuntoUpdated, // Nova prop
}: Props) {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [novoAssunto, setNovoAssunto] = useState(assunto);
   const [isLoading, setIsLoading] = useState(false);
   const [validationError, setValidationError] = useState<string | null>(null);

   const removerAcentos = (texto: string): string => {
      return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
   };

   // Validação em tempo real e verificação de mudanças
   const validation = useMemo(() => {
      const assuntoTrimmed = novoAssunto.trim();
      const assuntoOriginalTrimmed = assunto.trim();

      // Verificar se houve mudança
      const hasChanges = assuntoTrimmed !== assuntoOriginalTrimmed;

      // Validar com Zod
      const result = assuntoSchema.safeParse({ assunto: assuntoTrimmed });

      return {
         isValid: result.success,
         hasChanges,
         canSave: result.success && hasChanges,
         error: result.success ? null : result.error.issues[0]?.message || null,
      };
   }, [novoAssunto, assunto]);

   // Atualizar erro de validação
   useState(() => {
      setValidationError(validation.error);
   });

   const handleSave = async () => {
      if (!onUpdateAssunto || !validation.canSave) return;

      const novoAssuntoSemAcentos = removerAcentos(novoAssunto.trim());
      setIsLoading(true);

      try {
         const start = Date.now();
         await onUpdateAssunto(codChamado, novoAssuntoSemAcentos);

         // Garantir pelo menos 800ms de loading para mostrar spinner
         const elapsed = Date.now() - start;
         if (elapsed < 3000) {
            await new Promise(res => setTimeout(res, 800 - elapsed));
         }

         toast.custom(t => (
            <ToastCustom
               type="success"
               title="Assunto atualizado com sucesso!"
               description={`Chamado #${codChamado}`}
            />
         ));

         setIsModalOpen(false);
      } catch (error) {
         console.error('Erro ao atualizar assunto:', error);

         toast.custom(t => (
            <ToastCustom
               type="error"
               title="Erro ao tentar atualizar o assunto"
               description="Tente novamente em instantes."
            />
         ));
      } finally {
         setIsLoading(false);
      }
   };

   const handleCancel = () => {
      setNovoAssunto(assunto);
      setValidationError(null);
      setIsModalOpen(false);
   };

   const handleOpenModal = () => {
      setNovoAssunto(assunto);
      setValidationError(null);
      setIsModalOpen(true);
   };

   const handleClose = () => {
      if (!isLoading) {
         setTimeout(() => {
            setIsModalOpen(false);
            onClose();
         }, 300);
      }
   };

   const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNovoAssunto(value);
   };

   return (
      <>
         <Tooltip>
            <TooltipTrigger asChild>
               <div
                  className="group relative cursor-pointer truncate text-left"
                  onClick={handleOpenModal}
               >
                  <span className="block pr-6 font-medium">
                     {corrigirTextoCorrompido(assunto)}
                  </span>

                  {/* Ícone de edit sempre visível no hover */}
                  <FaEdit
                     className="absolute top-1/2 right-2 -translate-y-1/2 text-black opacity-0 transition-opacity group-hover:opacity-100"
                     size={20}
                  />
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
                     Clique para editar
                  </div>
               </div>
            </TooltipContent>
         </Tooltip>
         {/* ==================== */}

         <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <AlertDialogContent className="max-w-3xl overflow-hidden rounded-2xl border-none bg-white/95 p-0">
               {isLoading && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                     <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <span className="text-lg font-bold tracking-wider text-slate-800 select-none">
                           Salvando alterações...
                        </span>
                        <span className="text-sm font-semibold tracking-wider text-slate-600 italic select-none">
                           Chamado #{codChamado}
                        </span>
                     </div>
                  </div>
               )}

               <header className="bg-blue-600 p-6 text-white">
                  <AlertDialogHeader className="space-y-0">
                     <AlertDialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="rounded-md bg-white/10 p-4 shadow-md shadow-black">
                              <FaEdit className="text-white" size={24} />
                           </div>
                           <div>
                              <h3 className="text-2xl font-extrabold tracking-wider text-white select-none">
                                 Editar Assunto
                              </h3>
                              <p className="text-base font-semibold tracking-widest text-gray-200 italic select-none">
                                 Chamado #{codChamado}
                              </p>
                           </div>
                        </div>
                        <button
                           onClick={handleClose}
                           disabled={isLoading}
                           className="group cursor-pointer rounded-full bg-red-600/50 p-2 transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
                        >
                           <IoClose size={20} />
                        </button>
                     </AlertDialogTitle>
                  </AlertDialogHeader>
               </header>

               <div className="space-y-6 p-6">
                  {/* Informações do Chamado */}
                  <div className="rounded-md bg-slate-50 p-6 shadow-sm shadow-black">
                     <div className="space-y-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                           <FaEdit className="text-black" size={20} />
                           <h4 className="text-lg font-extrabold tracking-wider text-black select-none">
                              Edição de Assunto
                           </h4>
                        </div>

                        <div className="inline-block rounded-md bg-white px-6 py-2 shadow-sm shadow-black">
                           <p className="text-xs font-semibold tracking-wider text-slate-800 uppercase select-none">
                              Chamado
                           </p>
                           <div className="text-3xl font-extrabold tracking-widest text-black italic select-none">
                              #{codChamado}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Editor de Assunto */}
                  <div className="space-y-4">
                     <label
                        htmlFor="assunto"
                        className="text-lg font-extrabold tracking-wider text-black select-none"
                     >
                        Assunto do Chamado
                     </label>

                     <Textarea
                        id="assunto"
                        value={novoAssunto}
                        onChange={handleTextareaChange}
                        placeholder="Digite o assunto do chamado..."
                        className={`min-h-[140px] resize-none rounded-md bg-slate-50 p-4 font-semibold text-black shadow-sm shadow-black transition-all focus:outline-none ${
                           validationError
                              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                              : 'focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                        }`}
                        disabled={isLoading}
                        maxLength={200}
                     />

                     {/* Erro de Validação */}
                     {validationError && (
                        <div className="flex items-center gap-2 text-red-600">
                           <FaExclamationTriangle size={14} />
                           <span className="text-sm font-semibold">
                              {validationError}
                           </span>
                        </div>
                     )}

                     {/* Status das Mudanças */}
                     {!validation.hasChanges && novoAssunto.trim() !== '' && (
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                           <span className="text-sm font-semibold tracking-wider text-slate-800 italic select-none">
                              Nenhuma alteração detectada
                           </span>
                        </div>
                     )}

                     {validation.hasChanges && validation.isValid && (
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-green-600"></div>
                           <span className="text-sm font-semibold tracking-wider text-green-700 italic select-none">
                              Alterações detectadas - pronto para salvar
                           </span>
                        </div>
                     )}

                     {/* Contador de Caracteres */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                           <span className="text-sm font-semibold tracking-wider text-slate-800 italic select-none">
                              Máximo de 200 caracteres
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div
                              className={`h-2 w-2 rounded-full ${
                                 novoAssunto.length > 180
                                    ? 'bg-red-600'
                                    : novoAssunto.length > 150
                                      ? 'bg-amber-600'
                                      : 'bg-green-600'
                              }`}
                           ></div>
                           <span
                              className={`text-sm font-semibold tracking-wider italic select-none ${
                                 novoAssunto.length > 180
                                    ? 'text-red-600'
                                    : novoAssunto.length > 150
                                      ? 'text-amber-600'
                                      : 'text-green-600'
                              }`}
                           >
                              {novoAssunto.length}/200
                           </span>
                        </div>
                     </div>
                  </div>

                  {validation.hasChanges && (
                     <AlertDialogDescription asChild>
                        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-100 p-4 shadow-sm shadow-black">
                           <div className="flex items-start gap-3">
                              <FaExclamationTriangle
                                 className="mt-0.5 text-amber-600"
                                 size={16}
                              />
                              <p className="text-sm font-semibold tracking-wider text-amber-600 italic select-none">
                                 Esta alteração será salva permanentemente.
                              </p>
                           </div>
                        </div>
                     </AlertDialogDescription>
                  )}
               </div>

               <AlertDialogFooter className="relative gap-6 border-t border-red-600 bg-slate-50 p-6">
                  <AlertDialogCancel
                     onClick={handleCancel}
                     disabled={isLoading}
                     className="cursor-pointer rounded-xl border-none bg-red-600 px-6 py-2 text-lg font-bold tracking-wider text-white transition-all select-none hover:scale-110 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
                  >
                     Cancelar
                  </AlertDialogCancel>

                  <AlertDialogAction
                     onClick={handleSave}
                     disabled={isLoading || !validation.canSave}
                     className={`rounded-xl border-none bg-blue-600 px-6 py-2 text-lg font-bold tracking-wider text-white transition-all select-none hover:scale-110 hover:bg-blue-900 hover:shadow-md hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-slate-900 disabled:hover:shadow-none`}
                  >
                     {isLoading ? (
                        <div className="flex items-center gap-2">
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                           <span>Salvando...</span>
                        </div>
                     ) : (
                        <span>Salvar</span>
                     )}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
