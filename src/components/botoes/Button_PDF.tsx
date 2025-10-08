'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
import { FaFilePdf } from 'react-icons/fa';

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

interface PDFButtonRelatorioOSProps {
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

function getNomeMes(mes: string): string {
   const meses = [
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
   ];
   return meses[parseInt(mes)] || '';
}

// ================================================================================
// COMPONENTE
// ================================================================================
export default function PDFButtonRelatorioOS({
   grupo,
   tipoAgrupamento,
   filtros,
   buttonText = '',
   className = '',
}: PDFButtonRelatorioOSProps) {
   const exportToPDF = () => {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape

      let yPosition = 15;

      // ================================================================================
      // CABEÇALHO
      // ================================================================================
      doc.setFillColor(15, 118, 110); // Teal
      doc.rect(0, 0, 297, 25, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE ORDENS DE SERVIÇO', 148.5, 12, {
         align: 'center',
      });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 148.5, 19, {
         align: 'center',
      });

      yPosition = 35;

      // ================================================================================
      // FILTROS APLICADOS
      // ================================================================================
      if (filtros && Object.keys(filtros).length > 0) {
         doc.setFillColor(107, 114, 128); // Gray
         doc.rect(15, yPosition, 267, 8, 'F');

         doc.setTextColor(255, 255, 255);
         doc.setFontSize(11);
         doc.setFont('helvetica', 'bold');
         doc.text('FILTROS APLICADOS', 148.5, yPosition + 5.5, {
            align: 'center',
         });

         yPosition += 12;

         doc.setTextColor(0, 0, 0);
         doc.setFontSize(9);

         // Período por Data Início/Fim
         if (filtros.dataInicio || filtros.dataFim) {
            doc.setFont('helvetica', 'bold');
            doc.text('Período:', 20, yPosition);
            doc.setFont('helvetica', 'normal');

            const periodoTexto = [];
            if (filtros.dataInicio)
               periodoTexto.push(
                  `De: ${formatarDataParaBR(filtros.dataInicio)}`
               );
            if (filtros.dataFim)
               periodoTexto.push(`Até: ${formatarDataParaBR(filtros.dataFim)}`);

            doc.text(periodoTexto.join(' | '), 45, yPosition);
            yPosition += 6;
         }

         // Período por Mês/Ano
         if (filtros.mes || filtros.ano) {
            doc.setFont('helvetica', 'bold');
            doc.text('Mês/Ano:', 20, yPosition);
            doc.setFont('helvetica', 'normal');

            const mesNome = filtros.mes ? getNomeMes(filtros.mes) : '';
            doc.text(
               `${mesNome}${filtros.ano ? '/' + filtros.ano : ''}`,
               45,
               yPosition
            );
            yPosition += 6;
         }

         // Filtro Faturado
         if (filtros.faturado && filtros.faturado !== 'todos') {
            doc.setFont('helvetica', 'bold');
            doc.text('Faturado:', 20, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(filtros.faturado === 'sim' ? 'Sim' : 'Não', 45, yPosition);
            yPosition += 6;
         }

         // Filtro Validado
         if (filtros.validado && filtros.validado !== 'todos') {
            doc.setFont('helvetica', 'bold');
            doc.text('Validado:', 20, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(filtros.validado === 'sim' ? 'Sim' : 'Não', 45, yPosition);
            yPosition += 6;
         }

         // Filtro Cliente
         if (filtros.cliente) {
            doc.setFont('helvetica', 'bold');
            doc.text('Cliente:', 20, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(filtros.cliente, 45, yPosition);
            yPosition += 6;
         }

         // Filtro Recurso
         if (filtros.recurso) {
            doc.setFont('helvetica', 'bold');
            doc.text('Recurso:', 20, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(filtros.recurso, 45, yPosition);
            yPosition += 6;
         }

         // Filtro Projeto
         if (filtros.projeto) {
            doc.setFont('helvetica', 'bold');
            doc.text('Projeto:', 20, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(filtros.projeto, 45, yPosition);
            yPosition += 6;
         }

         yPosition += 4; // Espaçamento extra após filtros
      }

      // ================================================================================
      // INFORMAÇÕES DO GRUPO
      // ================================================================================
      doc.setFillColor(107, 114, 128); // Gray
      doc.rect(15, yPosition, 267, 8, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMAÇÕES DO GRUPO', 148.5, yPosition + 5.5, {
         align: 'center',
      });

      yPosition += 12;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${getTipoAgrupamentoLabel(tipoAgrupamento)}:`, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(grupo.nome, 60, yPosition);

      yPosition += 10;

      // ================================================================================
      // TOTALIZADORES
      // ================================================================================
      doc.setFillColor(107, 114, 128);
      doc.rect(15, yPosition, 267, 8, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTALIZADORES', 148.5, yPosition + 5.5, { align: 'center' });

      yPosition += 12;

      const totalizadores = [
         {
            label: 'Total de Horas',
            value: formatarDecimalParaTempo(grupo.totalHoras),
            color: [20, 184, 166],
         },
         {
            label: 'Total de OS',
            value: grupo.quantidadeOS.toString(),
            color: [168, 85, 247],
         },
         {
            label: 'OS Faturadas',
            value: grupo.osFaturadas.toString(),
            color: [59, 130, 246],
         },
         {
            label: 'OS Validadas',
            value: grupo.osValidadas.toString(),
            color: [34, 197, 94],
         },
      ];

      const boxWidth = 60;
      const boxHeight = 15;
      const startX = 20;
      const spacing = 5;

      totalizadores.forEach((tot, index) => {
         const xPos = startX + (boxWidth + spacing) * index;

         // Box colorido
         doc.setFillColor(tot.color[0], tot.color[1], tot.color[2]);
         doc.rect(xPos, yPosition, boxWidth, boxHeight, 'F');

         // Label
         doc.setTextColor(255, 255, 255);
         doc.setFontSize(8);
         doc.setFont('helvetica', 'bold');
         doc.text(tot.label, xPos + boxWidth / 2, yPosition + 5, {
            align: 'center',
         });

         // Valor
         doc.setFontSize(12);
         doc.text(tot.value, xPos + boxWidth / 2, yPosition + 11, {
            align: 'center',
         });
      });

      yPosition += boxHeight + 10;

      // ================================================================================
      // TABELA DE DETALHES
      // ================================================================================
      const tableData = grupo.detalhes.map(detalhe => [
         detalhe.codOs.toString(),
         formatarDataParaBR(detalhe.data),
         detalhe.chamado.length > 25
            ? detalhe.chamado.substring(0, 25) + '...'
            : detalhe.chamado,
         detalhe.horaInicio,
         detalhe.horaFim,
         formatarDecimalParaTempo(detalhe.horas),
         detalhe.cliente || '---',
         detalhe.recurso || '---',
         detalhe.faturado,
         detalhe.validado,
      ]);

      autoTable(doc, {
         startY: yPosition,
         head: [
            [
               'OS',
               'Data',
               'Chamado',
               'Início',
               'Fim',
               'Horas',
               'Cliente',
               'Recurso',
               'Faturado',
               'Validado',
            ],
         ],
         body: tableData,
         theme: 'grid',
         headStyles: {
            fillColor: [15, 118, 110],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
         },
         bodyStyles: {
            fontSize: 8,
            cellPadding: 2,
         },
         columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 22, halign: 'center' },
            2: { cellWidth: 45 },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
            6: { cellWidth: 40 },
            7: { cellWidth: 40 },
            8: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            9: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
         },
         didParseCell: data => {
            // Colorir células de Faturado e Validado
            if (data.column.index === 8 || data.column.index === 9) {
               if (data.cell.text[0] === 'SIM') {
                  data.cell.styles.fillColor = [59, 130, 246]; // Azul
                  data.cell.styles.textColor = [255, 255, 255];
               } else if (
                  data.cell.text[0] === 'NAO' ||
                  data.cell.text[0] === 'NÃO'
               ) {
                  data.cell.styles.fillColor = [239, 68, 68]; // Vermelho
                  data.cell.styles.textColor = [255, 255, 255];
               }
            }
         },
         margin: { left: 15, right: 15 },
      });

      // ================================================================================
      // SALVAR PDF
      // ================================================================================
      const timestamp = new Date().getTime();
      const nomeArquivo = `Relatorio_OS_${grupo.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
      doc.save(nomeArquivo);
   };

   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <button
               onClick={exportToPDF}
               className="group cursor-pointer rounded-md border-[1px] border-red-800 bg-red-700 p-2 shadow-md shadow-black transition-all hover:scale-125 active:scale-95"
            >
               <FaFilePdf className="text-white" size={20} />
               {buttonText}
            </button>
         </TooltipTrigger>
         <TooltipContent
            side="right"
            align="end"
            sideOffset={8}
            className="border-t-8 border-red-600 bg-white text-sm font-bold tracking-widest text-black italic shadow-lg shadow-black select-none"
         >
            Exportar PDF
         </TooltipContent>
      </Tooltip>
   );
}
