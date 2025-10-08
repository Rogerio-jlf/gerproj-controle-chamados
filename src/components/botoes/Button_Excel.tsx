'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
import { RiFileExcel2Fill } from 'react-icons/ri';
import { formatarHora, formatCodChamado } from '../../utils/formatters';

// ================================================================================
// TIPOS E INTERFACES
// ================================================================================
interface DetalheOS {
   codOs: number;
   data: string;
   chamado: string;
   horaInicio: string;
   horaFim: string;
   horas: number;
   faturado: string;
   validado: string;
   competencia: string;
   cliente?: string;
   codCliente?: number;
   recurso?: string;
   codRecurso?: number;
   projeto?: string;
   codProjeto?: number;
   tarefa?: string;
   codTarefa?: number;
}

interface GrupoRelatorio {
   chave: string;
   nome: string;
   totalHoras: number;
   quantidadeOS: number;
   osFaturadas: number;
   osValidadas: number;
   detalhes: DetalheOS[];
   codCliente?: number;
   codRecurso?: number;
   codProjeto?: number;
   codTarefa?: number;
}

interface FiltrosRelatorio {
   dataInicio?: string;
   dataFim?: string;
   mes?: string;
   ano?: string;
   faturado?: string;
   validado?: string;
   cliente?: string;
   recurso?: string;
   projeto?: string;
}

interface ExcelButtonRelatorioOSProps {
   grupo: GrupoRelatorio;
   tipoAgrupamento: string;
   filtros?: FiltrosRelatorio;
   buttonText?: string;
   className?: string;
}

// ================================================================================
// FUNÇÕES AUXILIARES
// ================================================================================
function formatarDecimalParaTempo(decimal: number | null): string {
   if (decimal === null || isNaN(decimal)) return '--:--';
   const horas = Math.floor(decimal);
   const minutos = Math.round((decimal - horas) * 60);
   return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

function formatarDataParaBR(data: string | null): string {
   if (!data) return '----------';
   try {
      const date = new Date(data);
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const ano = date.getFullYear();
      return `${dia}/${mes}/${ano}`;
   } catch {
      return '----------';
   }
}

function getTipoAgrupamentoLabel(tipo: string): string {
   const labels: { [key: string]: string } = {
      cliente: 'Cliente',
      recurso: 'Recurso',
      projeto: 'Projeto',
      tarefa: 'Tarefa',
      mes: 'Mês',
      'cliente-recurso': 'Cliente + Recurso',
   };
   return labels[tipo] || tipo;
}

// ================================================================================
// COMPONENTE
// ================================================================================
export default function ExcelButtonRelatorioOS({
   grupo,
   tipoAgrupamento,
   filtros,
   buttonText = '',
   className = '',
}: ExcelButtonRelatorioOSProps) {
   const exportToExcel = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Relatório');

      let currentRow = 1;

      // ================================================================================
      // CABEÇALHO DO RELATÓRIO
      // ================================================================================
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
      const titleCell = worksheet.getCell(`A${currentRow}`);
      titleCell.value = 'RELATÓRIO DE ORDENS DE SERVIÇO';
      titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = {
         type: 'pattern',
         pattern: 'solid',
         fgColor: { argb: 'FF0F766E' },
      };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(currentRow).height = 30;
      currentRow++;

      // Data de geração
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
      const dateCell = worksheet.getCell(`A${currentRow}`);
      dateCell.value = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
      dateCell.font = { italic: true, size: 10 };
      dateCell.alignment = { horizontal: 'center' };
      currentRow++;

      currentRow++;

      // ================================================================================
      // FILTROS APLICADOS
      // ================================================================================
      if (filtros && Object.keys(filtros).length > 0) {
         worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
         const filtrosTitleCell = worksheet.getCell(`A${currentRow}`);
         filtrosTitleCell.value = 'FILTROS APLICADOS';
         filtrosTitleCell.font = {
            bold: true,
            size: 12,
            color: { argb: 'FFFFFFFF' },
         };
         filtrosTitleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF6B7280' },
         };
         filtrosTitleCell.alignment = { horizontal: 'center' };
         currentRow++;

         // Período por Data Início/Fim
         if (filtros.dataInicio || filtros.dataFim) {
            worksheet.getCell(`A${currentRow}`).value = 'Período:';
            worksheet.getCell(`A${currentRow}`).font = { bold: true };

            const periodoTexto = [];
            if (filtros.dataInicio)
               periodoTexto.push(
                  `De: ${formatarDataParaBR(filtros.dataInicio)}`
               );
            if (filtros.dataFim)
               periodoTexto.push(`Até: ${formatarDataParaBR(filtros.dataFim)}`);

            worksheet.getCell(`B${currentRow}`).value =
               periodoTexto.join(' | ');
            worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
            currentRow++;
         }

         // Período por Mês/Ano
         if (filtros.mes || filtros.ano) {
            worksheet.getCell(`A${currentRow}`).value = 'Mês/Ano:';
            worksheet.getCell(`A${currentRow}`).font = { bold: true };

            const mesNome = filtros.mes
               ? [
                    '',
                    'Janeiro',
                    'Fevereiro',
                    'Março',
                    'Abril',
                    'Maio',
                    'Junho',
                    'Julho',
                    'Agosto',
                    'Setembro',
                    'Outubro',
                    'Novembro',
                    'Dezembro',
                 ][parseInt(filtros.mes)]
               : '';

            worksheet.getCell(`B${currentRow}`).value =
               `${mesNome}${filtros.ano ? '/' + filtros.ano : ''}`;
            worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
            currentRow++;
         }

         // Filtro Faturado
         if (filtros.faturado && filtros.faturado !== 'todos') {
            worksheet.getCell(`A${currentRow}`).value = 'Faturado:';
            worksheet.getCell(`A${currentRow}`).font = { bold: true };
            worksheet.getCell(`B${currentRow}`).value =
               filtros.faturado === 'sim' ? 'Sim' : 'Não';
            worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
            currentRow++;
         }

         // Filtro Validado
         if (filtros.validado && filtros.validado !== 'todos') {
            worksheet.getCell(`A${currentRow}`).value = 'Validado:';
            worksheet.getCell(`A${currentRow}`).font = { bold: true };
            worksheet.getCell(`B${currentRow}`).value =
               filtros.validado === 'sim' ? 'Sim' : 'Não';
            worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
            currentRow++;
         }

         // Filtro Cliente
         if (filtros.cliente) {
            worksheet.getCell(`A${currentRow}`).value = 'Cliente:';
            worksheet.getCell(`A${currentRow}`).font = { bold: true };
            worksheet.getCell(`B${currentRow}`).value = filtros.cliente;
            worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
            currentRow++;
         }

         // Filtro Recurso
         if (filtros.recurso) {
            worksheet.getCell(`A${currentRow}`).value = 'Recurso:';
            worksheet.getCell(`A${currentRow}`).font = { bold: true };
            worksheet.getCell(`B${currentRow}`).value = filtros.recurso;
            worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
            currentRow++;
         }

         // Filtro Projeto
         if (filtros.projeto) {
            worksheet.getCell(`A${currentRow}`).value = 'Projeto:';
            worksheet.getCell(`A${currentRow}`).font = { bold: true };
            worksheet.getCell(`B${currentRow}`).value = filtros.projeto;
            worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
            currentRow++;
         }

         currentRow++;
      }

      // ================================================================================
      // INFORMAÇÕES DO GRUPO
      // ================================================================================
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
      const infoTitleCell = worksheet.getCell(`A${currentRow}`);
      infoTitleCell.value = 'INFORMAÇÕES DO GRUPO';
      infoTitleCell.font = {
         bold: true,
         size: 12,
         color: { argb: 'FFFFFFFF' },
      };
      infoTitleCell.fill = {
         type: 'pattern',
         pattern: 'solid',
         fgColor: { argb: 'FF6B7280' },
      };
      infoTitleCell.alignment = { horizontal: 'center' };
      currentRow++;

      // Nome do grupo
      worksheet.getCell(`A${currentRow}`).value =
         `${getTipoAgrupamentoLabel(tipoAgrupamento)}:`;
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      worksheet.getCell(`B${currentRow}`).value = grupo.nome;
      worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
      currentRow++;

      currentRow++;

      // ================================================================================
      // TOTALIZADORES DO GRUPO
      // ================================================================================
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
      const totTitleCell = worksheet.getCell(`A${currentRow}`);
      totTitleCell.value = 'TOTALIZADORES';
      totTitleCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      totTitleCell.fill = {
         type: 'pattern',
         pattern: 'solid',
         fgColor: { argb: 'FF6B7280' },
      };
      totTitleCell.alignment = { horizontal: 'center' };
      currentRow++;

      const totHeaders = [
         'Total de Horas',
         'Total de OS',
         'OS Faturadas',
         'OS Validadas',
      ];
      const totValues = [
         formatarDecimalParaTempo(grupo.totalHoras),
         grupo.quantidadeOS.toString(),
         grupo.osFaturadas.toString(),
         grupo.osValidadas.toString(),
      ];

      const totColors = ['FF14B8A6', 'FFA855F7', 'FF3B82F6', 'FF22C55E'];

      for (let i = 0; i < totHeaders.length; i++) {
         const colStart = String.fromCharCode(65 + i * 2.5);
         const colEnd = String.fromCharCode(65 + i * 2.5 + 1);

         worksheet.mergeCells(
            `${colStart}${currentRow}:${colEnd}${currentRow}`
         );
         const headerCell = worksheet.getCell(`${colStart}${currentRow}`);
         headerCell.value = totHeaders[i];
         headerCell.font = {
            bold: true,
            size: 10,
            color: { argb: 'FFFFFFFF' },
         };
         headerCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: totColors[i] },
         };
         headerCell.alignment = { horizontal: 'center' };
         headerCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
         };
      }
      currentRow++;

      for (let i = 0; i < totValues.length; i++) {
         const colStart = String.fromCharCode(65 + i * 2.5);
         const colEnd = String.fromCharCode(65 + i * 2.5 + 1);

         worksheet.mergeCells(
            `${colStart}${currentRow}:${colEnd}${currentRow}`
         );
         const valueCell = worksheet.getCell(`${colStart}${currentRow}`);
         valueCell.value = totValues[i];
         valueCell.font = { bold: true, size: 12 };
         valueCell.alignment = { horizontal: 'center' };
         valueCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
         };
      }
      currentRow++;

      currentRow += 2;

      // ================================================================================
      // CABEÇALHOS DAS COLUNAS
      // ================================================================================
      const headers = [
         'OS',
         'Data',
         'Chamado',
         'Hora Início',
         'Hora Fim',
         'Horas',
         'Cliente',
         'Recurso',
         'Faturado',
         'Validado',
      ];

      headers.forEach((header, index) => {
         const cell = worksheet.getCell(currentRow, index + 1);
         cell.value = header;
         cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
         cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0F766E' },
         };
         cell.alignment = { horizontal: 'center' };
         cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
         };
      });
      currentRow++;

      // ================================================================================
      // DETALHES
      // ================================================================================
      grupo.detalhes.forEach(detalhe => {
         const rowData = [
            formatCodChamado(detalhe.codOs) || '-----',
            formatarDataParaBR(detalhe.data) || '--------',
            formatCodChamado(Number(detalhe.chamado)) || '-----',
            formatarHora(detalhe.horaInicio) || '----',
            formatarHora(detalhe.horaFim) || '----',
            formatarDecimalParaTempo(detalhe.horas) || '----',
            detalhe.cliente || '----------',
            detalhe.recurso || '----------',
            detalhe.faturado || '---',
            detalhe.validado || '---',
         ];

         rowData.forEach((value, colIndex) => {
            const cell = worksheet.getCell(currentRow, colIndex + 1);
            cell.value = value;
            cell.alignment = { horizontal: 'left' };
            cell.border = {
               top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            };

            // Colorir colunas Faturado e Validado
            if (colIndex === 8 || colIndex === 9) {
               cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
               cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: {
                     argb: value === 'SIM' ? 'FF3B82F6' : 'FFEF4444',
                  },
               };
               cell.alignment = { horizontal: 'center' };
            }
         });

         currentRow++;
      });

      // ================================================================================
      // CONFIGURAÇÕES FINAIS
      // ================================================================================
      worksheet.columns = [
         { width: 10 }, // OS
         { width: 12 }, // Data
         { width: 30 }, // Chamado
         { width: 12 }, // Hora Início
         { width: 12 }, // Hora Fim
         { width: 10 }, // Horas
         { width: 25 }, // Cliente
         { width: 25 }, // Recurso
         { width: 12 }, // Faturado
         { width: 12 }, // Validado
      ];

      // ================================================================================
      // SALVAR ARQUIVO
      // ================================================================================
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const timestamp = new Date().getTime();
      const nomeArquivo = `Relatorio_OS_${grupo.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;
      saveAs(blob, nomeArquivo);
   };

   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <button
               onClick={exportToExcel}
               className="group cursor-pointer rounded-md border-[1px] border-green-800 bg-green-700 p-2 shadow-md shadow-black transition-all hover:scale-125 active:scale-95"
            >
               <RiFileExcel2Fill className="text-white" size={20} />
               {buttonText}
            </button>
         </TooltipTrigger>
         <TooltipContent
            side="left"
            align="start"
            sideOffset={8}
            className="border-t-8 border-green-600 bg-white text-sm font-bold tracking-widest text-black italic shadow-lg shadow-black select-none"
         >
            Exportar Excel
         </TooltipContent>
      </Tooltip>
   );
}
