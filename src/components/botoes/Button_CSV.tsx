'use client';

import { useState } from 'react';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
import { FaFileCsv } from 'react-icons/fa6';

interface CSVButtonProps<T> {
   data: T[];
   fileName: string;
   buttonText?: string;
   className?: string;
   columns?: {
      key: keyof T | string;
      label: string;
   }[];
   separator?: string;
   includeHeaders?: boolean;
   encoding?: 'utf-8' | 'utf-8-bom' | 'latin1';
}

export default function CSVButton<T extends Record<string, any>>({
   data,
   fileName,
   buttonText,
   className = '',
   columns,
   separator = ',',
   includeHeaders = true,
   encoding = 'utf-8-bom',
}: CSVButtonProps<T>) {
   const [isExporting, setIsExporting] = useState(false);

   const escapeCSVValue = (value: any): string => {
      if (value === null || value === undefined) {
         return '';
      }

      const stringValue = value.toString();

      // Verifica se precisa de escape (contém separador, aspas, quebra de linha)
      if (
         stringValue.includes(separator) ||
         stringValue.includes('"') ||
         stringValue.includes('\n') ||
         stringValue.includes('\r')
      ) {
         // Escapa aspas duplas duplicando-as e envolve em aspas
         return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
   };

   const exportToCSV = () => {
      if (data.length === 0) {
         console.warn('Nenhum dado disponível para exportação');
         return;
      }

      try {
         setIsExporting(true);

         // Define os cabeçalhos
         let headers: string[] = [];
         if (includeHeaders) {
            headers = columns
               ? columns.map(col => col.label)
               : Object.keys(data[0]);
         }

         // Cria as linhas de dados
         const rows = data.map(item => {
            let values: any[] = [];

            if (columns) {
               // Usa as colunas especificadas
               values = columns.map(col => {
                  // Suporta chaves aninhadas (ex: 'user.name')
                  if (typeof col.key === 'string' && col.key.includes('.')) {
                     const keys = col.key.split('.');
                     let value: any = item;
                     for (const key of keys) {
                        value = value?.[key];
                     }
                     return value;
                  }
                  return item[col.key];
               });
            } else {
               // Usa todas as chaves do objeto
               values = Object.values(item);
            }

            return values.map(escapeCSVValue).join(separator);
         });

         // Monta o conteúdo CSV
         const csvRows = includeHeaders
            ? [headers.map(escapeCSVValue).join(separator), ...rows]
            : rows;

         const csvContent = csvRows.join('\n');

         // Define o encoding apropriado
         let blobContent = csvContent;
         let mimeType = 'text/csv;charset=utf-8;';

         if (encoding === 'utf-8-bom') {
            // Adiciona BOM (Byte Order Mark) para melhor compatibilidade com Excel
            blobContent = '\ufeff' + csvContent;
         } else if (encoding === 'latin1') {
            mimeType = 'text/csv;charset=iso-8859-1;';
         }

         // Cria o blob e faz o download
         const blob = new Blob([blobContent], { type: mimeType });
         const link = document.createElement('a');
         const url = URL.createObjectURL(blob);

         // Sanitiza o nome do arquivo
         const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
         const finalFileName = sanitizedFileName.endsWith('.csv')
            ? sanitizedFileName
            : `${sanitizedFileName}.csv`;

         link.setAttribute('href', url);
         link.setAttribute('download', finalFileName);
         link.style.visibility = 'hidden';
         document.body.appendChild(link);
         link.click();

         // Cleanup
         setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
         }, 100);

         console.log(`✅ CSV exportado com sucesso: ${finalFileName}`);
      } catch (error) {
         console.error('Erro ao exportar CSV:', error);
         alert('Erro ao gerar arquivo CSV. Tente novamente.');
      } finally {
         setIsExporting(false);
      }
   };

   // Não renderiza o botão se não houver dados
   if (!data || data.length === 0) {
      return null;
   }

   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <button
               onClick={exportToCSV}
               disabled={isExporting}
               className={`group flex cursor-pointer items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wider text-white transition-all select-none hover:scale-105 hover:bg-white/20 active:scale-95 ${className}`}
            >
               <FaFileCsv className="text-white" size={16} />
               {buttonText}
            </button>
         </TooltipTrigger>
         <TooltipContent
            side="top"
            align="center"
            sideOffset={8}
            className="border-t-4 border-green-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
         >
            Exportar CSV
         </TooltipContent>
      </Tooltip>
   );
}
