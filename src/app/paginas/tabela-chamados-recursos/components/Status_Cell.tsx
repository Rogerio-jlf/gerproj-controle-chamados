'use client';
import { useState } from 'react';
import { getStylesStatus } from './Colunas'; // importe sua função de estilos

interface StatusCellProps {
  status: string;
  codChamado: number;
  onUpdateStatus: (codChamado: number, newStatus: string) => Promise<void>;
}

const statusOptions = [
  'NAO FINALIZADO',
  'EM ATENDIMENTO',
  'FINALIZADO',
  'NAO INICIADO',
  'STANDBY',
  'ATRIBUIDO',
  'AGUARDANDO VALIDACAO',
];

export default function StatusCell({
  status: initialStatus,
  codChamado,
  onUpdateStatus,
}: StatusCellProps) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setEditing(false);
    await onUpdateStatus(codChamado, newStatus);
  };

  return (
    <div className="text-center">
      {editing ? (
        <select
          autoFocus
          value={status}
          onBlur={() => setEditing(false)}
          onChange={handleChange}
          className={`rounded-md p-1 font-semibold ${getStylesStatus(status)}`}
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <div
          className={`block cursor-pointer rounded-md p-2 ${getStylesStatus(status)}`}
          onClick={() => setEditing(true)}
        >
          {status ?? 'Sem status'}
        </div>
      )}
    </div>
  );
}
