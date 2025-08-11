import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Filter,
} from 'lucide-react';

interface ClienteDetalhes {
  cod_cliente: string;
  nome_cliente: string | null;
  horasContratadas: number;
  horasExecutadas: number;
  totalLimmesTarefas: number;
}

interface ResumoData {
  totalClientes: number;
  diferencaHoras: number;
  percentualExecucao: number;
}

interface ApiResponse {
  totalHorasContratadas: number;
  totalHorasExecutadas: number;
  detalhesClientes: ClienteDetalhes[];
  resumo: ResumoData;
}

interface HorasContratadasDashboardProps {
  mes: number;
  ano: number;
}

const HorasContratadasDashboard = ({
  mes,
  ano,
}: HorasContratadasDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'todos' | 'ativo' | 'suspenso'
  >('todos');

  // Função para buscar dados da API
  const fetchHorasContratadas = async (): Promise<ApiResponse> => {
    const params = new URLSearchParams({
      mes: mes.toString(),
      ano: ano.toString(),
      isAdmin: 'true',
    });

    const response = await fetch(
      `/api/postgre-SQL/apontamentos-view/metricas/horas_contratadas_horas_executadas?${params}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Erro ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  };

  // useQuery para gerenciar a chamada da API
  const { data, isLoading, error, refetch, isError } = useQuery<
    ApiResponse,
    Error
  >({
    queryKey: ['horasContratadas', mes, ano],
    queryFn: fetchHorasContratadas,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Função para determinar o status do cliente
  const getClienteStatus = (
    horasExecutadas: number,
    horasContratadas: number
  ) => {
    if (horasContratadas === 0) return 'sem_limite';
    return horasExecutadas > horasContratadas ? 'suspenso' : 'ativo';
  };

  // Função para obter cor baseada no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'suspenso':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'ativo':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Filtrar clientes
  const filteredClientes =
    data?.detalhesClientes?.filter(cliente => {
      const matchesSearch =
        !searchTerm ||
        cliente.nome_cliente
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cliente.cod_cliente.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'todos') return true;

      const status = getClienteStatus(
        cliente.horasExecutadas,
        cliente.horasContratadas
      );
      return statusFilter === 'suspenso'
        ? status === 'suspenso'
        : status === 'ativo';
    }) || [];

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-slate-600">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6 shadow-md shadow-black">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <span className="font-semibold text-red-800">
            Erro ao carregar dados
          </span>
        </div>
        <p className="mt-2 font-medium text-red-700">{error?.message}</p>
        <div className="mt-4">
          <button
            onClick={() => refetch()}
            className="rounded-md bg-red-600 px-6 py-2 font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-black"
          >
            Tentar novamente
          </button>
        </div>

        {error?.message.includes('database') && (
          <div className="mt-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
            <h4 className="mb-2 font-semibold text-yellow-800">
              Possíveis soluções:
            </h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
              <li>Verifique se o servidor PostgreSQL está rodando</li>
              <li>Confirme se o IP 192.168.234.3:5432 está acessível</li>
              <li>Verifique as credenciais de conexão no arquivo .env</li>
              <li>Confirme se não há firewall bloqueando a conexão</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-md shadow-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wider text-slate-600">
                Total Clientes
              </p>
              <p className="text-2xl font-extrabold text-blue-600">
                {data.resumo.totalClientes}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-md shadow-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wider text-slate-600">
                Horas Contratadas
              </p>
              <p className="text-2xl font-extrabold text-green-600">
                {data.totalHorasContratadas}h
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-md shadow-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wider text-slate-600">
                Horas Executadas
              </p>
              <p className="text-2xl font-extrabold text-orange-600">
                {data.totalHorasExecutadas}h
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-md shadow-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wider text-slate-600">
                % Execução
              </p>
              <p className="text-2xl font-extrabold text-slate-800">
                {data.resumo.percentualExecucao.toFixed(2)}%
              </p>
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                data.resumo.percentualExecucao > 90
                  ? 'bg-red-100'
                  : 'bg-green-100'
              }`}
            >
              {data.resumo.percentualExecucao > 90 ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-md shadow-black">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou código..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-300 py-2 pr-4 pl-10 font-medium text-slate-600 shadow-md shadow-black focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(
                  e.target.value as 'todos' | 'ativo' | 'suspenso'
                )
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 shadow-md shadow-black focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="suspenso">Suspensos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md shadow-black">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold tracking-wider text-slate-800">
            Detalhes por Cliente ({filteredClientes.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Horas Contratadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Horas Executadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Progresso
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredClientes.map(cliente => {
                const status = getClienteStatus(
                  cliente.horasExecutadas,
                  cliente.horasContratadas
                );
                const percentual =
                  cliente.horasContratadas > 0
                    ? Math.min(
                        (cliente.horasExecutadas / cliente.horasContratadas) *
                          100,
                        100
                      )
                    : 0;

                return (
                  <tr
                    key={cliente.cod_cliente}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          {cliente.nome_cliente || 'Nome não disponível'}
                        </div>
                        <div className="text-sm font-medium text-slate-600">
                          Código: {cliente.cod_cliente}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-slate-800">
                      {cliente.horasContratadas}h
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-slate-800">
                      {cliente.horasExecutadas}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-2 w-full rounded-full bg-slate-200 shadow-inner">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            status === 'suspenso'
                              ? 'bg-red-600'
                              : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(percentual, 100)}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-600">
                        {cliente.horasContratadas > 0
                          ? `${percentual.toFixed(1)}%`
                          : 'Sem limite'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold ${getStatusColor(status)}`}
                      >
                        {status === 'suspenso' ? (
                          <>
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Suspenso
                          </>
                        ) : status === 'ativo' ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Sem limite
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredClientes.length === 0 && (
          <div className="py-8 text-center">
            <p className="font-medium text-slate-600">
              Nenhum cliente encontrado com os filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HorasContratadasDashboard;
