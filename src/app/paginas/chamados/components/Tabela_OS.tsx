'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// ================================================================================
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
import { colunasTabelaOS, OSProps, OSTarefaProps } from './Colunas_Tabela_OS';
import ModalEditarOS from './Modal_Editar_OS';
import { ModalExcluirOS } from './Modal_Deletar_OS';
// ================================================================================
import IsLoading from './Loading';
import IsError from './Error';
// ================================================================================
import { BsEraserFill } from 'react-icons/bs';
import { LuFilter, LuFilterX } from 'react-icons/lu';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaFilter } from 'react-icons/fa6';
import { FaFileAlt } from 'react-icons/fa';
import { MdChevronLeft } from 'react-icons/md';
import { FiChevronsLeft } from 'react-icons/fi';
import { MdChevronRight } from 'react-icons/md';
import { FiChevronsRight } from 'react-icons/fi';
import { LuArrowUpDown } from 'react-icons/lu';
import { FaArrowUpLong } from 'react-icons/fa6';
import { FaArrowDownLong } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { FaThList } from 'react-icons/fa';
// ================================================================================
// ================================================================================

// ================================================================================
// Input filtro
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
    className="w-full rounded-md border border-white/30 bg-gray-900 px-4 py-2 text-base text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
  />
);
// =====

// Select filtro
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
    className="w-full cursor-pointer rounded-md border border-white/30 bg-gray-900 px-4 py-2 text-base text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
  >
    <option value="">{placeholder}</option>
    {options.map(option => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);
// =====

// Cabeçalho ordenável
const SortableHeader = ({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) => {
  const sorted = column.getIsSorted();

  return (
    <div
      className="flex cursor-pointer items-center justify-center gap-2 rounded-full py-2 hover:bg-teal-900"
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      <div className="flex flex-col">
        {sorted === 'asc' && <FaArrowUpLong size={20} />}
        {sorted === 'desc' && <FaArrowDownLong size={20} />}
        {!sorted && <LuArrowUpDown size={20} className="text-white" />}
      </div>
    </div>
  );
};
// ================================================================================

export default function TabelaOS({
  isOpen,
  onClose,
  onSuccess,
  codChamado,
}: OSTarefaProps) {
  // Estado para controle do modal de edição
  const [modalEditarOSOpen, setModalEditarOSOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'COD_OS', desc: false },
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [osParaExcluir, setOsParaExcluir] = useState<string | null>(null);
  const [isExcluindo, setIsExcluindo] = useState(false);

  // ==============================

  const fetchDataOS = async (codChamado: number) => {
    const response = await fetch(`/api/ordens-servico/${codChamado}`);

    if (!response.ok) throw new Error(`Erro: ${response.status}`);

    const data = await response.json();

    return Array.isArray(data) ? data : [data];
  };
  // ==============================

  const {
    data: dataOS,
    isLoading: isLoading,
    isError: isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dataOS', codChamado],
    queryFn: () => fetchDataOS(codChamado!),
    enabled: isOpen && !!codChamado,
    staleTime: 1000 * 60 * 1,
  });
  // ==============================

  useEffect(() => {
    if (isOpen && codChamado) {
      refetch();
    }
  }, [isOpen, codChamado, refetch]);
  // ==============================

  const handleClose = () => {
    setTimeout(() => {
      onClose();
    }, 300);
  };
  // ==============================

  // ==============================
  // Função para abrir o modal de edição
  const handleOpenEditarOS = (codOS: string) => {
    setSelectedOS(codOS);
    setModalEditarOSOpen(true);
  };

  // Função para fechar o modal de edição
  const handleCloseEditarOS = () => {
    setModalEditarOSOpen(false);
    setSelectedOS(null);
  };
  // ==============================

  // Função para abrir modal de exclusão
  const handleAbrirModalExclusao = (codOS: string) => {
    setOsParaExcluir(codOS);
  };

  // Função para fechar modal de exclusão
  const handleFecharModalExclusao = () => {
    setOsParaExcluir(null);
    setIsExcluindo(false);
  };

  const handleEditarOSSuccess = () => {
    handleCloseEditarOS(); // fecha o modal de edição
    onSuccess?.(); // fecha a Tabela_OS
  };

  // Função para confirmar exclusão
  const handleConfirmarExclusao = async (codOS: string) => {
    setIsExcluindo(true);
    try {
      const response = await fetch(`/api/os?codOS=${codOS}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir OS');
      }

      // Recarregar os dados após exclusão bem-sucedida
      await refetch();

      // Fechar o modal
      handleFecharModalExclusao();
    } catch (error) {
      console.error('Erro ao excluir OS:', error);
      throw error;
    } finally {
      setIsExcluindo(false);
    }
  };
  // ==============================

  // Configuração da tabela
  const colunas = colunasTabelaOS({
    onEditarOS: handleOpenEditarOS,
    onExcluirOS: handleAbrirModalExclusao,
  });
  // ==============================

  const table = useReactTable({
    data: (dataOS ?? []) as OSProps[],
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
        pageSize: 10,
      },
    },
    // Função de filtro personalizada
    defaultColumn: {
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === '') return true;

        const cellValue = row.getValue(columnId);

        // Converte ambos os valores para string e faz comparação case-insensitive
        const cellString = String(cellValue || '').toLowerCase();
        const filterString = String(filterValue).toLowerCase();

        // Para campos específicos, permite busca parcial
        if (columnId === 'COD_OS' || columnId === 'CODTRF_OS') {
          return cellString.includes(filterString);
        }

        // Para data, formata antes de comparar
        if (columnId === 'DTINI_OS') {
          if (!cellValue) return false;
          try {
            const date = new Date(cellValue as string);
            const formattedDate = date.toLocaleDateString('pt-BR');
            return formattedDate.includes(filterString);
          } catch {
            return cellString.includes(filterString);
          }
        }

        // Para outros campos, busca parcial
        return cellString.includes(filterString);
      },
    },
  });
  // ==============================

  // Obter valores únicos para filtros de select - usando useMemo para otimização
  const clienteOptions = Array.from(
    new Set(
      dataOS
        ?.map(item => item.NOME_CLIENTE)
        .filter(Boolean)
        .filter(cliente => cliente && cliente.trim() !== '')
    )
  ).sort();
  // ==============================

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setColumnFilters([]);
  };
  // ==============================

  if (!isOpen) return null;
  // ==============================

  // ===== LOADING CENTRALIZADO - NOVA IMPLEMENTAÇÃO =====
  if (isLoading) {
    return (
      <>
        {/* Overlay do modal principal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xl"
            onClick={onClose}
          />
          <div className="relative z-10 mx-4 max-h-[100vh] w-full max-w-[100vw] overflow-hidden rounded-2xl border border-gray-300">
            {/* Header do modal mesmo durante loading */}
            <header className="flex items-center justify-between gap-8 bg-white/70 p-6">
              <section className="flex items-center justify-center gap-6">
                <div className="flex items-center justify-center rounded-xl border border-black/30 bg-white/10 p-4">
                  <FaFileAlt className="animate-pulse text-black" size={44} />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h1 className="mb-1 text-4xl font-extrabold tracking-widest text-black select-none">
                    Ordens de Serviço
                  </h1>
                  <span className="rounded-full bg-black px-6 py-1 text-sm font-bold tracking-widest text-white italic select-none">
                    Chamado - {codChamado}
                  </span>
                </div>
              </section>
              <button
                onClick={handleClose}
                className="group cursor-pointer rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
              >
                <IoClose size={24} />
              </button>
            </header>
            {/* Conteúdo com loading */}
            <main className="flex min-h-[400px] items-center justify-center overflow-hidden bg-black">
              <div className="text-center">
                {/* Aqui você pode personalizar o loading como quiser */}
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
                <h2 className="text-2xl font-bold tracking-widest text-white italic">
                  Carregando os dados da tabela...
                </h2>
              </div>
            </main>
          </div>
        </div>

        {/* Loading overlay centralizado - Z-INDEX MAIS ALTO */}
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <IsLoading title="Carregando os dados da tabela" />
        </div>
      </>
    );
  }
  // ==============================

  if (isError) {
    return (
      <>
        {/* Overlay do modal principal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xl"
            onClick={onClose}
          />
          <div className="relative z-10 mx-4 max-h-[100vh] w-full max-w-[100vw] overflow-hidden rounded-2xl border border-gray-300">
            {/* Header do modal mesmo durante erro */}
            <header className="flex items-center justify-between gap-8 bg-white/70 p-6">
              <section className="flex items-center justify-center gap-6">
                <div className="flex items-center justify-center rounded-xl border border-black/30 bg-white/10 p-4">
                  <FaFileAlt className="animate-pulse text-black" size={44} />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h1 className="mb-1 text-4xl font-extrabold tracking-widest text-black select-none">
                    Ordens de Serviço
                  </h1>
                  <span className="rounded-full bg-black px-6 py-1 text-sm font-bold tracking-widest text-white italic select-none">
                    Chamado - {codChamado}
                  </span>
                </div>
              </section>
              <button
                onClick={handleClose}
                className="group cursor-pointer rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
              >
                <IoClose size={24} />
              </button>
            </header>
            <main className="min-h-[400px] overflow-hidden bg-black">
              {/* Conteúdo vazio durante erro */}
            </main>
          </div>
        </div>

        {/* Error overlay centralizado - Z-INDEX MAIS ALTO */}
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <IsError error={error as Error} />
        </div>
      </>
    );
  }

  // ================================================================================

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* ===== OVERLAY ===== */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-xl"
          onClick={onClose}
        />
        {/* ===== MODAL ===== */}
        <div className="relative z-10 mx-4 max-h-[100vh] w-full max-w-[100vw] overflow-hidden rounded-2xl border border-black">
          {/* ===== HEADER ===== */}
          <header className="flex items-center justify-between gap-8 bg-white/70 p-6">
            {/* ===== ITENS DA ESQUERDA ===== */}
            <section className="flex items-center justify-center gap-6">
              {/* ícone */}
              <div className="flex items-center justify-center rounded-xl border border-black/30 bg-white/10 p-4">
                <FaThList className="text-black" size={44} />
              </div>
              {/* ===== */}

              <div className="flex flex-col items-start justify-center">
                {/* título */}
                <h1 className="mb-1 text-4xl font-extrabold tracking-widest text-black select-none">
                  Ordens de Serviço
                </h1>
                {/* ===== */}

                <div className="flex items-center gap-4">
                  {/* número do chamado*/}
                  <span className="rounded-full bg-black px-6 py-1 text-sm font-bold tracking-widest text-white italic select-none">
                    Chamado - {codChamado}
                  </span>
                  {/* quantidade de OS's */}
                  {dataOS && dataOS.length > 0 && (
                    <span className="rounded-full bg-black px-6 py-1 text-sm font-bold tracking-widest text-white italic select-none">
                      {dataOS.length}{' '}
                      {dataOS.length === 1
                        ? '- OS encontrada'
                        : "- OS's encontradas"}
                    </span>
                  )}
                </div>
              </div>
            </section>
            {/* ===== */}

            {/* ===== ITENS DA DIREITA ===== */}
            <section className="flex items-center gap-20">
              <button
                onClick={() => setShowFilters(!showFilters)}
                disabled={!dataOS || dataOS.length <= 1}
                className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-2 text-lg font-extrabold tracking-wider text-black italic transition-all select-none disabled:border-gray-200 disabled:text-gray-200 ${
                  showFilters
                    ? 'border border-blue-800 bg-blue-600 text-white hover:scale-105 hover:bg-blue-900 hover:text-white active:scale-95'
                    : 'border border-black/50 bg-white/10 hover:scale-105 hover:bg-gray-500 hover:text-white active:scale-95'
                }`}
              >
                {showFilters ? <LuFilterX size={24} /> : <LuFilter size={24} />}
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>

              {columnFilters.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex cursor-pointer gap-4 rounded-md border border-white/30 bg-red-600 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic transition-all select-none hover:scale-105 hover:bg-red-900 active:scale-95"
                >
                  <BsEraserFill className="text-white" size={24} />
                  Limpar Filtros
                </button>
              )}

              {/* botão - fechar modal */}
              <button
                onClick={handleClose}
                className="group cursor-pointer rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
              >
                <IoClose size={24} />
              </button>
            </section>
          </header>
          {/* ===== */}

          {/* ===== CONTEÚDO PRINCIPAL ===== */}
          <main className="overflow-hidden bg-black">
            {/* ===== TABELA ===== */}
            {dataOS && dataOS.length > 0 && (
              <section className="h-full w-full overflow-hidden bg-black">
                <div
                  className="h-full overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 370px)' }}
                >
                  <table className="w-full table-fixed border-collapse">
                    {/* ===== CABEÇALHO DA TABELA ===== */}
                    <thead className="sticky top-0 z-20">
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className="bg-teal-800 py-6 font-extrabold tracking-wider text-white uppercase select-none"
                              style={{
                                width: getColumnWidth(header.column.id),
                              }}
                            >
                              {header.isPlaceholder ? null : header.column
                                  .id === 'COD_OS' ||
                                header.column.id === 'NOME_CLIENTE' ||
                                header.column.id === 'CODTRF_OS' ||
                                header.column.id === 'DTINI_OS' ||
                                header.column.id === 'HRINI_OS' ||
                                header.column.id === 'HRFIM_OS' ||
                                header.column.id === 'QTD_HR_OS' ? (
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
                              className="bg-teal-800 px-3 pb-6"
                              style={{ width: getColumnWidth(column.id) }}
                            >
                              {column.id === 'COD_OS' && (
                                <FilterInput
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  placeholder="Código..."
                                />
                              )}
                              {column.id === 'NOME_CLIENTE' && (
                                <FilterSelect
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  options={clienteOptions}
                                  placeholder="Cliente..."
                                />
                              )}
                              {column.id === 'CODTRF_OS' && (
                                <FilterInput
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  placeholder="Código..."
                                />
                              )}
                              {column.id === 'OBS_OS' && (
                                <FilterInput
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  placeholder="Observação..."
                                />
                              )}
                              {column.id === 'DTINI_OS' && (
                                <FilterInput
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  placeholder="dd/mm/aaaa"
                                  type="text"
                                />
                              )}
                              {column.id === 'HRINI_OS' && (
                                <FilterInput
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  placeholder="HH:MM"
                                />
                              )}
                              {column.id === 'HRFIM_OS' && (
                                <FilterInput
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  placeholder="HH:MM"
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
                          // Linha do corpo da tabela
                          <tr
                            key={row.id}
                            className={`group border-b border-gray-600 transition-all hover:bg-amber-200 ${
                              rowIndex % 2 === 0
                                ? 'bg-stone-600'
                                : 'bg-stone-500'
                            }`}
                          >
                            {row.getVisibleCells().map(cell => (
                              // Células da tabela
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
                  </table>
                </div>

                {/* ===== PAGINAÇÃO DA TABELA ===== */}
                <section className="border-t border-black bg-white/70 px-12 py-4">
                  <div className="flex items-center justify-between">
                    {/* Informações da página */}
                    <div className="flex items-center gap-4 text-base font-semibold tracking-widest text-black italic select-none">
                      <span>
                        {table.getFilteredRowModel().rows.length} registro
                        {table.getFilteredRowModel().rows.length !== 1
                          ? 's'
                          : ''}{' '}
                        encontrado
                        {table.getFilteredRowModel().rows.length !== 1
                          ? 's'
                          : ''}
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
                        <span className="text-base font-semibold tracking-widest text-black italic select-none">
                          Itens por página:
                        </span>
                        <select
                          value={table.getState().pagination.pageSize}
                          onChange={e =>
                            table.setPageSize(Number(e.target.value))
                          }
                          className="cursor-pointer rounded-md border border-black/30 px-4 py-1 text-base font-semibold tracking-widest text-black italic hover:bg-gray-500 hover:text-white"
                        >
                          {[5, 10, 15, 25].map(pageSize => (
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
                          className="cursor-pointer rounded-md border border-black/30 px-4 py-1 tracking-widest select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <FiChevronsLeft className="text-white" size={24} />
                        </button>

                        <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="cursor-pointer rounded-md border border-black/30 px-4 py-1 tracking-widest select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <MdChevronLeft className="text-white" size={24} />
                        </button>

                        <div className="flex items-center justify-center gap-2">
                          <span className="text-base font-semibold tracking-widest text-black italic select-none">
                            Página{' '}
                            <select
                              value={table.getState().pagination.pageIndex + 1}
                              onChange={e => {
                                const page = Number(e.target.value) - 1;
                                table.setPageIndex(page);
                              }}
                              className="cursor-pointer rounded-md border border-black/30 px-4 py-1 text-base font-semibold tracking-widest text-black italic hover:bg-gray-500 hover:text-white"
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
                          <span className="text-base font-semibold tracking-widest text-black italic select-none">
                            {' '}
                            de {table.getPageCount()}
                          </span>
                        </div>

                        <button
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className="cursor-pointer rounded-md border border-black/30 px-4 py-1 tracking-widest select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <MdChevronRight className="text-white" size={24} />
                        </button>

                        <button
                          onClick={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                          }
                          disabled={!table.getCanNextPage()}
                          className="cursor-pointer rounded-md border border-black/30 px-4 py-1 tracking-widest select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <FiChevronsRight className="text-white" size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </section>
            )}
            {/* ===== */}

            {/* ===== MENSAGEM QUANDO NÃO HÁ OS ===== */}
            {dataOS && dataOS.length === 0 && !isLoading && (
              <section className="bg-black py-40 text-center">
                {/* ícone */}
                <FaExclamationTriangle
                  className="mx-auto mb-6 text-yellow-500"
                  size={80}
                />
                {/* título */}
                <h3 className="text-2xl font-bold tracking-widest text-white italic select-none">
                  Nenhuma Ordem de Serviço foi encontrada para o chamado #
                  {codChamado}.
                </h3>
              </section>
            )}
            {/* ===== */}

            {/* ===== MENSAGEM QUANDO FILTROS NÃO RETORNAM RESULTADOS ===== */}
            {dataOS &&
              dataOS.length > 0 &&
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
                    Tente ajustar os filtros ou limpe-os para visualizar
                    registros.
                  </p>
                </section>
              )}
            {/* ===== */}
          </main>
          {/* ===== */}
        </div>
        {/* ===== */}
      </div>
      {/* ===== */}

      {/* ===== MODAL DE EDIÇÃO DE OS ===== */}
      {modalEditarOSOpen && selectedOS !== null && (
        <ModalEditarOS
          isOpen={modalEditarOSOpen}
          onClose={handleCloseEditarOS}
          codChamado={codChamado}
          codOS={selectedOS}
          nomeCliente={
            dataOS?.find(os => os.COD_OS === selectedOS)?.NOME_CLIENTE
          } // <-- ADICIONAR ESTA LINHA
          onSuccess={handleEditarOSSuccess}
        />
      )}
      {/* ===== */}

      {/* ===== MODAL DE EXCLUSÃO DE OS ===== */}
      <ModalExcluirOS
        isOpen={!!osParaExcluir}
        onClose={handleFecharModalExclusao}
        onConfirm={handleConfirmarExclusao}
        codOS={osParaExcluir}
        isLoading={isExcluindo}
      />
      {/* ===== */}
    </>
  );
}
// ================================================================================

// Função para largura fixa das colunas
function getColumnWidth(columnId: string): string {
  const widthMap: Record<string, string> = {
    COD_OS: '70px',
    NOME_CLIENTE: '150px',
    CODTRF_OS: '100px',
    OBS_OS: '250px',
    DTINI_OS: '100px',
    HRINI_OS: '100px',
    HRFIM_OS: '100px',
    QTD_HR_OS: '100px',
    actions: '80px',
  };

  return widthMap[columnId] || '100px';
}
