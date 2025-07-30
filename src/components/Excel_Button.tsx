'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { RiFileExcel2Line } from 'react-icons/ri';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

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
    <>
      {data.length > 0 && (
        <button
          onClick={exportToExcel}
          className={`group flex cursor-pointer items-center rounded-md border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold tracking-wider text-slate-200 hover:scale-110 hover:border-white/30 hover:bg-green-800 active:scale-90 ${className}`}
        >
          <RiFileExcel2Line className="mr-2 h-6 w-6 font-semibold text-green-500 group-hover:text-white" />
          {buttonText}
        </button>
      )}
    </>
  );
}
