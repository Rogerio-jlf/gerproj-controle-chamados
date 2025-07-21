import { useAuth } from '@/context/AuthContext';
import { useFilters } from '@/context/FiltersContext';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

// Interface para as props do componente de filtro
interface FiltersProps {
  onFiltersChange: (filters: {
    ano: number;
    mes: number;
    cliente: string;
    recurso: string;
    status: string;
  }) => void;
}

// Componente principal de filtros do dashboard
export default function ContainerFiltro({ onFiltersChange }: FiltersProps) {
  // Obtém a data atual
  const hoje = new Date();
  // Hooks de contexto para filtros globais
  const { filters, setFilters } = useFilters();

  // Estados locais para ano e mês selecionados
  const [ano, setAno] = useState(filters.ano || hoje.getFullYear());
  const [mes, setMes] = useState(filters.mes || hoje.getMonth() + 1);

  // Estados para lista de clientes e cliente selecionado
  const [cliente, setCliente] = useState<string[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(
    filters.cliente || '',
  );

  // Estados para lista de recursos e recurso selecionado
  const [recurso, setRecurso] = useState<string[]>([]);
  const [recursoSelecionado, setRecursoSelecionado] = useState(
    filters.recurso || '',
  );

  // Estados para lista de status e status selecionado
  const [status, setStatus] = useState<string[]>([]);
  const [statusSelecionado, setStatusSelecionado] = useState(
    filters.status || '',
  );

  // Estado para indicar carregamento de dados
  const [isLoading, setIsLoading] = useState(false);

  // Debounce dos filtros para evitar chamadas excessivas
  const [debouncedAno] = useDebounce(ano, 300);
  const [debouncedMes] = useDebounce(mes, 300);
  const [debouncedClienteSelecionado] = useDebounce(clienteSelecionado, 300);
  const [debouncedRecursoSelecionado] = useDebounce(recursoSelecionado, 300);
  const [debouncedStatusSelecionado] = useDebounce(statusSelecionado, 300);

  // Obtém informações do usuário autenticado
  const { isAdmin, codCliente } = useAuth();

  // Atualiza o contexto de filtro e notifica o componente pai quando filtros mudam
  useEffect(() => {
    setFilters({
      ano: debouncedAno,
      mes: debouncedMes,
      cliente: debouncedClienteSelecionado,
      recurso: debouncedRecursoSelecionado,
      status: debouncedStatusSelecionado,
    });
    onFiltersChange({
      ano: debouncedAno,
      mes: debouncedMes,
      cliente: debouncedClienteSelecionado,
      recurso: debouncedRecursoSelecionado,
      status: debouncedStatusSelecionado,
    });
  }, [
    debouncedAno,
    debouncedMes,
    debouncedClienteSelecionado,
    debouncedRecursoSelecionado,
    debouncedStatusSelecionado,
    onFiltersChange,
    setFilters,
  ]);

  // -----------------------------------------------------------------------------

  // Efeito para carregar a lista de clientes ao alterar ano/mês/admin/cliente
  useEffect(() => {
    if (mes && ano) {
      setCliente([]);

      if (!codCliente) {
        setClienteSelecionado('');
      }

      setRecurso([]);
      setRecursoSelecionado('');
      setStatus([]);
      setStatusSelecionado('');

      const params = new URLSearchParams();
      params.append('mes', mes.toString());
      params.append('ano', ano.toString());
      params.append('isAdmin', isAdmin.toString());

      if (!isAdmin && codCliente) {
        params.append('codCliente', codCliente);
      }

      const url = `/api/filtro/cliente?${params.toString()}`;

      axios
        .get(url)
        .then((response) => {
          const data = response.data;
          if (Array.isArray(data)) {
            setCliente(data);
          } else {
            console.error('Erro: resposta inesperada ao buscar clientes', data);
          }
        })
        .catch((err) => {
          console.error('Erro ao carregar clientes:', err);
        });
    }
  }, [isAdmin, codCliente, mes, ano]);

  // -----------------------------------------------------------------------------

  // Função para carregar a lista de recursos baseada nos filtros atuais
  const carregarRecursos = useCallback(async () => {
    setIsLoading(true);
    setRecurso([]);
    setRecursoSelecionado('');
    setStatus([]);
    setStatusSelecionado('');

    try {
      const params = new URLSearchParams();
      params.append('mes', mes.toString());
      params.append('ano', ano.toString());
      params.append('isAdmin', isAdmin.toString());

      if (!isAdmin && codCliente) {
        params.append('codCliente', codCliente);
      }

      if (isAdmin && clienteSelecionado) {
        params.append('cliente', clienteSelecionado);
      }

      const url = `/api/filtro/recurso?${params.toString()}`;

      axios
        .get(url)
        .then((response) => {
          const data = response.data;
          if (Array.isArray(data)) {
            setRecurso(data);
          } else {
            console.error('Erro: resposta inesperada ao buscar recursos', data);
          }
        })
        .catch((err) => {
          console.error('Erro ao carregar recursos:', err);
        });
    } catch (err) {
      console.error('Erro ao carregar recursos:', err);
      setRecurso([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, codCliente, mes, ano, clienteSelecionado]);

  // Efeito para carregar recursos quando filtros relevantes mudam
  useEffect(() => {
    const deveCarregarRecursos = mes && ano && (isAdmin || codCliente);

    if (deveCarregarRecursos) {
      carregarRecursos();
    }
  }, [isAdmin, codCliente, mes, ano, clienteSelecionado, carregarRecursos]);

  // -----------------------------------------------------------------------------

  // Função para carregar a lista de status baseada nos filtros atuais
  const carregarStatus = useCallback(async () => {
    setIsLoading(true);
    setStatus([]);
    setStatusSelecionado('');

    try {
      const params = new URLSearchParams();
      params.append('mes', mes.toString());
      params.append('ano', ano.toString());
      params.append('isAdmin', isAdmin.toString());

      if (!isAdmin && codCliente) {
        params.append('codCliente', codCliente);
      }

      if (isAdmin && clienteSelecionado) {
        params.append('cliente', clienteSelecionado);
      }

      if (recursoSelecionado) {
        params.append('recurso', recursoSelecionado);
      }

      const url = `/api/filtro/status?${params.toString()}`;

      axios
        .get(url)
        .then((response) => {
          const data = response.data;
          if (Array.isArray(data)) {
            setStatus(data);
          } else {
            console.error('Erro: resposta inesperada ao buscar status', data);
          }
        })
        .catch((err) => {
          console.error('Erro ao carregar status:', err);
        });
    } catch (err) {
      console.error('Erro ao carregar status:', err);
      setStatus([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, codCliente, mes, ano, clienteSelecionado, recursoSelecionado]);

  // Efeito para carregar status quando filtros relevantes mudam
  useEffect(() => {
    const deveCarregarRecursos = mes && ano && (isAdmin || codCliente);

    if (deveCarregarRecursos) {
      carregarStatus();
    }
  }, [
    isAdmin,
    codCliente,
    mes,
    ano,
    clienteSelecionado,
    recursoSelecionado,
    carregarStatus,
  ]);

  // -----------------------------------------------------------------------------

  // Lista fixa de anos disponíveis para filtro
  const years = [2024, 2025];

  // Lista fixa de meses disponíveis para filtro
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  // Renderização do componente de filtros (mobile e desktop)
  return (
    <div className="mb-6 lg:mb-8 lg:flex-shrink-0">
      {/* Título para desktop */}
      <div className="mb-4 flex items-center justify-between lg:mb-0">
        <h2 className="mb-4 hidden text-lg font-semibold text-gray-800 lg:block">
          Filtros - Dashboard
        </h2>

        <span className="text-lg font-semibold text-gray-800">
          {new Date().toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Filtros para mobile (dentro de card) */}
      <div className="mb-4 lg:hidden">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center font-medium text-gray-700">
            <span className="mr-2">🔍</span>
            Filtros de Busca
            {isLoading && (
              <span className="ml-2 animate-pulse text-xs text-purple-600">
                Carregando...
              </span>
            )}
          </h3>

          <div className="space-y-3">
            {/* Linha com Ano e Mês */}
            <div className="grid grid-cols-2 gap-3">
              {/* Ano */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Ano
                </label>
                <select
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500"
                >
                  {years.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mês */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Mês
                </label>
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500"
                >
                  {months.map((monthName, i) => (
                    <option key={i} value={i + 1}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cliente */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Cliente
              </label>
              <select
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
                disabled={!cliente.length}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              >
                <option value="">Todos os clientes</option>
                {cliente.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurso */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Recurso
              </label>
              <select
                value={recursoSelecionado}
                onChange={(e) => setRecursoSelecionado(e.target.value)}
                disabled={!recurso.length || isLoading}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              >
                <option value="">Todos os recursos</option>
                {recurso.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Status
              </label>
              <select
                value={statusSelecionado}
                onChange={(e) => setStatusSelecionado(e.target.value)}
                disabled={!status.length || isLoading}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
              >
                <option value="">Todos os status</option>
                {status.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros para desktop */}
      <div className="hidden lg:block">
        <div className="mb-4 grid grid-cols-5 gap-4">
          {/* Ano */}
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="w-full cursor-pointer rounded-xl border border-gray-300 p-3 shadow-md shadow-black transition-all duration-300 hover:shadow-lg focus:border-transparent focus:ring-2 focus:ring-purple-500"
          >
            {years.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>

          {/* Mês */}
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="w-full cursor-pointer rounded-xl border border-gray-300 p-3 shadow-md shadow-black transition-all duration-300 hover:shadow-lg focus:border-transparent focus:ring-2 focus:ring-purple-500"
          >
            {months.map((monthName, i) => (
              <option key={i} value={i + 1}>
                {monthName}
              </option>
            ))}
          </select>

          {/* Cliente */}
          <select
            value={clienteSelecionado}
            onChange={(e) => setClienteSelecionado(e.target.value)}
            disabled={!cliente.length || !!codCliente}
            className="w-full cursor-pointer rounded-xl border border-gray-300 p-3 shadow-md shadow-black transition-all duration-300 hover:shadow-lg focus:border-transparent focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <option value="">Selecione o cliente</option>
            {cliente.map((nomeCliente) => (
              <option key={nomeCliente} value={nomeCliente}>
                {nomeCliente}
              </option>
            ))}
          </select>

          {/* Recurso */}
          <select
            value={recursoSelecionado}
            onChange={(e) => setRecursoSelecionado(e.target.value)}
            disabled={!recurso.length || isLoading}
            className="w-full cursor-pointer rounded-xl border border-gray-300 p-3 shadow-md shadow-black transition-all duration-300 hover:shadow-lg focus:border-transparent focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <option value="">
              {isLoading ? 'Carregando recursos...' : 'Selecione o recurso'}
            </option>
            {recurso.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusSelecionado}
            onChange={(e) => setStatusSelecionado(e.target.value)}
            disabled={!status.length || isLoading}
            className="w-full cursor-pointer rounded-xl border border-gray-300 p-3 shadow-md shadow-black transition-all duration-300 hover:shadow-lg focus:border-transparent focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <option value="">
              {isLoading ? 'Carregando status...' : 'Selecione o status'}
            </option>
            {status.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
