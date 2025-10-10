import { useState, useRef, useEffect } from 'react';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';

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
// MODAL DE CONFIRMAÇÃO
// ================================================================================
interface ConfirmModalProps {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   fieldName: string;
   oldValue: SimNaoValue;
   newValue: SimNaoValue;
   isLoading: boolean;
}

function ConfirmModal({
   isOpen,
   onClose,
   onConfirm,
   fieldName,
   oldValue,
   newValue,
   isLoading,
}: ConfirmModalProps) {
   if (!isOpen) return null;

   const fieldLabel = fieldName === 'FATURADO_OS' ? 'Faturado' : 'Validado';

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="absolute inset-0 bg-black/60" onClick={onClose} />

         <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-black">
               Confirmar Alteração
            </h2>

            <div className="mb-6 space-y-2">
               <p className="text-sm font-semibold text-gray-700">
                  Deseja realmente alterar o campo{' '}
                  <span className="font-bold">{fieldLabel}</span>?
               </p>
               <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-600">De:</span>
                  <span
                     className={`rounded px-2 py-1 font-bold ${
                        oldValue === 'SIM'
                           ? 'bg-green-200 text-green-800'
                           : 'bg-red-200 text-red-800'
                     }`}
                  >
                     {oldValue || 'Não definido'}
                  </span>
               </div>
               <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-gray-600">Para:</span>
                  <span
                     className={`rounded px-2 py-1 font-bold ${
                        newValue === 'SIM'
                           ? 'bg-green-200 text-green-800'
                           : 'bg-red-200 text-red-800'
                     }`}
                  >
                     {newValue || 'Não definido'}
                  </span>
               </div>
            </div>

            <div className="flex justify-end gap-3">
               <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="rounded-md bg-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  Cancelar
               </button>
               <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  {isLoading ? 'Salvando...' : 'Confirmar'}
               </button>
            </div>
         </div>
      </div>
   );
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function EditarCellFaturadoOSValidOS({
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

   const handleSelectBlur = () => {
      // Sai do modo de edição quando o select perde o foco
      setEditing(false);
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
         return 'bg-blue-600 text-white border-[1px] border-blue-700';
      }
      if (val === 'NAO') {
         return 'bg-red-600 text-white border-[1px] border-red-700';
      }
      return 'bg-gray-600 text-gray-700 border-[1px] border-gray-700';
   };

   const fieldLabel = fieldName === 'FATURADO_OS' ? 'Faturado' : 'Validado';

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
                     className="bg-white font-bold tracking-wider text-black italic select-none"
                  >
                     SIM
                  </option>
                  <option
                     value="NAO"
                     className="bg-white font-bold tracking-wider text-black italic select-none"
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
                           className={`group relative rounded-full px-2 py-2 transition-all ${
                              !disabled
                                 ? 'cursor-pointer hover:scale-110'
                                 : 'cursor-not-allowed opacity-75'
                           } ${getStyles(currentValue)} ${
                              isLoading ? 'cursor-wait opacity-50' : ''
                           }`}
                           onClick={handleCellClick}
                        >
                           <div className="flex items-center justify-center gap-2">
                              <span className="font-semibold tracking-wider select-none">
                                 {currentValue || 'N/A'}
                              </span>
                           </div>
                        </div>
                     </TooltipTrigger>
                     <TooltipContent
                        side="right"
                        align="start"
                        sideOffset={8}
                        className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
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
         />
      </>
   );
}
