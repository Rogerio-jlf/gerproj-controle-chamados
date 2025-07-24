'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/Auth_Context';
import { useFiltersTabelaChamadosAbertos } from '@/contexts/Filters_Tabela_Chamados_Abertos_Context';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { ChamadosProps, colunasTabela } from './Colunas';
import Modal from './Modal';
import { AlertCircle, Clock, Database, TrendingUp, Users } from 'lucide-react';
import ExportaExcelButton from '../../tabela-chamados/components/Exportar_Excel_Button';
import ExportaPDFButton from '../../tabela-chamados/components/Exportar_PDF_Button';
import Cards from './Cards';

async function fetchChamados(
  params: URLSearchParams
): Promise<ChamadosProps[]> {
  const res = await fetch(
    `/api/chamados-abertos/tabelas/tabela-chamados-abertos?${params}`
  );
  if (!res.ok) throw new Error('Erro ao buscar chamados');
  const data = await res.json();

  return Array.isArray(data) ? data : data.chamados || [];
}

export default function Tabela() {
  const { filters } = useFiltersTabelaChamadosAbertos();
  const { ano, mes, cliente, recurso, status } = filters;
  const { isAdmin, codRecurso, isLoading: authLoading } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState<ChamadosProps | null>(
    null
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
    columns: colunasTabela,
    getCoreRowModel: getCoreRowModel(),
  });

  const stats = useMemo(() => {
    const chamadosArray = Array.isArray(data) ? data : [];
    const totalChamados = chamadosArray.length;

    return {
      totalChamados,
    };
  }, [data]);

  if (!enabled || authLoading) {
    return (
      <div className="min-h-[500px] rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl">
        <div className="flex h-full items-center justify-center p-12">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-red-200 bg-gradient-to-br from-red-50 to-red-100">
              <svg
                className="h-10 w-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-slate-800">
                Acesso Restrito
              </h3>
              <p className="mx-auto max-w-md text-slate-600">
                Você precisa estar logado para visualizar os chamados do
                sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderiza indicador de carregamento enquanto busca dados.
  if (isLoading) {
    return (
      <div className="min-h-[500px] rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl">
        <div className="flex h-full items-center justify-center p-12">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="relative">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                <Database
                  className="absolute inset-0 h-8 w-8 animate-pulse text-blue-400"
                  style={{ animationDelay: '0.5s' }}
                />
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold text-slate-800">
                Carregando Dados
              </h3>
              <p className="text-slate-600">
                Buscando informações dos chamados...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderiza mensagem de erro caso ocorra algum problema na requisição.
  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro ao carregar chamados';

    return (
      <div className="min-h-[500px] rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-xl">
        <div className="flex h-full items-center justify-center p-12">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-red-300 bg-gradient-to-br from-red-100 to-red-200">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-red-800">
                Erro ao Carregar
              </h3>
              <p className="mx-auto max-w-md text-red-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TooltipProvider>
        {/* CONTAINER PRINCIPAL */}
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-slate-900">
          {/* CONTAINER */}
          <div className="bg-slate-900 p-6">
            {/* HEADER / CARDS / EXCEL / PDF */}
            <div className="flex items-start justify-between">
              {/* TÍTULO / CARDS */}
              <div className="space-y-4">
                {/* TÍTULO */}
                <div>
                  <h1 className="text-2xl font-extrabold tracking-wider text-white italic">
                    Tabela de Chamados - {mes}/{ano}
                  </h1>
                </div>

                {/* CARDS MÉTRICAS */}
                {Array.isArray(data) && data.length > 0 && (
                  <div className="grid grid-cols-3 gap-5">
                    {/* TOTAL CHAMADOS */}
                    <Cards
                      icon={Database}
                      title="Chamados"
                      value={stats.totalChamados}
                    />
                  </div>
                )}
              </div>

              {/* EXCEL / PDF */}
              <div className="flex flex-col gap-5">
                {/* EXCEL */}
                <ExportaExcelButton
                  data={data ?? []}
                  fileName={`relatorio_${mes}_${ano}`}
                  columns={[
                    { key: 'PRIOR_CHAMADO', label: 'Prioridade' },
                    { key: 'COD_CHAMADO', label: 'N° OS' },
                    { key: 'DATA_CHAMADO', label: 'Data' },
                    { key: 'HORA_CHAMADO', label: 'Hora' },
                    { key: 'ASSUNTO_CHAMADO', label: 'Assunto' },
                    { key: 'STATUS_CHAMADO', label: 'Status' },
                    { key: 'COD_CLASSIFICACAO', label: 'Classificação' },
                    { key: 'RECURSO.NOME_RECURSO', label: 'Recurso' },
                    { key: 'CLIENTE.NOME_CLIENTE', label: 'Cliente' },
                    { key: 'CODTRF_CHAMADO', label: 'Código TRF' },
                    { key: 'EMAIL_CHAMADO', label: 'Email' },
                    { key: 'CONCLUSAO_CHAMADO', label: 'Conclusão' },
                  ]}
                  autoFilter={true}
                  freezeHeader={true}
                  className="border border-white/20 bg-white/10 text-white"
                />

                {/* PDF */}
                <ExportaPDFButton
                  data={data ?? []}
                  fileName={`relatorio_chamados_${mes}_${ano}`}
                  title={`Relatório de Chamados - ${mes}/${ano}`}
                  columns={[
                    { key: 'PRIOR_CHAMADO', label: 'Prioridade' },
                    { key: 'COD_CHAMADO', label: 'N° OS' },
                    { key: 'DATA_CHAMADO', label: 'Data' },
                    { key: 'HORA_CHAMADO', label: 'Hora' },
                    { key: 'ASSUNTO_CHAMADO', label: 'Assunto' },
                    { key: 'STATUS_CHAMADO', label: 'Status' },
                    { key: 'COD_CLASSIFICACAO', label: 'Classificação' },
                    { key: 'RECURSO.NOME_RECURSO', label: 'Recurso' },
                    { key: 'CLIENTE.NOME_CLIENTE', label: 'Cliente' },
                    { key: 'CODTRF_CHAMADO', label: 'Código TRF' },
                    { key: 'EMAIL_CHAMADO', label: 'Email' },
                    { key: 'CONCLUSAO_CHAMADO', label: 'Conclusão' },
                  ]}
                  footerText="Gerado pelo sistema em"
                  className="border border-white/20 bg-white/10 text-white"
                />
              </div>
            </div>
          </div>

          {/* Tabela com scroll customizado */}
          <div className="overflow-hidden">
            <div
              className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 424px)' }}
            >
              <table className="w-full">
                {/* Cabeçalho da tabela com efeito glassmorphism */}
                <thead className="sticky top-0 z-20">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="border-b border-gray-300 bg-teal-700 p-2 text-left font-semibold text-white"
                        >
                          <div className="flex items-center">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                {/* Corpo da tabela com hover effects modernos */}
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr
                      key={row.id}
                      className="group cursor-pointer border-b border-slate-700 transition-all duration-100 hover:bg-white/90"
                      onClick={() => handleRowClick(row.original)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="group-transition-all group-duration-100 p-3 text-sm text-white group-hover:text-base group-hover:font-semibold group-hover:text-black group-hover:italic"
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
          </div>

          {/* Footer com informações adicionais */}
          {Array.isArray(data) && data.length === 0 && !isLoading && (
            <div className="bg-white p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-200">
                  <TrendingUp className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-black">
                    Nenhum chamado encontrado
                  </h3>
                  <p className="text-black">
                    Não há registros para o período {mes}/{ano} com os filtros
                    selecionados.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        chamado={selectedChamado}
      />
    </>
  );
}
