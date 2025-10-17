'use client';
// ================================================================================
// IMPORTS
// ================================================================================
import { debounce } from 'lodash';
import { useMemo, useState, useCallback, useEffect } from 'react';
// ================================================================================
import { InputFilterTableHeaderProps } from '../../../../types/types';
// ================================================================================
import { FaPlus } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

// ================================================================================
// CONSTANTES
// ================================================================================
const DEBOUNCE_DELAY = 200;

const SEARCHABLE_COLUMNS = [
   'PROJETO_COMPLETO',
   'CLIENTE_COMPLETO',
   'RESPCLI_PROJETO',
   'RECURSO_COMPLETO',
   'QTDHORAS_PROJETO',
   'STATUS_PROJETO',
] as const;

const NUMERIC_COLUMNS = ['QTDHORAS_PROJETO'] as const;
const UPPERCASE_COLUMNS = ['STATUS_PROJETO'] as const;

// Limites de caracteres baseados no banco de dados
export const COLUMN_MAX_LENGTH: Record<string, number> = {
   PROJETO_COMPLETO: 15, // Concatenação: código + nome
   CLIENTE_COMPLETO: 15, // Concatenação: código + nome
   RESPCLI_PROJETO: 20, // VARCHAR(50)
   RECURSO_COMPLETO: 15, // Concatenação: código + nome
   // QTDHORAS_PROJETO: 18, // NUMERIC(15,2) = 15 dígitos + 1 vírgula + 2 decimais
   STATUS_PROJETO: 3, // CHAR(3)
   // =====
   COD_PROJETO: 10, // INTEGER (máximo ~10 dígitos)
   NOME_PROJETO: 50, // VARCHAR(50)
   COD_CLIENTE: 10, // INTEGER (máximo ~10 dígitos)
   NOME_CLIENTE: 50, // Assumindo mesmo tamanho
   COD_RECURSO: 10, // INTEGER (máximo ~10 dígitos)
   NOME_RECURSO: 50, // Assumindo mesmo tamanho
};

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
// FUNÇÕES UTILITÁRIAS
// ================================================================================
const normalizeString = (str: string): string => {
   return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
};

const getCellValue = (row: any, columnId: string): string => {
   const value = row.getValue(columnId);
   return String(value || '');
};

// ================================================================================
// COMPONENTE INPUT FILTRO POR COLUNA COM DEBOUNCE E MAXLENGTH
// ================================================================================
export const FiltrosHeaderTabelaProjeto = ({
   value,
   onChange,
   type = 'text',
   columnId,
}: ExtendedInputFilterProps) => {
   const [localValue, setLocalValue] = useState(value);
   const [isFocused, setIsFocused] = useState(false);

   // Obter o limite máximo para a coluna específica
   const maxLength = columnId ? COLUMN_MAX_LENGTH[columnId] : undefined;

   // Sincroniza valor local com prop externa
   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   // Debounce otimizado com cleanup
   const debouncedOnChange = useMemo(
      () =>
         debounce((newValue: string) => {
            onChange(newValue.trim());
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
         const inputValue = e.target.value;

         // Validar o limite de caracteres se definido
         if (maxLength && inputValue.length > maxLength) {
            return; // Não permite digitar além do limite
         }

         setLocalValue(inputValue);
         debouncedOnChange(inputValue);
      },
      [debouncedOnChange, maxLength]
   );

   const handleClear = useCallback(() => {
      setLocalValue('');
      onChange('');
      debouncedOnChange.cancel();
   }, [onChange, debouncedOnChange]);

   const handleFocus = useCallback(() => setIsFocused(true), []);
   const handleBlur = useCallback(() => setIsFocused(false), []);

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
   const isNearLimit =
      maxLength && localValue ? localValue.length / maxLength > 0.8 : false;

   return (
      <div className="relative w-full">
         <input
            type={type}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            className={`w-full rounded-md bg-teal-950 px-4 py-2 pr-10 text-base text-white placeholder-slate-400 shadow-sm shadow-white transition-all select-none hover:-translate-y-1 hover:scale-102 focus:ring-2 focus:outline-none ${
               isNearLimit
                  ? 'ring-2 ring-yellow-500/50 focus:ring-yellow-500'
                  : 'focus:ring-pink-500'
            }`}
            onFocus={handleFocus}
            onBlur={handleBlur}
         />

         {localValue && (
            <button
               onClick={handleClear}
               aria-label="Limpar filtro"
               title="Limpar (Esc)"
               className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-slate-400 transition-all hover:scale-110 hover:text-white active:scale-95"
               type="button"
            >
               <IoClose size={20} />
            </button>
         )}

         {/* Contador de caracteres quando próximo ao limite */}
         {maxLength && localValue && isNearLimit && (
            <div className="absolute right-0 -bottom-5 text-xs font-medium text-yellow-400">
               {localValue.length}/{maxLength}
            </div>
         )}
      </div>
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
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaPlus className="text-black" size={16} /> Filtros
         </label>

         <div className="flex items-center gap-6">
            {/* Botão mostrar/ocultar filtros */}
            <button
               onClick={handleToggleFilters}
               disabled={isDisabled}
               aria-label={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
               aria-expanded={showFilters}
               className={`w-[250px] cursor-pointer rounded-sm px-6 py-2.5 text-base tracking-widest transition-all select-none ${
                  showFilters
                     ? 'border-none bg-blue-600 font-extrabold text-white italic shadow-md shadow-black hover:bg-blue-700'
                     : 'border-none bg-white font-bold text-black italic shadow-md shadow-black hover:bg-white/70'
               } ${
                  isDisabled
                     ? 'disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-gray-500'
                     : 'hover:scale-105 active:scale-95'
               }`}
            >
               {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>

            {/* Botão limpar filtros */}
            {totalActiveFilters > 0 && (
               <button
                  onClick={clearFilters}
                  aria-label={`Limpar ${totalActiveFilters} filtro${totalActiveFilters > 1 ? 's' : ''}`}
                  className="cursor-pointer rounded-sm border-none bg-red-600 px-6 py-2.5 text-base font-extrabold tracking-widest text-white italic shadow-md shadow-black transition-all select-none hover:scale-105 hover:bg-red-700 active:scale-95"
               >
                  Limpar Filtros{' '}
                  {totalActiveFilters > 1 && `(${totalActiveFilters})`}
               </button>
            )}
         </div>
      </div>
   );
};

// ================================================================================
// HOOK PERSONALIZADO PARA FUNÇÕES DE FILTRO
// ================================================================================
export const useFiltrosHeaderTabelaTarefay = () => {
   const globalFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue) return true;

         const searchValue = filterValue.toLowerCase().trim();

         return SEARCHABLE_COLUMNS.some(colId => {
            const cellValue = getCellValue(row, colId);
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

         // Tratamento para colunas uppercase (com remoção de acentos)
         if (UPPERCASE_COLUMNS.includes(columnId as any)) {
            const normalizedCell = normalizeString(cellValue);
            const normalizedFilter = normalizeString(filterString);
            return normalizedCell.includes(normalizedFilter);
         }

         // Tratamento para colunas numéricas (sem conversão para lowercase)
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
