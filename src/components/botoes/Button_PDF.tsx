'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
import { FaFilePdf, FaCheckCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import {
   formatarCodNumber,
   formatarHora,
   formatarHorasTotaisHorasDecimais,
} from '../../utils/formatters';
import { corrigirTextoCorrompido } from '../../lib/corrigirTextoCorrompido';

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
   const [showModal, setShowModal] = useState(false);
   const [incluirFaturado, setIncluirFaturado] = useState(false);
   const [incluirValidado, setIncluirValidado] = useState(false);
   const [isExporting, setIsExporting] = useState(false);

   const handleOpenModal = () => {
      setShowModal(true);
   };

   const handleCloseModal = () => {
      setShowModal(false);
      setIncluirFaturado(false);
      setIncluirValidado(false);
   };

   const exportToPDF = () => {
      setIsExporting(true);

      try {
         const doc = new jsPDF('l', 'mm', 'a4');
         let yPosition = 15;

         // ================================================================================
         // CABEÇALHO DO RELATÓRIO
         // ================================================================================
         doc.setFillColor(15, 118, 110);
         doc.rect(0, 0, 297, 20, 'F');

         doc.setTextColor(255, 255, 255);
         doc.setFontSize(18);
         doc.setFont('helvetica', 'bold');
         doc.text('RELATÓRIO DE ORDENS DE SERVIÇO', 148.5, 11, {
            align: 'center',
         });

         doc.setFontSize(9);
         doc.setFont('helvetica', 'italic');
         doc.text(
            `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
            148.5,
            17,
            {
               align: 'center',
            }
         );

         yPosition = 26;

         // ================================================================================
         // FILTROS APLICADOS
         // ================================================================================
         if (filtros && Object.keys(filtros).length > 0) {
            doc.setFillColor(0, 0, 0);
            doc.rect(15, yPosition, 80, 6, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('FILTROS APLICADOS', 55, yPosition + 4, {
               align: 'center',
            });

            yPosition += 6;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(8);

            // Helper para criar linha de filtro
            const addFilterRow = (label: string, value: string) => {
               // Label
               doc.setFillColor(255, 255, 255);
               doc.rect(15, yPosition, 35, 6);
               doc.setDrawColor(229, 231, 235);
               doc.rect(15, yPosition, 35, 6);

               doc.setFont('helvetica', 'bold');
               doc.text(label, 32.5, yPosition + 4, { align: 'center' });

               // Value
               doc.setFillColor(255, 255, 255);
               doc.rect(50, yPosition, 45, 6);
               doc.setDrawColor(229, 231, 235);
               doc.rect(50, yPosition, 45, 6);

               doc.setFont('helvetica', 'normal');
               doc.text(value, 72.5, yPosition + 4, { align: 'center' });

               yPosition += 6;
            };

            // Período por Data Início/Fim
            if (filtros.dataInicio || filtros.dataFim) {
               const periodoTexto = [];
               if (filtros.dataInicio)
                  periodoTexto.push(
                     `De: ${formatarDataParaBR(filtros.dataInicio)}`
                  );
               if (filtros.dataFim)
                  periodoTexto.push(
                     `Até: ${formatarDataParaBR(filtros.dataFim)}`
                  );
               addFilterRow('Período:', periodoTexto.join(' | '));
            }

            // Período por Mês/Ano
            if (filtros.mes || filtros.ano) {
               const mesNome = filtros.mes ? getNomeMes(filtros.mes) : '';
               addFilterRow(
                  'Mês/Ano:',
                  `${mesNome}${filtros.ano ? '/' + filtros.ano : ''}`
               );
            }

            // Filtro Faturado
            if (filtros.faturado && filtros.faturado !== 'todos') {
               addFilterRow(
                  'Faturado:',
                  filtros.faturado === 'sim' ? 'Sim' : 'Não'
               );
            }

            // Filtro Validado
            if (filtros.validado && filtros.validado !== 'todos') {
               addFilterRow(
                  'Validado:',
                  filtros.validado === 'sim' ? 'Sim' : 'Não'
               );
            }

            // Filtro Cliente
            if (filtros.cliente) {
               addFilterRow('Cliente:', filtros.cliente);
            }

            // Filtro Recurso
            if (filtros.recurso) {
               addFilterRow('Recurso:', filtros.recurso);
            }

            // Filtro Projeto
            if (filtros.projeto) {
               addFilterRow('Projeto:', filtros.projeto);
            }

            yPosition += 3;
         }

         // ================================================================================
         // INFORMAÇÕES DO GRUPO
         // ================================================================================
         doc.setFillColor(0, 0, 0);
         doc.rect(15, yPosition, 80, 6, 'F');

         doc.setTextColor(255, 255, 255);
         doc.setFontSize(10);
         doc.setFont('helvetica', 'bold');
         doc.text('INFORMAÇÕES DO GRUPO', 55, yPosition + 4, {
            align: 'center',
         });

         yPosition += 6;

         // Label
         doc.setFillColor(255, 255, 255);
         doc.rect(15, yPosition, 35, 6);
         doc.setDrawColor(229, 231, 235);
         doc.rect(15, yPosition, 35, 6);

         doc.setTextColor(0, 0, 0);
         doc.setFontSize(8);
         doc.setFont('helvetica', 'bold');
         doc.text(
            `${getTipoAgrupamentoLabel(tipoAgrupamento)}:`,
            32.5,
            yPosition + 4,
            {
               align: 'center',
            }
         );

         // Value
         doc.setFillColor(255, 255, 255);
         doc.rect(50, yPosition, 45, 6);
         doc.setDrawColor(229, 231, 235);
         doc.rect(50, yPosition, 45, 6);

         doc.setFont('helvetica', 'normal');
         doc.text(grupo.nome, 72.5, yPosition + 4, { align: 'center' });

         yPosition += 9;

         // ================================================================================
         // TOTALIZADORES
         // ================================================================================
         doc.setFillColor(0, 0, 0);
         doc.rect(15, yPosition, 80, 6, 'F');

         doc.setTextColor(255, 255, 255);
         doc.setFontSize(10);
         doc.setFont('helvetica', 'bold');
         doc.text('TOTALIZADORES', 55, yPosition + 4, { align: 'center' });

         yPosition += 6;

         const totalizadores = [
            {
               label: 'Total de Horas',
               value: `${formatarHorasTotaisHorasDecimais(grupo.totalHoras)}h`,
               color: [0, 128, 128],
            },
            {
               label: "Total de OS's",
               value: formatarCodNumber(grupo.quantidadeOS),
               color: [160, 32, 240],
            },
            {
               label: "Total de OS's Faturadas",
               value: formatarCodNumber(grupo.osFaturadas),
               color: [0, 0, 255],
            },
            {
               label: "Total de OS's Validadas",
               value: formatarCodNumber(grupo.osValidadas),
               color: [0, 128, 0],
            },
         ];

         totalizadores.forEach(tot => {
            // Label (cabeçalho)
            doc.setFillColor(tot.color[0], tot.color[1], tot.color[2]);
            doc.rect(15, yPosition, 35, 6, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(tot.label, 32.5, yPosition + 4, { align: 'center' });

            // Valor
            doc.setFillColor(255, 255, 255);
            doc.rect(50, yPosition, 45, 6);
            doc.setDrawColor(229, 231, 235);
            doc.rect(50, yPosition, 45, 6);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(tot.value, 72.5, yPosition + 4, { align: 'center' });

            yPosition += 6;
         });

         yPosition += 5;

         // ================================================================================
         // TABELA DE DETALHES
         // ================================================================================
         const tableHeaders = [
            'OS',
            'Data',
            'Chamado',
            'Hora Início',
            'Hora Fim',
            'Horas',
            'Cliente',
            'Recurso',
         ];

         if (incluirFaturado) tableHeaders.push('Faturado');
         if (incluirValidado) tableHeaders.push('Validado');

         const tableData = grupo.detalhes.map(detalhe => {
            const row = [
               detalhe.codOs || null,
               formatarDataParaBR(detalhe.data) || '--------',
               detalhe.chamado
                  ? Number(detalhe.chamado) || detalhe.chamado
                  : '-----',
               formatarHora(detalhe.horaInicio) || '----',
               formatarHora(detalhe.horaFim) || '----',
               formatarHorasTotaisHorasDecimais(detalhe.horas) || '----',
               detalhe.cliente || '----------',
               corrigirTextoCorrompido(detalhe.recurso ?? '') || '----------',
            ];

            if (incluirFaturado) row.push(detalhe.faturado);
            if (incluirValidado) row.push(detalhe.validado);

            // Adaptação: Formatar valores numéricos para OS e Chamado
            if (typeof row[0] === 'number') {
               row[0] = row[0].toLocaleString('pt-BR');
            }
            if (typeof row[2] === 'number') {
               row[2] = row[2].toLocaleString('pt-BR');
            }

            return row;
         });

         // Configurar estilos de colunas dinamicamente
         const columnStyles: any = {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            6: { cellWidth: 60, halign: 'left' },
            7: { cellWidth: 60, halign: 'left' },
         };

         let currentColIndex = 8;
         if (incluirFaturado) {
            columnStyles[currentColIndex] = {
               cellWidth: 20,
               halign: 'center',
               fontStyle: 'bold',
            };
            currentColIndex++;
         }
         if (incluirValidado) {
            columnStyles[currentColIndex] = {
               cellWidth: 20,
               halign: 'center',
               fontStyle: 'bold',
            };
         }

         autoTable(doc, {
            startY: yPosition,
            head: [tableHeaders],
            body: tableData,
            theme: 'grid',
            headStyles: {
               fillColor: [15, 118, 110],
               textColor: [255, 255, 255],
               fontStyle: 'bold',
               fontSize: 8,
               halign: 'center',
               valign: 'middle',
            },
            bodyStyles: {
               fontSize: 7,
               cellPadding: 2,
               valign: 'middle',
            },
            columnStyles: columnStyles,
            didParseCell: data => {
               // Colorir células de Faturado e Validado
               const isFaturadoCol = incluirFaturado && data.column.index === 8;
               const isValidadoCol =
                  incluirValidado &&
                  data.column.index === (incluirFaturado ? 9 : 8);

               if (isFaturadoCol || isValidadoCol) {
                  if (data.cell.text[0] === 'SIM') {
                     data.cell.styles.fillColor = [59, 130, 246];
                     data.cell.styles.textColor = [255, 255, 255];
                  } else if (
                     data.cell.text[0] === 'NAO' ||
                     data.cell.text[0] === 'NÃO'
                  ) {
                     data.cell.styles.fillColor = [239, 68, 68];
                     data.cell.styles.textColor = [255, 255, 255];
                  }
               }
            },
            margin: { left: 10, right: 10 },
         });

         // ================================================================================
         // SALVAR PDF
         // ================================================================================
         const timestamp = new Date().getTime();
         const nomeArquivo = `Relatorio_OS_${grupo.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
         doc.save(nomeArquivo);

         handleCloseModal();
      } catch (error) {
         console.error('Erro ao exportar PDF:', error);
      } finally {
         setIsExporting(false);
      }
   };

   return (
      <>
         <Tooltip>
            <TooltipTrigger asChild>
               <button
                  onClick={handleOpenModal}
                  className="group cursor-pointer rounded-md border-[1px] border-red-800 bg-red-700 p-2 shadow-md shadow-black transition-all hover:scale-125 active:scale-95"
               >
                  <FaFilePdf className="text-white" size={20} />
                  {buttonText}
               </button>
            </TooltipTrigger>
            <TooltipContent
               side="left"
               align="start"
               sideOffset={8}
               className="border-t-8 border-red-600 bg-white text-sm font-bold tracking-widest text-black italic shadow-lg shadow-black select-none"
            >
               Exportar PDF
            </TooltipContent>
         </Tooltip>

         {/* MODAL */}
         {showModal && (
            <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
               {/* Overlay */}
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

               {/* Modal Content */}
               <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-xl overflow-hidden rounded-2xl border-[1px] border-slate-500 bg-slate-100 transition-all duration-500 ease-out">
                  {/* Header */}
                  <header className="relative flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700 p-6 shadow-sm shadow-black">
                     <div className="flex items-center gap-6">
                        <FaFilePdf className="text-white" size={32} />
                        <h2 className="text-xl font-extrabold tracking-wider text-white uppercase select-none">
                           Exportar P/ PDF
                        </h2>
                     </div>
                     <button
                        onClick={handleCloseModal}
                        disabled={isExporting}
                        className="group cursor-pointer rounded-full bg-red-500/50 p-1 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                        <IoClose className="text-white" size={24} />
                     </button>
                  </header>

                  {/* Body */}
                  <main className="flex flex-col gap-6 p-6">
                     <p className="text-base font-bold tracking-wider text-black italic select-none">
                        Selecione quais colunas deseja incluir no relatório:
                     </p>

                     <div className="flex flex-col gap-1">
                        {/* Checkbox Faturado */}
                        <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border-[1px] border-red-500 p-4 shadow-sm shadow-black transition-all hover:border-red-500 hover:bg-red-100">
                           <input
                              type="checkbox"
                              checked={incluirFaturado}
                              onChange={e =>
                                 setIncluirFaturado(e.target.checked)
                              }
                              className="h-5 w-5 cursor-pointer accent-red-600"
                              disabled={isExporting}
                           />
                           <div className="flex-1">
                              <span className="font-bold tracking-widest text-black select-none">
                                 Cliente Paga
                              </span>
                              <p className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Incluir coluna, Cliente Paga
                              </p>
                           </div>
                           {incluirFaturado && (
                              <FaCheckCircle
                                 className="text-red-600"
                                 size={24}
                              />
                           )}
                        </label>
                        {/* Checkbox Validado */}
                        <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border-[1px] border-red-500 p-4 shadow-sm shadow-black transition-all hover:border-red-500 hover:bg-red-100">
                           <input
                              type="checkbox"
                              checked={incluirValidado}
                              onChange={e =>
                                 setIncluirValidado(e.target.checked)
                              }
                              className="h-5 w-5 cursor-pointer accent-red-600"
                              disabled={isExporting}
                           />
                           <div className="flex-1">
                              <span className="font-bold tracking-widest text-black select-none">
                                 Consultor Recebe
                              </span>
                              <p className="text-sm font-semibold tracking-widest text-slate-600 italic select-none">
                                 Incluir coluna, Consultor Recebe
                              </p>
                           </div>
                           {incluirValidado && (
                              <FaCheckCircle
                                 className="text-red-600"
                                 size={24}
                              />
                           )}
                        </label>
                     </div>

                     {/* Botões */}
                     <div className="flex items-center justify-center gap-6">
                        <button
                           onClick={handleCloseModal}
                           className="flex-1 cursor-pointer rounded-md bg-red-600 px-6 py-2 text-lg font-extrabold text-white shadow-md shadow-black transition-all hover:scale-105 hover:bg-red-800 active:scale-95"
                           disabled={isExporting}
                        >
                           Cancelar
                        </button>
                        <button
                           onClick={exportToPDF}
                           disabled={isExporting}
                           className="flex-1 cursor-pointer rounded-md bg-green-600 px-6 py-2 text-lg font-extrabold text-white shadow-md shadow-black transition-all hover:scale-105 hover:bg-green-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                           {isExporting ? (
                              <>
                                 <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                 Exportando...
                              </>
                           ) : (
                              <>Exportar</>
                           )}
                        </button>
                     </div>
                  </main>
               </div>
            </div>
         )}
      </>
   );
}
