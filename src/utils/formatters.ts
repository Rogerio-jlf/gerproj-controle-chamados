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

export const formatarDataHoraParaBR = (
   dateString: string | null | undefined,
   incluirSegundos: boolean = false
): string => {
   if (!dateString) {
      return '-';
   }

   try {
      // Cria objeto Date a partir da string
      const date = new Date(dateString);

      // Verifica se é uma data válida
      if (isNaN(date.getTime())) {
         return dateString;
      }

      // Formata a data
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();

      // Formata a hora
      const horas = String(date.getHours()).padStart(2, '0');
      const minutos = String(date.getMinutes()).padStart(2, '0');
      const segundos = String(date.getSeconds()).padStart(2, '0');

      // Retorna com ou sem segundos
      if (incluirSegundos) {
         return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
      }

      return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
   } catch (error) {
      console.error('Erro ao formatar data/hora:', error);
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
         return 'bg-red-500 text-black italic hover:scale';

      case 'EM ATENDIMENTO':
         return 'bg-blue-500 text-black italic';

      case 'FINALIZADO':
         return 'bg-green-500 text-black italic';

      case 'NAO INICIADO':
         return 'bg-yellow-500 text-black italic';

      case 'STANDBY':
         return 'bg-orange-500 text-black';

      case 'ATRIBUIDO':
         return 'bg-teal-500 text-black italic';

      case 'AGUARDANDO VALIDACAO':
         return 'bg-purple-500 text-black italic';

      default:
         return 'bg-gray-500 text-black italic';
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

export const formatCodChamado = (num: number | null | undefined) => {
   if (num == null) return ''; // Trata null E undefined
   const str = num.toString();
   if (str.length <= 2) return str;
   return str.slice(0, 2) + '.' + str.slice(2);
};

export const formatCodOS = (string: string | null | undefined) => {
   if (string == null) return ''; // Trata null E undefined
   const str = string.toString();
   if (str.length <= 2) return str;
   return str.slice(0, 2) + '.' + str.slice(2);
};

// ====================================================================================================

export const formatarCodNumber = (num: number | null | undefined): string => {
   if (num == null) return '';
   // Intl já usa o separador de milhares adequado para 'de-DE' (ponto)
   return new Intl.NumberFormat('de-DE').format(num);
};

export const formatarCodString = (value: string | null | undefined): string => {
   if (!value) return '';

   // Remove tudo que não for dígito
   const onlyDigits = value.replace(/\D/g, '');
   if (!onlyDigits) return '';

   // Converte para número e formata
   return new Intl.NumberFormat('de-DE').format(Number(onlyDigits));
};

export const formatarHorasTotaisHorasDecimais = (
   value: string | number | null | undefined
): string => {
   if (value == null) return '-';

   let hours = 0;
   let minutes = 0;

   if (typeof value === 'number') {
      // Caso seja decimal -> ex: 12.5 = 12h30
      hours = Math.floor(value);
      minutes = Math.round((value - hours) * 60);
   } else if (typeof value === 'string') {
      // Caso seja string "HH:MM"
      const [hStr, mStr] = value.split(':');
      hours = parseInt(hStr, 10) || 0;
      minutes = parseInt(mStr, 10) || 0;
   }

   // Formata horas com separador de milhar
   const hoursFormatted = new Intl.NumberFormat('de-DE').format(hours);
   // Garante minutos sempre com 2 dígitos
   const minutesFormatted = minutes.toString().padStart(2, '0');

   return `${hoursFormatted}:${minutesFormatted}`;
};
