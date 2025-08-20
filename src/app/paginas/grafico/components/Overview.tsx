import React from 'react';
import Grafico from './Grafico';
import Clientes from './Clientes';

interface Props {
  mes: number;
  ano: number;
  // Props específicas para o componente gráfico
  dadosNumericosAPI?: any;
  dados?: any;
  dadosProcessados?: any[];
  chunks: any[];
  totalRecursos: number;
}

export default function Dashboard({
  mes,
  ano,
  dadosNumericosAPI,
  dados,
  dadosProcessados,
  chunks,
  totalRecursos,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-8">
      {/* ===== GRÁFICO COMPONENT ===== */}
      <section className="w-full">
        <Grafico
          mes={mes}
          ano={ano}
          dadosNumericosAPI={dadosNumericosAPI}
          dados={dados}
          dadosProcessados={dadosProcessados}
          chunks={chunks}
          totalRecursos={totalRecursos}
        />
      </section>
      {/* ========== */}

      {/* ===== CLIENTES COMPONENT ===== */}
      <section className="w-full">
        <Clientes mes={mes} ano={ano} />
      </section>
      {/* ========== */}
    </div>
  );
}
