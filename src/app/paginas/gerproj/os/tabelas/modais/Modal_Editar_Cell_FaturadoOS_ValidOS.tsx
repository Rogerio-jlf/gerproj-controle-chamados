import { useState, useRef, useEffect } from 'react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '../../../../../../components/ui/tooltip';
import { IoClose } from 'react-icons/io5';
import { LoadingButton } from '../../../../../../components/Loading';
import { MdEditSquare } from 'react-icons/md';
import { formatarCodNumber } from '../../../../../../utils/formatters';
import { FaArrowsAltH } from 'react-icons/fa';
import { IoIosSave } from 'react-icons/io';

// ================================================================================
// TIPOS
// ================================================================================
type SimNaoValue = 'SIM' | 'NAO' | null;

interface CellEditorSimNaoProps {
   value: SimNaoValue;
   fieldName: 'FATURADO_OS' | 'VALID_OS';
   codOs: number;
   onUpdate: (
      codOs: number,
      field: string,
      newValue: SimNaoValue
   ) => Promise<void>;
   disabled?: boolean;
}

// ================================================================================
// MODAL DE CONFIRMAÇÃO - ESTILIZADO
// ================================================================================
interface ConfirmModalProps {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   fieldName: string;
   oldValue: SimNaoValue;
   newValue: SimNaoValue;
   isLoading: boolean;
   codOs: number;
}

function ConfirmModal({
   isOpen,
   onClose,
   onConfirm,
   oldValue,
   newValue,
   isLoading,
   codOs,
}: ConfirmModalProps) {
   if (!isOpen) return null;

   return (
      <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
         {/* ===== OVERLAY ===== */}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-4xl overflow-hidden rounded-2xl border-0 bg-white shadow-lg shadow-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 p-6 shadow-sm shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center justify-center rounded-lg bg-white/30 p-4 shadow-md shadow-black">
                     <MdEditSquare className="text-black" size={28} />
                  </div>
                  <div className="flex flex-col">
                     <h1 className="text-3xl font-extrabold tracking-widest text-black uppercase select-none">
                        Editar Cliente Paga
                     </h1>
                     <p className="text-xl font-extrabold tracking-widest text-black italic select-none">
                        Código #{formatarCodNumber(codOs)}
                     </p>
                  </div>
               </div>

               {/* Botão fechar modal */}
               <button
                  onClick={onClose}
                  className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white transition-all hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <IoClose size={24} />
               </button>
            </header>

            {/* ===== CONTEÚDO ===== */}
            <main className="flex flex-col gap-12 px-6 py-16">
               <div className="flex flex-col items-center justify-center gap-10 rounded-xl border-t border-l-8 border-red-600 bg-white p-6 text-center shadow-md shadow-black">
                  <div className="flex flex-col items-center justify-center">
                     <div className="flex items-center justify-center gap-3">
                        <h3 className="text-xl font-extrabold tracking-wider text-black italic select-none">
                           Você selecionou a{' '}
                           <span className="text-2xl font-bold tracking-widest text-red-600 italic select-none">
                              OS #{formatarCodNumber(codOs)}
                           </span>{' '}
                           para alterar. Se você deseja continuar com a
                           operação, clique no botão Confirmar, logo abaixo.
                        </h3>
                     </div>

                     {/* Visualização da mudança */}
                     <div className="mt-10 flex items-center justify-center gap-10">
                        {/* Valor Antigo */}
                        <div className="flex items-center justify-center gap-3">
                           <span className="text-xl font-extrabold tracking-widest text-black italic select-none">
                              De:
                           </span>
                           <div
                              className={`rounded-md border-none px-6 py-2 text-xl font-extrabold tracking-widest shadow-md shadow-black ${
                                 oldValue === 'SIM'
                                    ? 'bg-blue-500 text-white'
                                    : oldValue === 'NAO'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-400 text-gray-700'
                              }`}
                           >
                              {oldValue || 'Não definido'}
                           </div>
                        </div>

                        {/* Seta indicadora */}
                        <div>
                           <FaArrowsAltH className="text-black" size={48} />
                        </div>

                        {/* Valor Novo */}
                        <div className="flex items-center justify-center gap-3">
                           <span className="text-xl font-extrabold tracking-widest text-black italic select-none">
                              Para:
                           </span>
                           <div
                              className={`rounded-lg border-none px-6 py-2 text-xl font-extrabold tracking-widest shadow-md shadow-black ${
                                 newValue === 'SIM'
                                    ? 'bg-blue-500 text-white'
                                    : newValue === 'NAO'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-400 text-gray-700'
                              }`}
                           >
                              {newValue || 'Não definido'}
                           </div>
                        </div>
                     </div>
                     {/* ========== */}
                  </div>
               </div>
            </main>

            {/* ===== FOOTER ===== */}
            <footer className="relative flex justify-end gap-8 border-t-4 border-red-600 p-6">
               {/* Botão cancelar */}
               <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-[200px] cursor-pointer rounded-md border-none bg-red-500 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:bg-red-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  Cancelar
               </button>

               {/* Botão confirmar */}
               <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="w-[200px] cursor-pointer rounded-md border-none bg-blue-500 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:bg-blue-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  {isLoading ? (
                     <span className="flex items-center justify-center gap-3">
                        <LoadingButton size={20} />
                        Salvando...
                     </span>
                  ) : (
                     <div className="flex items-center justify-center gap-3">
                        <IoIosSave className="mr-2 inline-block" size={20} />
                        <span>Alterar</span>
                     </div>
                  )}
               </button>
            </footer>
         </div>
      </div>
   );
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function ModalEditarCellFaturadoOSValidOS({
   value,
   fieldName,
   codOs,
   onUpdate,
   disabled = false,
}: CellEditorSimNaoProps) {
   const [editing, setEditing] = useState(false);
   const [currentValue, setCurrentValue] = useState<SimNaoValue>(value);
   const [pendingValue, setPendingValue] = useState<SimNaoValue>(null);
   const [showModal, setShowModal] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const selectRef = useRef<HTMLSelectElement>(null);

   useEffect(() => {
      setCurrentValue(value);
   }, [value]);

   // Focar no select quando entrar em modo de edição
   useEffect(() => {
      if (editing && selectRef.current) {
         selectRef.current.focus();
      }
   }, [editing]);

   const handleCellClick = () => {
      if (!disabled && !isLoading) {
         setEditing(true);
         // Abre o select automaticamente após um pequeno delay
         setTimeout(() => {
            if (selectRef.current) {
               selectRef.current.showPicker?.();
            }
         }, 50);
      }
   };

   const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value as SimNaoValue;

      // Se o usuário selecionou o mesmo valor, apenas sai do modo de edição
      if (newValue === currentValue) {
         setEditing(false);
         return;
      }

      setPendingValue(newValue);
      setEditing(false);
      setShowModal(true);
   };

   const handleConfirm = async () => {
      if (!pendingValue) return;

      setIsLoading(true);
      try {
         await onUpdate(codOs, fieldName, pendingValue);
         setCurrentValue(pendingValue);
         setShowModal(false);
         setPendingValue(null);
      } catch (error) {
         console.error('Erro ao atualizar:', error);
         // Aqui você pode adicionar um toast de erro
      } finally {
         setIsLoading(false);
      }
   };

   const handleCancel = () => {
      setShowModal(false);
      setPendingValue(null);
   };

   // Estilos baseados no valor
   const getStyles = (val: SimNaoValue) => {
      if (val === 'SIM') {
         return 'bg-blue-600 text-white border-[1px] border-blue-700 hover:bg-blue-800';
      }
      if (val === 'NAO') {
         return 'bg-red-600 text-white border-[1px] border-red-700 hover:bg-red-800';
      }
      return 'bg-gray-600 text-gray-700 border-[1px] border-gray-700 hover:bg-gray-500';
   };

   const fieldLabel =
      fieldName === 'FATURADO_OS'
         ? '"Cliente Paga OS"'
         : '"Consultor Recebe OS"';

   return (
      <>
         <div className="text-center">
            {editing && !disabled ? (
               // ===== MODO DE EDIÇÃO - SELECT =====
               <select
                  ref={selectRef}
                  autoFocus
                  value={currentValue || ''}
                  onBlur={() => setTimeout(() => setEditing(false), 100)}
                  onChange={handleSelectChange}
                  onClick={e => {
                     e.preventDefault();
                     e.stopPropagation();
                     setEditing(false);
                  }}
                  onKeyDown={e => {
                     if (e.key === 'Escape') {
                        setEditing(false);
                     }
                  }}
                  className={`w-full min-w-[60px] rounded-md px-2 py-1 font-bold ${getStyles(currentValue)}`}
                  disabled={isLoading}
               >
                  <option
                     value="SIM"
                     className="bg-white font-bold tracking-widest text-black italic"
                  >
                     SIM
                  </option>
                  <option
                     value="NAO"
                     className="bg-white font-bold tracking-widest text-black italic"
                  >
                     NAO
                  </option>
               </select>
            ) : (
               // ===== TOOLTIP =====
               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <div
                           className={`group relative rounded-md p-2 transition-all ${
                              !disabled
                                 ? 'cursor-pointer'
                                 : 'cursor-not-allowed opacity-75'
                           } ${getStyles(currentValue)} ${
                              isLoading ? 'cursor-wait opacity-50' : ''
                           }`}
                           onClick={handleCellClick}
                        >
                           <div className="flex items-center justify-center gap-2">
                              <span className="font-semibold tracking-widest">
                                 {currentValue || '-----'}
                              </span>
                           </div>
                        </div>
                     </TooltipTrigger>
                     <TooltipContent
                        side="left"
                        align="start"
                        sideOffset={8}
                        className="border-t-8 border-blue-600 bg-white text-sm font-extrabold tracking-widest text-black italic shadow-sm shadow-black select-none"
                     >
                        <div className="text-sm font-semibold tracking-wider text-black italic select-none">
                           {isLoading
                              ? 'Aguarde...'
                              : disabled
                                ? `Não é possível editar ${fieldLabel}`
                                : `Clique para alterar ${fieldLabel}`}
                        </div>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            )}
         </div>

         {/* MODAL DE CONFIRMAÇÃO */}
         <ConfirmModal
            isOpen={showModal}
            onClose={handleCancel}
            onConfirm={handleConfirm}
            fieldName={fieldName}
            oldValue={currentValue}
            newValue={pendingValue}
            isLoading={isLoading}
            codOs={codOs}
         />
      </>
   );
}
