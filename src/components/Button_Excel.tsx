'use client';

import { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { RiFileExcel2Fill } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import { FaCheckCircle } from 'react-icons/fa';

import {
   formatarDataParaBR,
   formatarHora,
   formatarHorasTotaisHorasDecimais,
   obterSufixoHoras,
} from '../utils/formatters';
import { corrigirTextoCorrompido } from '../lib/corrigirTextoCorrompido';

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
export function ExcelRelatorioOS({
   grupo,
   tipoAgrupamento,
   filtros,
   buttonText = '',
}: ExcelButtonRelatorioOSProps) {
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

   const exportToExcel = async () => {
      setIsExporting(true);

      try {
         const workbook = new ExcelJS.Workbook();
         const worksheet = workbook.addWorksheet('Relatório');
         worksheet.views = [{ showGridLines: false }];

         let currentRow = 1;

         // ================================================================================
         // CABEÇALHO DO RELATÓRIO
         // ================================================================================
         const numColunas =
            10 + (incluirFaturado ? 1 : 0) + (incluirValidado ? 1 : 0);
         const ultimaColuna = String.fromCharCode(64 + numColunas);

         worksheet.mergeCells(`A${currentRow}:${ultimaColuna}${currentRow}`);
         const titleCell = worksheet.getCell(`A${currentRow}`);
         titleCell.value = 'RELATÓRIO DE ORDENS DE SERVIÇO';
         titleCell.font = { bold: true, size: 22, color: { argb: 'FFFFFFFF' } };
         titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0F766E' },
         };
         titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
         worksheet.getRow(currentRow).height = 30;
         currentRow++;

         // Data de geração
         worksheet.mergeCells(`A${currentRow}:${ultimaColuna}${currentRow}`);
         const dateCell = worksheet.getCell(`A${currentRow}`);
         dateCell.value = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
         dateCell.font = {
            italic: true,
            size: 16,
            color: { argb: 'FFFFFFFF' },
         };
         dateCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0F766E' },
         };

         dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
         worksheet.getRow(currentRow).height = 30;

         currentRow++;

         currentRow += 1;

         // ================================================================================
         // FILTROS APLICADOS
         // ================================================================================
         if (filtros && Object.keys(filtros).length > 0) {
            console.log('🔍 DEBUG - Filtros recebidos:', filtros);
            console.log('📅 dataInicio:', filtros.dataInicio);
            console.log('📅 dataFim:', filtros.dataFim);
            console.log(
               '📅 dataInicio formatada:',
               formatarDataParaBR(filtros.dataInicio)
            );
            console.log(
               '📅 dataFim formatada:',
               formatarDataParaBR(filtros.dataFim)
            );

            worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
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
               fgColor: { argb: '000000' },
            };
            filtrosTitleCell.alignment = {
               horizontal: 'center',
               vertical: 'middle',
            };
            worksheet.getRow(currentRow).height = 24;

            filtrosTitleCell.border = {
               top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            };
            currentRow++;

            // Helper para bordas
            const setBorder = (cell: any) => {
               cell.border = {
                  top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                  left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                  bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                  right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               };
            };

            // Período por Data Início/Fim
            if (filtros.dataInicio || filtros.dataFim) {
               worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
               worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
               const labelCell = worksheet.getCell(`A${currentRow}`);
               labelCell.value = 'Período:';
               labelCell.font = { bold: true };
               labelCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(labelCell);

               const periodoTexto = [];
               if (filtros.dataInicio)
                  periodoTexto.push(
                     `De: ${formatarDataParaBR(filtros.dataInicio)}`
                  );
               if (filtros.dataFim)
                  periodoTexto.push(
                     `Até: ${formatarDataParaBR(filtros.dataFim)}`
                  );

               const valueCell = worksheet.getCell(`C${currentRow}`);
               valueCell.value = periodoTexto.join(' | ');
               valueCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(valueCell);

               currentRow++;
            }

            // Período por Mês/Ano
            if (filtros.mes || filtros.ano) {
               worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
               worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
               const labelCell = worksheet.getCell(`A${currentRow}`);
               labelCell.value = 'Mês/Ano:';
               labelCell.font = { bold: true };
               labelCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(labelCell);

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

               const valueCell = worksheet.getCell(`C${currentRow}`);
               valueCell.value = `${mesNome}${filtros.ano ? '/' + filtros.ano : ''}`;
               valueCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(valueCell);
               worksheet.getRow(currentRow).height = 24;

               currentRow++;
            }

            // Filtro Faturado
            if (filtros.faturado && filtros.faturado !== 'todos') {
               worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
               worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
               const labelCell = worksheet.getCell(`A${currentRow}`);
               labelCell.value = 'Faturado:';
               labelCell.font = { bold: true };
               labelCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(labelCell);

               const valueCell = worksheet.getCell(`C${currentRow}`);
               valueCell.value = filtros.faturado === 'sim' ? 'Sim' : 'Não';
               valueCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(valueCell);
               worksheet.getRow(currentRow).height = 24;

               currentRow++;
            }

            // Filtro Validado
            if (filtros.validado && filtros.validado !== 'todos') {
               worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
               worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
               const labelCell = worksheet.getCell(`A${currentRow}`);
               labelCell.value = 'Validado:';
               labelCell.font = { bold: true };
               labelCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(labelCell);

               const valueCell = worksheet.getCell(`C${currentRow}`);
               valueCell.value = filtros.validado === 'sim' ? 'Sim' : 'Não';
               valueCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(valueCell);
               worksheet.getRow(currentRow).height = 24;

               currentRow++;
            }

            // Filtro Cliente
            if (filtros.cliente) {
               worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
               worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
               const labelCell = worksheet.getCell(`A${currentRow}`);
               labelCell.value = 'Cliente:';
               labelCell.font = { bold: true };
               labelCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(labelCell);

               const valueCell = worksheet.getCell(`C${currentRow}`);
               valueCell.value = filtros.cliente;
               valueCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(valueCell);
               worksheet.getRow(currentRow).height = 24;

               currentRow++;
            }

            // Filtro Recurso
            if (filtros.recurso) {
               worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
               worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
               const labelCell = worksheet.getCell(`A${currentRow}`);
               labelCell.value = 'Recurso:';
               labelCell.font = { bold: true };
               labelCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(labelCell);

               const valueCell = worksheet.getCell(`C${currentRow}`);
               valueCell.value = filtros.recurso;
               valueCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(valueCell);
               worksheet.getRow(currentRow).height = 24;

               currentRow++;
            }

            // Filtro Projeto
            if (filtros.projeto) {
               worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
               worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
               const labelCell = worksheet.getCell(`A${currentRow}`);
               labelCell.value = 'Projeto:';
               labelCell.font = { bold: true };
               labelCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(labelCell);

               const valueCell = worksheet.getCell(`C${currentRow}`);
               valueCell.value = filtros.projeto;
               valueCell.alignment = {
                  horizontal: 'center',
                  vertical: 'middle',
               };
               setBorder(valueCell);
               worksheet.getRow(currentRow).height = 24;

               currentRow++;
            }

            currentRow += 1;
         }

         // ================================================================================
         // INFORMAÇÕES DO GRUPO
         // ================================================================================
         worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
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
            fgColor: { argb: '000000' },
         };
         infoTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
         worksheet.getRow(currentRow).height = 24;

         infoTitleCell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
         };
         currentRow++;

         // Nome do grupo
         worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
         worksheet.getCell(`A${currentRow}`).value =
            `${getTipoAgrupamentoLabel(tipoAgrupamento)}:`;
         worksheet.getCell(`A${currentRow}`).font = { bold: true };
         worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
         worksheet.getCell(`C${currentRow}`).value = grupo.nome;
         worksheet.getCell(`A${currentRow}`).alignment = {
            horizontal: 'center',
            vertical: 'middle',
         };
         worksheet.getCell(`C${currentRow}`).alignment = {
            horizontal: 'center',
            vertical: 'middle',
         };

         worksheet.getCell(`A${currentRow}`).border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
         };
         worksheet.getCell(`C${currentRow}`).border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
         };
         worksheet.getRow(currentRow).height = 24;

         currentRow++;

         currentRow += 1;

         // ================================================================================
         // TOTALIZADORES DO GRUPO
         // ================================================================================
         worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
         const totTitleCell = worksheet.getCell(`A${currentRow}`);
         totTitleCell.value = 'TOTALIZADORES';
         totTitleCell.font = {
            bold: true,
            size: 12,
            color: { argb: 'FFFFFFFF' },
         };
         totTitleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '000000' },
         };
         totTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
         worksheet.getRow(currentRow).height = 24;
         currentRow++;

         const totHeaders = [
            'Total de Horas',
            "Total de OS's",
            "Total de OS's Faturadas",
            "Total de OS's Validadas",
         ];
         const totValues = [
            `${formatarHorasTotaisHorasDecimais(grupo.totalHoras)} ${obterSufixoHoras(grupo.totalHoras)}`,
            grupo.quantidadeOS,
            grupo.osFaturadas,
            grupo.osValidadas,
         ];

         const totColors = ['008080', 'A020F0', '0000FF', '008000'];

         // Criar totalizadores verticalmente
         for (let i = 0; i < totHeaders.length; i++) {
            // Cabeçalho do totalizador
            worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
            const headerCell = worksheet.getCell(`A${currentRow}`);
            headerCell.value = totHeaders[i];
            headerCell.font = {
               bold: true,
               size: 12,
               color: { argb: 'FFFFFFFF' },
            };
            headerCell.fill = {
               type: 'pattern',
               pattern: 'solid',
               fgColor: { argb: totColors[i] },
            };
            headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
            headerCell.border = {
               top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            };

            // Valor do totalizador
            worksheet.mergeCells(`C${currentRow}:F${currentRow}`);
            const valueCell = worksheet.getCell(`C${currentRow}`);
            valueCell.value = totValues[i];
            valueCell.font = { size: 12 };
            valueCell.alignment = { horizontal: 'center', vertical: 'middle' };
            valueCell.border = {
               top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            };

            // Aplicar formato de número com separador de milhares para colunas numéricas
            if (i > 0) {
               valueCell.numFmt = '#,##0';
            }
            worksheet.getRow(currentRow).height = 24;

            currentRow++;
         }

         currentRow--;

         currentRow += 2;

         // ================================================================================
         // CABEÇALHOS DAS COLUNAS
         // ================================================================================
         const headers = [
            'OS',
            'TAREFA',
            'CHAMADO',
            'DATA',
            'HORA INÍCIO',
            'HORA FIM',
            'HORAS',
            'DATA INCLUSÃO',
            'RECURSO',
         ];

         if (incluirValidado) headers.push('CONSULTOR RECEBE');
         if (incluirFaturado) headers.push('CLIENTE PAGA');

         headers.forEach((header, index) => {
            const cell = worksheet.getCell(currentRow, index + 1);
            cell.value = header;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
               type: 'pattern',
               pattern: 'solid',
               fgColor: { argb: 'FF0F766E' },
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getRow(currentRow).height = 24;

            cell.border = {
               top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            };
         });
         currentRow++;

         // ================================================================================
         // DETALHES
         // ================================================================================
         grupo.detalhes.forEach(detalhe => {
            const rowData = [
               detalhe.codOs || null,
               detalhe.tarefa || 'n/a',
               detalhe.chamado
                  ? Number(detalhe.chamado) || detalhe.chamado
                  : 'n/a',
               formatarDataParaBR(detalhe.data) || 'n/a',
               formatarHora(detalhe.horaInicio) +
                  ' ' +
                  obterSufixoHoras(detalhe.horaInicio) || 'n/a',
               formatarHora(detalhe.horaFim) +
                  ' ' +
                  obterSufixoHoras(detalhe.horaFim) || 'n/a',
               formatarHorasTotaisHorasDecimais(detalhe.horas) +
                  ' ' +
                  obterSufixoHoras(detalhe.horas) || 'n/a',
               formatarDataParaBR(detalhe.dataInclusao || '') || 'n/a',
               corrigirTextoCorrompido(detalhe.recurso ?? '') || 'n/a',
            ];

            if (incluirValidado) rowData.push(detalhe.validado || 'n/a');
            if (incluirFaturado) rowData.push(detalhe.faturado || 'n/a');

            rowData.forEach((value, colIndex) => {
               const cell = worksheet.getCell(currentRow, colIndex + 1);
               cell.value = value;
               // Centralizar horizontalmente colunas de índice 0 a 5 e 7
               cell.alignment = {
                  horizontal:
                     colIndex <= 5 || colIndex === 7 ? 'center' : 'left',
                  vertical: 'middle',
                  indent: colIndex === 6 || colIndex === 8 ? 2 : 0,
               };
               cell.border = {
                  top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                  left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                  bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                  right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
               };

               // Aplicar formato de número para coluna OS (índice 0) e Chamado (índice 2)
               if (
                  (colIndex === 0 || colIndex === 2) &&
                  typeof value === 'number'
               ) {
                  cell.numFmt = '#,##0';
               }

               // Colorir colunas Faturado e Validado
               const isFaturadoCol = incluirFaturado && colIndex === 9;
               const isValidadoCol =
                  incluirValidado && colIndex === (incluirFaturado ? 10 : 9);

               if (isFaturadoCol || isValidadoCol) {
                  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  cell.fill = {
                     type: 'pattern',
                     pattern: 'solid',
                     fgColor: {
                        argb: value === 'SIM' ? 'FF3B82F6' : 'FFEF4444',
                     },
                  };
                  cell.alignment = { horizontal: 'center', vertical: 'middle' };
               }
            });

            worksheet.getRow(currentRow).height = 24;
            currentRow++;
         });

         // ================================================================================
         // CONFIGURAÇÕES FINAIS
         // ================================================================================
         const columnWidths = [
            { width: 12 }, // OS
            { width: 60 }, // Tarefa
            { width: 12 }, // Chamado
            { width: 20 }, // Data
            { width: 15 }, // Hora Início
            { width: 15 }, // Hora Fim
            { width: 15 }, // Horas
            { width: 20 }, // Data Inclusão
            { width: 40 }, // Recurso
         ];

         if (incluirValidado) columnWidths.push({ width: 20 }); // Validado
         if (incluirFaturado) columnWidths.push({ width: 20 }); // Faturado

         worksheet.columns = columnWidths;

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

         handleCloseModal();
      } catch (error) {
         console.error('Erro ao exportar Excel:', error);
      } finally {
         setIsExporting(false);
      }
   };

   return (
      <>
         <button
            onClick={handleOpenModal}
            title="Exportar para Excel"
            className="group cursor-pointer rounded-md bg-gradient-to-br from-green-600 to-green-700 p-3 shadow-md shadow-black transition-all hover:scale-110 active:scale-95"
         >
            <RiFileExcel2Fill
               className="text-white group-hover:scale-110"
               size={24}
            />
            {buttonText}
         </button>

         {/* MODAL */}
         {showModal && (
            <div className="animate-in fade-in fixed inset-0 z-70 flex items-center justify-center p-4 duration-300">
               {/* Overlay */}
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

               {/* Modal Content */}
               <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-xl overflow-hidden rounded-2xl border-[1px] border-slate-500 bg-slate-100 transition-all duration-500 ease-out">
                  {/* Header */}
                  <header className="relative flex items-center justify-between bg-gradient-to-r from-green-600 to-green-700 p-6 shadow-sm shadow-black">
                     <div className="flex items-center gap-6">
                        <RiFileExcel2Fill className="text-white" size={32} />
                        <h2 className="text-xl font-extrabold tracking-wider text-white uppercase select-none">
                           Exportar P/ Excel
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
                        <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border-[1px] border-green-500 p-4 shadow-sm shadow-black transition-all hover:border-green-500 hover:bg-green-100">
                           <input
                              type="checkbox"
                              checked={incluirFaturado}
                              onChange={e =>
                                 setIncluirFaturado(e.target.checked)
                              }
                              className="h-5 w-5 cursor-pointer accent-green-600"
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
                                 className="text-green-600"
                                 size={24}
                              />
                           )}
                        </label>

                        {/* Checkbox Validado */}
                        <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border-[1px] border-green-500 p-4 shadow-sm shadow-black transition-all hover:border-green-500 hover:bg-green-100">
                           <input
                              type="checkbox"
                              checked={incluirValidado}
                              onChange={e =>
                                 setIncluirValidado(e.target.checked)
                              }
                              className="h-5 w-5 cursor-pointer accent-green-600"
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
                                 className="text-green-600"
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
                           onClick={exportToExcel}
                           disabled={isExporting}
                           className="flex-1 cursor-pointer rounded-md bg-green-600 px-6 py-2 text-lg font-extrabold text-white shadow-md shadow-black transition-all hover:scale-105 hover:bg-green-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                           {isExporting ? (
                              <div className="flex items-center justify-center gap-2">
                                 <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                 <span>Exportando...</span>
                              </div>
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
