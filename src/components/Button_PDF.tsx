'use client';

// IMPORTS
import jsPDF from 'jspdf';
import { useState } from 'react';
import autoTable from 'jspdf-autotable';

// FORMATTERS
import {
   formatarCodNumber,
   formatarDataParaBR,
   formatarHora,
   formatarHorasTotaisHorasDecimais,
} from '../utils/formatters';

// HELPERS
import { corrigirTextoCorrompido } from '../lib/corrigirTextoCorrompido';

// ICONS
import { IoClose } from 'react-icons/io5';
import { FaFilePdf, FaCheckCircle, FaFileExport } from 'react-icons/fa';
import { LoadingButton } from './Loading';

// ================================================================================
// INTERFACES
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
   dataInclusao?: string;
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
export function PDFRelatorioOS({
   grupo,
   tipoAgrupamento,
   filtros,
   buttonText = '',
}: PDFButtonRelatorioOSProps) {
   const [showModal, setShowModal] = useState(false);
   const [incluirFaturado, setIncluirFaturado] = useState(false);
   const [incluirValidado, setIncluirValidado] = useState(false);
   const [isExporting, setIsExporting] = useState(false);

   const handleOpenModalExportarPDF = () => {
      setShowModal(true);
   };

   const handleCloseModalExportarPDF = () => {
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

         const horasSufixo = (() => {
            const n = parseFloat(String(grupo.totalHoras).replace(',', '.'));
            return isNaN(n) ? 'hs' : n > 1 ? 'hs' : 'h';
         })();

         const totalizadores = [
            {
               label: 'Total de Horas',
               value: `${formatarHorasTotaisHorasDecimais(grupo.totalHoras)} ${horasSufixo}`,
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
            'TAREFA',
            'CHAMADO',
            'DATA',
            'HORA INÍCIO',
            'HORA FIM',
            'TOTAL HORAS',
            'DATA INCLUSÃO',
            'CONSULTOR',
         ];

         if (incluirValidado) tableHeaders.push('CONSULTOR RECEBE');
         if (incluirFaturado) tableHeaders.push('CLIENTE PAGA');

         const tableData = grupo.detalhes.map(detalhe => {
            const row = [
               detalhe.codOs || null,
               detalhe.tarefa || 'n/a',
               detalhe.chamado
                  ? Number(detalhe.chamado) || detalhe.chamado
                  : 'n/a',
               formatarDataParaBR(detalhe.data) || 'n/a',
               formatarHora(detalhe.horaInicio) + horasSufixo || 'n/a',
               formatarHora(detalhe.horaFim) + horasSufixo || 'n/a',
               formatarHorasTotaisHorasDecimais(detalhe.horas) + horasSufixo ||
                  'n/a',
               formatarDataParaBR(detalhe.dataInclusao || '') || 'n/a',
               corrigirTextoCorrompido(detalhe.recurso ?? '') || 'n/a',
            ];

            if (incluirValidado) row.push(detalhe.validado);
            if (incluirFaturado) row.push(detalhe.faturado);

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
            0: { cellWidth: 15, halign: 'center' }, // OS
            1: { cellWidth: 50, halign: 'left' }, // Tarefa
            2: { cellWidth: 20, halign: 'center' }, // Chamado
            3: { cellWidth: 20, halign: 'center' }, // Data
            4: { cellWidth: 20, halign: 'center' }, // Hora Início
            5: { cellWidth: 20, halign: 'center' }, // Hora Fim
            6: { cellWidth: 20, halign: 'center' }, // total Horas
            7: { cellWidth: 20, halign: 'center' }, // Data Inclusão
            8: { cellWidth: 50, halign: 'left' }, // Recurso
         };

         let currentColIndex = 9;
         if (incluirValidado) {
            columnStyles[currentColIndex] = {
               cellWidth: 20,
               halign: 'center',
               fontStyle: 'bold',
            };
            currentColIndex++;
         }

         if (incluirFaturado) {
            columnStyles[currentColIndex] = {
               cellWidth: 20,
               halign: 'center',
               fontStyle: 'bold',
            };
            currentColIndex++;
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
               const isFaturadoCol = incluirFaturado && data.column.index === 9;
               const isValidadoCol =
                  incluirValidado &&
                  data.column.index === (incluirFaturado ? 10 : 9);

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

         handleCloseModalExportarPDF();
      } catch (error) {
         console.error('Erro ao exportar PDF:', error);
      } finally {
         setIsExporting(false);
      }
   };

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <>
         <button
            onClick={handleOpenModalExportarPDF}
            title="Exportar para PDF"
            className="group cursor-pointer rounded-md bg-gradient-to-br from-red-600 to-red-700 p-3 shadow-md shadow-black transition-all hover:scale-110 active:scale-95"
         >
            <FaFilePdf className="text-white group-hover:scale-110" size={24} />
            {buttonText}
         </button>

         {/* MODAL */}
         {showModal && (
            <div className="animate-in fade-in fixed inset-0 z-70 flex items-center justify-center p-4 duration-300">
               {/* ===== OVERLAY ===== */}
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

               {/* ===== CARD ===== */}
               <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-2xl overflow-hidden rounded-2xl border-none bg-white transition-all duration-500 ease-out">
                  {/* ===== HEADER ===== */}
                  <header className="relative flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 p-6 shadow-sm shadow-black">
                     <div className="flex items-center justify-center gap-6">
                        <FaFilePdf className="text-white" size={60} />
                        <div className="flex flex-col">
                           <h1 className="text-2xl font-extrabold tracking-widest text-black uppercase select-none">
                              Exportar P/ PDF
                           </h1>
                           <p className="text-base font-extrabold tracking-widest text-black italic select-none">
                              {(() => {
                                 // Extrai as propriedades que podem existir
                                 const { dataInicio, dataFim, ano, mes } =
                                    filtros || {};

                                 const now = new Date();
                                 const mesAtual = String(
                                    now.getMonth() + 1
                                 ).padStart(2, '0');
                                 const anoAtual = now.getFullYear();

                                 // Se tem dataInicio e dataFim (formato YYYY-MM-DD)
                                 if (dataInicio && dataFim) {
                                    // Converte de YYYY-MM-DD para DD/MM/YYYY
                                    const [anoInicio, mesInicio, diaInicio] =
                                       dataInicio.split('-');
                                    const [anoFim, mesFim, diaFim] =
                                       dataFim.split('-');

                                    const dataInicioFormatada = `${diaInicio}/${mesInicio}/${anoInicio}`;
                                    const dataFimFormatada = `${diaFim}/${mesFim}/${anoFim}`;

                                    return (
                                       <>
                                          De {dataInicioFormatada} até{' '}
                                          {dataFimFormatada}
                                       </>
                                    );
                                 }

                                 // Se tem ano e mês (mas não tem datas completas)
                                 if (ano && mes) {
                                    return (
                                       <>
                                          {mes}/{ano}
                                       </>
                                    );
                                 }

                                 // Se só tem mês
                                 if (mes && !ano) {
                                    return (
                                       <>
                                          {mes}/{anoAtual}
                                       </>
                                    );
                                 }

                                 // Se só tem ano
                                 if (ano && !mes) {
                                    return (
                                       <>
                                          {mesAtual}/{ano}
                                       </>
                                    );
                                 }

                                 // Se não tem nenhum filtro de data
                                 return (
                                    <>
                                       {mesAtual}/{anoAtual}
                                    </>
                                 );
                              })()}
                           </p>
                        </div>
                     </div>
                     {/* BOTÃO FECHAR MODAL */}
                     <button
                        onClick={handleCloseModalExportarPDF}
                        disabled={isExporting}
                        className="group cursor-pointer rounded-full bg-red-500/50 p-3 transition-all hover:scale-110 hover:rotate-180 hover:bg-red-500 active:scale-95"
                     >
                        <IoClose
                           className="text-white group-hover:scale-110"
                           size={24}
                        />
                     </button>
                  </header>

                  {/* Body */}
                  {/* ==== CONTEÚDO ==== */}
                  <main className="flex flex-col gap-12 p-6">
                     <div className="flex flex-col gap-6">
                        <p className="text-base font-extrabold tracking-widest text-black select-none">
                           Selecione abaixo, quais colunas deseja incluir no
                           relatório:
                        </p>

                        {/* CHECKBOX VALIDADO */}
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-black/10 p-4 shadow-md shadow-black transition-all hover:scale-102">
                           <input
                              type="checkbox"
                              checked={incluirValidado}
                              onChange={e =>
                                 setIncluirValidado(e.target.checked)
                              }
                              disabled={isExporting}
                              className="h-5 w-5 cursor-pointer accent-green-600 shadow-sm shadow-black"
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

                        {/* CHECKBOX FATURADO */}
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-black/10 p-4 shadow-md shadow-black transition-all hover:scale-102">
                           <input
                              type="checkbox"
                              checked={incluirFaturado}
                              onChange={e =>
                                 setIncluirFaturado(e.target.checked)
                              }
                              disabled={isExporting}
                              className="h-5 w-5 cursor-pointer accent-green-600 shadow-sm shadow-black"
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
                     </div>

                     {/* ===== BOTÕES CANCELAR EXPORTAR ===== */}
                     <div className="flex items-center justify-end gap-8">
                        <button
                           onClick={handleCloseModalExportarPDF}
                           className="w-[200px] cursor-pointer rounded-md border-none bg-gradient-to-r from-red-600 to-red-700 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                           disabled={isExporting}
                        >
                           Cancelar
                        </button>
                        <button
                           onClick={exportToPDF}
                           disabled={isExporting}
                           className="w-[200px] cursor-pointer rounded-md border-none bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-lg font-extrabold tracking-widest text-white shadow-md shadow-black transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                           {isExporting ? (
                              <span className="flex items-center justify-center gap-3">
                                 <LoadingButton size={20} />
                                 Exportando...
                              </span>
                           ) : (
                              <div className="flex items-center justify-center gap-3">
                                 <FaFileExport
                                    className="mr-2 inline-block"
                                    size={20}
                                 />
                                 <span>Exportar</span>
                              </div>
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
