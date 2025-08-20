import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp,
  RefreshCw,
  Activity,
  Zap,
  Target,
  Filter,
  ArrowUpDown,
  Calendar,
  User,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../components/ui/tooltip';
import LoadingComponent from '../../../../components/Loading';
import { IoMdClock } from 'react-icons/io';
import { TbClockPlus } from 'react-icons/tb';
import { ImUsers } from 'react-icons/im';
import { FaGaugeHigh } from 'react-icons/fa6';

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
    'todos' | 'ativo' | 'suspenso' | 'sem_limite'
  >('todos');
  const [sortBy, setSortBy] = useState<'nome' | 'contratadas' | 'executadas'>(
    'nome'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
        color: 'text-red-700 bg-red-50 border-red-200 shadow-red-100',
        icon: AlertTriangle,
        label: 'Limite Excedido',
        progressColor: 'from-red-500 to-red-600',
        dot: 'bg-red-500',
      },
      ativo: {
        color:
          'text-emerald-700 bg-emerald-50 border-emerald-200 shadow-emerald-100',
        icon: CheckCircle,
        label: 'Dentro do Limite',
        progressColor: 'from-emerald-500 to-green-600',
        dot: 'bg-emerald-500',
      },
      sem_limite: {
        color: 'text-blue-700 bg-blue-50 border-blue-200 shadow-blue-100',
        icon: Zap,
        label: 'Sem Limite',
        progressColor: 'from-blue-500 to-indigo-600',
        dot: 'bg-blue-500',
      },
    };
    return configs[status as keyof typeof configs] || configs.sem_limite;
  };

  const handleSort = (column: 'nome' | 'contratadas' | 'executadas') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredClientes =
    data?.detalhesClientes
      ?.filter(cliente => {
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
      })
      .sort((a, b) => {
        let valueA: string | number, valueB: string | number;

        switch (sortBy) {
          case 'nome':
            valueA = a.nome_cliente?.toLowerCase() || '';
            valueB = b.nome_cliente?.toLowerCase() || '';
            break;
          case 'contratadas':
            valueA = a.horasContratadas;
            valueB = b.horasContratadas;
            break;
          case 'executadas':
            valueA = a.horasExecutadas;
            valueB = b.horasExecutadas;
            break;
          default:
            return 0;
        }

        if (sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        }
        return valueA < valueB ? 1 : -1;
      }) || [];

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-8 shadow-xl">
        <div className="mb-6 flex items-start space-x-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-800">
              Ops! Algo deu errado
            </h3>
            <p className="mt-2 text-red-600">
              {error?.message ||
                'Não foi possível carregar os dados dos clientes.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-3 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl"
        >
          <RefreshCw className="h-5 w-5" />
          Tentar Novamente
        </button>

        {error?.message.includes('database') && (
          <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-6">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-yellow-800">
              <Zap className="h-5 w-5" />
              Possíveis soluções
            </h4>
            <ul className="space-y-2 text-sm text-yellow-700">
              {[
                'Verifique se o servidor PostgreSQL está rodando',
                'Confirme se o IP 192.168.234.3:5432 está acessível',
                'Verifique as credenciais de conexão no arquivo .env',
                'Confirme se não há firewall bloqueando a conexão',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
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
  // ==========================================================================================

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <div className="rounded-md border-t border-slate-200 bg-white shadow-md shadow-black">
        <header className="flex items-center justify-between rounded-t-md bg-slate-900 p-6">
          {/* ===== seção da esquerda ===== */}
          <section className="flex flex-col items-start justify-center">
            <h1 className="text-3xl font-extrabold tracking-wider text-white select-none">
              Horas Cliente
            </h1>

            <div className="mb-8 flex items-center gap-2">
              {/* ícone */}
              <Calendar className="text-white" size={20} />
              {/* descrição data */}
              <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                {new Date(ano, mes - 1)
                  .toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })
                  .replace(/^\w/, c => c.toUpperCase())}
              </span>
              {/* barra separadora */}
              <div className="mx-2 h-4 w-0.5 bg-white select-none"></div>
              {/* ícone */}
              <User className="text-white" size={20} />
              {/* quantidade de clientes */}
              <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                {filteredClientes.length} cliente
                {filteredClientes.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* ===== filtros ===== */}
            <div className="flex items-center justify-center gap-2">
              {/* buscar cliente */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-80 rounded-md border-t border-slate-200 bg-white py-1 pl-10 text-sm placeholder-slate-500 shadow-xs shadow-black transition-all hover:scale-105 hover:shadow-md hover:shadow-black focus:outline-none"
                />
              </div>

              {/* filtrar status */}
              <div className="relative">
                <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={e =>
                    setStatusFilter(
                      e.target.value as
                        | 'todos'
                        | 'ativo'
                        | 'suspenso'
                        | 'sem_limite'
                    )
                  }
                  className="w-60 rounded-md border-t border-slate-200 bg-white py-1 pl-10 text-sm placeholder-slate-500 shadow-xs shadow-black transition-all hover:scale-105 hover:shadow-md hover:shadow-black focus:outline-none"
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Dentro do Limite</option>
                  <option value="suspenso">Limite Excedido</option>
                  <option value="sem_limite">Sem Limite</option>
                </select>
              </div>
            </div>
          </section>
          {/* ==================== */}

          {/* ===== seção da direita ===== */}
          <section className="grid grid-cols-4 gap-4">
            <div className="min-w-[180px] rounded-md border-t border-blue-200 bg-blue-600 px-4 py-2 shadow-md shadow-black">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-bold tracking-wider text-white select-none">
                    Total Clientes
                  </p>
                  <p className="text-2xl font-semibold tracking-wider text-white italic select-none">
                    {data.resumo.totalClientes}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-300 via-blue-700 to-blue-300 shadow-md shadow-black">
                  <ImUsers className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="min-w-[180px] rounded-md border-t border-orange-200 bg-orange-600 px-4 py-2 shadow-md shadow-black">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-bold tracking-wider text-white select-none">
                    Horas Contratadas
                  </p>
                  <p className="text-2xl font-semibold tracking-wider text-white italic select-none">
                    {data.totalHorasContratadas}h
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-orange-300 via-orange-700 to-orange-300 shadow-md shadow-black">
                  <IoMdClock className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="min-w-[180px] rounded-md border-t border-green-200 bg-green-600 px-4 py-2 shadow-md shadow-black">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-bold tracking-wider text-white select-none">
                    Horas Executadas
                  </p>
                  <p className="text-2xl font-semibold tracking-wider text-white italic select-none">
                    {data.totalHorasExecutadas}h
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-green-300 via-green-700 to-green-300 shadow-md shadow-black">
                  <TbClockPlus className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="min-w-[180px] rounded-md border-t border-purple-200 bg-purple-600 px-4 py-2 shadow-md shadow-black">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-bold tracking-wider text-white select-none">
                    Eficiência
                  </p>
                  <p className="text-2xl font-semibold tracking-wider text-white italic select-none">
                    {data.resumo.percentualExecucao.toFixed(1)}%
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-300 via-purple-700 to-purple-300 shadow-md shadow-black">
                  <FaGaugeHigh className="text-white" size={24} />
                </div>
              </div>
            </div>
          </section>
          {/* ==================== */}
        </header>

        {/* Tabela */}
        <div className="overflow-x-auto">
          {/* ===== tabela ===== */}
          <table className="w-full">
            {/* ==== cabeçalho da tabela ===== */}
            <thead>
              {/* linha do cabeçalho */}
              <tr className="border-t border-slate-300 bg-teal-700">
                {[
                  {
                    key: 'nome',
                    label: 'Clientes',
                    icon: Users,
                    sortable: true,
                  },
                  {
                    key: 'contratadas',
                    label: 'Horas Contratadas',
                    icon: Target,
                    sortable: true,
                  },
                  {
                    key: 'executadas',
                    label: 'Horas Executadas',
                    icon: Activity,
                    sortable: true,
                  },
                  {
                    key: 'consumo',
                    label: 'Consumo',
                    icon: TrendingUp,
                    sortable: false,
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    icon: CheckCircle,
                    sortable: false,
                  },
                  // =====
                ].map(({ key, label, icon: Icon, sortable }) => (
                  // colunas do cabeçalho
                  <th key={key} className="px-6 py-4 text-left">
                    {sortable ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() =>
                              handleSort(
                                key as 'nome' | 'contratadas' | 'executadas'
                              )
                            }
                            className="flex cursor-pointer items-center justify-center gap-4 text-base font-bold tracking-wider text-white select-none"
                          >
                            {Icon && <Icon size={20} />}
                            {label}
                            {sortBy === key && (
                              <ArrowUpDown
                                className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                size={20}
                              />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top" // (top, bottom, left, right) - aqui aparece acima
                          align="center" // start = esquerda, center = padrão, end = direita
                          sideOffset={12} // distância entre o trigger e o tooltip
                          className="border border-slate-300 bg-white text-base font-semibold tracking-wider text-slate-800"
                        >
                          <span>Clique para ordenar</span>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div className="flex items-center justify-center gap-4 text-base font-bold tracking-wider text-white select-none">
                        {Icon && <Icon size={20} />}
                        {label}
                      </div>
                    )}
                  </th>
                  // =====
                ))}
              </tr>
              {/* ===== */}
            </thead>
            {/* ===== */}

            {/* ===== corpo da tabela ===== */}
            <tbody className="divide-y divide-slate-100">
              {filteredClientes.map((cliente, index) => {
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
                    : 100;

                const isOverLimit =
                  cliente.horasContratadas > 0 &&
                  cliente.horasExecutadas > cliente.horasContratadas;

                return (
                  // linhas do corpo da tabela
                  <tr
                    key={cliente.cod_cliente}
                    className={`group transition-all hover:bg-slate-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    {/* células/colunas da tabela */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 via-slate-800 to-blue-600 text-lg font-bold text-white shadow-md shadow-black">
                            {cliente.nome_cliente?.charAt(0) ||
                              cliente.cod_cliente.charAt(0)}
                          </div>
                          <div
                            className={`absolute -right-2 -bottom-2 h-5 w-5 rounded-full border-2 border-white ${config.dot}`}
                          ></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-lg font-bold tracking-wider text-slate-800 select-none">
                            {cliente.nome_cliente || 'Nome não disponível'}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-700 italic select-none">
                            <span>{cliente.cod_cliente}</span>
                            <span>•</span>
                            <span>{cliente.totalLimmesTarefas} tarefas</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* ===== */}

                    <td className="px-6 py-4">
                      <div className="text-left">
                        <div className="text-xl font-bold tracking-wider text-slate-800 select-none">
                          {cliente.horasContratadas === 0
                            ? '∞'
                            : `${cliente.horasContratadas}h`}
                        </div>
                        <div className="text-sm font-semibold tracking-wider text-slate-700 italic select-none">
                          contratadas
                        </div>
                      </div>
                    </td>
                    {/* ===== */}

                    <td className="px-6 py-4">
                      <div className="text-left">
                        <div
                          className={`text-xl font-bold tracking-wider select-none ${isOverLimit ? 'text-red-600' : 'text-slate-800'}`}
                        >
                          {cliente.horasExecutadas}h
                        </div>
                        <div className="text-sm font-semibold tracking-wider text-slate-700 italic select-none">
                          executadas
                        </div>
                      </div>
                    </td>
                    {/* ===== */}

                    <td className="px-6 py-4">
                      <div className="space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-bold tracking-wider select-none ${isOverLimit ? 'text-red-600' : 'text-slate-600'}`}
                          >
                            {cliente.horasContratadas > 0
                              ? `${percentual.toFixed(1)}%`
                              : 'Sem limite'}
                          </span>
                        </div>

                        <div className="h-3 w-32 overflow-hidden rounded-full bg-slate-200 shadow-inner">
                          <div
                            className={`h-3 rounded-full bg-gradient-to-r transition-all duration-700 ${config.progressColor} ${
                              isOverLimit ? 'animate-pulse' : ''
                            }`}
                            style={{ width: `${Math.min(percentual, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* ===== */}

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-4 rounded-md border px-4 py-2 text-base font-semibold tracking-wider select-none ${config.color}`}
                      >
                        <config.icon size={20} />
                        {config.label}
                      </span>
                    </td>
                    {/* ===== */}
                  </tr>
                );
              })}
            </tbody>
            {/* ===== */}
          </table>
          {/* ===== */}
        </div>
        {/* ==================== */}

        {/* ===== filtro sem resultado ===== */}
        {filteredClientes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* ícone */}
            <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 shadow-md shadow-black">
              <Search className="text-slate-600" size={44} />
            </div>
            {/* título */}
            <h2 className="text-2xl font-bold tracking-wider text-slate-800 select-none">
              Nenhum cliente encontrado
            </h2>
            {/* descrição */}
            <span className="mb-10 text-base font-semibold tracking-wider text-slate-600 italic select-none">
              Tente ajustar os filtros ou os termos de busca para encontrar o
              que procura
            </span>
            {/* botão limpar filtro */}
            {(searchTerm || statusFilter !== 'todos') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
                }}
                className="rounded-md border border-blue-600 bg-blue-500 px-6 py-2 text-base font-bold tracking-wider text-white transition-all select-none hover:scale-105 hover:bg-blue-800"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
