'use client';
import React from 'react';
import KPICard from './Cards';
import { DollarSign } from 'lucide-react';

const Financeiro: React.FC<{ metricas: any; dados: any }> = ({
  metricas,
  dados,
}) => {
  return (
    <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-xl backdrop-blur-lg">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Resumo Financeiro
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          icon={<DollarSign className="h-6 w-6 text-white" />}
          title="Custo Médio por Recurso"
          value={`R$ ${metricas.custoMedio?.toFixed?.(2) ?? '0.00'}`}
          color="bg-gradient-to-r from-yellow-500 to-amber-600"
        />
        <KPICard
          icon={<DollarSign className="h-6 w-6 text-white" />}
          title="Total de Custos"
          value={`R$ ${dados.valor_total_custos_mes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="bg-gradient-to-r from-emerald-500 to-teal-600"
        />
        <KPICard
          icon={<DollarSign className="h-6 w-6 text-white" />}
          title="Despesas Rateadas"
          value={`R$ ${dados.valor_total_despesas_rateadas_recursos_mes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="bg-gradient-to-r from-pink-500 to-fuchsia-600"
        />
      </div>
    </div>
  );
};

export default Financeiro;
