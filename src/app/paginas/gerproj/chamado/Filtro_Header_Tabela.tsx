'use client';
// IMPORTS
import { debounce } from 'lodash';
import { useMemo, useState, useCallback, useEffect, useRef, memo } from 'react';

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
const DEBOUNCE_DELAY = 600;

// Colunas pesquisáveis
const SEARCHABLE_COLUMNS = [
   'COD_CHAMADO',
   'DATA_CHAMADO',
   'HORA_CHAMADO',
   'ASSUNTO_CHAMADO',
   'STATUS_CHAMADO',
   'DTENVIO_CHAMADO',
   'NOME_RECURSO',
   'NOME_CLIENTE',
   'EMAIL_CHAMADO',
] as const;

// Colunas de data
const DATE_COLUMNS = ['DATA_CHAMADO', 'DTENVIO_CHAMADO'] as const;

// Colunas apenas numéricas
const NUMERIC_COLUMNS = ['COD_CHAMADO'] as const;

// Sets para verificação O(1)
const SEARCHABLE_COLUMNS_SET = new Set(SEARCHABLE_COLUMNS);
const DATE_COLUMNS_SET = new Set(DATE_COLUMNS);
const NUMERIC_COLUMNS_SET = new Set(NUMERIC_COLUMNS);

// Limites de caracteres por coluna
export const MAX_LENGTH_COLUMN: Record<string, number> = {
   COD_CHAMADO: 6,
   DATA_CHAMADO: 10,
   HORA_CHAMADO: 8,
   ASSUNTO_CHAMADO: 50,
   STATUS_CHAMADO: 12,
   DTENVIO_CHAMADO: 10,
   NOME_RECURSO: 12,
   NOME_CLIENTE: 12,
   EMAIL_CHAMADO: 30,
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
function formatThousandsNumber(input: string): string {
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
const InputFilterWithDebounce = memo(
   ({ value, onChange, columnId }: ExtendedInputFilterProps) => {
      const [localValue, setLocalValue] = useState(value);
      const isUserTyping = useRef(false);
      const inputRef = useRef<HTMLInputElement>(null);

      // Obter o limite máximo para a coluna específica
      const maxLength = useMemo(
         () => (columnId ? MAX_LENGTH_COLUMN[columnId] : undefined),
         [columnId]
      );

      // Verificar se a coluna aceita apenas números
      const isNumericOnly = useMemo(
         () => (columnId ? NUMERIC_COLUMNS_SET.has(columnId as any) : false),
         [columnId]
      );

      // Verificar se é coluna de data
      const isDateColumn = useMemo(
         () => (columnId ? DATE_COLUMNS_SET.has(columnId as any) : false),
         [columnId]
      );

      // Sincroniza valor local com prop externa APENAS se não estiver digitando
      useEffect(() => {
         if (!isUserTyping.current) {
            if (isNumericOnly && value) {
               const formatted = formatThousandsNumber(value);
               setLocalValue(formatted);
            } else {
               setLocalValue(value);
            }
         }
      }, [value, isNumericOnly]);

      // Debounce otimizado com cleanup
      const debouncedOnChange = useMemo(
         () =>
            debounce((newValue: string) => {
               onChange(newValue.trim());
               requestAnimationFrame(() => {
                  isUserTyping.current = false;
               });
            }, DEBOUNCE_DELAY),
         [onChange]
      );

      // Cleanup do debounce
      useEffect(() => {
         return () => {
            debouncedOnChange.cancel();
         };
      }, [debouncedOnChange]);

      // Handler otimizado
      const handleChange = useCallback(
         (e: React.ChangeEvent<HTMLInputElement>) => {
            isUserTyping.current = true;
            const inputValue = e.target.value;

            // Validar limite primeiro (mais rápido)
            if (maxLength && inputValue.length > maxLength) return;

            let processedValue = inputValue;
            let valueToSend = inputValue;

            // Processamento por tipo de coluna
            if (isNumericOnly) {
               const numbersOnly = inputValue.replace(/\D/g, '');
               processedValue = formatThousandsNumber(numbersOnly);
               valueToSend = numbersOnly;
            } else if (isDateColumn) {
               const numbersOnly = inputValue.replace(/[^\d]/g, '');
               processedValue = formatDateString(numbersOnly).slice(0, 10);
               valueToSend = processedValue;
            }

            setLocalValue(processedValue);
            debouncedOnChange(valueToSend);
         },
         [debouncedOnChange, maxLength, isNumericOnly, isDateColumn]
      );

      const handleClear = useCallback(() => {
         isUserTyping.current = false;
         setLocalValue('');
         onChange('');
         debouncedOnChange.cancel();

         // Manter foco após limpar
         requestAnimationFrame(() => {
            inputRef.current?.focus();
         });
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
            maxLength && localValue
               ? localValue.length / maxLength > 0.8
               : false,
         [maxLength, localValue]
      );

      return (
         <div className="group relative w-full">
            <input
               ref={inputRef}
               type="text"
               value={localValue}
               onChange={handleChange}
               onKeyDown={handleKeyDown}
               maxLength={maxLength}
               inputMode={isNumericOnly || isDateColumn ? 'numeric' : 'text'}
               pattern={isNumericOnly ? '[0-9]*' : undefined}
               className={`hover:bg-opacity-90 w-full rounded-md px-4 py-2 text-lg font-bold shadow-sm shadow-black transition-all select-none focus:ring-2 focus:ring-pink-500 focus:outline-none active:scale-95 ${
                  localValue
                     ? 'bg-white text-black ring-2 ring-pink-500 focus:outline-none'
                     : 'border border-teal-950 bg-teal-900 text-white hover:shadow-lg hover:shadow-black'
               } `}
            />

            {localValue && (
               <button
                  onClick={handleClear}
                  aria-label="Limpar filtro"
                  title="Limpar (Esc)"
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-black transition-all hover:scale-150 hover:rotate-180 hover:text-red-500"
                  type="button"
               >
                  <IoClose size={24} />
               </button>
            )}
         </div>
      );
   }
);

InputFilterWithDebounce.displayName = 'InputFilterWithDebounce';

// ================================================================================
// COMPONENTE PRINCIPAL (MEMOIZADO)
// ================================================================================
export const FiltrosHeaderTabelaChamado = memo(
   ({ value, onChange, type = 'text', columnId }: ExtendedInputFilterProps) => {
      return (
         <InputFilterWithDebounce
            value={value}
            onChange={onChange}
            type={type}
            columnId={columnId}
         />
      );
   }
);

FiltrosHeaderTabelaChamado.displayName = 'FiltrosHeaderTabelaChamado';

// ================================================================================
// CONTROLES DE FILTRO (MOSTRAR/OCULTAR E LIMPAR)
// ================================================================================
export const FilterControls = memo(
   ({
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

      // Cache do texto do botão
      const clearButtonText = useMemo(
         () => (totalActiveFilters > 1 ? 'Limpar Filtros' : 'Limpar Filtro'),
         [totalActiveFilters]
      );

      const toggleButtonText = showFilters
         ? 'Ocultar Filtros'
         : 'Mostrar Filtros';

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
                  {toggleButtonText}
               </button>

               {/* Botão limpar filtros */}
               {totalActiveFilters > 0 && (
                  <button
                     onClick={clearFilters}
                     className="w-[300px] cursor-pointer rounded-md border-none bg-red-600 px-6 py-2.5 text-base font-extrabold tracking-widest text-white italic shadow-md shadow-black transition-all select-none hover:bg-red-800 focus:ring-2 focus:ring-pink-600 focus:outline-none active:scale-95"
                  >
                     {clearButtonText}
                  </button>
               )}
            </div>
         </div>
      );
   }
);

FilterControls.displayName = 'FilterControls';

// ================================================================================
// HOOK PERSONALIZADO PARA FUNÇÕES DE FILTRO
// ================================================================================
export const useFiltrosHeaderTabelaChamado = () => {
   const globalFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue) return true;

         const searchValue = filterValue.toLowerCase().trim();
         if (!searchValue) return true;

         return SEARCHABLE_COLUMNS.some(colId => {
            const cellValue = getCellValue(row, colId);

            // Para campos de data, usar normalização
            if (DATE_COLUMNS_SET.has(colId as any)) {
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
         if (!filterValue) return true;

         const cellValue = getCellValue(row, columnId);
         const filterTrimmed = String(filterValue).trim();

         if (!filterTrimmed) return true;

         // Tratamento especial para campos de data
         if (DATE_COLUMNS_SET.has(columnId as any)) {
            const dateFormats = normalizeDate(cellValue);
            const filterLower = filterTrimmed.toLowerCase();
            return dateFormats.some(dateFormat =>
               dateFormat.toLowerCase().includes(filterLower)
            );
         }

         // Tratamento para colunas numéricas
         if (NUMERIC_COLUMNS_SET.has(columnId as any)) {
            return cellValue.includes(filterTrimmed);
         }

         // Tratamento padrão para texto
         const cellLower = cellValue.toLowerCase();
         const filterLower = filterTrimmed.toLowerCase();
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
   formatThousandsNumber,
   normalizeString,
   getCellValue,
};
