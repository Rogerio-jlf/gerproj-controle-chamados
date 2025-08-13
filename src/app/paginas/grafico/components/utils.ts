export const formatarNumero = (numero: number, decimais: number = 1): number =>
  Number(Number.isFinite(numero) ? numero.toFixed(decimais) : 0);

export const calcularStatus = (
  percentualAtingido: number,
  percentualEficiencia: number
) => {
  console.log(
    `Status calc: ${percentualAtingido}% atingido, ${percentualEficiencia}% eficiência`
  );
  if (percentualAtingido >= 100 && percentualEficiencia >= 80) {
    return {
      nivelPerformance: 5,
      statusCor: '#10b981',
      statusTexto: 'Excelente',
    };
  } else if (percentualAtingido >= 90 && percentualEficiencia >= 70) {
    return {
      nivelPerformance: 4,
      statusCor: '#059669',
      statusTexto: 'Muito Bom',
    };
  } else if (percentualAtingido >= 80 && percentualEficiencia >= 60) {
    return {
      nivelPerformance: 3,
      statusCor: '#f59e0b',
      statusTexto: 'Bom',
    };
  } else if (percentualAtingido >= 60) {
    return {
      nivelPerformance: 2,
      statusCor: '#f97316',
      statusTexto: 'Regular',
    };
  } else {
    return {
      nivelPerformance: 1,
      statusCor: '#ef4444',
      statusTexto: 'Ruim',
    };
  }
};
