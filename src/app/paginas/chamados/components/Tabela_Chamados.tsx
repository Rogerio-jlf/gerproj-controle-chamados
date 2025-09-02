'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';
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
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { FaFilter } from 'react-icons/fa6';
import { Loader2 } from 'lucide-react';
// ================================================================================
// ================================================================================

// ================================================================================
const FilterInput = ({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full rounded-md bg-black px-4 py-2 text-base text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none"
  />
);
// =====

const FilterSelect = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full cursor-pointer rounded-md bg-black px-4 py-2 text-base text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none"
  >
    <option value="" className="placeholder:text-gray-400">
      {placeholder}
    </option>
    {options.map(option => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);
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
            {!sorted && <RiArrowUpDownLine size={20} className="text-white" />}
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
// ================================================================================

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
// ================================================================================

export default function TabelaChamados() {
  const { filters } = useFiltersTabelaChamados();
  const { ano, mes } = filters;
  const { user, loading } = useAuth();

  // Estados para modal do chamado
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState<ChamadosProps | null>(
    null
  );

  // Estados para modal da OS
  const [osModalOpen, setOsModalOpen] = useState(false);
  const [selectedCodChamado, setSelectedCodChamado] = useState<number | null>(
    null
  );

  // Estados para filtros e ordenação
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'COD_CHAMADO', desc: true }, // Ordenação padrão por código decrescente
  ]);
  const [showFilters, setShowFilters] = useState(false);

  const [tarefasModalOpen, setTarefasModalOpen] = useState(false);

  // ================================================================================

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedChamado(null);
  };

  const handleCloseOSModal = () => {
    setOsModalOpen(false);
    setSelectedCodChamado(null);
  };

  // ================================================================================

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const enabled = !!ano && !!mes && !!token && !!user;

  const queryParams = useMemo(() => {
    if (!user) return new URLSearchParams();

    const params = new URLSearchParams({
      ano: String(ano),
      mes: String(mes),
    });

    return params;
  }, [ano, mes, user]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['chamadosAbertos', queryParams.toString(), token],
    queryFn: () => fetchChamados(queryParams, token!),
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const handleVisualizarChamado = useCallback(
    (codChamado: number) => {
      const chamado = data?.find(c => c.COD_CHAMADO === codChamado);
      if (chamado) {
        setSelectedChamado(chamado);
        setModalOpen(true);
      }
    },
    [data]
  );

  const handleVisualizarOS = useCallback((codChamado: number) => {
    setSelectedCodChamado(codChamado);
    setOsModalOpen(true);
  }, []);

  const colunas = useMemo(
    () =>
      colunasTabela({
        onVisualizarChamado: handleVisualizarChamado,
        onVisualizarOS: handleVisualizarOS,
        onVisualizarTarefas: () => setTarefasModalOpen(true),
      }),
    [handleVisualizarChamado, handleVisualizarOS]
  );

  const table = useReactTable({
    data: data ?? [],
    columns: colunas,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    // Função de filtro personalizada que funciona para todos os tipos
    filterFns: {
      customFilter: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === '') return true;

        const cellValue = row.getValue(columnId);

        // Converte ambos os valores para string e faz comparação case-insensitive
        const cellString = String(cellValue || '').toLowerCase();
        const filterString = String(filterValue).toLowerCase();

        // Para COD_CHAMADO, permite busca parcial em números
        if (columnId === 'COD_CHAMADO') {
          return cellString.includes(filterString);
        }

        // Para STATUS_CHAMADO, busca exata se for um valor do select
        if (columnId === 'STATUS_CHAMADO' && filterValue !== '') {
          return cellString === filterString;
        }

        // Para outros campos, busca parcial
        return cellString.includes(filterString);
      },
    },
    // Aplica o filtro customizado para todas as colunas
    defaultColumn: {
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === '') return true;

        const cellValue = row.getValue(columnId);

        // Converte ambos os valores para string e faz comparação case-insensitive
        const cellString = String(cellValue || '').toLowerCase();
        const filterString = String(filterValue).toLowerCase();

        // Para COD_CHAMADO, permite busca parcial em números
        if (columnId === 'COD_CHAMADO') {
          return cellString.includes(filterString);
        }

        // Para STATUS_CHAMADO, busca exata se for um valor do select
        if (columnId === 'STATUS_CHAMADO' && filterValue !== '') {
          return cellString === filterString;
        }

        // Para outros campos, busca parcial
        return cellString.includes(filterString);
      },
    },
  });

  // Obter valores únicos para filtros de select
  const statusOptions = useMemo(() => {
    const statusSet = new Set<string>();
    data?.forEach(item => {
      if (item.STATUS_CHAMADO) statusSet.add(item.STATUS_CHAMADO);
    });
    return Array.from(statusSet).sort();
  }, [data]);

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setColumnFilters([]);
  };
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
            Você precisa estar logado para visualizar os chamados do sistema.
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

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-500 bg-black">
        {/* ===== HEADER ===== */}
        <header className="flex items-center justify-between gap-8 bg-black p-6">
          {/* ===== ITENS DA ESQUERDA ===== */}
          <section className="flex items-center justify-center gap-6">
            {/* ícone */}
            <div className="flex items-center justify-center rounded-xl border border-white/50 p-4">
              <FaDatabase className="text-white" size={44} />
            </div>
            {/* ===== */}
            <div className="flex flex-col items-start justify-center">
              {/* título */}
              <h1 className="mb-1 text-4xl font-extrabold tracking-widest text-white select-none">
                Tabela de Chamados
              </h1>
              {/* ===== */}
              <div className="flex items-center gap-4">
                {/* nome usuário */}
                <span className="rounded-full bg-white px-6 py-1 text-sm font-bold tracking-widest text-black italic select-none">
                  {user.nome}
                </span>
                {/* período */}
                {Array.isArray(data) && data.length > 0 && (
                  <span className="rounded-full bg-white px-6 py-1 text-sm font-bold tracking-widest text-black italic select-none">
                    {mes.toString().padStart(2, '0')}/{ano}
                  </span>
                )}
              </div>
              {/* ===== */}
            </div>
            {/* ===== */}
          </section>
          {/* ===== */}

          {/* ===== ITENS DA DIREITA ===== */}
          <section className="flex items-center gap-6">
            {/* botão mostrar/ocultar filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-2 text-lg font-extrabold tracking-wider text-white italic transition-all select-none ${
                showFilters
                  ? 'bg-blue-600 hover:scale-105 hover:bg-blue-900 active:scale-95'
                  : 'border border-white/50 bg-white/10 hover:scale-105 hover:bg-white/30 active:scale-95'
              }`}
            >
              {showFilters ? (
                <FaFilterCircleXmark size={24} />
              ) : (
                <FaFilter size={24} />
              )}
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            {/* ===== */}

            {/* botão limpar filtros */}
            {columnFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="flex cursor-pointer gap-4 rounded-md border border-white/30 bg-red-600 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic transition-all select-none hover:scale-105 hover:bg-red-900 active:scale-95"
              >
                <BsEraserFill className="text-white" size={24} />
                Limpar Filtros
              </button>
            )}
            {/* ===== */}

            {/* botão exportar para excel */}
            {/* <ButtonExcel
              data={data ?? []}
              fileName={`relatorio_de_chamados_${mes}_${ano}`}
              title={`Relatório de Chamados - ${mes}/${ano}`}
              columns={[
                { key: 'COD_CHAMADO', label: 'Chamado' },
                { key: 'ASSUNTO_CHAMADO', label: 'Assunto' },
                { key: 'EMAIL_CHAMADO', label: 'Email' },
                { key: 'DATA_CHAMADO', label: 'Data' },
                { key: 'STATUS_CHAMADO', label: 'Status' },
              ]}
              autoFilter={true}
              freezeHeader={true}
            /> */}
            {/* ===== */}

            {/* botão exportar para PDF */}
            {/* <ButtonPDF
              data={data ?? []}
              fileName={`relatorio_chamados_${mes}_${ano}`}
              title={`Relatório de Chamados - ${mes}/${ano}`}
              columns={[
                { key: 'COD_CHAMADO', label: 'Chamado' },
                { key: 'ASSUNTO_CHAMADO', label: 'Assunto' },
                { key: 'EMAIL_CHAMADO', label: 'Email' },
                { key: 'DATA_CHAMADO', label: 'Data' },
                { key: 'STATUS_CHAMADO', label: 'Status' },
              ]}
              footerText="Gerado pelo sistema em"
            /> */}
            {/* ===== */}
          </section>
        </header>
        {/* ===== */}

        {/* ===== CONTEÚDO ===== */}
        <main className="h-full w-full overflow-hidden bg-black">
          <div
            className="h-full overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 370px)' }}
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
                        style={{ width: getColumnWidth(header.column.id) }}
                      >
                        {header.isPlaceholder ? null : header.column.id ===
                            'COD_CHAMADO' ||
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
                          <FilterInput
                            value={(column.getFilterValue() as string) ?? ''}
                            onChange={value => column.setFilterValue(value)}
                            placeholder="Código..."
                            type="text"
                          />
                        )}
                        {column.id === 'DATA_CHAMADO' && (
                          <FilterInput
                            value={(column.getFilterValue() as string) ?? ''}
                            onChange={value => column.setFilterValue(value)}
                            placeholder="dd/mm/aaaa"
                            type="text"
                          />
                        )}
                        {column.id === 'ASSUNTO_CHAMADO' && (
                          <FilterInput
                            value={(column.getFilterValue() as string) ?? ''}
                            onChange={value => column.setFilterValue(value)}
                            placeholder="Filtrar por assunto..."
                          />
                        )}
                        {column.id === 'STATUS_CHAMADO' && (
                          <FilterSelect
                            value={(column.getFilterValue() as string) ?? ''}
                            onChange={value => column.setFilterValue(value)}
                            options={statusOptions}
                            placeholder="Filtrar por status..."
                          />
                        )}
                        {column.id === 'EMAIL_CHAMADO' && (
                          <FilterInput
                            value={(column.getFilterValue() as string) ?? ''}
                            onChange={value => column.setFilterValue(value)}
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
                        rowIndex % 2 === 0 ? 'bg-stone-800' : 'bg-stone-700'
                      }`}
                    >
                      {row.getVisibleCells().map(cell => (
                        // células do corpo da tabela
                        <td
                          key={cell.id}
                          className="p-3 text-sm font-semibold tracking-wider text-white select-none group-hover:text-black"
                          style={{ width: getColumnWidth(cell.column.id) }}
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
          <section className="border-t border-white bg-black px-12 py-4">
            <div className="flex items-center justify-between">
              {/* Informações da página */}
              <div className="flex items-center gap-4 text-base font-semibold tracking-widest text-white italic select-none">
                <span>
                  {table.getFilteredRowModel().rows.length} registro
                  {table.getFilteredRowModel().rows.length !== 1
                    ? 's'
                    : ''}{' '}
                  encontrado
                  {table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
                </span>

                {/* Filtros ativos */}
                {columnFilters.length > 0 && (
                  <span className="rounded-full bg-blue-600 px-4 py-1 text-base font-semibold tracking-widest text-white italic select-none">
                    {columnFilters.length} filtro
                    {columnFilters.length > 1 ? 's' : ''} ativo
                    {columnFilters.length > 1 ? 's' : ''}
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
                    onChange={e => table.setPageSize(Number(e.target.value))}
                    className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 text-base font-semibold tracking-widest text-white italic hover:bg-gray-500"
                  >
                    {[10, 25, 50, 100].map(pageSize => (
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
                    className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiChevronsLeft className="text-white" size={24} />
                  </button>

                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <MdChevronLeft className="text-white" size={24} />
                  </button>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-semibold tracking-widest text-white italic select-none">
                      Página{' '}
                      <select
                        value={table.getState().pagination.pageIndex + 1}
                        onChange={e => {
                          const page = Number(e.target.value) - 1;
                          table.setPageIndex(page);
                        }}
                        className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 text-base font-semibold tracking-widest text-white italic hover:bg-gray-500"
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
                    className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <MdChevronRight className="text-white" size={24} />
                  </button>

                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="cursor-pointer rounded-md border border-white/30 bg-white/10 px-4 py-1 hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiChevronsRight className="text-white" size={24} />
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
            {/* Descrição */}
            <p className="mt-2 text-lg text-gray-400">
              Você não possui chamados atribuídos nesse período.
            </p>
          </section>
        )}
        {/* ===== */}

        {/* ===== MENSAGEM QUANDO FILTROS NÃO RETORNAM RESULTADOS ===== */}
        {data &&
          data.length > 0 &&
          table.getFilteredRowModel().rows.length === 0 && (
            <section className="bg-slate-900 py-20 text-center">
              {/* ícone */}
              <FaFilter className="mx-auto mb-4 text-cyan-400" size={60} />
              {/* título */}
              <h3 className="text-xl font-bold tracking-wider text-slate-200 select-none">
                Nenhum registro foi encontrado para os filtros aplicados.
              </h3>
              {/* Subtítulo */}
              <p className="mt-2 text-slate-400">
                Tente ajustar os filtros ou limpe-os para visualizar registros.
              </p>
            </section>
          )}
        {/* ===== */}
      </div>
      {/* ===== */}

      {/* ===== MODAL CHAMADO ===== */}
      <ModalAtribuirChamado
        isOpen={modalOpen}
        onClose={handleCloseModal}
        chamado={selectedChamado}
      />
      {/* ===== MODAL OS ===== */}
      <TabelaOS
        isOpen={osModalOpen}
        onClose={handleCloseOSModal}
        codChamado={selectedCodChamado}
        onSuccess={() => setOsModalOpen(false)} // <- fecha o modal da tabela
      />
      {/* ===== MODAL TAREFAS ===== */}
      <TabelaTarefas
        isOpen={tarefasModalOpen}
        onClose={() => setTarefasModalOpen(false)}
        codChamado={selectedCodChamado}
      />
      {/* ===== */}
    </>
  );
}

// Função para largura fixa por coluna
function getColumnWidth(columnId: string): string {
  const widthMap: Record<string, string> = {
    COD_CHAMADO: '70px',
    ASSUNTO_CHAMADO: '300px',
    EMAIL_CHAMADO: '150px',
    DATA_CHAMADO: '80px',
    STATUS_CHAMADO: '150px',
    actions: '80px',
  };

  return widthMap[columnId] || '100px';
}
