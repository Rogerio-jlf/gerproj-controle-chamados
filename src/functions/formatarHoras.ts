export function formatHorasDecimalParaHHMM(decimal: number): string {
  const horas = Math.floor(decimal);
  const minutos = Math.round((decimal - horas) * 60);

  const horasFormatadas = String(horas).padStart(2, '0');
  const minutosFormatados = String(minutos).padStart(2, '0');

  return `${horasFormatadas}h:${minutosFormatados}`;
}
