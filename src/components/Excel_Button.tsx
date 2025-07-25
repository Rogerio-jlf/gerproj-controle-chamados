'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { RiFileExcel2Line } from 'react-icons/ri';

interface ExportaExcelButtonProps<T> {
  data: T[];
  fileName: string;
  title?: string;
  buttonText?: string;
  disabled?: boolean;
  className?: string;
  columns?: {
    key: keyof T | string;
    label: string;
  }[];
  autoFilter?: boolean;
  freezeHeader?: boolean;
}

export default function ExcelButton<T>({
  data,
  fileName,
  buttonText = 'Excel',
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
      className={`group flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
        disabled || data.length === 0
          ? 'cursor-not-allowed text-indigo-500'
          : 'cursor-pointer bg-green-500 text-white hover:bg-green-600 active:scale-90'
      } transition-all duration-100 ${className}`}
    >
      <RiFileExcel2Line className="mr-2 h-4 w-4 text-green-500 group-hover:text-white" />
      {buttonText}
    </button>
  );
}
