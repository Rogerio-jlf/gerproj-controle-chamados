'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useChamadosAbertosFilters } from '@/context/Chamados_Abertos_Filters_Context';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import {
  ChamadosProps,
  colunasTabelaChamadosAbertos,
} from './Colunas_Tabela_Chamados_Abertos';
import ModalTabelaChamadosAbertos from './Modal_Tabela_Chamados_Abertos';

async function fetchChamados(
  params: URLSearchParams,
): Promise<ChamadosProps[]> {
  const res = await fetch(
    `/api/chamados-abertos/tabelas/tabela-chamados-abertos?${params}`,
  );
  if (!res.ok) throw new Error('Erro ao buscar chamados');
  const data = await res.json();

  return Array.isArray(data) ? data : data.chamados || [];
}

export default function TabelaChamadosAbertos() {
  const { filters } = useChamadosAbertosFilters();
  const { ano, mes, cliente, recurso, status } = filters;
  const { isAdmin, codRecurso, isLoading: authLoading } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState<ChamadosProps | null>(
    null,
  );

  const handleRowClick = (chamado: ChamadosProps) => {
    setSelectedChamado(chamado);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedChamado(null);
  };

  const enabled = !!ano && !!mes && !authLoading;

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      ano: String(ano),
      mes: String(mes),
      isAdmin: String(isAdmin),
    });

    if (isAdmin) {
      if (cliente) params.append('cliente', cliente);
      if (recurso) params.append('recurso', recurso);
      if (status && status !== 'todos') params.append('status', status);
    } else if (codRecurso) {
      params.append('codRecurso', codRecurso);

      if (cliente) params.append('cliente', cliente);
      if (status && status !== 'todos') params.append('status', status);
    }

    return params;
  }, [ano, mes, cliente, recurso, status, isAdmin, codRecurso]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['chamadosAbertos', queryParams.toString()],
    queryFn: () => fetchChamados(queryParams),
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const table = useReactTable({
    data: data ?? [],
    columns: colunasTabelaChamadosAbertos,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!enabled || authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Carregando autenticação...
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Carregando chamados...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-red-600 dark:text-red-400">
            <span className="font-medium">Erro ao carregar dados:</span>{' '}
            {error?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TooltipProvider>
        <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {/* Header da tabela com informações */}
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Chamados Abertos
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Total: {data?.length || 0} chamados</span>
                <span>•</span>
                <span>
                  {mes}/{ano}
                </span>
              </div>
            </div>
          </div>

          {/* Container da tabela com scroll */}
          <div className="relative max-h-[calc(100vh-300px)] overflow-auto">
            <div className="min-w-[1200px]">
              <table className="w-full table-fixed">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      {headerGroup.headers.map((header, index) => (
                        <th
                          key={header.id}
                          className={`sticky top-0 z-20 border-r border-gray-200 bg-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-700 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ${index === headerGroup.headers.length - 1 ? 'border-r-0' : ''} `}
                          style={{
                            width: getColumnWidth(header.column.id),
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={colunasTabelaChamadosAbertos.length}
                        className="p-12 text-center"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                            <svg
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Nenhum chamado encontrado para os filtros aplicados
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            Tente ajustar os filtros para ver mais resultados
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, rowIndex) => (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row.original)}
                        className={`group cursor-pointer transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20'} `}
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => (
                          <td
                            key={cell.id}
                            className={`border-r border-gray-100 px-4 py-3 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200 ${cellIndex === row.getVisibleCells().length - 1 ? 'border-r-0' : ''} `}
                            style={{
                              width: getColumnWidth(cell.column.id),
                            }}
                          >
                            <div className="overflow-hidden">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer da tabela */}
          {data && data.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Mostrando {data.length} registro{data.length !== 1 ? 's' : ''}
                </span>
                <span>
                  Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* Modal */}
      <ModalTabelaChamadosAbertos
        isOpen={modalOpen}
        onClose={handleCloseModal}
        chamado={selectedChamado}
      />
    </>
  );
}

// Função para definir larguras das colunas
function getColumnWidth(columnId: string): string {
  const widthMap: Record<string, string> = {
    prior_chamado: '120px',
    cod_chamado: '100px',
    data_chamado: '110px',
    hora_chamado: '80px',
    assunto_chamado: '200px',
    status_chamado: '130px',
    cod_classificacao: '140px',
    'recurso.nome_recurso': '180px',
    'cliente.nome_cliente': '180px',
    codtrf_chamado: '150px',
    email_chamado: '200px',
    conclusao_chamado: '150px',
  };

  return widthMap[columnId] || '150px';
}
