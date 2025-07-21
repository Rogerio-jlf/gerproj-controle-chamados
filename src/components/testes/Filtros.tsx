'use client';

import { useAuth } from '@/context/AuthContext';
import { useFilters } from '@/context/FiltersContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

// Importando os componentes individuais
import SelectAno from '@/components/testes/filtros/Select_Ano';
import SelectCliente from '@/components/testes/filtros/Select_Clientes';
import SelectMes from '@/components/testes/filtros/Select_Mes';
import SelectRecurso from '@/components/testes/filtros/Select_Recursos';
import SelectStatus from '@/components/testes/filtros/Select_Status';

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
const fetchClientes = async ({ ano, mes, isAdmin, codCliente }: any) => {
  const params = new URLSearchParams({
    ano: ano.toString(),
    mes: mes.toString(),
    isAdmin: isAdmin.toString(),
  });
  if (!isAdmin && codCliente) params.append('codCliente', codCliente);
  const { data } = await axios.get(`/api/filtro/cliente?${params}`);
  if (!Array.isArray(data)) throw new Error('Resposta inesperada');
  return data;
};

const fetchRecursos = async ({
  ano,
  mes,
  isAdmin,
  codCliente,
  clienteSelecionado,
}: any) => {
  const params = new URLSearchParams({
    ano: ano.toString(),
    mes: mes.toString(),
    isAdmin: isAdmin.toString(),
  });
  if (!isAdmin && codCliente) params.append('codCliente', codCliente);
  if (isAdmin && clienteSelecionado)
    params.append('cliente', clienteSelecionado);
  const { data } = await axios.get(`/api/filtro/recurso?${params}`);
  if (!Array.isArray(data)) throw new Error('Resposta inesperada');
  return data;
};

const fetchStatus = async ({
  ano,
  mes,
  isAdmin,
  codCliente,
  clienteSelecionado,
  recursoSelecionado,
}: any) => {
  const params = new URLSearchParams({
    ano: ano.toString(),
    mes: mes.toString(),
    isAdmin: isAdmin.toString(),
  });
  if (!isAdmin && codCliente) params.append('codCliente', codCliente);
  if (isAdmin && clienteSelecionado)
    params.append('cliente', clienteSelecionado);
  if (recursoSelecionado) params.append('recurso', recursoSelecionado);
  const { data } = await axios.get(`/api/filtro/status?${params}`);
  if (!Array.isArray(data)) throw new Error('Resposta inesperada');
  return data;
};

export default function Filtros({ onFiltersChange }: FiltersProps) {
  const hoje = new Date();
  const { filters, setFilters } = useFilters();
  const { isAdmin, codCliente } = useAuth();

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

  const [debouncedAno] = useDebounce(ano, 300);
  const [debouncedMes] = useDebounce(mes, 300);
  const [debouncedClienteSelecionado] = useDebounce(clienteSelecionado, 300);
  const [debouncedRecursoSelecionado] = useDebounce(recursoSelecionado, 300);
  const [debouncedStatusSelecionado] = useDebounce(statusSelecionado, 300);

  // CLIENTES
  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes', ano, mes, isAdmin, codCliente],
    queryFn: () => fetchClientes({ ano, mes, isAdmin, codCliente }),
    enabled: !!ano && !!mes,
  });

  useEffect(() => {
    setClienteSelecionado('');
    setRecursoSelecionado('');
    setStatusSelecionado('');
  }, [clientes]);

  // RECURSOS
  const { data: recursos = [], isLoading: loadingRecursos } = useQuery({
    queryKey: ['recursos', ano, mes, isAdmin, codCliente, clienteSelecionado],
    queryFn: () =>
      fetchRecursos({ ano, mes, isAdmin, codCliente, clienteSelecionado }),
    enabled: !!ano && !!mes && (!!isAdmin || !!codCliente),
  });

  useEffect(() => {
    setRecursoSelecionado('');
    setStatusSelecionado('');
  }, [recursos]);

  // STATUS
  const { data: statusList = [], isLoading: loadingStatus } = useQuery({
    queryKey: [
      'status',
      ano,
      mes,
      isAdmin,
      codCliente,
      clienteSelecionado,
      recursoSelecionado,
    ],
    queryFn: () =>
      fetchStatus({
        ano,
        mes,
        isAdmin,
        codCliente,
        clienteSelecionado,
        recursoSelecionado,
      }),
    enabled: !!ano && !!mes && (!!isAdmin || !!codCliente),
  });

  useEffect(() => {
    setStatusSelecionado('');
  }, [statusList]);

  // Atualiza contexto e callback externo
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
              disabled={!!codCliente}
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
