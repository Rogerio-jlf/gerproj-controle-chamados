'use client';
// IMPORTS
import { debounce } from 'lodash';
import { useMemo, useState, useCallback, useEffect } from 'react';

// TYPES
import { InputFilterTableHeaderProps } from '../../../../../../types/types';

// FORMATERS
import { normalizeDate } from '../../../../../../utils/formatters';

// COMPONENTS
import { DropdownSimNao } from './Dropdown_Sim_Nao';

// ICONS
import { FaPlus } from 'react-icons/fa';
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

const SEARCHABLE_COLUMNS = [
   'COD_OS',
   'CODTRF_OS',
   'CHAMADO_OS',
   'DTINI_OS',
   'DTINC_OS',
   'NOME_CLIENTE',
   'FATURADO_OS',
   'NOME_RECURSO',
   'VALID_OS',
] as const;

const DATE_COLUMNS = ['DTINI_OS', 'DTINC_OS'] as const;
const NUMERIC_COLUMNS = ['COD_OS', 'CHAMADO_OS'] as const;
const NUMERIC_ONLY_COLUMNS = ['COD_OS', 'CODTRF_OS', 'CHAMADO_OS'] as const;
const UPPERCASE_COLUMNS = ['FATURADO_OS', 'VALID_OS'] as const;

// Colunas que usam dropdown SIM/NÃO
const DROPDOWN_SIM_NAO_COLUMNS = ['FATURADO_OS', 'VALID_OS'] as const;

// Limites de caracteres baseados no banco de dados
export const COLUMN_MAX_LENGTH: Record<string, number> = {
   COD_OS: 5, // INTEGER
   CODTRF_OS: 4, // Concatenação testada
   CHAMADO_OS: 5, // INTEGER
   DTINI_OS: 10, // DATE (formato DD/MM/YYYY)
   DTINC_OS: 10, // DATE
   COMP_OS: 7, // VARCHAR (assumindo competência/descrição)
   NOME_CLIENTE: 15, // Assumindo limite
   NOME_RECURSO: 15, // Assumindo limite
   FATURADO_OS: 3, // CHAR(3) - similar ao FATURA_TAREFA
   VALID_OS: 3, // CHAR(3) - assumindo SIM/NÃO
};

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
// COMPONENTE INPUT FILTRO (INTERNO) COM DEBOUNCE E MAXLENGTH
// ================================================================================
const InputFilterWithDebounce = ({
   value,
   onChange,
   type = 'text',
   columnId,
}: ExtendedInputFilterProps) => {
   const [localValue, setLocalValue] = useState(value);

   // Obter o limite máximo para a coluna específica
   const maxLength = columnId ? COLUMN_MAX_LENGTH[columnId] : undefined;

   // Verificar se a coluna aceita apenas números
   const isNumericOnly = columnId
      ? NUMERIC_ONLY_COLUMNS.includes(columnId as any)
      : false;

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
         let inputValue = e.target.value;

         // Validar apenas números se for coluna numérica
         if (isNumericOnly && inputValue && !/^\d*$/.test(inputValue)) {
            return; // Não permite caracteres não numéricos
         }

         // Validação especial para campos de data - apenas números e /
         if (columnId && DATE_COLUMNS.includes(columnId as any)) {
            // Remove qualquer caractere que não seja número ou /
            inputValue = inputValue.replace(/[^\d/]/g, '');
         }

         // Validar o limite de caracteres se definido
         if (maxLength && inputValue.length > maxLength) {
            return; // Não permite digitar além do limite
         }

         setLocalValue(inputValue);
         debouncedOnChange(inputValue);
      },
      [debouncedOnChange, maxLength, isNumericOnly, columnId]
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

   return (
      <div className="group relative w-full">
         <input
            type={type}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            inputMode={isNumericOnly ? 'numeric' : 'text'}
            pattern={isNumericOnly ? '[0-9]*' : undefined}
            className="w-full rounded-md bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-2.5 text-base font-extrabold tracking-widest text-white italic shadow-md shadow-black transition-all select-none hover:scale-105 focus:ring-2 focus:ring-pink-500 focus:outline-none"
         />

         {localValue && (
            <button
               onClick={handleClear}
               className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-white transition-all hover:scale-150 hover:text-red-500 active:scale-95"
               type="button"
            >
               <IoClose size={24} />
            </button>
         )}
      </div>
   );
};

// ================================================================================
// COMPONENTE PRINCIPAL - WRAPPER QUE DECIDE QUAL RENDERIZAR
// ================================================================================
export const FiltrosHeaderTabelaOs = ({
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
      return <DropdownSimNao value={value} onChange={onChange} />;
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
            <FaPlus className="text-black" size={16} /> Filtros
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
               {showFilters ? 'Ocultar Filtros' : 'Mostrar + Filtros'}
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
export const useFiltrosHeaderTabelaOS = () => {
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

         // Tratamento para colunas uppercase (FATURADO_OS, VALID_OS)
         if (UPPERCASE_COLUMNS.includes(columnId as any)) {
            const normalizedCell = normalizeString(cellValue);
            const normalizedFilter = normalizeString(filterString);
            return normalizedCell.includes(normalizedFilter);
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
