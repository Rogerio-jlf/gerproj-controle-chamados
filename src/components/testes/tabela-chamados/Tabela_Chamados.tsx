'use client';

import { useAuth } from '@/context/AuthContext';
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
import { TableRowProps, columns } from './Colunas_Tabela';
import { ExportaExcelButton } from './Exportar_Excel_Button';
import { ExportaPDFButton } from './Exportar_PDF_Button';
import ModalChamados from './Modal_Chamados';
import StatusBadge from './Status_Badge';

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
    },
  );
  return response.data as {
    apontamentos: TableRowProps[];
    totalHorasGeral: string;
  };
};

// Componente principal da tabela de chamados.
export default function TabelaChamados({
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
    return data.map((item) => ({
      ...item,
      obs: corrigirTextoCorrompido(item.obs),
    }));
  }, [data]);

  // Inicializa a tabela usando TanStack Table.
  const table = useReactTable<TableRowProps>({
    data: dataCorrigida,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Calcula estatísticas
  const stats = useMemo(() => {
    const totalChamados = data.length;
    const totalRecursos = Array.from(
      new Set(data.map((item) => item.nome_recurso || '')),
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
      {/* Container principal com design moderno */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header com gradiente e estatísticas */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-8 py-6">
          <div className="flex items-start justify-between">
            {/* Título e estatísticas */}
            <div className="space-y-4">
              <div>
                <h2 className="mb-1 text-2xl font-bold text-white">
                  Relatório de Chamados
                </h2>
                <p className="text-lg text-indigo-100">
                  {mes}/{ano}
                </p>
              </div>

              {/* Cards de estatísticas */}
              {data.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-white/20 p-2">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs tracking-wide text-indigo-100 uppercase">
                          Total Chamados
                        </p>
                        <p className="text-xl font-bold text-white">
                          {stats.totalChamados}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-white/20 p-2">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs tracking-wide text-indigo-100 uppercase">
                          Recursos
                        </p>
                        <p className="text-xl font-bold text-white">
                          {stats.totalRecursos}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-white/20 p-2">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs tracking-wide text-indigo-100 uppercase">
                          Horas Totais
                        </p>
                        <p className="text-xl font-bold text-white">
                          {totalHorasGeral || '0h'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botões de exportação e status do usuário */}
            <div className="flex flex-col items-end space-y-4">
              {/* Status do usuário */}
              <div className="flex items-center space-x-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
                <span className="text-sm font-medium text-white">
                  {isAdmin ? 'Administrador' : 'Usuário'}
                </span>
              </div>

              {/* Botões de exportação */}
              <div className="flex space-x-3">
                <ExportaExcelButton
                  data={data}
                  fileName={`relatorio_${mes}_${ano}`}
                  buttonText="Excel"
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
                  className="border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/30"
                  autoFilter={true}
                  freezeHeader={true}
                />

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
                  logoUrl="/caminho/para/logo.png"
                  footerText="Gerado pelo sistema em"
                  className="border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/30"
                />
              </div>
            </div>
          </div>
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
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        className={`border-b-2 border-slate-300 bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-4 text-left font-semibold text-slate-700 shadow-sm backdrop-blur-sm ${index === 0 ? 'pl-8' : ''} ${index === headerGroup.headers.length - 1 ? 'pr-8' : ''} `}
                      >
                        <div className="flex items-center space-x-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
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
                    className={`group cursor-pointer border-b border-slate-100 transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:shadow-blue-100/50 ${
                      rowIndex % 2 === 0
                        ? 'bg-white'
                        : 'bg-gradient-to-r from-slate-50/50 to-slate-50/30'
                    } `}
                    onClick={() => openModal(row.original)}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <td
                        key={cell.id}
                        className={`px-6 py-4 text-slate-700 transition-all duration-300 group-hover:text-slate-900 ${cellIndex === 0 ? 'pl-8' : ''} ${cellIndex === row.getVisibleCells().length - 1 ? 'pr-8' : ''} `}
                      >
                        {/* Renderiza badge de status ou valor padrão da célula */}
                        {cell.column.id === 'status' ? (
                          <StatusBadge status={cell.getValue() as string} />
                        ) : (
                          <div className="whitespace-nowrap">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
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
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300">
                <TrendingUp className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-slate-600">
                  Nenhum chamado encontrado
                </h3>
                <p className="text-slate-500">
                  Não há registros para o período {mes}/{ano} com os filtros
                  selecionados.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal com design atualizado */}
      <ModalChamados
        isOpen={isModalOpen}
        selectedRow={selectedRow}
        onClose={closeModal}
      />
    </>
  );
}
