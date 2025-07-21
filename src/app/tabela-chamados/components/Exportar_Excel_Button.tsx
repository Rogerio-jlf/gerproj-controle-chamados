'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';

interface ExportaExcelButtonProps<T> {
  data: T[];
  fileName: string;
  buttonText?: string;
  disabled?: boolean;
  className?: string;
  columns?: {
    key: keyof T;
    label: string;
  }[];
  autoFilter?: boolean;
  freezeHeader?: boolean;
}

export default function ExportaExcelButton<T>({
  data,
  fileName,
  buttonText = 'Exportar para Excel',
  disabled = false,
  className = '',
  columns,
  autoFilter = true,
  freezeHeader = true,
}: ExportaExcelButtonProps<T>) {
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados');

    // Cabeçalhos
    const headers = columns
      ? columns.map(col => ({
          header: col.label,
          key: col.key as string,
          width: 20,
        }))
      : Object.keys(data[0] || {}).map(key => ({
          header: key,
          key,
          width: 20,
        }));

    worksheet.columns = headers;

    // Dados
    data.forEach(item => worksheet.addRow(item));

    // Estilo do cabeçalho
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF336699' },
      };
      cell.alignment = { horizontal: 'center' };
    });

    // Autofiltro
    if (autoFilter) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: headers.length },
      };
    }

    // Congelar cabeçalho
    if (freezeHeader) {
      worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    }

    // Gerar e salvar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <button
      onClick={exportToExcel}
      disabled={disabled || data.length === 0}
      className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
        disabled || data.length === 0
          ? 'cursor-not-allowed bg-gray-200 text-gray-500'
          : 'bg-green-600 text-white hover:bg-green-700'
      } transition-colors duration-200 ${className}`}
    >
      <Download className="mr-2 h-4 w-4" />
      {buttonText}
    </button>
  );
}
