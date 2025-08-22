import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp,
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
import { IoMdClock } from 'react-icons/io';
import { TbClockPlus } from 'react-icons/tb';
import { ImUsers } from 'react-icons/im';
import { FaGaugeHigh } from 'react-icons/fa6';
import { FaArrowTrendUp } from 'react-icons/fa6';
import { FaArrowTrendDown } from 'react-icons/fa6';
import { FaUsers } from 'react-icons/fa6';
import { FaCalendarAlt, FaCalendarTimes } from 'react-icons/fa';
import { Card } from '../../../../components/ui/card';
// ====================================================================================================

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
// ====================================================================================================

export default function Clientes({ mes, ano }: HorasContratadasDashboardProps) {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'todos' | 'ativo' | 'suspenso' | 'sem_limite'
  >('todos');
  const [sortBy, setSortBy] = useState<'nome' | 'contratadas' | 'executadas'>(
    'nome'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  // ====================================================================================================

  // Consulta ao banco de dados
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
  // ====================================================================================================

  // Função para verificar se há dados válidos
  const hasValidData = () => {
    if (!data || isLoading) return false;

    return (
      data.resumo?.totalClientes > 0 ||
      data.totalHorasContratadas > 0 ||
      data.totalHorasExecutadas > 0 ||
      (data.detalhesClientes && data.detalhesClientes.length > 0)
    );
  };
  // ====================================================================================================

  // Cálculo da diferença
  const diferenca =
    data?.totalHorasExecutadas && data?.totalHorasContratadas
      ? data.totalHorasExecutadas - data.totalHorasContratadas
      : 0;

  const executadasMaior = diferenca > 0;

  const titulo = executadasMaior ? 'Ultrapassou' : 'Saldo';

  const valor = Math.abs(diferenca); // sempre positivo

  const Icone = executadasMaior ? FaArrowTrendUp : FaArrowTrendDown;

  // Classes dinâmicas para cores
  const cardClasses = executadasMaior
    ? 'bg-yellow-600 border-yellow-200'
    : 'bg-cyan-600 border-cyan-200';

  const iconClasses = executadasMaior
    ? 'from-yellow-300 via-yellow-700 to-yellow-300'
    : 'from-cyan-300 via-cyan-700 to-cyan-300';
  // ==========================================================================================

  // Função para obter o status do cliente com base nas horas
  const getClienteStatus = (
    horasExecutadas: number,
    horasContratadas: number
  ) => {
    if (horasContratadas === 0) return 'sem_limite';
    return horasExecutadas > horasContratadas ? 'suspenso' : 'ativo';
  };
  // ====================================================================================================

  // Função para obter a configuração de status do cliente
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
  // ====================================================================================================

  // Função para lidar com a ordenação
  const handleSort = (column: 'nome' | 'contratadas' | 'executadas') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  // ====================================================================================================

  // Filtragem dos clientes
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
  // ====================================================================================================

  // Verifica se não há dados válidos para exibir
  if (!hasValidData()) {
    return (
      <Card className="flex h-96 items-center justify-center rounded-xl border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-md shadow-black">
        {/* Conteúdo */}
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-3 border-dashed border-gray-300 bg-white shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <FaCalendarAlt className="text-gray-400" size={28} />
              {/* ===== */}
              <FaUsers className="text-gray-400" size={28} />
            </div>
          </div>
          {/* ===== */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-2xl font-extrabold tracking-wider text-gray-900 select-none">
              Nenhum dado disponível
            </h3>
            {/* ===== */}
            <p className="text-base font-bold tracking-wider text-gray-700 italic select-none">
              Não há dados de clientes para o período selecionado
            </p>
          </div>
          {/* ===== */}
          <div className="flex items-center justify-center gap-3">
            <FaCalendarTimes className="text-blue-600" size={20} />{' '}
            {/* ===== */}
            <p className="text-base font-semibold tracking-wider text-blue-600 select-none">
              {new Date(ano, mes - 1)
                .toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })
                .replace(/^\w/, c => c.toUpperCase())}
            </p>
          </div>
        </div>
      </Card>
    );
  }
  // ==========================================================================================

  return (
    <div className="space-y-6">
      <div className="rounded-md border-t border-slate-200 bg-white shadow-md shadow-black">
        {/* ===== Header ===== */}
        <header className="flex items-center justify-between rounded-t-md bg-slate-900 p-6">
          {/* Seção da esquerda */}
          <section className="flex flex-col items-start justify-center">
            {/* Título e subtítulo */}
            <div className="flex flex-col items-start justify-center">
              <h1 className="text-3xl font-extrabold tracking-widest text-white select-none">
                Horas Cliente
              </h1>
              {/* ===== */}
              <div className="mb-8 flex items-center gap-2">
                <Calendar className="text-white" size={20} />
                {/* ===== */}
                <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                  {new Date(ano, mes - 1)
                    .toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })
                    .replace(/^\w/, c => c.toUpperCase())}
                </span>
                {/* ===== */}
                <div className="mx-2 h-4 w-0.5 bg-white select-none"></div>
                {/* ===== */}
                <User className="text-white" size={20} />
                {/* ===== */}
                <span className="text-sm font-semibold tracking-wider text-white italic select-none">
                  {filteredClientes.length} cliente
                  {filteredClientes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {/* ===== */}

            {/* Filtros */}
            <div className="flex items-center justify-center gap-2">
              {/* buscar cliente */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                {/* ===== */}
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-80 rounded-md border-t border-slate-200 bg-white py-1 pl-10 text-sm italic placeholder-slate-500 shadow-xs shadow-black transition-all hover:scale-105 hover:shadow-md hover:shadow-black focus:outline-none"
                />
              </div>
              {/* ===== */}

              {/* filtrar status */}
              <div className="relative">
                <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                {/* ===== */}
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
                  className="w-60 rounded-md border-t border-slate-200 bg-white py-1 pl-10 text-sm italic placeholder-slate-500 shadow-xs shadow-black transition-all hover:scale-105 hover:shadow-md hover:shadow-black focus:outline-none"
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

          {/* Seção da direita */}
          <section className="grid grid-cols-5 gap-4">
            {/* total clientes */}
            <Card className="min-w-[180px] rounded-md border-none bg-blue-600 px-4 py-2">
              <div className="flex items-center gap-4">
                {/* ícone */}
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-300 via-blue-700 to-blue-300">
                  <ImUsers className="text-white" size={24} />
                </div>
                <div className="flex flex-col items-start justify-center">
                  {/* título */}
                  <p className="text-lg font-semibold tracking-wider text-white select-none">
                    Total Clientes
                  </p>
                  {/* valor */}
                  <p className="text-2xl font-bold tracking-wider text-white select-none">
                    {data?.resumo?.totalClientes ?? 0}
                  </p>
                </div>
              </div>
            </Card>
            {/* ===== */}

            {/* Horas contratadas */}
            <Card className="min-w-[180px] rounded-md border-none bg-orange-600 px-4 py-2">
              <div className="flex items-center gap-4">
                {/* ícone */}
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-orange-300 via-orange-700 to-orange-300 shadow-md shadow-black">
                  <IoMdClock className="text-white" size={24} />
                </div>
                <div className="flex flex-col items-start justify-center">
                  {/* título */}
                  <p className="text-lg font-semibold tracking-wider text-white select-none">
                    Horas Contratadas
                  </p>
                  {/* valor */}
                  <p className="text-2xl font-bold tracking-wider text-white select-none">
                    {data?.totalHorasContratadas}h
                  </p>
                </div>
              </div>
            </Card>
            {/*  */}

            {/* Horas executadas */}
            <Card className="min-w-[180px] rounded-md border-none bg-green-600 px-4 py-2">
              <div className="flex items-center gap-4">
                {/* ícone */}
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-green-300 via-green-700 to-green-300 shadow-md shadow-black">
                  <TbClockPlus className="text-white" size={24} />
                </div>
                <div className="flex flex-col items-start justify-center">
                  {/* título */}
                  <p className="text-lg font-semibold tracking-wider text-white select-none">
                    Horas Executadas
                  </p>
                  {/* valor */}
                  <p className="text-2xl font-bold tracking-wider text-white select-none">
                    {data?.totalHorasExecutadas}h
                  </p>
                </div>
              </div>
            </Card>
            {/* ===== */}

            {/* Diferença entre horas contratadas e horas executadas */}
            <Card
              className={`min-w-[180px] rounded-md border-none ${cardClasses} px-4 py-2`}
            >
              <div className="flex items-center gap-4">
                {/* ícone */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${iconClasses} shadow-md shadow-black`}
                >
                  <Icone className="text-white" size={24} />
                </div>
                <div className="flex flex-col items-start justify-center">
                  {/* título */}
                  <p className="text-lg font-semibold tracking-wider text-white select-none">
                    {titulo}
                  </p>
                  {/* valor */}
                  <p className="text-2xl font-bold tracking-wider text-white select-none">
                    {valor}h
                  </p>
                </div>
              </div>
            </Card>
            {/* ===== */}

            {/* Eficiência */}
            <Card className="min-w-[180px] rounded-md border-none bg-purple-600 px-4 py-2">
              <div className="flex items-center gap-4">
                {/* ícone */}
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-300 via-purple-700 to-purple-300 shadow-md shadow-black">
                  <FaGaugeHigh className="text-white" size={24} />
                </div>
                <div className="flex flex-col items-start justify-center">
                  {/* título */}
                  <p className="text-lg font-semibold tracking-wider text-white select-none">
                    Eficiência
                  </p>
                  {/* valor */}
                  <p className="text-2xl font-bold tracking-wider text-white select-none">
                    {data?.resumo.percentualExecucao.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
            {/* ===== */}
          </section>
        </header>
        {/* ==================== */}

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
                          className="border border-slate-300 bg-white text-base font-semibold tracking-wider text-gray-900"
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
                          <div className="via-gray-900text-gray-900 flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-600 text-lg font-bold text-white shadow-md shadow-black">
                            {cliente.nome_cliente?.charAt(0) ||
                              cliente.cod_cliente.charAt(0)}
                          </div>
                          <div
                            className={`absolute -right-2 -bottom-2 h-5 w-5 rounded-full border-2 border-white ${config.dot}`}
                          ></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-lg font-bold tracking-wider text-gray-900 select-none">
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
                        <div className="text-xl font-bold tracking-wider text-gray-900 select-none">
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
                          className={`text-xl font-bold tracking-wider select-none ${isOverLimit ? 'text-red-600' : 'text-gray-900'}`}
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
            <h2 className="text-2xl font-bold tracking-wider text-gray-900 select-none">
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
