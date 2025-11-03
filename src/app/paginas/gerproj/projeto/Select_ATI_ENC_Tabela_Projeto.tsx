// IMPORTS
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';

// ICONS
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';

// ================================================================================
// INTERFACES
// ================================================================================
interface SelectAtiEncProps {
   value: string;
   onChange: (value: string) => void;
}

interface OptionType {
   name: string;
   code: string;
}

// ================================================================================
// CONSTANTES
// ================================================================================
const OPTIONS: readonly OptionType[] = [
   { name: 'ATI', code: 'ATI' },
   { name: 'ENC', code: 'ENC' },
] as const;

// ================================================================================
// HOOKS CUSTOMIZADOS
// ================================================================================
function useClickOutside(
   ref: React.RefObject<HTMLElement | null>,
   callback: () => void
) {
   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         const el = ref.current;
         if (el && !el.contains(event.target as Node)) {
            callback();
         }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
         document.removeEventListener('mousedown', handleClickOutside);
   }, [ref, callback]);
}

function useKeyboardNavigation(
   isOpen: boolean,
   onClose: () => void,
   onClear: () => void,
   hasValue: boolean
) {
   useEffect(() => {
      if (!isOpen) return;

      function handleKeyDown(event: KeyboardEvent) {
         if (event.key === 'Escape') {
            event.preventDefault();
            if (hasValue) {
               onClear();
            } else {
               onClose();
            }
         }
      }

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
   }, [isOpen, onClose, onClear, hasValue]);
}

// ================================================================================
// COMPONENTE DROPDOWN OPTION
// ================================================================================
const DropdownOption = memo(
   ({
      option,
      isSelected,
      onSelect,
   }: {
      option: OptionType;
      isSelected: boolean;
      onSelect: (code: string) => void;
   }) => (
      <button
         onClick={() => onSelect(option.code)}
         className={`w-full px-4 py-2.5 text-left text-base font-semibold tracking-widest italic transition-all ${
            isSelected
               ? 'bg-blue-500 text-white'
               : 'text-black hover:bg-black hover:text-white'
         }`}
      >
         {option.name}
      </button>
   )
);
DropdownOption.displayName = 'DropdownOption';

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const SelectAtiEncTabelaProjeto = memo(
   ({ value, onChange }: SelectAtiEncProps) => {
      const [isOpen, setIsOpen] = useState(false);
      const [localValue, setLocalValue] = useState(value);
      const isUserTyping = useRef(false);
      const dropdownRef = useRef<HTMLDivElement>(null);

      // Sincroniza valor local com prop externa APENAS se não estiver digitando
      useEffect(() => {
         if (!isUserTyping.current) {
            setLocalValue(value);
         }
      }, [value]);

      // Memoiza a opção selecionada
      const selectedOption = useMemo(
         () => OPTIONS.find(opt => opt.code === value),
         [value]
      );

      // Handlers otimizados
      const handleToggle = useCallback(() => {
         setIsOpen(prev => !prev);
      }, []);

      const handleClose = useCallback(() => {
         setIsOpen(false);
      }, []);

      const handleSelect = useCallback(
         (code: string) => {
            isUserTyping.current = true;
            setLocalValue(code);
            onChange(code);
            setIsOpen(false);

            // Reset do flag após a atualização
            requestAnimationFrame(() => {
               isUserTyping.current = false;
            });
         },
         [onChange]
      );

      const handleClear = useCallback(
         (e?: React.MouseEvent) => {
            if (e) {
               e.stopPropagation();
            }

            isUserTyping.current = false;
            setLocalValue('');
            onChange('');
            setIsOpen(false);
         },
         [onChange]
      );

      // Hooks customizados
      useClickOutside(dropdownRef, handleClose);
      useKeyboardNavigation(isOpen, handleClose, handleClear, !!value);

      // ================================================================================
      // RENDERIZAÇÃO
      // ================================================================================
      return (
         <div ref={dropdownRef} className="group relative w-full">
            {/* Button */}
            <button
               onClick={handleToggle}
               aria-expanded={isOpen}
               aria-haspopup="listbox"
               className={`flex w-full cursor-pointer items-center justify-between rounded-md px-4 py-2.5 text-lg font-bold shadow-sm shadow-black transition-all select-none focus:ring-2 focus:outline-none ${
                  value
                     ? 'hover:bg-opacity-90 bg-white text-black ring-2 ring-pink-500'
                     : 'border border-teal-950 bg-teal-900 text-white hover:scale-95 hover:bg-teal-950'
               } focus:ring-pink-500`}
            >
               <span className={value ? 'text-black' : 'text-white'}>
                  {selectedOption?.name}
               </span>

               <div className="flex items-center gap-2">
                  {value && (
                     <span
                        onClick={handleClear}
                        role="button"
                        aria-label="Limpar seleção"
                        className="cursor-pointer text-black transition-all hover:scale-150 hover:rotate-180 hover:text-red-500"
                        title="Limpar (Esc)"
                     >
                        <IoClose size={24} />
                     </span>
                  )}
                  <span
                     className={`transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                     } ${value ? 'text-black' : 'text-white'}`}
                     aria-hidden="true"
                  >
                     <IoIosArrowDown size={24} />
                  </span>
               </div>
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
               <div
                  role="listbox"
                  className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-md bg-white shadow-md shadow-black"
               >
                  {OPTIONS.map(option => (
                     <DropdownOption
                        key={option.code}
                        option={option}
                        isSelected={value === option.code}
                        onSelect={handleSelect}
                     />
                  ))}
               </div>
            )}
         </div>
      );
   }
);

SelectAtiEncTabelaProjeto.displayName = 'SelectAtiEncTabelaProjeto';
