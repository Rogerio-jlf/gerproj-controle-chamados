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
import { useMemo, useState, useCallback } from 'react';
import { ChamadosProps, colunasTabela } from './Colunas';
import Modal from './Modal';
import { AlertCircle, Database, TrendingUp } from 'lucide-react';
import ExcelButton from '../../../components/Excel_Button';
import PDFButton from '../../../components/PDF_Button';
import Cards from './Cards';

// Novo componente Modal para OS
import OSModal from '../components/OS_Modal';

async function fetchChamados(
  params: URLSearchParams
): Promise<ChamadosProps[]> {
  const res = await fetch(
    `/api/firebird/chamados-abertos/tabela-chamados-abertos?${params}`
  );
  if (!res.ok) throw new Error('Erro ao buscar chamados');
  const data = await res.json();

  return Array.isArray(data) ? data : data.chamados || [];
}

export default function Tabela() {
  const { filters } = useFiltersTabelaChamadosAbertos();
  const { ano, mes, cliente, recurso, status } = filters;
  const { isAdmin, codRecurso, isLoading: authLoading } = useAuth();

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

  // Removemos a função handleRowClick pois não será mais usada

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedChamado(null);
  };

  const handleCloseOSModal = () => {
    setOsModalOpen(false);
    setSelectedCodChamado(null);
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

  // Funções para os botões de ação com useCallback para evitar re-renders desnecessários
  const handleVisualizarChamado = useCallback(
    (codChamado: number) => {
      // Encontrar o chamado completo pelo código
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

  // Colunas da tabela com as ações
  const colunas = useMemo(
    () =>
      colunasTabela({
        onVisualizarChamado: handleVisualizarChamado,
        onVisualizarOS: handleVisualizarOS,
      }),
    [handleVisualizarChamado, handleVisualizarOS]
  );

  const table = useReactTable({
    data: data ?? [],
    columns: colunas,
    getCoreRowModel: getCoreRowModel(),
  });

  const stats = useMemo(() => {
    const chamadosArray = Array.isArray(data) ? data : [];
    const totalChamados = chamadosArray.length;

    return {
      totalChamados,
    };
  }, [data]);

  // -------------------------------------------------------------------

  // IS LOGGED CHECK
  if (!enabled || authLoading) {
    return (
      <div className="min-h-[500px] rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl">
        <div className="flex h-full items-center justify-center p-12">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-red-200 bg-gradient-to-br from-red-50 to-red-100">
              <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold tracking-wider text-slate-800 select-none">
                Acesso restrito!
              </h3>
              <p className="mx-auto max-w-md tracking-wider text-slate-600 select-none">
                Você precisa estar logado para visualizar os chamados do
                sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOADING CARREGAMENTO
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
              <h3 className="mb-2 text-xl font-semibold tracking-wider text-slate-800 select-none">
                Carregando os dados...
              </h3>
              <p className="tracking-wider text-slate-600 select-none">
                Buscando informações dos chamados, aguarde...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ERRO MESSAGE
  if (isError) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Não foi possível carregar os dados. Tente novamente mais tarde.';

    return (
      <div className="min-h-[500px] rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-xl">
        <div className="flex h-full items-center justify-center p-12">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-red-300 bg-gradient-to-br from-red-100 to-red-200">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold tracking-wider text-red-800 select-none">
                Oops... Algo deu errado!
              </h3>
              <p className="mx-auto max-w-md tracking-wider text-red-600 select-none">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------

  return (
    <>
      <TooltipProvider>
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-slate-900">
          {/* ===== HEADER / CARDS / EXCEL / PDF ===== */}
          <header className="bg-slate-900 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                {/* TÍTULO */}
                <div>
                  <h1 className="text-2xl font-extrabold tracking-wider text-white italic select-none">
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
                <ExcelButton
                  data={data ?? []}
                  fileName={`relatorio_de_chamados_${mes}_${ano}`}
                  title={`Relatório de Chamados - ${mes}/${ano}`}
                  columns={[
                    { key: 'PRIOR_CHAMADO', label: 'Prioridade' },
                    { key: 'COD_CHAMADO', label: 'Chamado' },
                    { key: 'DATA_CHAMADO', label: 'Data' },
                    { key: 'HORA_CHAMADO', label: 'Hora' },
                    { key: 'ASSUNTO_CHAMADO', label: 'Assunto' },
                    { key: 'STATUS_CHAMADO', label: 'Status' },
                    { key: 'COD_CLASSIFICACAO', label: 'Classificação' },
                    { key: 'RECURSO.NOME_RECURSO', label: 'Recurso' },
                    { key: 'CLIENTE.NOME_CLIENTE', label: 'Cliente' },
                    { key: 'CODTRF_CHAMADO', label: 'Código Tarefa' },
                    { key: 'EMAIL_CHAMADO', label: 'Email' },
                    { key: 'CONCLUSAO_CHAMADO', label: 'Conclusão' },
                  ]}
                  autoFilter={true}
                  freezeHeader={true}
                  className="border border-white/20 bg-white/10 text-white"
                />

                {/* PDF */}
                <PDFButton
                  data={data ?? []}
                  fileName={`relatorio_chamados_${mes}_${ano}`}
                  title={`Relatório de Chamados - ${mes}/${ano}`}
                  columns={[
                    { key: 'PRIOR_CHAMADO', label: 'Prioridade' },
                    { key: 'COD_CHAMADO', label: 'Chamado' },
                    { key: 'DATA_CHAMADO', label: 'Data' },
                    { key: 'HORA_CHAMADO', label: 'Hora' },
                    { key: 'ASSUNTO_CHAMADO', label: 'Assunto' },
                    { key: 'STATUS_CHAMADO', label: 'Status' },
                    { key: 'COD_CLASSIFICACAO', label: 'Classificação' },
                    { key: 'RECURSO.NOME_RECURSO', label: 'Recurso' },
                    { key: 'CLIENTE.NOME_CLIENTE', label: 'Cliente' },
                    { key: 'CODTRF_CHAMADO', label: 'Código Tarefa' },
                    { key: 'EMAIL_CHAMADO', label: 'Email' },
                    { key: 'CONCLUSAO_CHAMADO', label: 'Conclusão' },
                  ]}
                  footerText="Gerado pelo sistema em"
                  className="border border-white/20 bg-white/10 text-white"
                />
              </div>
            </div>
          </header>

          {/* ===== TABELA ===== */}
          <div className="h-full w-full overflow-hidden border border-white bg-slate-900">
            <div
              className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 h-full overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 424px)' }}
            >
              <table className="w-full table-fixed border-collapse">
                {/* HEADER */}
                <thead className="sticky top-0 z-20">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="border-b border-gray-300 bg-teal-800 p-3 font-semibold tracking-wider text-white select-none"
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
                </thead>

                {/* BODY */}
                <tbody>
                  {table.getRowModel().rows.length === 0 && !isLoading ? (
                    <tr>
                      <td
                        colSpan={table.getHeaderGroups()[0].headers.length}
                        className="p-6 text-center text-sm text-gray-400"
                      >
                        Nenhum chamado encontrado
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, rowIndex) => (
                      <tr
                        key={row.id}
                        className={`group border-b border-slate-700 transition-all duration-300 hover:bg-white/50 ${
                          rowIndex % 2 === 0
                            ? 'bg-slate-900'
                            : 'bg-slate-800/50'
                        }`}
                      >
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className="p-3 text-sm font-semibold tracking-wider text-white group-hover:text-black"
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MENSAGEM QUANDO NÃO HÁ DADOS */}
          {Array.isArray(data) && data.length === 0 && !isLoading && (
            <div className="bg-white p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-200">
                  <TrendingUp className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-black">
                    Nenhum chamado encontrado.
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

      {/* Modal do Chamado */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        chamado={selectedChamado}
      />

      {/* Modal da OS */}
      <OSModal
        isOpen={osModalOpen}
        onClose={handleCloseOSModal}
        codChamado={selectedCodChamado}
      />
    </>
  );
}

// Função para largura fixa por coluna (atualizada com a nova coluna)
function getColumnWidth(columnId: string): string {
  const widthMap: Record<string, string> = {
    PRIOR_CHAMADO: '80px',
    COD_CHAMADO: '100px',
    DATA_CHAMADO: '130px',
    HORA_CHAMADO: '80px',
    ASSUNTO_CHAMADO: '250px',
    STATUS_CHAMADO: '140px',
    COD_CLASSIFICACAO: '100px',
    'RECURSO.NOME_RECURSO': '80px',
    'CLIENTE.NOME_CLIENTE': '80px',
    CODTRF_CHAMADO: '90px',
    EMAIL_CHAMADO: '150px',
    CONCLUSAO_CHAMADO: '120px',
    actions: '120px', // Nova coluna de ações
  };

  return widthMap[columnId] || '100px';
}
