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
import ExcelButton from '../../../components/Excel_Button';
import PDFButton from '../../../components/PDF_Button';
import Modal from './Modal';
import Cards from './Cards';
import { TooltipProvider } from '../../../components/ui/tooltip';

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

  // -------------------------------------------------------------------

  // IS LOGGED CHECK
  if (!isLoggedIn) {
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
                <ExcelButton
                  data={data}
                  fileName={`relatorio_de_chamados_${mes}_${ano}`}
                  title={`Relatório de Chamados - ${mes}/${ano}`}
                  columns={[
                    { key: 'chamado_os', label: 'Chamado' },
                    { key: 'nome_cliente', label: 'Cliente' },
                    { key: 'dtini_os', label: 'Data' },
                    { key: 'status_chamado', label: 'Status' },
                    { key: 'hrini_os', label: 'Hora Início' },
                    { key: 'hrfim_os', label: 'Hora Fim' },
                    { key: 'total_horas', label: 'Total Horas' },
                    { key: 'obs', label: 'Observação' },
                  ]}
                  autoFilter={true}
                  freezeHeader={true}
                  className="border border-white/20 bg-white/10 text-white"
                />

                {/* PDF */}
                <PDFButton
                  data={data}
                  fileName={`relatorio_de_chamados_${mes}_${ano}`}
                  title={`Relatório de Chamados - ${mes}/${ano}`}
                  columns={[
                    { key: 'chamado_os', label: 'Chamado' },
                    { key: 'nome_cliente', label: 'Cliente' },
                    { key: 'dtini_os', label: 'Data' },
                    { key: 'status_chamado', label: 'Status' },
                    { key: 'hrini_os', label: 'Hora Início' },
                    { key: 'hrfim_os', label: 'Hora Fim' },
                    { key: 'total_horas', label: 'Total Horas' },
                    { key: 'obs', label: 'Observação' },
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
              {/* <table className="w-full border-collapse"> */}
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
                        className={`group cursor-pointer border-b border-slate-700 transition-all duration-100 hover:bg-white/50 ${
                          rowIndex % 2 === 0
                            ? 'bg-slate-900'
                            : 'bg-slate-800/50'
                        }`}
                        onClick={() => openModal(row.original)}
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
          {data.length === 0 && !isLoading && (
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

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        selectedRow={selectedRow}
        onClose={closeModal}
      />
    </>
  );
}

// Função para largura fixa por coluna
function getColumnWidth(columnId: string): string {
  const widthMap: Record<string, string> = {
    chamado_os: '120px',
    dtini_os: '110px',
    nome_cliente: '230px',
    status_chamado: '150px',
    nome_recurso: '200px',
    hrini_os: '100px',
    hrfim_os: '100px',
    total_horas: '120px',
    obs: '300px',
  };

  return widthMap[columnId] || '150px';
}
