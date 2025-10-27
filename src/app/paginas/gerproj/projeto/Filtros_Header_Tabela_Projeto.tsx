'use client';
// IMPORTS
import { debounce } from 'lodash';
import { useMemo, useState, useCallback, useEffect } from 'react';

// COMPONENTS
import { SelectAtiEncTabelaProjeto } from './Select_ATI_ENC_Tabela_Projeto';

// TYPES
import { InputFilterTableHeaderProps } from '../../../../types/types';

// ICONS
import { FaFilter } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

// ================================================================================
// CONSTANTES
// ================================================================================
const DEBOUNCE_DELAY = 400;

const SEARCHABLE_COLUMNS = [
   'PROJETO_COMPLETO',
   'NOME_CLIENTE',
   'RESPCLI_PROJETO',
   'NOME_RECURSO',
   'STATUS_PROJETO',
] as const;

const UPPERCASE_COLUMNS = ['STATUS_PROJETO'] as const;

// Colunas que usam dropdown SIM/NÃO
const DROPDOWN_SIM_NAO_COLUMNS = ['STATUS_PROJETO'] as const;

// Limites de caracteres baseados no banco de dados
export const COLUMN_MAX_LENGTH: Record<string, number> = {
   PROJETO_COMPLETO: 15, // Concatenação: código + nome
   NOME_CLIENTE: 15, // Concatenação: código + nome
   RESPCLI_PROJETO: 15, // VARCHAR(50)
   NOME_RECURSO: 15, // Concatenação: código + nome
   STATUS_PROJETO: 3, // CHAR(3)
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
export const InputFilterWithDebounce = ({
   value,
   onChange,
   type = 'text',
   columnId,
}: ExtendedInputFilterProps) => {
   const [localValue, setLocalValue] = useState(value);

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
            className={`w-full rounded-md border border-teal-950 bg-teal-900 px-4 py-2 pr-10 text-base text-white transition-all select-none hover:bg-teal-950 focus:ring-2 focus:outline-none ${
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
               className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-white transition-all hover:scale-150 hover:text-red-500 active:scale-95"
               type="button"
            >
               <IoClose size={20} />
            </button>
         )}
      </div>
   );
};

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const FiltrosHeaderTabelaProjeto = ({
   value,
   onChange,
   type = 'text',
   columnId,
}: ExtendedInputFilterProps) => {
   // Verificar se a coluna usa dropdown SIM/NÃO
   const isDropdownSimNao = columnId
      ? DROPDOWN_SIM_NAO_COLUMNS.includes(columnId as any)
      : false;

   // Se for dropdown SIM/NÃO, renderizar o componente específico
   if (isDropdownSimNao) {
      return <SelectAtiEncTabelaProjeto value={value} onChange={onChange} />;
   }

   // Caso contrário, renderizar o input normal
   return (
      <InputFilterWithDebounce
         value={value}
         onChange={onChange}
         type={type}
         columnId={columnId}
      />
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
export const useFiltrosHeaderTabelaProjeto = () => {
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

         // Tratamento padrão para texto
         const cellLower = cellValue.toLowerCase();
         const filterLower = filterString.toLowerCase();
         return cellLower.includes(filterLower);
      },
      []
   );

   return { globalFilterFn, columnFilterFn };
};
