import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
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

interface ApiResponse {
  totalHorasContratadas: number;
  totalHorasExecutadas: number;
  detalhesClientes: ClienteDetalhes[];
  resumo: {
    totalClientes: number;
    diferencaHoras: number;
    percentualExecucao: number;
  };
}

interface HorasContratadasDashboardProps {
  mes: number;
  ano: number;
}

export default function Clientes({ mes, ano }: HorasContratadasDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'todos' | 'ativo' | 'suspenso'
  >('todos');

  const { data, isLoading, error, refetch, isError } = useQuery<
    ApiResponse,
    Error
  >({
    queryKey: ['horasContratadas', mes, ano],
    queryFn: async () => {
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
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const getClienteStatus = (
    horasExecutadas: number,
    horasContratadas: number
  ) => {
    if (horasContratadas === 0) return 'sem_limite';
    return horasExecutadas > horasContratadas ? 'suspenso' : 'ativo';
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      suspenso: {
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: AlertTriangle,
        label: 'Suspenso',
        progressColor: 'from-red-500 to-red-600',
      },
      ativo: {
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        icon: CheckCircle,
        label: 'Ativo',
        progressColor: 'from-emerald-500 to-green-600',
      },
      sem_limite: {
        color: 'text-slate-600 bg-slate-50 border-slate-200',
        icon: Clock,
        label: 'Sem limite',
        progressColor: 'from-slate-400 to-slate-500',
      },
    };
    return configs[status as keyof typeof configs] || configs.sem_limite;
  };

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
      return statusFilter === status;
    }) || [];

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-2xl border bg-white/95 shadow-lg backdrop-blur-sm">
        <div className="space-y-3 text-center">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Carregando dados</p>
            <p className="text-sm text-slate-500">Aguarde um momento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 shadow-lg">
        <div className="mb-4 flex items-start space-x-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 text-red-600" />
          <div className="flex-1">
            <h3 className="font-bold text-red-800">Erro ao carregar dados</h3>
            <p className="mt-1 text-sm text-red-600">{error?.message}</p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </button>

        {error?.message.includes('database') && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-yellow-800">
              <Zap className="h-4 w-4" />
              Possíveis soluções
            </h4>
            <ul className="space-y-1 text-sm text-yellow-700">
              {[
                'Verifique se o servidor PostgreSQL está rodando',
                'Confirme se o IP 192.168.234.3:5432 está acessível',
                'Verifique as credenciais de conexão no arquivo .env',
                'Confirme se não há firewall bloqueando a conexão',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-yellow-500"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-lg">
      {/* Header compacto */}
      <div className="border-b bg-slate-50/80 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            Detalhes por Cliente
          </h2>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-slate-600">
              {filteredClientes.length} cliente
              {filteredClientes.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela compacta */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr className="border-b border-slate-200">
              {[
                { label: 'Cliente', icon: Users },
                { label: 'Contratadas', icon: Target },
                { label: 'Executadas', icon: Activity },
                { label: 'Progresso', icon: TrendingUp },
                { label: 'Status', icon: CheckCircle },
              ].map(({ label, icon: Icon }) => (
                <th key={label} className="px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                      {label}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClientes.map(cliente => {
              const status = getClienteStatus(
                cliente.horasExecutadas,
                cliente.horasContratadas
              );
              const config = getStatusConfig(status);
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
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                        {cliente.nome_cliente?.charAt(0) ||
                          cliente.cod_cliente.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-800">
                          {cliente.nome_cliente || 'Nome não disponível'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {cliente.cod_cliente}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">
                      {cliente.horasContratadas}h
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">
                      {cliente.horasExecutadas}h
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r transition-all duration-500 ${config.progressColor}`}
                          style={{ width: `${Math.min(percentual, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs font-medium text-slate-600">
                        {cliente.horasContratadas > 0
                          ? `${percentual.toFixed(1)}%`
                          : 'Sem limite'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${config.color}`}
                    >
                      <config.icon className="h-3.5 w-3.5" />
                      {config.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Estado vazio compacto */}
      {filteredClientes.length === 0 && (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-3 h-12 w-12 text-slate-400" />
          <h3 className="mb-1 font-semibold text-slate-700">
            Nenhum cliente encontrado
          </h3>
          <p className="text-sm text-slate-500">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      )}
    </div>
  );
}
