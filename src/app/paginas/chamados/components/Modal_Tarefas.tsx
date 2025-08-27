'use client';

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
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
import { useMemo, useState } from 'react';
import { TarefasProps, colunasTabela } from './Colunas_Tarefas';
import {
  X,
  Database,
  TriangleAlert,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from 'lucide-react';
import { LuFilter, LuFilterX } from 'react-icons/lu';
import { BsEraserFill } from 'react-icons/bs';
import ExcelButton from '../../../../components/Button_Excel';
import PDFButton from '../../../../components/Button_PDF';

interface ModalTarefasProps {
  isOpen: boolean;
  onClose: () => void;
}

// Função para buscar tarefas da API
async function fetchTarefas(token: string): Promise<TarefasProps[]> {
  const res = await fetch('/api/tarefas', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Erro ao buscar tarefas');
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Componente de filtro inline
const FilterInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full rounded-md border border-white/30 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
  />
);

export default function ModalTarefas({ isOpen, onClose }: ModalTarefasProps) {
  const { user } = useAuth();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const enabled = !!token && !!user && isOpen;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tarefas', token],
    queryFn: () => fetchTarefas(token!),
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const colunas = useMemo(() => colunasTabela(), []);

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
        pageSize: 10,
      },
    },
  });

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setColumnFilters([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl border border-slate-300 bg-slate-900">
        {/* Header */}
        <header className="bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-xl border border-white/30 bg-white/10 p-3">
                <Database className="animate-pulse text-cyan-400" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-widest text-white select-none">
                  Minhas Tarefas
                </h2>
                {user && (
                  <span className="rounded-full bg-green-800 px-3 py-1 text-xs font-bold tracking-widest text-white italic select-none">
                    {user.nome}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold tracking-wider text-white transition-all select-none ${
                  showFilters
                    ? 'border border-white/30 bg-blue-600 hover:bg-blue-700'
                    : 'border border-white/30 bg-white/10 hover:bg-gray-600'
                }`}
              >
                {showFilters ? <LuFilterX size={18} /> : <LuFilter size={18} />}
                {showFilters ? 'Ocultar' : 'Filtros'}
              </button>

              {columnFilters.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 rounded-md border border-white/30 bg-red-600 px-4 py-2 text-sm font-bold tracking-wider text-white transition-all select-none hover:bg-red-700"
                >
                  <BsEraserFill size={16} />
                  Limpar
                </button>
              )}

              <ExcelButton
                data={data ?? []}
                fileName="minhas_tarefas"
                title="Minhas Tarefas"
                columns={[
                  { key: 'COD_TAREFA', label: 'Código' },
                  { key: 'NOME_TAREFA', label: 'Nome da Tarefa' },
                  { key: 'DTSOL_TAREFA', label: 'Data Solicitação' },
                  { key: 'HREST_TAREFA', label: 'Horas Restantes' },
                ]}
              />

              <PDFButton
                data={data ?? []}
                fileName="minhas_tarefas"
                title="Minhas Tarefas"
                columns={[
                  { key: 'COD_TAREFA', label: 'Código' },
                  { key: 'NOME_TAREFA', label: 'Nome da Tarefa' },
                  { key: 'DTSOL_TAREFA', label: 'Data Solicitação' },
                  { key: 'HREST_TAREFA', label: 'Horas Restantes' },
                ]}
              />

              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-md border border-white/30 bg-red-600 p-2 text-white transition-all hover:bg-red-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Tabela */}
        <div className="h-full w-full overflow-hidden bg-gray-900">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400"></div>
                <p className="font-semibold text-white">
                  Carregando tarefas...
                </p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <TriangleAlert
                  className="mx-auto mb-4 text-red-500"
                  size={48}
                />
                <p className="font-semibold text-red-400">
                  Erro ao carregar tarefas: {(error as Error)?.message}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 overflow-y-auto"
              style={{ maxHeight: 'calc(90vh - 200px)' }}
            >
              <table className="w-full table-fixed border-collapse">
                <thead className="sticky top-0 z-10">
                  {/* Cabeçalho principal */}
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="bg-teal-800 py-3 text-sm font-bold tracking-wider text-white uppercase select-none"
                          style={{ width: getColumnWidth(header.column.id) }}
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
                          className="bg-teal-800 px-2 pb-4"
                          style={{ width: getColumnWidth(column.id) }}
                        >
                          {column.id === 'NOME_TAREFA' && (
                            <FilterInput
                              value={(column.getFilterValue() as string) ?? ''}
                              onChange={value => column.setFilterValue(value)}
                              placeholder="Filtrar nome..."
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                  )}
                </thead>

                <tbody>
                  {table.getRowModel().rows.length > 0 &&
                    table.getRowModel().rows.map((row, rowIndex) => (
                      <tr
                        key={row.id}
                        className={`group border-b border-slate-700 transition-all duration-300 hover:bg-white/10 ${
                          rowIndex % 2 === 0
                            ? 'bg-slate-900'
                            : 'bg-slate-800/50'
                        }`}
                      >
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className="p-2 text-xs font-semibold tracking-wider text-white"
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
              </table>
            </div>
          )}
        </div>

        {/* Paginação */}
        {Array.isArray(data) && data.length > 0 && (
          <div className="bg-gray-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white select-none">
                {table.getFilteredRowModel().rows.length} tarefa
                {table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}{' '}
                encontrada
                {table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={e => table.setPageSize(Number(e.target.value))}
                  className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-sm text-white select-none"
                >
                  {[5, 10, 20].map(pageSize => (
                    <option
                      key={pageSize}
                      value={pageSize}
                      className="bg-gray-800"
                    >
                      {pageSize}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="rounded-md border border-white/30 bg-white/10 p-1 text-white transition-colors select-none hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="rounded-md border border-white/30 bg-white/10 p-1 text-white transition-colors select-none hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 text-sm text-white select-none">
                    {table.getState().pagination.pageIndex + 1} de{' '}
                    {table.getPageCount()}
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="rounded-md border border-white/30 bg-white/10 p-1 text-white transition-colors select-none hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="rounded-md border border-white/30 bg-white/10 p-1 text-white transition-colors select-none hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando não há tarefas */}
        {Array.isArray(data) && data.length === 0 && !isLoading && (
          <div className="bg-slate-900 py-20 text-center">
            <TriangleAlert className="mx-auto mb-4 text-yellow-500" size={48} />
            <h3 className="text-lg font-bold text-slate-200 select-none">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-sm text-slate-400">
              Você não possui tarefas atribuídas no momento
            </p>
          </div>
        )}

        {/* Mensagem quando filtros não retornam resultados */}
        {Array.isArray(data) &&
          data.length > 0 &&
          table.getFilteredRowModel().rows.length === 0 && (
            <div className="bg-slate-900 py-16 text-center">
              <Filter className="mx-auto mb-4 text-cyan-400" size={40} />
              <h3 className="text-lg font-bold text-slate-200 select-none">
                Nenhuma tarefa encontrada com os filtros aplicados
              </h3>
              <p className="text-sm text-slate-400">
                Tente ajustar os filtros ou limpe-os para ver todas as tarefas
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

// Função para largura das colunas
function getColumnWidth(columnId: string): string {
  const widthMap: Record<string, string> = {
    COD_TAREFA: '120px',
    NOME_TAREFA: '300px',
    DTSOL_TAREFA: '140px',
    HREST_TAREFA: '140px',
    actions: '100px',
  };

  return widthMap[columnId] || '120px';
}
