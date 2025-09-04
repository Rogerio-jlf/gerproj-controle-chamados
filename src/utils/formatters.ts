// Função para converter data ISO ou outros formatos para dd/mm/yyyy
export const formatarDataParaBR = (
  dateString: string | null | undefined
): string => {
  if (!dateString) {
    return '-';
  }

  try {
    // Se já está no formato dd/mm/yyyy, retorna como está
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    // Se está no formato ISO (yyyy-mm-dd ou yyyy-mm-ddT...)
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('T')[0].split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }

    // Se não conseguir converter, retorna o valor original
    return dateString;
  } catch (error) {
    // Em caso de erro, retorna o valor original
    return dateString;
  }
};
// ====================================================================================================

// Função para converter horas de HHMM para HH:MM
export const formatarHora = (timeString: string | null | undefined): string => {
  if (!timeString || !/^\d{4}$/.test(timeString.trim())) {
    return '-';
  }

  const cleanTime = timeString.trim();
  const hours = parseInt(cleanTime.substring(0, 2), 10);
  const minutes = parseInt(cleanTime.substring(2, 4), 10);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
// ====================================================================================================

// Função para converter decimal para HH:MM (já existe, mas mantendo consistência)
export const formatarDecimalParaTempo = (
  decimalHours: number | null | undefined
): string => {
  if (!decimalHours && decimalHours !== 0) return '-';

  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
// ====================================================================================================

// Função para remover acentos de uma string
export const removerAcentos = (texto: string): string => {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
// ====================================================================================================
