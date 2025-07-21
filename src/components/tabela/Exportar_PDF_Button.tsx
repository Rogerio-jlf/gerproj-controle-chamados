'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText } from 'lucide-react';

// Define as propriedades aceitas pelo componente ExportaPDFButton.
interface ExportaPDFButtonProps<T> {
  data: T[]; // Dados a serem exportados para o PDF.
  fileName: string; // Nome do arquivo PDF gerado.
  buttonText?: string; // Texto opcional do botão.
  disabled?: boolean; // Se o botão deve estar desabilitado.
  className?: string; // Classe CSS opcional para customização.
  title?: string; // Título do relatório.
  columns?: {
    key: keyof T; // Chave do dado a ser exibido.
    label: string; // Rótulo da coluna.
  }[];
  orientation?: 'portrait' | 'landscape'; // Orientação do PDF.
  logoUrl?: string; // URL do logo a ser exibido no PDF.
  footerText?: string; // Texto do rodapé.
}

// Componente principal que renderiza o botão de exportação para PDF.
export function ExportaPDFButton<T extends Record<string, any>>({
  data,
  fileName,
  buttonText = 'Exportar para PDF',
  disabled = false,
  className = '',
  title = 'Relatório',
  columns,
  orientation = 'landscape',
  logoUrl,
  footerText = 'Gerado em',
}: ExportaPDFButtonProps<T>) {
  // Função responsável por gerar e baixar o PDF.
  const exportToPdf = () => {
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
    });

    const margin = { top: 20, left: 5, right: 5, bottom: 20 }; // Define as margens do PDF.
    const pageWidth = doc.internal.pageSize.getWidth(); // Largura da página.
    const pageHeight = doc.internal.pageSize.getHeight(); // Altura da página.

    let yPos = margin.top; // Posição vertical inicial.

    // Adiciona o logo ao PDF, se fornecido.
    if (logoUrl) {
      try {
        const imgWidth = 30;
        const imgHeight = 15;
        doc.addImage(logoUrl, 'PNG', margin.left, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 5;
      } catch (error) {
        console.error('Erro ao carregar logo:', error);
      }
    }

    // Adiciona o título centralizado.
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, pageWidth / 2 - titleWidth / 2, yPos);
    yPos += 10;

    // Adiciona a data e hora de geração do relatório.
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dateText = `${footerText} ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`;
    doc.text(
      dateText,
      pageWidth - margin.right - doc.getTextWidth(dateText),
      yPos,
    );
    yPos += 5;

    // Adiciona uma linha horizontal separadora.
    doc.setDrawColor(200, 200, 200);
    doc.line(margin.left, yPos, pageWidth - margin.right, yPos);
    yPos += 10;

    // Prepara os dados da tabela para o autoTable.
    const tableData = data.map((item) => {
      if (columns) {
        return columns.map((col) => item[col.key]?.toString() || '');
      }
      return Object.values(item).map((value) => value?.toString() || '');
    });

    // Define os cabeçalhos da tabela.
    const headers = columns
      ? columns.map((col) => col.label)
      : Object.keys(data[0] || {}).map((key) =>
          key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase()),
        );

    // Cria a tabela no PDF usando autoTable.
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: yPos,
      margin: { left: margin.left, right: margin.right },
      styles: {
        cellPadding: 3,
        fontSize: 9,
        valign: 'middle',
        halign: 'left',
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [51, 102, 153],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
      },
      // Adiciona o rodapé e a numeração de páginas.
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        const footerY = pageHeight - margin.bottom + 10;

        const pageCount = doc.getNumberOfPages();
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          pageWidth / 2,
          footerY,
          {
            align: 'center',
          },
        );

        doc.setDrawColor(200, 200, 200);
        doc.line(
          margin.left,
          pageHeight - margin.bottom,
          pageWidth - margin.right,
          pageHeight - margin.bottom,
        );
      },
    });

    doc.save(`${fileName}.pdf`); // Salva e baixa o arquivo PDF.
  };

  // Renderiza o botão de exportação.
  return (
    <button
      onClick={exportToPdf}
      disabled={disabled || data.length === 0}
      className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
        disabled || data.length === 0
          ? 'cursor-not-allowed bg-gray-200 text-gray-500'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${className}`}
    >
      <FileText className="mr-2 h-4 w-4" /> {/* Ícone do botão */}
      {buttonText}
    </button>
  );
}
