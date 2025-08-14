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
  RefreshCw,
  Activity,
  Zap,
  Target,
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
        return 'text-red-600 bg-red-50/80 border-red-200/50 backdrop-blur-sm';
      case 'ativo':
        return 'text-emerald-600 bg-emerald-50/80 border-emerald-200/50 backdrop-blur-sm';
      default:
        return 'text-slate-600 bg-slate-50/80 border-slate-200/50 backdrop-blur-sm';
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
      <div className="flex min-h-96 items-center justify-center rounded-3xl border border-white/30 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-pulse rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-t-blue-600"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-700">
              Carregando dados
            </p>
            <p className="text-sm text-slate-500">Aguarde um momento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-red-200/50 bg-gradient-to-br from-red-50/95 via-white/90 to-red-50/95 p-8 shadow-xl shadow-red-900/10 backdrop-blur-xl">
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-red-200/30 to-red-300/30 blur-2xl"></div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center space-x-3">
            <div className="rounded-2xl bg-red-100/80 p-3 backdrop-blur-sm">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800">
                Erro ao carregar dados
              </h3>
              <p className="text-red-600/80">{error?.message}</p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-semibold text-white shadow-lg shadow-red-900/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-900/30"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>

          {error?.message.includes('database') && (
            <div className="mt-6 rounded-2xl border border-yellow-200/50 bg-yellow-50/80 p-6 shadow-lg backdrop-blur-sm">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-yellow-800">
                <Zap className="h-5 w-5" />
                Possíveis soluções
              </h4>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                  Verifique se o servidor PostgreSQL está rodando
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                  Confirme se o IP 192.168.234.3:5432 está acessível
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                  Verifique as credenciais de conexão no arquivo .env
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                  Confirme se não há firewall bloqueando a conexão
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Tabela de clientes modernizada */}
      <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/2 via-purple-600/2 to-indigo-600/2"></div>

        {/* Header da tabela */}
        <div className="relative z-10 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/80 to-white/80 px-8 py-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-2xl font-bold text-transparent">
              Detalhes por Cliente
            </h2>
            <div className="flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 shadow-md backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <span className="text-sm font-semibold text-slate-600">
                {filteredClientes.length}{' '}
                {filteredClientes.length === 1 ? 'cliente' : 'clientes'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/30 bg-gradient-to-r from-slate-50/50 to-white/50 backdrop-blur-sm">
                {[
                  { label: 'Cliente', icon: Users },
                  { label: 'Horas Contratadas', icon: Target },
                  { label: 'Horas Executadas', icon: Activity },
                  { label: 'Progresso', icon: TrendingUp },
                  { label: 'Status', icon: CheckCircle },
                ].map(({ label, icon: Icon }) => (
                  <th key={label} className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                        {label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/30">
              {filteredClientes.map((cliente, index) => {
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
                    className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 hover:shadow-lg"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/90 to-indigo-600/90 shadow-md">
                          <span className="text-sm font-bold text-white">
                            {cliente.nome_cliente?.charAt(0) ||
                              cliente.cod_cliente.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-800 group-hover:text-slate-900">
                            {cliente.nome_cliente || 'Nome não disponível'}
                          </div>
                          <div className="text-sm font-medium text-slate-500">
                            Código: {cliente.cod_cliente}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-bold text-slate-800">
                        {cliente.horasContratadas}h
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-bold text-slate-800">
                        {cliente.horasExecutadas}h
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <div className="h-3 w-32 overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
                          <div
                            className={`h-3 rounded-full transition-all duration-1000 ${
                              status === 'suspenso'
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : 'bg-gradient-to-r from-emerald-500 to-green-600'
                            }`}
                            style={{
                              width: `${Math.min(percentual, 100)}%`,
                              animationDelay: `${index * 100}ms`,
                            }}
                          ></div>
                        </div>
                        <div className="text-sm font-semibold text-slate-600">
                          {cliente.horasContratadas > 0
                            ? `${percentual.toFixed(1)}%`
                            : 'Sem limite'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold transition-all duration-300 ${getStatusColor(status)}`}
                      >
                        {status === 'suspenso' ? (
                          <>
                            <AlertTriangle className="h-4 w-4" />
                            Suspenso
                          </>
                        ) : status === 'ativo' ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4" />
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

        {/* Estado vazio */}
        {filteredClientes.length === 0 && (
          <div className="relative z-10 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-700">
              Nenhum cliente encontrado
            </h3>
            <p className="text-slate-500">
              Tente ajustar os filtros ou termos de busca
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HorasContratadasDashboard;
