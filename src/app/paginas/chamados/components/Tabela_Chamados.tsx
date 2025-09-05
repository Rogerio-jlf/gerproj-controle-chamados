'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useEffect } from 'react';
import {
   flexRender,
   getCoreRowModel,
   useReactTable,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   ColumnFiltersState,
   SortingState,
} from '@tanstack/react-table';
import { debounce } from 'lodash';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../components/ui/tooltip';
// ================================================================================
import { useAuth } from '../../../../hooks/useAuth';
import { useFiltersTabelaChamados } from '../../../../contexts/Filters_Context';
import { ChamadosProps, colunasTabela } from './Colunas_Tabela_Chamados';
// import ButtonExcel from '../../../../components/Button_Excel';
// import ButtonPDF from '../../../../components/Button_PDF';
import ModalAtribuirChamado from './Modal_Atribuir_Chamado';
import TabelaTarefas from './Tabela_Tarefas';
import TabelaOS from './Tabela_OS';
// ================================================================================
import IsLoading from './Loading';
import IsError from './Error';
// ================================================================================
import { BsEraserFill } from 'react-icons/bs';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaDatabase } from 'react-icons/fa';
import { FaUserLock } from 'react-icons/fa';
import { MdChevronLeft } from 'react-icons/md';
import { FiChevronsLeft } from 'react-icons/fi';
import { MdChevronRight } from 'react-icons/md';
import { FiChevronsRight } from 'react-icons/fi';
import { RiArrowUpDownLine } from 'react-icons/ri';
import { IoArrowUp } from 'react-icons/io5';
import { IoArrowDown } from 'react-icons/io5';
import { FaFilter } from 'react-icons/fa6';
import { Loader2 } from 'lucide-react';
import { LuFilter, LuFilterX } from 'react-icons/lu';
import { FaSearch } from 'react-icons/fa';
import TarefasButton from '../../../../components/Button_Tarefa';
// ================================================================================
// ================================================================================

interface FilterInputWithDebounceProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   type?: string;
   onClear?: () => void; // Nova prop para limpeza
}

// Componente de Filtro Global
interface GlobalFilterInputProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   onClear: () => void;
}

// ================================================================================

const FilterInputWithDebounce = ({
   value,
   onChange,
   placeholder,
   type = 'text',
}: FilterInputWithDebounceProps) => {
   const [localValue, setLocalValue] = useState(value);

   // Atualiza o valor local quando o valor externo muda (ex: limpeza)
   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   const debouncedOnChange = useMemo(
      () => debounce((newValue: string) => onChange(newValue), 300),
      [onChange]
   );

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
      debouncedOnChange(e.target.value);
   };

   return (
      <input
         type={type}
         value={localValue}
         onChange={handleChange}
         placeholder={placeholder}
         className="w-full rounded-md border border-white/50 bg-teal-950 px-4 py-2 text-base text-white placeholder-gray-500 hover:scale-105 focus:bg-black focus:outline-none focus:placeholder:text-gray-700"
      />
   );
};

// =====

const GlobalFilterInput = ({
   value,
   onChange,
   placeholder = 'Buscar em todas as colunas...',
}: GlobalFilterInputProps) => {
   const [localValue, setLocalValue] = useState(value);

   // Atualiza o valor local quando o valor externo muda
   useEffect(() => {
      setLocalValue(value);
   }, [value]);

   const debouncedOnChange = useMemo(
      () => debounce((newValue: string) => onChange(newValue), 500),
      [onChange]
   );

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
      debouncedOnChange(e.target.value);
   };

   return (
      <div className="group relative transition-all focus-within:text-black hover:scale-105">
         <FaSearch
            className="absolute top-1/2 left-4 -translate-y-1/2 text-white transition-colors duration-300 group-focus-within:text-black"
            size={18}
         />
         <input
            type="text"
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full rounded-md border border-white/50 bg-white/40 py-2 pr-4 pl-12 text-base text-black placeholder-white focus:bg-white/70 focus:outline-none focus:placeholder:text-gray-200"
         />
      </div>
   );
};
// =====

// Componente para ordenação do cabeçalho da tabela
const SortableHeader = ({
   column,
   children,
}: {
   column: any;
   children: React.ReactNode;
}) => {
   const sorted = column.getIsSorted();

   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <div
               className="flex cursor-pointer items-center justify-center gap-2 rounded-md py-2 transition-all hover:bg-teal-900 active:scale-95"
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
            className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
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

// Componente de Indicador de Filtros Ativos
const FilterIndicator = ({
   columnFilters,
   globalFilter,
   totalFilters,
}: {
   columnFilters: ColumnFiltersState;
   globalFilter: string;
   totalFilters: number;
}) => {
   if (totalFilters === 0) return null;

   return (
      <div className="flex items-center gap-2">
         <div className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold tracking-wider text-white italic select-none">
            {totalFilters} filtro{totalFilters > 1 ? 's' : ''} ativo
            {totalFilters > 1 ? 's' : ''}
         </div>

         {globalFilter && (
            <div className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold tracking-wider text-white italic select-none">
               Busca global: "{globalFilter}"
            </div>
         )}

         {columnFilters.map(filter => (
            <div
               key={filter.id}
               className="rounded-full bg-purple-600 px-3 py-1 text-sm font-semibold tracking-wider text-white italic select-none"
            >
               {getColumnDisplayName(filter.id)}: "{String(filter.value)}"
            </div>
         ))}
      </div>
   );
};

// Função auxiliar para nomes das colunas
const getColumnDisplayName = (columnId: string): string => {
   const displayNames: Record<string, string> = {
      COD_CHAMADO: 'Código',
      ASSUNTO_CHAMADO: 'Assunto',
      EMAIL_CHAMADO: 'Email',
      DATA_CHAMADO: 'Data',
      STATUS_CHAMADO: 'Status',
   };
   return displayNames[columnId] || columnId;
};

// ================================================================================

// ===== COMPONENTE PRINCIPAL =====
export default function TabelaChamados() {
   const { filters } = useFiltersTabelaChamados();
   const { ano, mes } = filters;
   const { user, loading } = useAuth();

   // Estados para o modal do chamado
   const [modalChamadosOpen, setModalChamadosOpen] = useState(false);
   const [selectedChamado, setSelectedChamado] = useState<ChamadosProps | null>(
      null
   );

   // Estados para a tabela OS
   const [tabelaOSOpen, setTabelaOSOpen] = useState(false);
   const [selectedCodChamado, setSelectedCodChamado] = useState<number | null>(
      null
   );

   // Estado para a tabela de tarefas
   const [tabelaTarefasOpen, setTabelaTarefasOpen] = useState(false);

   // Estados para os filtros e ordenação
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [globalFilter, setGlobalFilter] = useState('');
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'COD_CHAMADO', desc: true },
   ]);

   // Estados para os valores dos inputs de filtro
   const [filterValues, setFilterValues] = useState({
      COD_CHAMADO: '',
      DATA_CHAMADO: '',
      ASSUNTO_CHAMADO: '',
      STATUS_CHAMADO: '',
      EMAIL_CHAMADO: '',
      global: '',
   });

   // Estado para mostrar/ocultar os filtros
   const [showFilters, setShowFilters] = useState(false);
   // ================================================================================

   // Token de autenticação
   const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

   // Verifica se a requisição pode ser feita
   const enabled = !!ano && !!mes && !!token && !!user;

   // Cria os parâmetros da query
   const queryParams = useMemo(() => {
      if (!user) return new URLSearchParams();

      const params = new URLSearchParams({
         ano: String(ano),
         mes: String(mes),
      });

      return params;
   }, [ano, mes, user]);

   // Função para buscar os chamados
   async function fetchChamados(
      params: URLSearchParams,
      token: string
   ): Promise<ChamadosProps[]> {
      const res = await fetch(`/api/chamados?${params}`, {
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Erro ao buscar chamados');
      }

      const data = await res.json();
      return Array.isArray(data) ? data : data.chamados || [];
   }

   // Hook para buscar os chamados
   const { data, isLoading, isError, error } = useQuery({
      queryKey: ['chamadosAbertos', queryParams.toString(), token],
      queryFn: () => fetchChamados(queryParams, token!),
      enabled,
      staleTime: 1000 * 60 * 5,
      retry: 2,
   });

   // Função para fechar o modal de chamados
   const handleCloseModalChamados = () => {
      setModalChamadosOpen(false);
      setSelectedChamado(null);
   };

   // Função para fechar a tabela de OS
   const handleCloseTabelaOS = () => {
      setTabelaOSOpen(false);
      setSelectedCodChamado(null);
   };

   // Função para visualizar um chamado
   const handleVisualizarChamado = useCallback(
      (codChamado: number) => {
         const chamado = data?.find(c => c.COD_CHAMADO === codChamado);
         if (chamado) {
            setSelectedChamado(chamado);
            setModalChamadosOpen(true);
         }
      },
      [data]
   );

   // Função para visualizar uma OS
   const handleVisualizarOS = useCallback((codChamado: number) => {
      setSelectedCodChamado(codChamado);
      setTabelaOSOpen(true);
   }, []);

   // Colunas da tabela
   const colunas = useMemo(
      () =>
         colunasTabela({
            onVisualizarChamado: handleVisualizarChamado,
            onVisualizarOS: handleVisualizarOS,
            onVisualizarTarefas: () => setTabelaTarefasOpen(true),
         }),
      [handleVisualizarChamado, handleVisualizarOS]
   );

   // Função de filtro global otimizada
   const globalFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue) return true;

         const searchValue = filterValue.toLowerCase();

         // Busca em todas as colunas principais
         const searchableColumns = [
            'COD_CHAMADO',
            'ASSUNTO_CHAMADO',
            'EMAIL_CHAMADO',
            'DATA_CHAMADO',
            'STATUS_CHAMADO',
         ];

         return searchableColumns.some(colId => {
            const cellValue = row.getValue(colId);
            const cellString = String(cellValue || '').toLowerCase();
            return cellString.includes(searchValue);
         });
      },
      []
   );

   // Função de filtro por coluna otimizada
   const columnFilterFn = useCallback(
      (row: any, columnId: string, filterValue: string) => {
         if (!filterValue || filterValue === '') return true;

         const cellValue = row.getValue(columnId);
         const cellString = String(cellValue || '').toLowerCase();
         const filterString = String(filterValue).toLowerCase();

         // Filtro específico por tipo de coluna
         switch (columnId) {
            case 'COD_CHAMADO':
               // Para códigos, permite busca parcial em números
               return cellString.includes(filterString);

            case 'DATA_CHAMADO':
               // Para datas, permite busca por parte da data (dd, mm, yyyy, dd/mm, etc)
               return cellString.includes(filterString);

            case 'STATUS_CHAMADO':
               // Para status, busca parcial para flexibilidade
               return cellString.includes(filterString);

            case 'EMAIL_CHAMADO':
            case 'ASSUNTO_CHAMADO':
            default:
               // Para texto, busca parcial case-insensitive
               return cellString.includes(filterString);
         }
      },
      []
   );

   // Tabela filtrada e ordenada
   const table = useReactTable({
      data: data ?? [],
      columns: colunas,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
      onSortingChange: setSorting,
      globalFilterFn,
      state: {
         columnFilters,
         globalFilter,
         sorting,
      },
      initialState: {
         pagination: {
            pageSize: 20,
         },
      },

      // Função de filtro personalizada para colunas
      filterFns: {
         customColumnFilter: columnFilterFn,
      },

      // Aplica o filtro customizado para todas as colunas
      defaultColumn: {
         filterFn: columnFilterFn,
      },
   });

   // Calcula o total de filtros ativos
   const totalActiveFilters = useMemo(() => {
      let count = columnFilters.length;
      if (globalFilter && globalFilter.trim()) count += 1;
      return count;
   }, [columnFilters.length, globalFilter]);

   // Função para limpar todos os filtros e inputs
   const clearFilters = () => {
      setColumnFilters([]);
      setGlobalFilter('');

      // Limpa os valores dos inputs
      setFilterValues({
         COD_CHAMADO: '',
         DATA_CHAMADO: '',
         ASSUNTO_CHAMADO: '',
         STATUS_CHAMADO: '',
         EMAIL_CHAMADO: '',
         global: '',
      });

      // Limpa os filtros da tabela
      table.getAllColumns().forEach(column => {
         column.setFilterValue('');
      });
   };

   // Atualiza os valores locais quando os filtros mudam
   // Atualiza os valores locais quando os filtros da tabela mudam
   useEffect(() => {
      // Cria um novo objeto de valores baseado nos filtros atuais
      const newFilterValues = {
         COD_CHAMADO: '',
         DATA_CHAMADO: '',
         ASSUNTO_CHAMADO: '',
         STATUS_CHAMADO: '',
         EMAIL_CHAMADO: '',
         global: globalFilter || '',
      };

      // Preenche os valores dos filtros de coluna
      columnFilters.forEach(filter => {
         if (filter.id in newFilterValues) {
            newFilterValues[filter.id as keyof typeof newFilterValues] = String(
               filter.value || ''
            );
         }
      });

      // Atualiza apenas se houver mudanças reais para evitar loops
      setFilterValues(prev => {
         // Verifica se os valores realmente mudaram
         const hasChanged = Object.keys(newFilterValues).some(
            key =>
               prev[key as keyof typeof prev] !==
               newFilterValues[key as keyof typeof newFilterValues]
         );

         return hasChanged ? newFilterValues : prev;
      });
   }, [columnFilters, globalFilter]); // Remova filterValues das dependências
   // ================================================================================

   if (loading) {
      return (
         <div className="flex flex-col items-center justify-center space-y-6 py-40">
            {/* Ícones */}
            <div className="relative">
               <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-cyan-200 via-cyan-400 to-cyan-600 opacity-20 blur-lg"></div>

               <div className="relative flex items-center justify-center">
                  {/* Ícone Loader2 */}
                  <Loader2 className="animate-spin text-blue-600" size={120} />

                  {/* Ícone DataBaseIcon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <FaUserLock className="text-blue-600" size={60} />
                  </div>
               </div>
            </div>

            <div className="space-y-3 text-center">
               {/* Título */}
               <h3 className="text-2xl font-bold tracking-wider text-blue-600 select-none">
                  Verificando autenticação do usuário
               </h3>

               <div className="flex items-center justify-center space-x-1">
                  {/* Aguarde */}
                  <span className="text-base font-semibold tracking-wider text-blue-600 italic select-none">
                     Aguarde
                  </span>

                  {/* Pontos animados de carregamento */}
                  <div className="flex space-x-1">
                     <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                        style={{ animationDelay: '0.1s' }}
                     ></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                        style={{ animationDelay: '0.2s' }}
                     ></div>
                  </div>
               </div>
            </div>
         </div>
      );
   }
   // =====

   if (!user || !token) {
      return (
         <div className="flex flex-col items-center justify-center space-y-6 py-40">
            {/* Ícones com efeito de fundo pulsante */}
            <div className="relative">
               <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-red-200 via-red-400 to-red-600 opacity-20 blur-lg"></div>

               <div className="relative flex items-center justify-center">
                  {/* Ícone principal animado */}
                  <FaExclamationTriangle
                     className="animate-pulse text-red-600"
                     size={120}
                  />
               </div>
            </div>

            <div className="space-y-3 text-center">
               {/* Título */}
               <h3 className="text-2xl font-bold tracking-wider text-red-600 select-none">
                  Acesso restrito!
               </h3>

               {/* Mensagem */}
               <p className="mx-auto max-w-md text-base font-semibold tracking-wider text-red-500 italic select-none">
                  Você precisa estar logado para visualizar os chamados do
                  sistema.
               </p>

               {/* Efeito de carregamento (pontos animados) */}
               <div className="flex items-center justify-center space-x-1">
                  <span className="text-base font-semibold tracking-wider text-red-600 italic select-none">
                     Redirecionando
                  </span>
                  <div className="flex space-x-1">
                     <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-600"></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-600"
                        style={{ animationDelay: '0.1s' }}
                     ></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-600"
                        style={{ animationDelay: '0.2s' }}
                     ></div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (!ano || !mes) {
      return (
         <div className="flex flex-col items-center justify-center space-y-6 py-40">
            {/* Ícones com efeito de fundo pulsante */}
            <div className="relative">
               <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 opacity-20 blur-lg"></div>

               <div className="relative flex items-center justify-center">
                  {/* Ícone principal animado */}
                  <FaExclamationTriangle
                     className="animate-pulse text-blue-600"
                     size={120}
                  />
               </div>
            </div>

            <div className="space-y-3 text-center">
               {/* Título */}
               <h3 className="text-2xl font-bold tracking-wider text-blue-600 select-none">
                  Filtros obrigatórios
               </h3>

               {/* Mensagem */}
               <p className="mx-auto max-w-md text-base font-semibold tracking-wider text-blue-500 italic select-none">
                  Por favor, selecione o ano e mês para visualizar os chamados.
               </p>

               {/* Efeito de carregamento (pontos animados) */}
               <div className="flex items-center justify-center space-x-1">
                  <span className="text-base font-semibold tracking-wider text-blue-600 italic select-none">
                     Aguardando filtros
                  </span>
                  <div className="flex space-x-1">
                     <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                        style={{ animationDelay: '0.1s' }}
                     ></div>
                     <div
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                        style={{ animationDelay: '0.2s' }}
                     ></div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (isLoading) {
      return <IsLoading title="Carregando os dados da tabela" />;
   }

   if (isError) {
      return <IsError error={error as Error} />;
   }
   // ================================================================================

   // ===== RENDERIZAÇÃO DO COMPONENTE =====
   return (
      <>
         <div className="overflow-hidden rounded-xl border border-gray-500 bg-black">
            {/* ===== HEADER ===== */}
            <header className="flex flex-col gap-6 bg-black p-6">
               {/* ===== LINHA SUPERIOR ===== */}
               <section className="flex items-center justify-between gap-8">
                  {/* ===== ITENS DA ESQUERDA ===== */}
                  <div className="flex items-center justify-center gap-6">
                     {/* ícone */}
                     <div className="flex items-center justify-center rounded-xl border border-white/50 p-4">
                        <FaDatabase className="text-white" size={28} />
                     </div>
                     {/* título */}
                     <h1 className="text-4xl font-extrabold tracking-widest text-white select-none">
                        Tabela de Chamados
                     </h1>
                  </div>
                  {/* ===== */}

                  {/* ===== ITENS DA DIREITA ===== */}
                  <div className="flex items-center gap-6">
                     <TarefasButton
                        onVisualizarTarefas={() => setTabelaTarefasOpen(true)}
                     />

                     {/* botão mostrar/ocultar filtros */}
                     <button
                        onClick={() => setShowFilters(!showFilters)}
                        disabled={!data || data.length <= 1}
                        className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-2 text-lg font-extrabold tracking-wider italic transition-all select-none ${
                           showFilters
                              ? 'bg-blue-600 text-white hover:bg-blue-900'
                              : 'border border-white/50 bg-white/40 text-white hover:border-none hover:bg-white/70 hover:text-black'
                        } ${
                           !data || data.length <= 1
                              ? 'disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-gray-500'
                              : 'hover:scale-105 active:scale-95'
                        }`}
                     >
                        {showFilters ? (
                           <LuFilterX size={24} />
                        ) : (
                           <LuFilter size={24} />
                        )}
                        {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                     </button>

                     {/* botão limpar filtros */}
                     {totalActiveFilters > 0 && (
                        <button
                           onClick={clearFilters}
                           className="flex cursor-pointer gap-4 rounded-md border border-white/30 bg-red-600 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic transition-all select-none hover:scale-105 hover:bg-red-900 active:scale-95"
                        >
                           <BsEraserFill className="text-white" size={24} />
                           Limpar Filtros
                        </button>
                     )}
                  </div>
               </section>

               {/* ===== FILTRO GLOBAL ===== */}
               {data && data.length > 0 && (
                  <section className="flex items-center justify-between gap-6">
                     {/* Campo de busca global */}
                     <div className="max-w-md flex-1 font-semibold tracking-wider select-none placeholder:tracking-wider placeholder:text-gray-400 placeholder:italic placeholder:select-none">
                        <GlobalFilterInput
                           value={globalFilter ?? ''}
                           onChange={value => setGlobalFilter(String(value))}
                           placeholder="Buscar em todas as colunas..."
                           onClear={function (): void {
                              setGlobalFilter('');
                           }}
                        />
                     </div>

                     {/* Indicadores de filtros ativos */}
                     <FilterIndicator
                        columnFilters={columnFilters}
                        globalFilter={globalFilter}
                        totalFilters={totalActiveFilters}
                     />
                  </section>
               )}
            </header>
            {/* ===== */}

            {/* ===== CONTEÚDO ===== */}
            <main className="h-full w-full overflow-hidden bg-black">
               <div
                  className="h-full overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 450px)' }}
               >
                  {/* ===== TABELA ===== */}
                  <table className="w-full table-fixed border-collapse">
                     {/* ===== CABEÇALHO DA TABELA ===== */}
                     <thead className="sticky top-0 z-20">
                        {table.getHeaderGroups().map(headerGroup => (
                           // linha do cabeçalho
                           <tr key={headerGroup.id}>
                              {headerGroup.headers.map(header => (
                                 // células do cabeçalho
                                 <th
                                    key={header.id}
                                    className="bg-teal-700 py-6 font-extrabold tracking-wider text-white uppercase select-none"
                                    style={{
                                       width: getColumnWidth(header.column.id),
                                    }}
                                 >
                                    {header.isPlaceholder ? null : header.column
                                         .id === 'COD_CHAMADO' ||
                                      header.column.id === 'DATA_CHAMADO' ||
                                      header.column.id === 'ASSUNTO_CHAMADO' ||
                                      header.column.id === 'STATUS_CHAMADO' ? (
                                       <SortableHeader column={header.column}>
                                          {flexRender(
                                             header.column.columnDef.header,
                                             header.getContext()
                                          )}
                                       </SortableHeader>
                                    ) : (
                                       flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                       )
                                    )}
                                 </th>
                              ))}
                           </tr>
                        ))}
                        {/* ===== */}

                        {/* ===== FILTROS DA TABELA ===== */}
                        {showFilters && (
                           <tr>
                              {table.getAllColumns().map(column => (
                                 <th
                                    key={column.id}
                                    className="bg-teal-700 px-3 pb-6"
                                    style={{ width: getColumnWidth(column.id) }}
                                 >
                                    {column.id === 'COD_CHAMADO' && (
                                       <FilterInputWithDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          onClear={() =>
                                             column.setFilterValue('')
                                          }
                                          placeholder="Código..."
                                          type="text"
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'DATA_CHAMADO' && (
                                       <FilterInputWithDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          onClear={() =>
                                             column.setFilterValue('')
                                          }
                                          placeholder="dd/mm/aaaa"
                                          type="text"
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'ASSUNTO_CHAMADO' && (
                                       <FilterInputWithDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          onClear={() =>
                                             column.setFilterValue('')
                                          }
                                          placeholder="Filtrar por assunto..."
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'STATUS_CHAMADO' && (
                                       <FilterInputWithDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          onClear={() =>
                                             column.setFilterValue('')
                                          }
                                          placeholder="Filtrar por status..."
                                       />
                                    )}
                                    {/* ===== */}
                                    {column.id === 'EMAIL_CHAMADO' && (
                                       <FilterInputWithDebounce
                                          value={
                                             (column.getFilterValue() as string) ??
                                             ''
                                          }
                                          onChange={value =>
                                             column.setFilterValue(value)
                                          }
                                          onClear={() =>
                                             column.setFilterValue('')
                                          }
                                          placeholder="Filtrar por email..."
                                       />
                                    )}
                                 </th>
                              ))}
                           </tr>
                        )}
                     </thead>
                     {/* ===== */}

                     {/* ===== CORPO DA TABELA ===== */}
                     <tbody>
                        {table.getRowModel().rows.length > 0 &&
                           !isLoading &&
                           table.getRowModel().rows.map((row, rowIndex) => (
                              // linhas do corpo da tabela
                              <tr
                                 key={row.id}
                                 className={`group border-b border-gray-600 transition-all hover:bg-amber-200 ${
                                    rowIndex % 2 === 0
                                       ? 'bg-stone-800'
                                       : 'bg-stone-700'
                                 }`}
                              >
                                 {row.getVisibleCells().map(cell => (
                                    // células do corpo da tabela
                                    <td
                                       key={cell.id}
                                       className="p-3 text-sm font-semibold tracking-wider text-white select-none group-hover:text-black"
                                       style={{
                                          width: getColumnWidth(cell.column.id),
                                       }}
                                    >
                                       <div className="overflow-hidden">
                                          {flexRender(
                                             cell.column.columnDef.cell,
                                             cell.getContext()
                                          )}
                                       </div>
                                    </td>
                                 ))}
                              </tr>
                           ))}
                     </tbody>
                     {/* ===== */}
                  </table>
                  {/* ===== */}
               </div>
               {/* ===== */}
            </main>
            {/* ===== */}

            {/* ===== PAGINAÇÃO DA TABELA ===== */}
            {Array.isArray(data) && data.length > 0 && (
               <section className="bg-black px-12 py-4">
                  <div className="flex items-center justify-between">
                     {/* Informações da página */}
                     <div className="flex items-center gap-2">
                        <span className="text-base font-semibold tracking-widest text-white italic select-none">
                           {table.getFilteredRowModel().rows.length} registro
                           {table.getFilteredRowModel().rows.length !== 1
                              ? 's'
                              : ''}{' '}
                           encontrado
                           {table.getFilteredRowModel().rows.length !== 1
                              ? 's'
                              : ''}
                        </span>

                        {/* Total de registros (sem filtros) */}
                        {totalActiveFilters > 0 && (
                           <span className="text-base font-semibold tracking-widest text-white italic select-none">
                              de um total de {data.length}
                           </span>
                        )}
                     </div>

                     {/* Controles de paginação */}
                     <div className="flex items-center gap-3">
                        {/* Seletor de itens por página */}
                        <div className="flex items-center gap-2">
                           <span className="text-base font-semibold tracking-widest text-white italic select-none">
                              Itens por página:
                           </span>
                           <select
                              value={table.getState().pagination.pageSize}
                              onChange={e =>
                                 table.setPageSize(Number(e.target.value))
                              }
                              className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 text-base font-semibold tracking-widest text-white italic transition-all hover:bg-gray-500"
                           >
                              {[10, 25, 50, 75, 100].map(pageSize => (
                                 <option
                                    key={pageSize}
                                    value={pageSize}
                                    className="text-base font-semibold tracking-widest text-black italic"
                                 >
                                    {pageSize}
                                 </option>
                              ))}
                           </select>
                        </div>

                        {/* Botões de navegação */}
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => table.setPageIndex(0)}
                              disabled={!table.getCanPreviousPage()}
                              className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 transition-all hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                           >
                              <FiChevronsLeft
                                 className="text-white"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() => table.previousPage()}
                              disabled={!table.getCanPreviousPage()}
                              className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 transition-all hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                           >
                              <MdChevronLeft className="text-white" size={24} />
                           </button>

                           <div className="flex items-center justify-center gap-2">
                              <span className="text-base font-semibold tracking-widest text-white italic select-none">
                                 Página{' '}
                                 <select
                                    value={
                                       table.getState().pagination.pageIndex + 1
                                    }
                                    onChange={e => {
                                       const page = Number(e.target.value) - 1;
                                       table.setPageIndex(page);
                                    }}
                                    className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 text-base font-semibold tracking-widest text-white italic transition-all hover:bg-gray-500"
                                 >
                                    {Array.from(
                                       { length: table.getPageCount() },
                                       (_, i) => (
                                          <option
                                             key={i + 1}
                                             value={i + 1}
                                             className="text-base font-semibold tracking-widest text-black italic"
                                          >
                                             {i + 1}
                                          </option>
                                       )
                                    )}
                                 </select>
                              </span>
                              <span className="text-base font-semibold tracking-widest text-white italic select-none">
                                 {' '}
                                 de {table.getPageCount()}
                              </span>
                           </div>

                           <button
                              onClick={() => table.nextPage()}
                              disabled={!table.getCanNextPage()}
                              className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 transition-all hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                           >
                              <MdChevronRight
                                 className="text-white"
                                 size={24}
                              />
                           </button>

                           <button
                              onClick={() =>
                                 table.setPageIndex(table.getPageCount() - 1)
                              }
                              disabled={!table.getCanNextPage()}
                              className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 transition-all hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                           >
                              <FiChevronsRight
                                 className="text-white"
                                 size={24}
                              />
                           </button>
                        </div>
                     </div>
                  </div>
               </section>
            )}
            {/* ===== */}

            {/* ===== MENSAGEM QUANDO NÃO HÁ CHAMADOS ===== */}
            {data && data.length === 0 && !isLoading && (
               <section className="bg-black py-40 text-center">
                  {/* ícone */}
                  <FaExclamationTriangle
                     className="mx-auto mb-6 text-yellow-500"
                     size={80}
                  />
                  {/* título */}
                  <h3 className="text-2xl font-bold tracking-widest text-white italic select-none">
                     Nenhum chamado foi encontrado para o período{' '}
                     {mes.toString().padStart(2, '0')}/{ano}.
                  </h3>
               </section>
            )}
            {/* ===== */}

            {/* ===== MENSAGEM QUANDO FILTROS NÃO RETORNAM RESULTADOS ===== */}
            {data &&
               data.length > 0 &&
               table.getFilteredRowModel().rows.length === 0 && (
                  <section className="bg-slate-900 py-20 text-center">
                     {/* ícone */}
                     <FaFilter
                        className="mx-auto mb-4 text-cyan-400"
                        size={60}
                     />
                     {/* título */}
                     <h3 className="text-xl font-bold tracking-wider text-slate-200 select-none">
                        Nenhum registro foi encontrado para os filtros
                        aplicados.
                     </h3>
                     {/* Subtítulo */}
                     <p className="mt-2 text-slate-400">
                        Tente ajustar os filtros ou limpe-os para visualizar
                        registros.
                     </p>

                     {/* Botão para limpar filtros */}
                     {totalActiveFilters > 0 && (
                        <button
                           onClick={clearFilters}
                           className="mx-auto mt-4 flex cursor-pointer items-center gap-2 rounded-md border border-cyan-400 bg-cyan-600 px-6 py-2 text-base font-semibold tracking-wider text-white transition-all select-none hover:scale-105 hover:bg-cyan-700 active:scale-95"
                        >
                           <BsEraserFill size={18} />
                           Limpar Filtros
                        </button>
                     )}
                  </section>
               )}
            {/* ===== */}
         </div>
         {/* ===== */}

         {/* ===== MODAL CHAMADO ===== */}
         <ModalAtribuirChamado
            isOpen={modalChamadosOpen}
            onClose={handleCloseModalChamados}
            chamado={selectedChamado}
         />
         {/* ===== MODAL OS ===== */}
         <TabelaOS
            isOpen={tabelaOSOpen}
            onClose={handleCloseTabelaOS}
            codChamado={selectedCodChamado}
            onSuccess={() => setTabelaOSOpen(false)} // <- fecha o modal da tabela
         />
         {/* ===== MODAL TAREFAS ===== */}
         <TabelaTarefas
            isOpen={tabelaTarefasOpen}
            onClose={() => setTabelaTarefasOpen(false)}
            codChamado={selectedCodChamado}
         />
         {/* ===== */}
      </>
   );
}

// Função para largura fixa por coluna
function getColumnWidth(columnId: string): string {
   const widthMap: Record<string, string> = {
      COD_CHAMADO: '10%',
      ASSUNTO_CHAMADO: '35%',
      EMAIL_CHAMADO: '15%',
      DATA_CHAMADO: '10%',
      STATUS_CHAMADO: '20%',
      actions: '7%',
   };

   return widthMap[columnId] || 'auto';
}
