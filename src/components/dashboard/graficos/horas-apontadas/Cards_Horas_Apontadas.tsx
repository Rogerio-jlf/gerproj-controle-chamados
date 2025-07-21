'use client';

import { useAuth } from '@/context/AuthContext';
import { formatHorasDecimalParaHHMM } from '@/functions/formatarHoras';
import { BarChart3, Calendar, Clock, TrendingUp } from 'lucide-react';

interface MetricasProps {
  totalHoras: number;
  mediaHoras: number;
  mesesComDados: number;
  loading?: boolean;
}

export default function MetricasHorasApontadas({
  totalHoras,
  mediaHoras,
  mesesComDados,
  loading = false,
}: MetricasProps) {
  const metricas = [
    {
      titulo: 'Total de Horas',
      valor: `${formatHorasDecimalParaHHMM(totalHoras)}`,
      descricao: 'Total horas executadas',
      icone: Clock,
      bgColor: 'from-blue-100 to-indigo-100',
      iconColor: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      valueColor: 'text-blue-800',
    },
    {
      titulo: 'Meses Ativos',
      valor: mesesComDados.toString(),
      descricao: 'Total meses apontados',
      icone: Calendar,
      bgColor: 'from-purple-100 to-pink-100',
      iconColor: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      valueColor: 'text-purple-800',
    },
    {
      titulo: 'Média Mensal',
      valor: `${formatHorasDecimalParaHHMM(mediaHoras)}`,
      descricao: 'Total média horas mês',
      icone: TrendingUp,
      bgColor: 'from-emerald-100 to-teal-100',
      iconColor: 'from-emerald-500 to-teal-600',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-600',
      valueColor: 'text-emerald-800',
    },
  ];

  const { isAdmin } = useAuth();

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>

          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-indigo-800 to-purple-800">
              Horas apontadas
            </h2>
            <p className="text-xs lg:text-sm text-gray-500 font-medium">
              Distribuição de horas apontadas no ano
            </p>
          </div>
        </div>

        {/* Badge de status */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-2 lg:px-4 rounded-full border border-emerald-200">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-emerald-700 font-semibold text-xs lg:text-sm">
            {isAdmin ? 'Administrador' : ''}
          </span>
        </div>
      </div>

      {/* Cards das métricas */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-3 bg-blue-200 rounded mb-1"></div>
                  <div className="h-5 bg-blue-200 rounded"></div>
                  <span className="mt-1">Carregando...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4">
          {metricas.map((metrica, index) => {
            const IconeComponent = metrica.icone;

            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${metrica.bgColor} rounded-xl border ${metrica.borderColor} shadow-sm p-4`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 bg-gradient-to-br ${metrica.iconColor} rounded-lg flex items-center justify-center`}
                  >
                    <IconeComponent className="w-4 h-4 text-white" />
                  </div>

                  <div>
                    <p className={`text-xs font-medium ${metrica.textColor}`}>
                      {metrica.descricao}
                    </p>
                    <p className={`text-xl font-bold ${metrica.valueColor}`}>
                      {metrica.valor}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
