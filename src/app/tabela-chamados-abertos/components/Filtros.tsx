'use client';

import { useAuth } from '@/contexts/Auth_Context';
import { useFiltersTabelaChamadosAbertos } from '@/contexts/Filters_Tabela_Chamados_Abertos_Context';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

// Importando os componentes individuais
import SelectAno from '@/components/filtros/Select_Ano';
import SelectCliente from '@/components/filtros/Select_Clientes';
import SelectMes from '@/components/filtros/Select_Mes';
import SelectRecurso from '@/components/filtros/Select_Recursos';
import SelectStatus from '@/components/filtros/Select_Status';

interface FiltersProps {
  onFiltersChange: (filters: {
    ano: number;
    mes: number;
    cliente: string;
    recurso: string;
    status: string;
  }) => void;
}

// FETCH CLIENTE
const fetchClientes = async ({ ano, mes, isAdmin, codRecurso }: any) => {
  const params = new URLSearchParams({
    ano: ano.toString(),
    mes: mes.toString(),
    isAdmin: isAdmin.toString(),
  });
  if (!isAdmin && codRecurso) params.append('codRecurso', codRecurso);
  const { data } = await axios.get(
    `/api/firebird/chamados-abertos/filtro/cliente?${params}`
  );
  if (!Array.isArray(data)) throw new Error('Resposta inesperada');
  return data;
};

// FETCH RECURSOS
const fetchRecursos = async ({
  ano,
  mes,
  isAdmin,
  codRecurso,
  clienteSelecionado,
}: any) => {
  const params = new URLSearchParams({
    ano: ano.toString(),
    mes: mes.toString(),
    isAdmin: isAdmin.toString(),
  });
  if (!isAdmin && codRecurso) params.append('codRecurso', codRecurso);
  if (isAdmin && clienteSelecionado)
    params.append('cliente', clienteSelecionado);
  const { data } = await axios.get(
    `/api/firebird/chamados-abertos/filtro/recurso?${params}`
  );
  if (!Array.isArray(data)) throw new Error('Resposta inesperada');
  return data;
};

// FETCH STATUS
const fetchStatus = async ({
  ano,
  mes,
  isAdmin,
  codRecurso,
  clienteSelecionado,
  recursoSelecionado,
}: any) => {
  const params = new URLSearchParams({
    ano: ano.toString(),
    mes: mes.toString(),
    isAdmin: isAdmin.toString(),
  });
  if (!isAdmin && codRecurso) params.append('codRecurso', codRecurso);
  if (isAdmin && clienteSelecionado)
    params.append('cliente', clienteSelecionado);
  if (recursoSelecionado) params.append('recurso', recursoSelecionado);
  const { data } = await axios.get(
    `/api/firebird/chamados-abertos/filtro/status?${params}`
  );
  if (!Array.isArray(data)) throw new Error('Resposta inesperada');
  return data;
};

export default function Filtros({ onFiltersChange }: FiltersProps) {
  const hoje = new Date();
  const { filters, setFilters } = useFiltersTabelaChamadosAbertos();
  const { isAdmin, codRecurso } = useAuth();

  // Estados locais
  const [ano, setAno] = useState(filters.ano || hoje.getFullYear());
  const [mes, setMes] = useState(filters.mes || hoje.getMonth() + 1);
  const [clienteSelecionado, setClienteSelecionado] = useState(
    filters.cliente || ''
  );
  const [recursoSelecionado, setRecursoSelecionado] = useState(
    filters.recurso || ''
  );
  const [statusSelecionado, setStatusSelecionado] = useState(
    filters.status || ''
  );

  // Debounces
  const [debouncedAno] = useDebounce(ano, 300);
  const [debouncedMes] = useDebounce(mes, 300);
  const [debouncedClienteSelecionado] = useDebounce(clienteSelecionado, 300);
  const [debouncedRecursoSelecionado] = useDebounce(recursoSelecionado, 300);
  const [debouncedStatusSelecionado] = useDebounce(statusSelecionado, 300);

  // QUERIES usando valores debounced para evitar muitos fetches rápidos
  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes', debouncedAno, debouncedMes, isAdmin, codRecurso],
    queryFn: () =>
      fetchClientes({
        ano: debouncedAno,
        mes: debouncedMes,
        isAdmin,
        codRecurso,
      }),
    enabled: !!debouncedAno && !!debouncedMes && (isAdmin || !!codRecurso),
  });

  const { data: recursos = [], isLoading: loadingRecursos } = useQuery({
    queryKey: [
      'recursos',
      debouncedAno,
      debouncedMes,
      isAdmin,
      codRecurso,
      debouncedClienteSelecionado,
    ],
    queryFn: () =>
      fetchRecursos({
        ano: debouncedAno,
        mes: debouncedMes,
        isAdmin,
        codRecurso,
        clienteSelecionado: debouncedClienteSelecionado,
      }),
    enabled: !!debouncedAno && !!debouncedMes && (isAdmin || !!codRecurso),
  });

  const { data: statusList = [], isLoading: loadingStatus } = useQuery({
    queryKey: [
      'status',
      debouncedAno,
      debouncedMes,
      isAdmin,
      codRecurso,
      debouncedClienteSelecionado,
      debouncedRecursoSelecionado,
    ],
    queryFn: () =>
      fetchStatus({
        ano: debouncedAno,
        mes: debouncedMes,
        isAdmin,
        codRecurso,
        clienteSelecionado: debouncedClienteSelecionado,
        recursoSelecionado: debouncedRecursoSelecionado,
      }),
    enabled: !!debouncedAno && !!debouncedMes && (isAdmin || !!codRecurso),
  });

  // Reset seleções quando o valor selecionado não existir mais nos dados retornados
  useEffect(() => {
    if (clienteSelecionado && !clientes.includes(clienteSelecionado)) {
      setClienteSelecionado('');
      setRecursoSelecionado('');
      setStatusSelecionado('');
    }
  }, [clientes, clienteSelecionado]);

  useEffect(() => {
    if (recursoSelecionado && !recursos.includes(recursoSelecionado)) {
      setRecursoSelecionado('');
      setStatusSelecionado('');
    }
  }, [recursos, recursoSelecionado]);

  useEffect(() => {
    if (statusSelecionado && !statusList.includes(statusSelecionado)) {
      setStatusSelecionado('');
    }
  }, [statusList, statusSelecionado]);

  // Atualiza contexto e callback externo
  useEffect(() => {
    setFilters({
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
    setFilters,
  ]);

  return (
    <div className="">
      {/* Filtros para desktop */}
      <div className="hidden lg:block">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <SelectAno value={ano} onChange={setAno} />

            <SelectMes value={mes} onChange={setMes} />

            <SelectCliente
              value={clienteSelecionado}
              onChange={setClienteSelecionado}
              clientes={clientes}
              isLoading={loadingClientes}
              disabled={!!codRecurso}
            />

            <SelectRecurso
              value={recursoSelecionado}
              onChange={setRecursoSelecionado}
              recursos={recursos}
              isLoading={loadingRecursos}
            />

            <SelectStatus
              value={statusSelecionado}
              onChange={setStatusSelecionado}
              statusList={statusList}
              isLoading={loadingStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
