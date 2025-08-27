'use client';

import { useEffect, useState } from 'react';
import {
  X,
  FileText,
  TriangleAlert,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import IsLoading from './IsLoading';
import Erro from './IsError';
import { useQuery } from '@tanstack/react-query';
import ModalApontamentos from './Modal_Apontamentos';
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
import { colunasOS } from './Colunas_OS';
import { BsEraserFill } from 'react-icons/bs';
import { LuFilter, LuFilterX } from 'react-icons/lu';
// ================================================================================

interface OSModalProps {
  isOpen: boolean;
  onClose: () => void;
  codChamado: number | null;
}

export interface OSProps {
  COD_OS: string;
  NUM_OS: string;
  CHAMADO_OS: string;
  STATUS_OS: string;
  DTINI_OS: string | null;
  HRINI_OS: string | null;
  DTINC_OS: string | null;
  VRHR_OS: string | null;
  PERC_OS: string | null;
  FATURADO_OS: string;
  COD_FATURAMENTO: string;
  PRODUTIVO_OS: string;
  PRODUTIVO2_OS: string;
  RESPCLI_OS: string;
  CODREC_OS: string;
  CODTRF_OS: string;
  DESLOC_OS: string;
  ABONO_OS: string;
  COMP_OS: string;
  OBS_OS: string;
  OBS: string;
}
// ================================================================================

// Componente de filtro inline
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
// ================================================================================

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
    className="w-full rounded-md border border-white/30 bg-gray-900 px-4 py-2 text-base text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
  >
    <option value="">{placeholder}</option>
    {options.map(option => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);
// ================================================================================

export default function ModalOS({ isOpen, onClose, codChamado }: OSModalProps) {
  // Estado para controlar o modal de apontamentos
  const [modalApontamentosOpen, setModalApontamentosOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<string | null>(null);

  // Estados para filtros e ordenação
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchDataOS = async (codChamado: number) => {
    const response = await fetch(`/api/ordens-servico/${codChamado}`);

    if (!response.ok) throw new Error(`Erro: ${response.status}`);

    const data = await response.json();

    return Array.isArray(data) ? data : [data];
  };

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

  useEffect(() => {
    if (isOpen && codChamado) {
      refetch();
    }
  }, [isOpen, codChamado, refetch]);

  const handleClose = () => {
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Função para abrir modal de apontamentos
  const handleOpenApontamentos = (codOS: string) => {
    setSelectedOS(codOS);
    setModalApontamentosOpen(true);
  };

  // Função para fechar modal de apontamentos
  const handleCloseApontamentos = () => {
    setModalApontamentosOpen(false);
    setSelectedOS(null);
  };

  // Configuração da tabela
  const colunas = colunasOS({
    onVisualizarApontamentos: handleOpenApontamentos,
  });

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
  });

  // Obter valores únicos para filtros de select
  const statusOptions = Array.from(
    new Set(dataOS?.map(item => item.STATUS_OS).filter(Boolean))
  ).sort();

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setColumnFilters([]);
  };

  if (!isOpen) return null;
  // ================================================================================

  return (
    <>
      {/* ===== CONTAINER PRINCIPAL ===== */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* ===== OVERLAY ===== */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* ===== MODAL ===== */}
        <div className="relative z-10 mx-4 max-h-[95vh] w-full max-w-[95vw] overflow-hidden rounded-2xl border border-slate-600">
          {/* ===== HEADER ===== */}
          <header className="bg-slate-950 p-6">
            <div className="flex items-center justify-between gap-8">
              {/* ícone, título e informações */}
              <section className="flex items-center justify-center gap-6">
                <div className="flex items-center justify-center rounded-xl border border-white/30 bg-white/10 p-4">
                  <FileText className="animate-pulse text-cyan-400" size={44} />
                </div>
                <div className="flex flex-col items-center justify-center">
                  {/* Título */}
                  <h1 className="mb-1 text-4xl font-extrabold tracking-widest text-white select-none">
                    Ordens de Serviço
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-blue-800 px-4 py-1 text-sm font-bold tracking-widest text-white italic select-none">
                      Chamado #{codChamado}
                    </span>
                    {dataOS && dataOS.length > 0 && (
                      <span className="rounded-full bg-green-800 px-4 py-1 text-sm font-bold tracking-widest text-white italic select-none">
                        {dataOS.length} OS encontrada(s)
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* botões de controle */}
              <section className="flex items-center gap-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex cursor-pointer items-center gap-4 rounded-md px-6 py-2 text-lg font-extrabold tracking-wider text-white italic transition-all select-none ${
                    showFilters
                      ? 'border border-white/30 bg-blue-600 hover:scale-105 hover:bg-blue-900 active:scale-95'
                      : 'border border-white/30 bg-white/10 hover:scale-105 hover:bg-gray-500 active:scale-95'
                  }`}
                >
                  {showFilters ? (
                    <LuFilterX size={24} />
                  ) : (
                    <LuFilter size={24} />
                  )}
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
                  className="group rounded-full p-2 text-slate-200 hover:scale-125 hover:bg-red-500/50 hover:text-red-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </section>
            </div>
          </header>

          {/* ===== CONTEÚDO PRINCIPAL ===== */}
          <div className="overflow-hidden rounded-xl border-t border-slate-300 bg-slate-900">
            {/* loading */}
            {isLoading && (
              <div className="p-6">
                <IsLoading title="Buscando ordens de serviço" />
              </div>
            )}

            {/* erro */}
            {isError && error && (
              <div className="p-6">
                <Erro error={error as Error} />
              </div>
            )}

            {/* tabela de OS */}
            {dataOS && dataOS.length > 0 && (
              <div className="h-full w-full overflow-hidden bg-gray-900">
                <div
                  className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 h-full overflow-y-auto"
                  style={{ maxHeight: 'calc(95vh - 250px)' }}
                >
                  <table className="w-full table-fixed border-collapse">
                    <thead className="sticky top-0 z-20">
                      {/* Cabeçalho principal */}
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className="bg-teal-800 py-4 font-extrabold tracking-wider text-white uppercase select-none"
                              style={{
                                width: getColumnWidth(header.column.id),
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}

                      {/* Linha de filtros */}
                      {showFilters && (
                        <tr>
                          {table.getAllColumns().map(column => (
                            <th
                              key={column.id}
                              className="bg-teal-800 px-3 pb-6"
                              style={{ width: getColumnWidth(column.id) }}
                            >
                              {column.id === 'NUM_OS' && (
                                <FilterInput
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  placeholder="Filtrar número..."
                                />
                              )}
                              {column.id === 'STATUS_OS' && (
                                <FilterSelect
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  options={statusOptions}
                                  placeholder="Status..."
                                />
                              )}
                              {column.id === 'PRODUTIVO_OS' && (
                                <FilterInput
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  placeholder="Filtrar produtivo..."
                                />
                              )}
                              {column.id === 'RESPCLI_OS' && (
                                <FilterInput
                                  value={
                                    (column.getFilterValue() as string) ?? ''
                                  }
                                  onChange={value =>
                                    column.setFilterValue(value)
                                  }
                                  placeholder="Filtrar responsável..."
                                />
                              )}
                            </th>
                          ))}
                        </tr>
                      )}
                    </thead>

                    {/* Corpo da tabela */}
                    <tbody>
                      {table.getRowModel().rows.length > 0 &&
                        !isLoading &&
                        table.getRowModel().rows.map((row, rowIndex) => (
                          // Linha do corpo da tabela
                          <tr
                            key={row.id}
                            className={`group border-b border-gray-700 transition-all duration-300 hover:bg-white/50 ${
                              rowIndex % 2 === 0
                                ? 'bg-gray-900'
                                : 'bg-gray-800/50'
                            }`}
                          >
                            {row.getVisibleCells().map(cell => (
                              // Células da tabela
                              <td
                                key={cell.id}
                                className="p-3 text-sm font-semibold tracking-wider text-white group-hover:text-black"
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

                {/* ===== PAGINAÇÃO ===== */}
                <div className="bg-gray-900 px-12 py-6">
                  <div className="flex items-center justify-between">
                    {/* Informações da página */}
                    <div className="flex items-center gap-4 text-base font-semibold tracking-widest text-white italic select-none">
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
                        <span className="text-base font-semibold tracking-widest text-white italic select-none">
                          Itens por página:
                        </span>
                        <select
                          value={table.getState().pagination.pageSize}
                          onChange={e =>
                            table.setPageSize(Number(e.target.value))
                          }
                          className="rounded-md border border-white/30 bg-white/10 px-4 py-1 text-base font-semibold tracking-widest text-white italic select-none"
                        >
                          {[5, 10, 15, 25].map(pageSize => (
                            <option
                              key={pageSize}
                              value={pageSize}
                              className="bg-gray-800 text-base font-semibold tracking-widest text-white italic select-none"
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
                          className="rounded-md border border-white/30 bg-white/10 px-4 py-1 tracking-widest text-white transition-colors select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronsLeft className="text-white" size={20} />
                        </button>

                        <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="rounded-md border border-white/30 bg-white/10 px-4 py-1 tracking-widest text-white transition-colors select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronLeft className="text-white" size={20} />
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
                              className="rounded-md border border-white/30 bg-white/10 px-4 py-1 text-center font-semibold tracking-widest text-white italic select-none"
                            >
                              {Array.from(
                                { length: table.getPageCount() },
                                (_, i) => (
                                  <option
                                    key={i + 1}
                                    value={i + 1}
                                    className="bg-gray-800 text-base font-semibold tracking-widest text-white italic select-none"
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
                          className="rounded-md border border-white/30 bg-white/10 px-4 py-1 tracking-widest text-white transition-colors select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronRight className="text-white" size={20} />
                        </button>

                        <button
                          onClick={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                          }
                          disabled={!table.getCanNextPage()}
                          className="rounded-md border border-white/30 bg-white/10 px-4 py-1 tracking-widest text-white transition-colors select-none hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronsRight className="text-white" size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensagem quando não há OS */}
            {dataOS && dataOS.length === 0 && !isLoading && (
              <div className="bg-slate-900 py-40 text-center">
                <TriangleAlert
                  className="mx-auto mb-6 text-yellow-500"
                  size={80}
                />
                <h3 className="text-2xl font-bold tracking-wider text-slate-200 italic select-none">
                  Nenhuma OS foi encontrada para o chamado #{codChamado}.
                </h3>
              </div>
            )}

            {/* Mensagem quando filtros não retornam resultados */}
            {dataOS &&
              dataOS.length > 0 &&
              table.getFilteredRowModel().rows.length === 0 && (
                <div className="bg-slate-900 py-20 text-center">
                  <Filter className="mx-auto mb-4 text-cyan-400" size={60} />
                  <h3 className="text-xl font-bold tracking-wider text-slate-200 select-none">
                    Nenhum registro encontrado com os filtros aplicados
                  </h3>
                  <p className="mt-2 text-slate-400">
                    Tente ajustar os filtros ou limpe-os para ver todos os
                    registros
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ===== MODAL DE APONTAMENTOS ===== */}
      <ModalApontamentos
        isOpen={modalApontamentosOpen}
        onClose={handleCloseApontamentos}
        codChamado={codChamado}
        codOS={selectedOS}
      />
    </>
  );
}
// ================================================================================

// Função para largura fixa das colunas
function getColumnWidth(columnId: string): string {
  const widthMap: Record<string, string> = {
    COD_OS: '70px',
    NOME_CLIENTE: '150px',
    CODTRF_OS: '80px',
    OBS_OS: '300px',
    DTINI_OS: '80px',
    HRINI_OS: '80px',
    HRFIM_OS: '80px',
    QTD_HR_OS: '80px',
    actions: '80px',
  };

  return widthMap[columnId] || '100px';
}
// ================================================================================
