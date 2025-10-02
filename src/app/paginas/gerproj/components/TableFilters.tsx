'use client';
// ================================================================================
import { debounce } from 'lodash';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
// ================================================================================
import { InputGlobalFilterProps } from '../../../../types/types';
import { InputFilterTableHeaderProps } from '../../../../types/types';
import { normalizeDate } from '../../../../utils/formatters';
// ================================================================================
import { BsEraserFill } from 'react-icons/bs';
import { RiArrowUpDownLine } from 'react-icons/ri';
import { LuFilter, LuFilterX } from 'react-icons/lu';
import { FaSearch } from 'react-icons/fa';
import { IoArrowUp, IoArrowDown } from 'react-icons/io5';
import { FaFilter } from 'react-icons/fa6';
import { FaPlus } from 'react-icons/fa';

// ================================================================================
// INTERFACE PARA PROPS DOS COMPONENTES
// ================================================================================
interface IndicatorFilterProps {
   columnFilters: ColumnFiltersState;
   globalFilter: string;
   totalFilters: number;
   getColumnDisplayName: (columnId: string) => string;
}

interface OrderTableHeaderProps {
   column: any;
   children: React.ReactNode;
}

interface FilterControlsProps {
   showFilters: boolean;
   setShowFilters: (show: boolean) => void;
   totalActiveFilters: number;
   clearFilters: () => void;
   dataLength: number;
}

// ================================================================================
// COMPONENTE INPUT FILTRO GLOBAL
// ================================================================================
export const InputGlobalFilter = ({
   value,
   onChange,
   placeholder = 'Buscar em todas as colunas...',
}: InputGlobalFilterProps) => {
   const [localValue, setLocalValue] = useState(value);
   const inputRef = useRef<HTMLInputElement>(null);
   const [isFocused, setIsFocused] = useState(false);

   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   const debouncedOnChange = useMemo(
      () =>
         debounce((newValue: string) => {
            onChange(newValue.trim());
         }, 300),
      [onChange]
   );

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalValue(inputValue);
      debouncedOnChange(inputValue);
   };

   return (
      <div className="group relative transition-all hover:-translate-y-1 hover:scale-102">
         <FaSearch
            className="absolute top-1/2 left-4 -translate-y-1/2 text-black"
            size={24}
         />
         <input
            type="text"
            value={localValue}
            onChange={handleChange}
            placeholder={isFocused ? '' : placeholder}
            className="w-[500px] rounded-md border-none bg-white/30 py-2 pl-14 text-base font-semibold tracking-wider text-black placeholder-black shadow-sm shadow-black select-none placeholder:text-base placeholder:font-semibold focus:ring-2 focus:ring-black focus:outline-none"
            ref={inputRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
         />
      </div>
   );
};

// ================================================================================
// COMPONENTE INPUT FILTRO POR COLUNA COM DEBOUNCE
// ================================================================================
export const FilterInputTableHeaderDebounce = ({
   value,
   onChange,
   placeholder,
   type = 'text',
}: InputFilterTableHeaderProps) => {
   const [localValue, setLocalValue] = useState(value);
   const [isFocused, setIsFocused] = useState(false);

   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   const debouncedOnChange = useMemo(
      () =>
         debounce((newValue: string) => {
            onChange(newValue.trim());
         }, 200),
      [onChange]
   );

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalValue(inputValue);
      debouncedOnChange(inputValue);
   };

   return (
      <input
         type={type}
         value={localValue}
         onChange={handleChange}
         placeholder={isFocused ? '' : placeholder}
         className="w-full rounded-md bg-teal-950 px-4 py-2 text-base text-white placeholder-slate-400 shadow-sm shadow-white transition-all select-none hover:-translate-y-1 hover:scale-105 focus:ring-2 focus:ring-amber-500 focus:outline-none"
         onFocus={() => setIsFocused(true)}
         onBlur={() => setIsFocused(false)}
      />
   );
};

// ================================================================================
// INDICADOR DE FILTROS ATIVOS
// ================================================================================
export const IndicatorFilter = ({
   columnFilters,
   globalFilter,
   totalFilters,
   getColumnDisplayName,
}: IndicatorFilterProps) => {
   if (totalFilters === 0) return null;

   return (
      <div className="flex items-center gap-4">
         <div className="rounded-md border border-blue-800 bg-blue-600 px-6 py-2 text-base font-semibold tracking-wider text-white italic select-none">
            {totalFilters} filtro{totalFilters > 1 ? 's' : ''} ativo
            {totalFilters > 1 ? 's' : ''}
         </div>

         {globalFilter && (
            <div className="rounded-md border border-green-800 bg-green-600 px-6 py-2 text-base font-semibold tracking-wider text-white italic select-none">
               Busca global: "{globalFilter}"
            </div>
         )}

         {columnFilters.map(filter => (
            <div
               key={filter.id}
               className="rounded-md border border-purple-800 bg-purple-600 px-6 py-2 text-base font-semibold tracking-wider text-white italic select-none"
            >
               {getColumnDisplayName(filter.id)}: "{String(filter.value)}"
            </div>
         ))}
      </div>
   );
};

// ================================================================================
// CABEÇALHO DE TABELA COM ORDENAÇÃO
// ================================================================================
export const OrderTableHeader = ({
   column,
   children,
}: OrderTableHeaderProps) => {
   const sorted = column.getIsSorted();

   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <div
               className="flex cursor-pointer items-center justify-center gap-4 rounded-md py-2 transition-all hover:bg-teal-900 active:scale-95"
               onClick={column.getToggleSortingHandler()}
            >
               {children}
               <div className="flex flex-col">
                  {sorted === 'asc' && <IoArrowUp size={20} />}
                  {sorted === 'desc' && <IoArrowDown size={20} />}
                  {!sorted && (
                     <RiArrowUpDownLine size={20} className="text-white" />
                  )}
               </div>
            </div>
         </TooltipTrigger>
         <TooltipContent
            side="top"
            align="center"
            sideOffset={8}
            className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black shadow-lg shadow-black select-none"
         >
            Clique para ordenar{' '}
            {sorted === 'asc'
               ? '(ascendente)'
               : sorted === 'desc'
                 ? '(descendente)'
                 : ''}
         </TooltipContent>
      </Tooltip>
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
   return (
      <div className="group flex w-full flex-col gap-1">
         <label className="flex items-center gap-2 text-base font-extrabold tracking-widest text-black uppercase select-none">
            <FaPlus className="text-black" size={16} /> Filtros
         </label>

         {/* Botão mostrar/ocultar filtros */}
         <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={dataLength <= 1}
            className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-1.5 text-lg font-extrabold tracking-wider italic transition-all select-none ${
               showFilters
                  ? 'border-none bg-blue-600 text-white shadow-sm shadow-black hover:bg-blue-800'
                  : 'border-none bg-white text-black shadow-sm shadow-black'
            } ${
               dataLength <= 1
                  ? 'disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-gray-500'
                  : 'hover:-translate-y-1 hover:scale-102 active:scale-95'
            }`}
         >
            {showFilters ? <LuFilterX size={24} /> : <LuFilter size={24} />}
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
         </button>

         {/* Botão limpar filtros */}
         {totalActiveFilters > 0 && (
            <button
               onClick={clearFilters}
               className="flex cursor-pointer items-center gap-4 rounded-md border-none bg-red-600 px-6 py-1.5 text-lg font-extrabold tracking-wider text-white italic shadow-sm shadow-black transition-all select-none hover:-translate-y-1 hover:scale-102 hover:bg-red-800 active:scale-95"
            >
               <BsEraserFill className="text-white" size={24} />
               Limpar Filtros
            </button>
         )}
      </div>
   );
};

// ================================================================================
// HOOK PERSONALIZADO PARA FUNÇÕES DE FILTRO
// ================================================================================
export const useTableFilters = () => {
   const globalFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue) return true;

         const searchValue = filterValue.toLowerCase().trim();
         const searchableColumns = [
            'COD_CHAMADO',
            'DATA_CHAMADO',
            'ASSUNTO_CHAMADO',
            'STATUS_CHAMADO',
            'NOME_RECURSO',
            'EMAIL_CHAMADO',
         ];

         return searchableColumns.some(colId => {
            const cellValue = row.getValue(colId);

            // Para campos de data, usar normalização
            if (colId === 'DATA_CHAMADO') {
               const dateFormats = normalizeDate(cellValue);
               return dateFormats.some(dateFormat =>
                  dateFormat.toLowerCase().includes(searchValue)
               );
            }

            // Para outros campos, busca normal
            const cellString = String(cellValue || '').toLowerCase();
            return cellString.includes(searchValue);
         });
      },
      []
   );

   const columnFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue || filterValue === '') return true;

         const cellValue = row.getValue(columnId);
         const filterString = String(filterValue).toLowerCase().trim();

         // Tratamento especial para campos de data
         if (columnId === 'DATA_CHAMADO') {
            const dateFormats = normalizeDate(cellValue);
            return dateFormats.some(dateFormat =>
               dateFormat.toLowerCase().includes(filterString)
            );
         }

         // Para campos numéricos (como código do chamado)
         if (columnId === 'COD_CHAMADO') {
            const cellString = String(cellValue || '');
            return cellString.includes(filterString);
         }

         // Para outros campos de texto
         const cellString = String(cellValue || '').toLowerCase();
         return cellString.includes(filterString);
      },
      []
   );

   return { globalFilterFn, columnFilterFn };
};

// ================================================================================
// FUNÇÃO UTILITÁRIA PARA NOMES DE COLUNAS (PODE SER CUSTOMIZADA)
// ================================================================================
export const getDefaultColumnDisplayName = (columnId: string): string => {
   const displayNames: Record<string, string> = {
      COD_CHAMADO: 'Código',
      DATA_CHAMADO: 'Data',
      ASSUNTO_CHAMADO: 'Assunto',
      STATUS_CHAMADO: 'Status',
      NOME_RECURSO: 'Recurso',
      EMAIL_CHAMADO: 'Email',
   };
   return displayNames[columnId] || columnId;
};
