'use client';

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
import { AlertCircle, Database, Sigma, TriangleAlert } from 'lucide-react';
import ExcelButton from '../../../components/Excel_Button';
import PDFButton from '../../../components/PDF_Button';
import Cards from './Cards';

// Novo componente Modal para OS
import OSModal from '../components/OS_Modal';
import FiltroNumeroChamado from './Filtro_Cod_Chamado';
import IsLoading from './IsLoading';
import Erro from './Erro';

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
  const { ano, mes, cliente, recurso, status, codChamado } = filters;
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
      if (codChamado) params.append('codChamado', codChamado);
    } else if (codRecurso) {
      params.append('codRecurso', codRecurso);

      if (cliente) params.append('cliente', cliente);
      if (status && status !== 'todos') params.append('status', status);
      if (codChamado) params.append('codChamado', codChamado);
    }

    return params;
  }, [ano, mes, cliente, recurso, status, isAdmin, codRecurso, codChamado]);

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
      <>
        <IsLoading />;
      </>
    );
  }

  // ERRO MESSAGE
  if (isError) {
    return (
      <>
        <Erro error={error} />
      </>
    );
  }

  // ------------------------------------------------------------------------------------------

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-slate-900 shadow-xl shadow-black">
        {/* ===== HEADER ===== */}
        <header className="bg-slate-950 p-6">
          <div className="space-y-7">
            {/* ===== LINHA 1: HEADER E BOTÕES DE EXPORTAÇÃO ===== */}
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                {/* Ícone */}
                <div className="flex items-center justify-center rounded-xl border border-white/30 bg-white/10 p-3 backdrop-blur-sm">
                  <Database className="h-7 w-7 text-cyan-400" />
                </div>

                <div>
                  {/* Título */}
                  <h1 className="text-3xl font-bold tracking-wider text-slate-200 select-none">
                    Tabela de Chamados
                  </h1>

                  {/* Período */}
                  <span className="text-sm font-semibold tracking-wider text-slate-200 italic select-none">
                    Período: {mes.toString().padStart(2, '0')}/{ano}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Botão exportar excel */}
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
                />

                {/* Botão exportar PDF */}
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
                />
              </div>
            </div>

            {/* ===== LINHA 2: CARD E FILTRO ===== */}
            <div className="flex items-start justify-between gap-8">
              {/* Card total chamados */}
              {Array.isArray(data) && data.length > 0 && (
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-4">
                    <Cards
                      icon={Sigma}
                      title="Total de Chamados"
                      value={stats.totalChamados}
                      className="w-[240px]"
                    />
                  </div>
                </div>
              )}

              {/* Filtro buscar por chamado */}
              {data && data.length > 0 && (
                <div className="flex-shrink-0">
                  <FiltroNumeroChamado />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===== TABELA ===== */}
        <div className="h-full w-full overflow-hidden bg-slate-900">
          <div
            className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 h-full overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 466px)' }}
          >
            <table className="w-full table-fixed border-collapse">
              {/* Header Table */}
              <thead className="sticky top-0 z-20">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="bg-teal-800 p-3 font-semibold tracking-wider text-white select-none"
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

              {/* Body Table */}
              <tbody>
                {table.getRowModel().rows.length > 0 &&
                  !isLoading &&
                  table.getRowModel().rows.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className={`group border-b border-slate-700 transition-all duration-300 hover:bg-white/50 ${
                        rowIndex % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'
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
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mensagem quando não há chamado */}
        {Array.isArray(data) && data.length === 0 && !isLoading && (
          <div className="bg-slate-900 py-40 text-center">
            {/* Ícone */}
            <TriangleAlert
              className="mx-auto mb-6 animate-pulse text-yellow-500"
              size={80}
            />

            {/* Título */}
            <h3 className="text-2xl font-bold tracking-wider text-slate-300 italic select-none">
              Nenhum chamado encontrado, para o período de{' '}
              {mes.toString().padStart(2, '0')}/{ano}.
            </h3>
          </div>
        )}
      </div>

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
    ASSUNTO_CHAMADO: '230px',
    STATUS_CHAMADO: '140px',
    COD_CLASSIFICACAO: '100px',
    'RECURSO.NOME_RECURSO': '100px',
    'CLIENTE.NOME_CLIENTE': '100px',
    CODTRF_CHAMADO: '90px',
    EMAIL_CHAMADO: '150px',
    CONCLUSAO_CHAMADO: '140px',
    actions: '110px',
  };

  return widthMap[columnId] || '100px'; // Valor padrão
}
