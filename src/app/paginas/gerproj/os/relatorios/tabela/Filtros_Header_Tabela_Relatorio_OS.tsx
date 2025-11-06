'use client';
// IMPORTS
import { debounce } from 'lodash';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

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
const DEBOUNCE_DELAY = 600;

// Colunas que usam dropdown SIM/NÃO
const DROPDOWN_SIM_NAO_COLUMNS = ['faturado', 'validado'] as const;

// Colunas apenas numéricas (que aceitam formatação de milhar)
const NUMERIC_ONLY_COLUMNS = ['codOs', 'chamado'] as const;

// Colunas de data
const DATE_COLUMNS = ['data', 'dataInclusao'] as const;

// Limites de caracteres por coluna
export const COLUMN_MAX_LENGTH: Record<string, number> = {
   codOs: 6,
   data: 10, // DD/MM/YYYY ou DDMMYYYY
   dataInclusao: 10, // DD/MM/YYYY ou DDMMYYYY
   recurso: 20,
   faturado: 3,
   validado: 3,
   chamado: 6,
};

// ================================================================================
// FUNÇÕES AUXILIARES PARA NORMALIZAÇÃO DE DATAS
// ================================================================================

/**
 * Formata número com separador de milhar
 * Exemplo: "12345" -> "12.345"
 */
function formatNumberWithThousands(input: string): string {
   // Remove tudo que não é número
   const numbersOnly = input.replace(/\D/g, '');

   if (numbersOnly.length === 0) return '';

   // Adiciona o separador de milhar
   return numbersOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Remove formatação de número (pontos) para comparação
 * Exemplo: "12.345" -> "12345"
 */
function normalizeNumberForComparison(value: string | number): string {
   return String(value).replace(/\./g, '');
}

/**
 * Formata uma string de números para o formato DD/MM/YYYY
 * Exemplo: "10102025" -> "10/10/2025"
 */
function formatDateString(input: string): string {
   // Remove todos os caracteres que não são números
   const numbersOnly = input.replace(/\D/g, '');

   if (numbersOnly.length === 0) return '';
   if (numbersOnly.length <= 2) return numbersOnly;
   if (numbersOnly.length <= 4) {
      return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
   }
   if (numbersOnly.length <= 8) {
      return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4)}`;
   }

   // DDMMYYYY -> DD/MM/YYYY (limita a 8 dígitos)
   return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4, 8)}`;
}

/**
 * Normaliza uma data para comparação, ignorando horas
 * Retorna apenas a parte da data no formato DD/MM/YYYY
 */
function normalizeDateForComparison(dateStr: string | null): string {
   if (!dateStr) return '';

   // Se já tem formato DD/MM/YYYY, retorna
   if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return dateStr;
   }

   // Se tem horário (formato ISO ou com hora), extrai apenas a data
   // Exemplos: "2025-10-10T14:30:00" ou "10/10/2025 14:30:00"
   try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
         const day = String(date.getDate()).padStart(2, '0');
         const month = String(date.getMonth() + 1).padStart(2, '0');
         const year = date.getFullYear();
         return `${day}/${month}/${year}`;
      }
   } catch (e) {
      // Se falhar, tenta extrair manualmente
   }

   // Tenta extrair apenas a parte da data (antes de espaço ou T)
   const datePart = dateStr.split(/[\sT]/)[0];

   // Se está no formato YYYY-MM-DD, converte para DD/MM/YYYY
   if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
   }

   return datePart;
}

// ================================================================================
// COMPONENTE INPUT FILTRO COM DEBOUNCE
// ================================================================================
const InputFilterWithDebounce = ({
   value,
   onChange,
   columnId,
}: InputFilterHeaderProps) => {
   const [localValue, setLocalValue] = useState(value);
   const isUserTyping = useRef(false);

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

   // Sincroniza valor local com prop externa APENAS se não estiver digitando
   useEffect(() => {
      if (!isUserTyping.current) {
         // Se for campo numérico e o value vier sem formatação, formata
         if (isNumericOnly && value) {
            const formatted = formatNumberWithThousands(value);
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
            // Marca que terminou de digitar após o debounce
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
         // Marca que o usuário está digitando
         isUserTyping.current = true;

         let inputValue = e.target.value;

         // Validação especial para campos numéricos (codOs, chamado)
         if (isNumericOnly) {
            // Remove tudo que não é número
            const numbersOnly = inputValue.replace(/\D/g, '');

            // Valida se tem apenas números
            if (numbersOnly && !/^\d*$/.test(numbersOnly)) {
               return;
            }

            // Formata com separador de milhar para exibição
            const formatted = formatNumberWithThousands(numbersOnly);

            setLocalValue(formatted);
            // Envia apenas números para o filtro (sem pontos)
            debouncedOnChange(numbersOnly);
            return;
         }

         // Validação especial para campos de data
         if (isDateColumn) {
            // Remove tudo que não é número ou /
            let cleanValue = inputValue.replace(/[^\d/]/g, '');

            // Remove as barras para recontar os números
            const numbersOnly = cleanValue.replace(/\//g, '');

            // Formata automaticamente conforme digita
            const formatted = formatDateString(numbersOnly);

            // Limita a 10 caracteres (DD/MM/YYYY)
            const finalValue = formatted.slice(0, 10);

            setLocalValue(finalValue);
            debouncedOnChange(finalValue);
            return;
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
      isUserTyping.current = false;
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
            inputMode={isNumericOnly || isDateColumn ? 'numeric' : 'text'}
            pattern={isNumericOnly ? '[0-9]*' : undefined}
            className="w-full rounded-md bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-2.5 text-base font-extrabold tracking-widest text-white italic shadow-md shadow-black transition-all select-none placeholder:font-normal placeholder:text-white/50 hover:scale-105 focus:ring-2 focus:ring-pink-500 focus:outline-none"
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

export {
   formatDateString,
   normalizeDateForComparison,
   formatNumberWithThousands,
   normalizeNumberForComparison,
};
