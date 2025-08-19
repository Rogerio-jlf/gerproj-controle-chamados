'use client';
import React from 'react';
import PerformanceTableColumns from './Colunas_Tabela';

interface RecursoProps {
  nome: string;
  percentualAtingido: number;
  percentualEficiencia: number;
  percentualUtilizacao: number;
  nivelPerformance: number;
  horasFaturadas: number;
  horasNaoFaturadas: number;
}

interface TabelaProps {
  dadosProcessados: RecursoProps[];
}

export default function TabelaRecursos(props: TabelaProps) {
  const { dadosProcessados } = props;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white p-6 shadow-md shadow-black">
      <table className="min-w-full table-auto border-collapse text-left text-lg font-semibold tracking-wider text-slate-800 select-none">
        <PerformanceTableColumns dadosProcessados={dadosProcessados} />
      </table>
    </div>
  );
}
