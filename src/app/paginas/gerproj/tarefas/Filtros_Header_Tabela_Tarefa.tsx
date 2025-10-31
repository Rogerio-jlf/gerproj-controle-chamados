'use client';
// IMPORTS
import { debounce } from 'lodash';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

// TYPES
import { InputFilterTableHeaderProps } from '../../../../types/types';

// FORMATTERS
import { normalizeDate } from '../../../../utils/formatters';

// ICONS
import { FaFilter } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

// ================================================================================
// INTERFACES
// ================================================================================
interface FilterControlsProps {
   showFilters: boolean;
   setShowFilters: (show: boolean) => void;
   totalActiveFilters: number;
   clearFilters: () => void;
   dataLength: number;
}

interface ExtendedInputFilterProps extends InputFilterTableHeaderProps {
   columnId?: string;
}

// ================================================================================
// CONSTANTES
// ================================================================================
const DEBOUNCE_DELAY = 400;

// Colunas pesquisáveis
const SEARCHABLE_COLUMNS = [
   'TAREFA_COMPLETA',
   'PROJETO_COMPLETO',
   'NOME_CLIENTE',
   'NOME_RECURSO',
   'DTSOL_TAREFA',
   'DTAPROV_TAREFA',
   'DTPREVENT_TAREFA',
   'HREST_TAREFA',
   'QTD_HRS_TAREFA',
   'TIPO_TAREFA_COMPLETO',
] as const;

// Colunas de data
const DATE_COLUMNS = [
   'DTSOL_TAREFA',
   'DTAPROV_TAREFA',
   'DTPREVENT_TAREFA',
] as const;

// Colunas apenas numéricas
const NUMERIC_COLUMNS = ['HREST_TAREFA', 'QTD_HRS_TAREFA'] as const;

// Limites de caracteres por coluna
export const COLUMN_MAX_LENGTH: Record<string, number> = {
   TAREFA_COMPLETA: 15,
   PROJETO_COMPLETO: 15,
   NOME_CLIENTE: 12,
   NOME_RECURSO: 12,
   DTSOL_TAREFA: 10, // DD/MM/YYYY
   DTAPROV_TAREFA: 10,
   DTPREVENT_TAREFA: 10,
   TIPO_TAREFA_COMPLETO: 12,
   HREST_TAREFA: 10,
   QTD_HRS_TAREFA: 10,
};

// ================================================================================
// FUNÇÕES AUXILIARES PARA FORMATAÇÃO
// ================================================================================

/**
 * Formata uma string de números para o formato DD/MM/YYYY
 * Exemplo: "10102025" -> "10/10/2025"
 */
function formatDateString(input: string): string {
   const numbersOnly = input.replace(/\D/g, '');

   if (numbersOnly.length === 0) return '';
   if (numbersOnly.length <= 2) return numbersOnly;
   if (numbersOnly.length <= 4) {
      return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
   }
   if (numbersOnly.length <= 8) {
      return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4)}`;
   }

   return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4, 8)}`;
}

/**
 * Formata número com separador de milhar (opcional)
 * Exemplo: "12345" -> "12.345"
 */
function formatNumberWithThousands(input: string): string {
   const numbersOnly = input.replace(/\D/g, '');
   if (numbersOnly.length === 0) return '';
   return numbersOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Normaliza string removendo acentos e convertendo para maiúsculas
 */
const normalizeString = (str: string): string => {
   return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
};

/**
 * Obtém valor da célula
 */
const getCellValue = (row: any, columnId: string): string => {
   const value = row.getValue(columnId);
   return String(value || '');
};

// ================================================================================
// COMPONENTE INPUT FILTRO COM DEBOUNCE
// ================================================================================
const InputFilterWithDebounce = ({
   value,
   onChange,
   type = 'text',
   columnId,
}: ExtendedInputFilterProps) => {
   const [localValue, setLocalValue] = useState(value);
   const isUserTyping = useRef(false);
   const inputRef = useRef<HTMLInputElement>(null);
   const shouldMaintainFocus = useRef(false);
   const isInitialMount = useRef(true);

   // Obter o limite máximo para a coluna específica
   const maxLength = useMemo(
      () => (columnId ? COLUMN_MAX_LENGTH[columnId] : undefined),
      [columnId]
   );

   // Verificar se a coluna aceita apenas números
   const isNumericOnly = useMemo(
      () => (columnId ? NUMERIC_COLUMNS.includes(columnId as any) : false),
      [columnId]
   );

   // Verificar se é coluna de data
   const isDateColumn = useMemo(
      () => (columnId ? DATE_COLUMNS.includes(columnId as any) : false),
      [columnId]
   );

   // Sincroniza valor local com prop externa APENAS se não estiver digitando
   useEffect(() => {
      if (!isUserTyping.current) {
         if (isNumericOnly && value) {
            const formatted = formatNumberWithThousands(value);
            setLocalValue(formatted);
         } else {
            setLocalValue(value);
         }
      }
   }, [value, isNumericOnly]);

   // Mantém o foco após re-renderização
   useEffect(() => {
      // Pula o primeiro mount
      if (isInitialMount.current) {
         isInitialMount.current = false;
         return;
      }

      if (shouldMaintainFocus.current && inputRef.current) {
         const activeElement = document.activeElement;

         // Só restaura o foco se não estiver em outro input
         if (
            activeElement?.tagName !== 'INPUT' ||
            activeElement === inputRef.current
         ) {
            inputRef.current.focus();
         }

         shouldMaintainFocus.current = false;
      }
   });

   // Debounce otimizado com cleanup
   const debouncedOnChange = useMemo(
      () =>
         debounce((newValue: string) => {
            onChange(newValue.trim());
            setTimeout(() => {
               isUserTyping.current = false;
            }, 100);
         }, DEBOUNCE_DELAY),
      [onChange]
   );

   // Cleanup do debounce
   useEffect(() => {
      return () => {
         debouncedOnChange.cancel();
      };
   }, [debouncedOnChange]);

   // Handlers
   const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
         isUserTyping.current = true;
         shouldMaintainFocus.current = true;
         let inputValue = e.target.value;

         // Salvar posição do cursor
         const cursorPosition = e.target.selectionStart;

         // Função para restaurar foco
         const restoreFocus = () => {
            if (
               inputRef.current &&
               document.activeElement !== inputRef.current
            ) {
               inputRef.current.focus();
               if (cursorPosition !== null) {
                  try {
                     inputRef.current.setSelectionRange(
                        cursorPosition,
                        cursorPosition
                     );
                  } catch (e) {
                     // Ignora erro se não for possível definir posição
                  }
               }
            }
         };

         // Validação especial para campos numéricos
         if (isNumericOnly) {
            const numbersOnly = inputValue.replace(/\D/g, '');

            if (numbersOnly && !/^\d*$/.test(numbersOnly)) {
               return;
            }

            const formatted = formatNumberWithThousands(numbersOnly);
            setLocalValue(formatted);
            debouncedOnChange(numbersOnly);

            setTimeout(restoreFocus, 0);
            return;
         }

         // Validação especial para campos de data
         if (isDateColumn) {
            let cleanValue = inputValue.replace(/[^\d/]/g, '');
            const numbersOnly = cleanValue.replace(/\//g, '');
            const formatted = formatDateString(numbersOnly);
            const finalValue = formatted.slice(0, 10);

            setLocalValue(finalValue);
            debouncedOnChange(finalValue);

            setTimeout(restoreFocus, 0);
            return;
         }

         // Validar o limite de caracteres se definido
         if (maxLength && inputValue.length > maxLength) {
            return;
         }

         setLocalValue(inputValue);
         debouncedOnChange(inputValue);

         setTimeout(restoreFocus, 0);
      },
      [debouncedOnChange, maxLength, isNumericOnly, isDateColumn]
   );

   const handleClear = useCallback(() => {
      isUserTyping.current = false;
      shouldMaintainFocus.current = true;
      setLocalValue('');
      onChange('');
      debouncedOnChange.cancel();

      // Manter foco após limpar
      setTimeout(() => {
         if (inputRef.current) {
            inputRef.current.focus();
         }
      }, 0);
   }, [onChange, debouncedOnChange]);

   // Atalho de teclado para limpar (Escape)
   const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
         if (e.key === 'Escape' && localValue) {
            e.preventDefault();
            handleClear();
         }
      },
      [localValue, handleClear]
   );

   // Calcular se está próximo do limite (>80%)
   const isNearLimit = useMemo(
      () =>
         maxLength && localValue ? localValue.length / maxLength > 0.8 : false,
      [maxLength, localValue]
   );

   // Event handlers para manter foco
   const handleFocus = useCallback(() => {
      shouldMaintainFocus.current = true;
   }, []);

   const handleBlur = useCallback(() => {
      // Pequeno delay para verificar se o blur foi intencional
      setTimeout(() => {
         if (isUserTyping.current) {
            shouldMaintainFocus.current = true;
         }
      }, 50);
   }, []);

   return (
      <div className="group relative w-full">
         <input
            ref={inputRef}
            type={type}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={maxLength}
            inputMode={isNumericOnly || isDateColumn ? 'numeric' : 'text'}
            pattern={isNumericOnly ? '[0-9]*' : undefined}
            className={`hover:bg-opacity-90 w-full rounded-md px-4 py-2 text-base font-bold transition-all select-none focus:ring-2 focus:outline-none ${
               localValue
                  ? 'bg-white text-black ring-2 ring-pink-500 focus:outline-none'
                  : 'border border-teal-950 bg-teal-900 text-white hover:bg-teal-950'
            } ${
               isNearLimit
                  ? 'ring-2 ring-yellow-500/50 focus:ring-yellow-500'
                  : 'focus:ring-pink-500'
            }`}
         />

         {localValue && (
            <button
               onClick={handleClear}
               aria-label="Limpar filtro"
               title="Limpar (Esc)"
               className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-black transition-all hover:scale-150 hover:rotate-180 hover:text-red-500"
               type="button"
            >
               <IoClose size={24} />
            </button>
         )}
      </div>
   );
};

// ================================================================================
// COMPONENTE PRINCIPAL (MEMOIZADO)
// ================================================================================
export const FiltrosHeaderTabelaTarefa = ({
   value,
   onChange,
   type = 'text',
   columnId,
}: ExtendedInputFilterProps) => {
   // Memoiza o componente para evitar re-renders desnecessários
   return useMemo(
      () => (
         <InputFilterWithDebounce
            value={value}
            onChange={onChange}
            type={type}
            columnId={columnId}
         />
      ),
      [value, onChange, type, columnId]
   );
};

// ================================================================================
// CONTROLES DE FILTRO (MOSTRAR/OCULTAR E LIMPAR)
// ================================================================================
export const FilterControls = ({
   showFilters,
   setShowFilters,
   totalActiveFilters,
   clearFilters,
   dataLength,
}: FilterControlsProps) => {
   const isDisabled = dataLength <= 1;

   const handleToggleFilters = useCallback(() => {
      if (!isDisabled) {
         setShowFilters(!showFilters);
      }
   }, [isDisabled, showFilters, setShowFilters]);

   return (
      <div className="group flex w-full flex-col gap-1">
         <label className="flex items-center gap-3 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaFilter className="text-black" size={16} /> Filtros
         </label>

         <div className="flex items-center gap-6">
            {/* Botão mostrar/ocultar filtros */}
            <button
               onClick={handleToggleFilters}
               disabled={isDisabled}
               className={`w-[300px] cursor-pointer rounded-md border-none px-6 py-2.5 text-base font-extrabold tracking-widest italic shadow-md shadow-black transition-all focus:ring-2 focus:ring-pink-600 focus:outline-none ${
                  showFilters
                     ? 'border-none bg-blue-600 text-white hover:bg-blue-800'
                     : 'border-none bg-white text-black hover:bg-white/50'
               } ${
                  isDisabled
                     ? 'disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-slate-500'
                     : 'active:scale-95'
               }`}
            >
               {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>

            {/* Botão limpar filtros */}
            {totalActiveFilters > 0 && (
               <button
                  onClick={clearFilters}
                  className="w-[300px] cursor-pointer rounded-md border-none bg-red-600 px-6 py-2.5 text-base font-extrabold tracking-widest text-white italic shadow-md shadow-black transition-all select-none hover:bg-red-800 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
               >
                  {totalActiveFilters > 1 ? `Limpar Filtros` : 'Limpar Filtro'}
               </button>
            )}
         </div>
      </div>
   );
};

// ================================================================================
// HOOK PERSONALIZADO PARA FUNÇÕES DE FILTRO
// ================================================================================
export const useFiltrosHeaderTabelaTarefa = () => {
   const globalFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue) return true;

         const searchValue = filterValue.toLowerCase().trim();

         return SEARCHABLE_COLUMNS.some(colId => {
            const cellValue = getCellValue(row, colId);

            // Para campos de data, usar normalização
            if (DATE_COLUMNS.includes(colId as any)) {
               const dateFormats = normalizeDate(cellValue);
               return dateFormats.some(dateFormat =>
                  dateFormat.toLowerCase().includes(searchValue)
               );
            }

            // Para outros campos, busca normal
            const cellString = cellValue.toLowerCase();
            return cellString.includes(searchValue);
         });
      },
      []
   );

   const columnFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue || filterValue === '') return true;

         const cellValue = getCellValue(row, columnId);
         const filterString = String(filterValue).trim();

         // Tratamento especial para campos de data
         if (DATE_COLUMNS.includes(columnId as any)) {
            const dateFormats = normalizeDate(cellValue);
            return dateFormats.some(dateFormat =>
               dateFormat.toLowerCase().includes(filterString.toLowerCase())
            );
         }

         // Tratamento para colunas numéricas
         if (NUMERIC_COLUMNS.includes(columnId as any)) {
            return cellValue.includes(filterString);
         }

         // Tratamento padrão para texto
         const cellLower = cellValue.toLowerCase();
         const filterLower = filterString.toLowerCase();
         return cellLower.includes(filterLower);
      },
      []
   );

   return { globalFilterFn, columnFilterFn };
};

// ================================================================================
// EXPORTAÇÕES DE FUNÇÕES AUXILIARES
// ================================================================================
export {
   formatDateString,
   formatNumberWithThousands,
   normalizeString,
   getCellValue,
};
