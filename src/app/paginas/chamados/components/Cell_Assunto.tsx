import { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
// ================================================================================
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
   onAssuntoUpdated?: (codChamado: number, novoAssunto: string) => void;
}

// Modal Component
interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
   useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === 'Escape') {
            onClose();
         }
      };

      if (isOpen) {
         document.addEventListener('keydown', handleEscape);
         document.body.style.overflow = 'hidden';
      }

      return () => {
         document.removeEventListener('keydown', handleEscape);
         document.body.style.overflow = 'unset';
      };
   }, [isOpen, onClose]);

   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl"
         onClick={onClose}
      >
         <div
            className="relative max-h-[100vh] w-full max-w-4xl overflow-hidden"
            onClick={e => e.stopPropagation()}
         >
            {children}
         </div>
      </div>
   );
};

// ================================================================================

export default function AssuntoCellEditavel({
   onClose,
   assunto,
   codChamado,
   onUpdateAssunto,
   onAssuntoUpdated,
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
   useEffect(() => {
      setValidationError(validation.error);
   }, [validation.error]);

   const handleSave = async () => {
      if (!onUpdateAssunto || !validation.canSave) return;

      const novoAssuntoSemAcentos = removerAcentos(novoAssunto.trim());
      setIsLoading(true);

      try {
         const start = Date.now();
         await onUpdateAssunto(codChamado, novoAssuntoSemAcentos);

         // Garantir pelo menos 800ms de loading para mostrar spinner
         const elapsed = Date.now() - start;
         if (elapsed < 800) {
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

         // Notificar callback se existir
         if (onAssuntoUpdated) {
            onAssuntoUpdated(codChamado, novoAssuntoSemAcentos);
         }
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

   const handleCloseModal = () => {
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

   // ================================================================================
   // RENDERIZAÇÃO PRINCIPAL
   // ================================================================================

   return (
      <>
         {/* ===== TOOLTIP ===== */}
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
               className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
            >
               <div>
                  <div className="max-w-xs break-words">
                     {corrigirTextoCorrompido(assunto)}
                  </div>
                  <div className="mt-1 text-xs font-semibold tracking-widest text-black italic select-none">
                     Clique para editar
                  </div>
               </div>
            </TooltipContent>
         </Tooltip>
         {/* ==================== */}

         {/* ===== MODAL DE CONFIRMAÇÃO ===== */}
         <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
            {/* ===== OVERLAY ===== */}
            <div
               className="absolute inset-0 bg-black/50 backdrop-blur-xl"
               onClick={handleCloseModal}
            />
            {/* ========== */}
            <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-white transition-all duration-500 ease-out">
               {/* ===== HEADER ===== */}
               <header className="relative flex items-center justify-between bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 p-6 shadow-md shadow-black">
                  {/* Título do modal */}
                  <div className="flex items-center justify-center gap-6">
                     <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                        <FaEdit className="text-black" size={36} />
                     </div>
                     <h1 className="text-3xl font-extrabold tracking-wider text-black select-none">
                        Editar Assunto
                     </h1>
                  </div>
                  {/* ========== */}

                  {/* Botão fechar modal */}
                  <button
                     onClick={handleCloseModal}
                     disabled={isLoading}
                     className="group cursor-pointer rounded-full bg-red-500/50 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     <IoClose size={24} />
                  </button>
               </header>
               {/* ==================== */}

               {/* ===== CONTEÚDO ===== */}
               <main className="flex flex-col gap-12 p-6">
                  {/* ===== CARD DE VISUALIZAÇÃO ===== */}
                  <div className="flex flex-col items-center justify-center gap-10 rounded-md border-l-8 border-blue-600 bg-slate-50 p-6 text-center shadow-sm shadow-black">
                     {/* Cabeçalho do card */}
                     <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center gap-3">
                           <FaEdit className="text-black" size={28} />
                           <h4 className="text-xl font-extrabold tracking-wider text-black select-none">
                              Edição de Assunto
                           </h4>
                        </div>
                        <p className="text-2xl font-extrabold tracking-widest text-black italic select-none">
                           Chamado - #{codChamado}
                        </p>
                     </div>
                     {/* ========== */}

                     {/* Textarea do card */}
                     <div className="flex w-full flex-col items-start justify-center gap-1">
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
                           className={`min-h-[140px] resize-none rounded-md bg-slate-50 p-4 font-semibold text-black shadow-sm shadow-black transition-all hover:-translate-y-1 hover:scale-102 ${
                              validationError
                                 ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                 : 'hover:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none'
                           }`}
                           disabled={isLoading}
                           maxLength={200}
                        />

                        {/* Erro de Validação */}
                        {validationError && (
                           <div className="flex items-center gap-2">
                              <FaExclamationTriangle
                                 className="text-red-600"
                                 size={14}
                              />
                              <span className="text-sm font-semibold tracking-widest text-red-600 italic select-none">
                                 {validationError}
                              </span>
                           </div>
                        )}

                        {/* Status das Mudanças */}
                        {!validation.hasChanges &&
                           novoAssunto.trim() !== '' && (
                              <div className="flex items-center gap-2">
                                 <div className="h-2 w-2 rounded-full bg-red-600"></div>
                                 <span className="text-sm font-semibold tracking-widest text-red-600 italic select-none">
                                    Nenhuma alteração realizada.
                                 </span>
                              </div>
                           )}

                        {/* Status das Mudanças */}
                        {validation.hasChanges && validation.isValid && (
                           <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-600"></div>
                              <span className="text-sm font-semibold tracking-widest text-green-600 italic select-none">
                                 Alteração realizada, pronto para salvar.
                              </span>
                           </div>
                        )}

                        {/* Contador de Caracteres */}
                        <div className="flex w-full items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-black"></div>
                              <span className="text-sm font-semibold tracking-widest text-black italic select-none">
                                 Máximo de 200 caracteres.
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
                                 className={`text-sm font-semibold tracking-widest italic select-none ${
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
                  </div>
                  {/* ========== */}

                  {/* ===== AVISO DE CONFIRMAÇÃO ===== */}
                  {validation.hasChanges && (
                     <div className="rounded-lg border-l-4 border-red-600 bg-amber-200 p-4 shadow-sm shadow-black">
                        <div className="flex items-start gap-3">
                           <FaExclamationTriangle
                              className="mt-0.5 text-red-600"
                              size={16}
                           />
                           <p className="text-sm font-semibold tracking-widest text-black italic select-none">
                              Esta alteração será salva permanentemente.
                           </p>
                        </div>
                     </div>
                  )}
               </main>
               {/* ==================== */}

               {/* ===== FOOTER ===== */}
               <footer className="relative flex justify-end gap-4 border-t-4 border-red-600 p-6">
                  <button
                     onClick={handleCancel}
                     disabled={isLoading}
                     className="cursor-pointer rounded-xl border-none bg-red-500 px-6 py-2 text-lg font-extrabold text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-md hover:shadow-black active:scale-95"
                  >
                     Cancelar
                  </button>
                  {/* ===== */}

                  <button
                     onClick={handleSave}
                     disabled={isLoading || !validation.canSave}
                     className={`cursor-pointer rounded-xl border-none bg-blue-500 px-6 py-2 text-lg font-extrabold text-white shadow-sm shadow-black select-none ${
                        isLoading || !validation.canSave
                           ? 'disabled:cursor-not-allowed disabled:opacity-50'
                           : 'transition-all hover:scale-105 hover:bg-blue-900 hover:shadow-md hover:shadow-black active:scale-95'
                     }`}
                  >
                     {isLoading ? (
                        <div className="flex items-center gap-2">
                           <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                           <span>Atualizando...</span>
                        </div>
                     ) : (
                        <>Atualizar</>
                     )}
                  </button>
               </footer>
            </div>
         </Modal>
      </>
   );
}
