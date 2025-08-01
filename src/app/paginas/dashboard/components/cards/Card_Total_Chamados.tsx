'use client';

import { useAuth } from '@/contexts/Auth_Context';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircleX } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../../../../components/ui/card';

interface FilterProps {
  filters: {
    ano: number;
    mes: number;
    cliente: string;
    recurso: string;
    status: string;
  };
}

interface ApiResponseProps {
  totalChamados: number;
}

export default function CardTotalChamados({ filters }: FilterProps) {
  const { isAdmin, codCliente } = useAuth();

  const fetchData = async (): Promise<ApiResponseProps> => {
    const params = new URLSearchParams();
    params.append('mes', filters.mes.toString());
    params.append('ano', filters.ano.toString());
    params.append('isAdmin', isAdmin.toString());

    if (!isAdmin && codCliente) {
      params.append('codCliente', codCliente);
    }

    if (filters.cliente) params.append('cliente', filters.cliente);
    if (filters.recurso) params.append('recurso', filters.recurso);
    if (filters.status) params.append('status', filters.status);

    const res = await axios.get<ApiResponseProps>(
      `/api/postgre-SQL/apontamentos-view/metricas/total_chamados?${params.toString()}`
    );
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['totalChamados', filters, isAdmin, codCliente],
    queryFn: fetchData,
    enabled: !!filters && (isAdmin || codCliente !== null),
  });

  if (isLoading) {
    return (
      <div className="relative h-48 overflow-hidden rounded-xl border-2 border-dashed border-gray-400 bg-gray-200">
        <div className="flex h-full items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="relative mx-auto h-12 w-12">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-purple-600 border-r-purple-600" />
              <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-l-blue-600 [animation-direction:reverse] [animation-duration:1.5s]" />
              <div className="absolute inset-4 animate-spin rounded-full border-2 border-transparent border-t-purple-600 border-r-purple-600" />
            </div>
            <p className="text-md font-semibold text-black">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="relative h-48 overflow-hidden rounded-xl border-2 border-dashed border-red-300 bg-red-100">
        <div className="flex h-full items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex items-center justify-center">
              <CircleX className="h-12 w-12 text-red-500" />
            </div>

            <p className="text-md font-semibold text-red-500">
              Erro ao tentar carregar os dados
            </p>

            <p className="text-sm font-semibold text-red-500">
              Verifique sua conexão e tente novamente mais tarde
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="group relative h-60 overflow-hidden rounded-lg border border-gray-300 p-6 shadow-md shadow-black">
      <CardHeader className="flex h-full flex-col items-center justify-center space-y-2 text-center">
        {/* HEADER */}
        <CardTitle className="text-xl font-extrabold tracking-wider text-black italic">
          Total Chamados
        </CardTitle>
        {/* TOTAL CHAMADOS */}
        <div className="text-7xl font-extrabold tracking-wider text-black">
          {data.totalChamados.toLocaleString('pt-BR')}
        </div>
      </CardHeader>
    </Card>
  );
}
