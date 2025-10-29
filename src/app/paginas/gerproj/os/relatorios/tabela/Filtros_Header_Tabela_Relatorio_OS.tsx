'use client';
// IMPORTS
import { debounce } from 'lodash';
import { useMemo, useState, useCallback, useEffect } from 'react';

// COMPONENTS
import { DropdownSimNao } from './Dropdown_Sim_Nao';

// ICONS
import { IoClose } from 'react-icons/io5';

// ================================================================================
// INTERFACES
// ================================================================================
interface InputFilterHeaderProps {
   value: string;
   onChange: (value: string) => void;
   columnId?: string;
}

// ================================================================================
// CONSTANTES
// ================================================================================
const DEBOUNCE_DELAY = 400;

// Colunas que usam dropdown SIM/NÃO
const DROPDOWN_SIM_NAO_COLUMNS = ['faturado', 'validado'] as const;

// Colunas apenas numéricas
const NUMERIC_ONLY_COLUMNS = ['codOs', 'chamado'] as const;

// Colunas de data
const DATE_COLUMNS = ['data'] as const;

// Limites de caracteres por coluna
export const COLUMN_MAX_LENGTH: Record<string, number> = {
   codOs: 5,
   data: 10, // DD/MM/YYYY
   chamado: 5,
   cliente: 20,
   recurso: 20,
   faturado: 3,
   validado: 3,
};

// ================================================================================
// COMPONENTE INPUT FILTRO COM DEBOUNCE
// ================================================================================
const InputFilterWithDebounce = ({
   value,
   onChange,
   columnId,
}: InputFilterHeaderProps) => {
   const [localValue, setLocalValue] = useState(value);

   // Obter o limite máximo para a coluna específica
   const maxLength = columnId ? COLUMN_MAX_LENGTH[columnId] : undefined;

   // Verificar se a coluna aceita apenas números
   const isNumericOnly = columnId
      ? NUMERIC_ONLY_COLUMNS.includes(columnId as any)
      : false;

   // Verificar se é coluna de data
   const isDateColumn = columnId
      ? DATE_COLUMNS.includes(columnId as any)
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
            return;
         }

         // Validação especial para campos de data - apenas números e /
         if (isDateColumn) {
            inputValue = inputValue.replace(/[^\d/]/g, '');
         }

         // Validar o limite de caracteres se definido
         if (maxLength && inputValue.length > maxLength) {
            return;
         }

         setLocalValue(inputValue);
         debouncedOnChange(inputValue);
      },
      [debouncedOnChange, maxLength, isNumericOnly, isDateColumn]
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
            type="text"
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
               aria-label="Limpar filtro"
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
export const FiltrosHeaderTabelaRelatorioOS = ({
   value,
   onChange,
   columnId,
}: InputFilterHeaderProps) => {
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
         columnId={columnId}
      />
   );
};
