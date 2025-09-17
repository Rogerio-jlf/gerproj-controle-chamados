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

// Função para mapear status para classes de estilo
export const getStylesStatus = (status: string | undefined) => {
   switch (status?.toUpperCase()) {
      case 'NAO FINALIZADO':
         return 'bg-yellow-600 text-white italic';

      case 'EM ATENDIMENTO':
         return 'bg-blue-600 text-white italic';

      case 'FINALIZADO':
         return 'bg-green-600 text-white italic';

      case 'NAO INICIADO':
         return 'bg-red-600 text-white italic';

      case 'STANDBY':
         return 'bg-orange-600 text-white';

      case 'ATRIBUIDO':
         return 'bg-teal-600 text-white italic';

      case 'AGUARDANDO VALIDACAO':
         return 'bg-purple-600 text-white italic';

      default:
         return 'bg-gray-600 text-white italic';
   }
};

// Função auxiliar para normalizar datas para busca
export const normalizeDate = (dateValue: any): string[] => {
   if (!dateValue) return [];

   const formats: string[] = [];
   let date: Date | null = null;

   // Tentar criar objeto Date a partir do valor
   if (dateValue instanceof Date) {
      date = dateValue;
   } else if (typeof dateValue === 'string') {
      // Se é uma string ISO do banco (2025-08-08T00:00:00.000Z)
      if (dateValue.includes('T') || dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
         date = new Date(dateValue);
      }
      // Se é uma string no formato brasileiro dd/mm/yyyy
      else if (dateValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
         const [day, month, year] = dateValue.split('/');
         date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
   }

   // Se conseguiu criar o objeto Date, gerar todos os formatos
   if (date && !isNaN(date.getTime())) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      // Formatos com zeros à esquerda
      const dayStr = day.toString().padStart(2, '0');
      const monthStr = month.toString().padStart(2, '0');

      // Adicionar todos os formatos possíveis
      formats.push(`${dayStr}/${monthStr}/${year}`); // 08/08/2025
      formats.push(`${day}/${month}/${year}`); // 8/8/2025
      formats.push(`${year}-${monthStr}-${dayStr}`); // 2025-08-08
      formats.push(`${year}/${monthStr}/${dayStr}`); // 2025/08/08
      formats.push(`${dayStr}-${monthStr}-${year}`); // 08-08-2025

      // Adicionar também partes individuais para busca parcial
      formats.push(dayStr); // 08
      formats.push(monthStr); // 08
      formats.push(year.toString()); // 2025
      formats.push(`${monthStr}/${year}`); // 08/2025
      formats.push(`${dayStr}/${monthStr}`); // 08/08
   }

   // Se é uma string, adicionar também como está
   const originalStr = String(dateValue);
   formats.push(originalStr);

   return [...new Set(formats)]; // Remove duplicatas
};
