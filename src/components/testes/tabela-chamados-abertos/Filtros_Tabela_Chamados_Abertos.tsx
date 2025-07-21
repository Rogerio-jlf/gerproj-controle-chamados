'use client';

import { useAuth } from '@/context/AuthContext';
import { useChamadosAbertosFilters } from '@/context/Chamados_Abertos_Filters_Context';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

// Importando os componentes individuais
import SelectAno from '@/components/testes/filtros/Select_Ano';
import SelectCliente from '@/components/testes/filtros/Select_Clientes';
import SelectMes from '@/components/testes/filtros/Select_Mes';
import SelectRecurso from '@/components/testes/filtros/Select_Recursos';
import SelectStatus from '@/components/testes/filtros/Select_Status';
import { Filter } from 'lucide-react';

interface FiltersProps {
  onFiltersChange: (filters: {
    ano: number;
    mes: number;
    cliente: string;
    recurso: string;
    status: string;
  }) => void;
}

// Fetchers
const fetchClientes = async ({ ano, mes, isAdmin, codRecurso }: any) => {
  const params = new URLSearchParams({
    ano: ano.toString(),
    mes: mes.toString(),
    isAdmin: isAdmin.toString(),
  });
  if (!isAdmin && codRecurso) params.append('codRecurso', codRecurso);
  const { data } = await axios.get(
    `/api/chamados-abertos/filtros/clientes?${params}`,
  );
  if (!Array.isArray(data)) throw new Error('Resposta inesperada');
  return data;
};

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
    `/api/chamados-abertos/filtros/recursos?${params}`,
  );
  if (!Array.isArray(data)) throw new Error('Resposta inesperada');
  return data;
};

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
    `/api/chamados-abertos/filtros/status?${params}`,
  );
  if (!Array.isArray(data)) throw new Error('Resposta inesperada');
  return data;
};

export default function Filtros({ onFiltersChange }: FiltersProps) {
  const hoje = new Date();
  const { filters, setFilters } = useChamadosAbertosFilters();
  const { isAdmin, codRecurso } = useAuth();

  // Estados locais
  const [ano, setAno] = useState(filters.ano || hoje.getFullYear());
  const [mes, setMes] = useState(filters.mes || hoje.getMonth() + 1);
  const [clienteSelecionado, setClienteSelecionado] = useState(
    filters.cliente || '',
  );
  const [recursoSelecionado, setRecursoSelecionado] = useState(
    filters.recurso || '',
  );
  const [statusSelecionado, setStatusSelecionado] = useState(
    filters.status || '',
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

  // Atualiza o contexto global de filtros quando os valores debounced mudam
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
    <div className="mb-4">
      {/* Filtros para desktop */}
      <div className="hidden lg:block">
        <div className="relative z-10">
          <div className="grid grid-cols-[70px_1fr_1fr_1fr_1fr_1fr] items-end gap-2">
            {/* Ícone de filtro fixo */}
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 via-purple-700 to-blue-700 shadow-md shadow-black">
              <Filter className="h-8 w-8 text-white" />
            </div>

            {/* Componentes de Select */}
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
