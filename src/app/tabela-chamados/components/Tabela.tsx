'use client';

import { useAuth } from '@/contexts/Auth_Context';
import { corrigirTextoCorrompido } from '@/utils/corrigirTextoCorrompido';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import { AlertCircle, Clock, Database, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TableRowProps, colunasTabela } from './Colunas';
import ExportaExcelButton from './Exportar_Excel_Button';
import ExportaPDFButton from './Exportar_PDF_Button';
import Modal from './Modal';
import StatusBadge from './Status_Badge';
import Cards from './Cards';
import { ObservacaoCell } from './Tooltip';

// Interface para os filtros recebidos como props.
interface FiltersProps {
  ano: string;
  mes: string;
  cliente?: string;
  recurso?: string;
  status?: string;
}

// Função utilitária para criar os headers de autenticação para requisições.
const createAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'x-is-logged-in': localStorage.getItem('isLoggedIn') || 'false',
    'x-is-admin': localStorage.getItem('isAdmin') || 'false',
    'x-user-email': localStorage.getItem('userEmail') || '',
    'x-cod-cliente': localStorage.getItem('codCliente') || '',
  };
};

// Função para buscar chamados
const fetchChamados = async (params: URLSearchParams) => {
  const response = await axios.get(
    `/api/tabela/tabela_chamado?${params.toString()}`,
    {
      headers: createAuthHeaders(),
    }
  );
  return response.data as {
    apontamentos: TableRowProps[];
    totalHorasGeral: string;
  };
};

// Componente principal da tabela de chamados.
export default function Tabela({
  ano,
  mes,
  cliente,
  recurso,
  status,
}: FiltersProps) {
  // Estados para modal e linha selecionada.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableRowProps | null>(null);

  // Obtém informações de autenticação do contexto.
  const { isAdmin, codCliente, isLoggedIn } = useAuth();

  // Normaliza valores dos filtros para evitar undefined.
  const clienteValue = cliente ?? '';
  const recursoValue = recurso ?? '';
  const statusValue = status ?? '';
  const isLoggedInValue = isLoggedIn ?? false;
  const isAdminValue = isAdmin ?? false;
  const codClienteValue = codCliente ?? '';

  // Monta os parâmetros da query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      ano,
      mes,
      isAdmin: isAdminValue.toString(),
      ...(isAdminValue && codClienteValue
        ? { codCliente: codClienteValue }
        : {}),
      ...(clienteValue ? { cliente: clienteValue } : {}),
      ...(recursoValue ? { recurso: recursoValue } : {}),
      ...(statusValue ? { status: statusValue } : {}),
    });

    if (!isAdminValue && codClienteValue) {
      params.append('codCliente', codClienteValue);
    }

    return params;
  }, [
    ano,
    mes,
    clienteValue,
    recursoValue,
    statusValue,
    isAdminValue,
    codClienteValue,
  ]);

  // useQuery para buscar dados
  const {
    data: apiData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['chamados', queryParams.toString()],
    queryFn: () => fetchChamados(queryParams),
    enabled: isLoggedInValue,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  const data = useMemo(() => apiData?.apontamentos || [], [apiData]);
  const totalHorasGeral = apiData?.totalHorasGeral || '';

  // Função para abrir o modal com os dados da linha selecionada.
  const openModal = (row: TableRowProps) => {
    console.log('Dados da linha clicada:', row);
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  // Função para fechar o modal e limpar a linha selecionada.
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  // Corrige possíveis textos corrompidos no campo 'obs' dos dados.
  const dataCorrigida = useMemo(() => {
    return data.map(item => ({
      ...item,
      obs: corrigirTextoCorrompido(item.obs),
    }));
  }, [data]);

  // Inicializa a tabela usando TanStack Table.
  const table = useReactTable<TableRowProps>({
    data: dataCorrigida,
    columns: colunasTabela,
    getCoreRowModel: getCoreRowModel(),
  });

  // Calcula estatísticas
  const stats = useMemo(() => {
    const totalChamados = data.length;
    const totalRecursos = Array.from(
      new Set(data.map(item => item.nome_recurso || ''))
    ).filter(Boolean).length;
    return { totalChamados, totalRecursos };
  }, [data]);

  // Renderiza mensagem de acesso restrito se não estiver logado.
  if (!isLoggedIn) {
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

  // Renderiza a tabela de chamados, exportações e modal.
  return (
    <>
      {/* CONTAINER PRINCIPAL */}
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
        {/* CONTAINER */}
        <div className="bg-indigo-950 p-6">
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
              {data.length > 0 && (
                <div className="grid grid-cols-3 gap-5">
                  {/* TOTAL CHAMADOS */}
                  <Cards
                    icon={Database}
                    title="Chamados"
                    value={stats.totalChamados}
                  />
                  {/* TOTAL RECURSOS */}
                  <Cards
                    icon={Users}
                    title="Recursos"
                    value={stats.totalRecursos}
                  />
                  {/* HORAS TOTAIS */}
                  <Cards
                    icon={Clock}
                    title="Horas"
                    value={totalHorasGeral || '0h'}
                  />
                </div>
              )}
            </div>

            {/* EXCEL / PDF */}
            <div className="flex flex-col gap-5">
              {/* EXCEL */}
              <ExportaExcelButton
                data={data}
                fileName={`relatorio_${mes}_${ano}`}
                columns={[
                  { key: 'chamado_os', label: 'N° OS' },
                  { key: 'nome_cliente', label: 'Nome Completo' },
                  { key: 'dtini_os', label: 'Data' },
                  { key: 'status_chamado', label: 'Status' },
                  { key: 'hrini_os', label: 'Hora Início' },
                  { key: 'hrfim_os', label: 'Hora Fim' },
                  { key: 'total_horas', label: 'Duração' },
                  { key: 'obs', label: 'Observação' },
                ]}
                autoFilter={true}
                freezeHeader={true}
                className="border border-white/20 bg-white/10 text-white"
              />

              {/* PDF */}
              <ExportaPDFButton
                data={data}
                fileName={`relatorio_chamados_${mes}_${ano}`}
                title={`Relatório de Chamados - ${mes}/${ano}`}
                columns={[
                  { key: 'chamado_os', label: 'N° OS' },
                  { key: 'nome_cliente', label: 'Cliente' },
                  { key: 'dtini_os', label: 'Data' },
                  { key: 'status_chamado', label: 'Status' },
                  { key: 'hrini_os', label: 'Hora Início' },
                  { key: 'hrfim_os', label: 'Hora Fim' },
                  { key: 'total_horas', label: 'Duração' },
                  { key: 'obs', label: 'Observação' },
                ]}
                footerText="Gerado pelo sistema em"
                className="border border-white/20 bg-white/10 text-white"
              />
            </div>
            {/* ---------- */}
          </div>
          {/* ---------- */}
        </div>

        {/* Tabela com scroll customizado */}
        <div className="overflow-hidden">
          <div
            className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 350px)' }}
          >
            <table className="w-full">
              {/* Cabeçalho da tabela com efeito glassmorphism */}
              <thead className="sticky top-0 z-20">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => (
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
                {table.getRowModel().rows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={`group cursor-pointer border-b border-gray-300 transition-all duration-300 ease-out hover:bg-orange-200 ${
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                    } `}
                    onClick={() => openModal(row.original)}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <td
                        key={cell.id}
                        className="p-2 text-sm text-indigo-500 transition-all duration-100 group-hover:text-black hover:italic"
                      >
                        {/* Renderiza badge de status ou valor padrão da célula */}
                        {cell.column.id === 'status_chamado' ? (
                          <StatusBadge status={cell.getValue() as string} />
                        ) : cell.column.id === 'obs' ? (
                          <ObservacaoCell value={cell.getValue() as string} />
                        ) : (
                          <div className="whitespace-nowrap">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer com informações adicionais */}
        {data.length === 0 && !isLoading && (
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

      {/* Modal com design atualizado */}
      <Modal
        isOpen={isModalOpen}
        selectedRow={selectedRow}
        onClose={closeModal}
      />
    </>
  );
}
