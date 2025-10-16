'use client';
// ================================================================================
import { debounce } from 'lodash';
import { useMemo, useState, useCallback, useEffect } from 'react';
// ================================================================================
import { InputFilterTableHeaderProps } from '../../../../../types/types';
import { normalizeDate } from '../../../../../utils/formatters';
// ================================================================================
import { FaPlus } from 'react-icons/fa';

// ================================================================================
// INTERFACE PARA PROPS DOS COMPONENTES
// ================================================================================
interface FilterControlsProps {
   showFilters: boolean;
   setShowFilters: (show: boolean) => void;
   totalActiveFilters: number;
   clearFilters: () => void;
   dataLength: number;
}

// ================================================================================
// COMPONENTE INPUT FILTRO POR COLUNA COM DEBOUNCE
// ================================================================================
export const FiltrosHeaderTabelaOs = ({
   value,
   onChange,
   placeholder,
   type = 'text',
}: InputFilterTableHeaderProps) => {
   const [localValue, setLocalValue] = useState(value);
   const [isFocused, setIsFocused] = useState(false);
   // ====================

   useEffect(() => {
      setLocalValue(value);
   }, [value]);
   // ====================

   const debouncedOnChange = useMemo(
      () =>
         debounce((newValue: string) => {
            onChange(newValue.trim());
         }, 200),
      [onChange]
   );
   // ====================

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalValue(inputValue);
      debouncedOnChange(inputValue);
   };
   // ====================

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
// ====================

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

         <div className="flex items-center gap-6">
            {/* Botão mostrar/ocultar filtros */}
            <button
               onClick={() => setShowFilters(!showFilters)}
               disabled={dataLength <= 1}
               className={`w-[250px] cursor-pointer rounded-sm px-6 py-2.5 text-base tracking-widest transition-all select-none ${
                  showFilters
                     ? 'border-none bg-blue-600 font-extrabold text-white italic shadow-md shadow-black hover:bg-blue-700'
                     : 'border-none bg-white font-bold text-black italic shadow-md shadow-black hover:bg-white/70'
               } ${
                  dataLength <= 1
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
                  className="cursor-pointer rounded-sm border-none bg-red-600 px-6 py-2.5 text-base font-extrabold tracking-widest text-white italic shadow-md shadow-black transition-all select-none hover:scale-105 hover:bg-red-700 active:scale-95"
               >
                  Limpar Filtros
               </button>
            )}
         </div>
      </div>
   );
};
// ====================

// ================================================================================
// HOOK PERSONALIZADO PARA FUNÇÕES DE FILTRO
// ================================================================================
export const useFiltrosHeaderTabelaOSy = () => {
   const globalFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue) return true;

         const searchValue = filterValue.toLowerCase().trim();
         const searchableColumns = [
            'CHAMADO_OS',
            'COD_OS',
            'DTINI_OS',
            'DTINC_OS',
            'COMP_OS',
            'NOME_CLIENTE',
            'FATURADO_OS',
            'NOME_RECURSO',
            'VALID_OS',
            'TAREFA_COMPLETA',
            'PROJETO_COMPLETO',
         ];

         return searchableColumns.some(colId => {
            const cellValue = row.getValue(colId);

            // Para campos de data, usar normalização
            if (colId === 'DTINI_OS' || colId === 'DTINC_OS') {
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
         if (columnId === 'DTINI_OS' || columnId === 'DTINC_OS') {
            const dateFormats = normalizeDate(cellValue);
            return dateFormats.some(dateFormat =>
               dateFormat.toLowerCase().includes(filterString)
            );
         }

         // Para campos numéricos (como código do chamado)
         if (columnId === 'COD_OS' || columnId === 'CHAMADO_OS') {
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
