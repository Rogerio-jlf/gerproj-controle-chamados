import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// ================================================================================
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import StatusCellClicavel from './Cell_Status';
import AssuntoCellEditavel from './Cell_Assunto';
// ================================================================================
import { FaDownload, FaTasks } from 'react-icons/fa';
import { IoCall } from 'react-icons/io5';
import { GrServicePlay } from 'react-icons/gr';
import { HiMiniSquaresPlus } from 'react-icons/hi2';
// ================================================================================
// ================================================================================

export interface ChamadosProps {
  COD_CHAMADO: number;
  DATA_CHAMADO: string;
  HORA_CHAMADO: string;
  CONCLUSAO_CHAMADO: string | null;
  STATUS_CHAMADO: string;
  DTENVIO_CHAMADO: string | null;
  COD_RECURSO: number;
  CODTRF_CHAMADO: string | null;
  COD_CLIENTE: number;
  ASSUNTO_CHAMADO: string;
  EMAIL_CHAMADO: string;
  PRIOR_CHAMADO: string;
  COD_CLASSIFICACAO: number;
  NOME_CLIENTE: string;
  NOME_RECURSO: string;
}

export interface AcoesProps {
  onVisualizarChamado: (codChamado: number) => void;
  onVisualizarOS: (codChamado: number) => void;
  onUpdateAssunto?: (codChamado: number, novoAssunto: string) => Promise<void>;
  onVisualizarTarefas: () => void;
}

// ================================================================================

export const getStylesStatus = (status: string | undefined) => {
  switch (status?.toUpperCase()) {
    case 'NAO FINALIZADO':
      return 'bg-yellow-600 text-white ring-1 ring-white';

    case 'EM ATENDIMENTO':
      return 'bg-blue-600 text-white ring-1 ring-white';

    case 'FINALIZADO':
      return 'bg-green-600 text-white ring-1 ring-white';

    case 'NAO INICIADO':
      return 'bg-red-600 text-white ring-1 ring-white';

    case 'STANDBY':
      return 'bg-orange-600 text-white ring-1 ring-white';

    case 'ATRIBUIDO':
      return 'bg-blue-600 text-white ring-1 ring-white';

    case 'AGUARDANDO VALIDACAO':
      return 'bg-purple-600 text-white ring-1 ring-white';

    default:
      return 'bg-gray-600 text-white ring-1 ring-white';
  }
};

// ================================================================================

// Componente do Menu Circular
interface CircularActionsMenuProps {
  chamado: ChamadosProps;
  acoes: AcoesProps;
}

const CircularActionsMenu = ({ chamado, acoes }: CircularActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(chamado, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chamado_${chamado.COD_CHAMADO}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleToggle = (e: React.MouseEvent) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setButtonPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    setIsOpen(!isOpen);
  };

  // Posições dos botões em um semicírculo (lado esquerdo) - agora com distâncias maiores
  const buttonPositions = [
    { x: -80, y: -70, delay: 0.0 }, // Visualizar Chamado
    { x: -90, y: -10, delay: 0.1 }, // Visualizar OS
    { x: -80, y: 50, delay: 0.15 }, // Visualizar Tarefas
    { x: -40, y: 95, delay: 0.2 }, // Download
  ];

  const actionButtons = [
    {
      icon: IoCall,
      onClick: () => {
        acoes.onVisualizarChamado(chamado.COD_CHAMADO);
        setIsOpen(false);
      },
      tooltip: 'Visualizar Chamado',
    },
    {
      icon: GrServicePlay,
      onClick: () => {
        acoes.onVisualizarOS(chamado.COD_CHAMADO);
        setIsOpen(false);
      },
      tooltip: 'Visualizar OS',
    },
    {
      icon: FaTasks,
      onClick: () => {
        acoes.onVisualizarTarefas();
        setIsOpen(false);
      },
      tooltip: 'Visualizar Tarefa',
    },
    {
      icon: FaDownload,
      onClick: handleDownload,
      tooltip: 'Download Arquivos',
    },
  ];

  return (
    <>
      {/* Botão Principal */}
      <div className="relative flex items-center justify-center">
        <motion.button
          onClick={handleToggle}
          className="relative z-10 inline-flex cursor-pointer items-center justify-center transition-all hover:scale-125 active:scale-95"
        >
          <motion.div animate={{ rotate: isOpen ? 135 : 0 }}>
            {isOpen ? (
              <HiMiniSquaresPlus size={32} />
            ) : (
              <HiMiniSquaresPlus size={32} />
            )}
          </motion.div>
        </motion.button>
      </div>
      {/* ===== */}

      {/* Portal para os botões de ação - renderiza fora da célula */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para fechar quando clicar fora */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Container dos botões fixo na tela */}
            <div
              className="pointer-events-none fixed z-50"
              style={{
                left: buttonPosition.x,
                top: buttonPosition.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {actionButtons.map((button, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <motion.button
                      initial={{
                        opacity: 0,
                        scale: 0,
                        x: 0,
                        y: 0,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: buttonPositions[index].x,
                        y: buttonPositions[index].y,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0,
                        x: 0,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: buttonPositions[index].delay,
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                      }}
                      onClick={button.onClick}
                      className="pointer-events-auto absolute inline-flex cursor-pointer items-center justify-center rounded-full bg-white p-4 text-black transition-all hover:scale-110 hover:ring-3 hover:ring-cyan-500 active:scale-95"
                    >
                      <button.icon size={18} />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    align="center"
                    sideOffset={8}
                    className="z-50 bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
                  >
                    {button.tooltip}
                  </TooltipContent>
                </Tooltip>
              ))}
              {/* ===== */}
            </div>
            {/* ===== */}
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ================================================================================

export const colunasTabela = (
  acoes: AcoesProps
): ColumnDef<ChamadosProps>[] => [
  // número do chamado
  {
    accessorKey: 'COD_CHAMADO',
    header: () => <div className="text-center">Chamado</div>,
    cell: ({ getValue }) => (
      <div className="rounded-md bg-pink-600 p-2 text-center text-white ring-1 ring-white">
        {getValue() as string}
      </div>
    ),
  },
  // =====

  // data do chamado
  {
    accessorKey: 'DATA_CHAMADO',
    header: () => <div className="text-center">Data</div>,
    cell: ({ getValue }) => {
      const dateString = getValue() as string;

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return <div className="text-center">{dateString}</div>;
      }

      try {
        const [year, month, day] = dateString.split('T')[0].split('-');
        const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;

        return <div className="text-center">{formattedDate}</div>;
      } catch {
        console.warn('Formato de data não reconhecido:', dateString);

        return <div className="text-center">{dateString}</div>;
      }
    },
  },
  // =====

  // assunto do chamado (editável)
  {
    accessorKey: 'ASSUNTO_CHAMADO',
    header: () => <div className="text-center">Assunto</div>,
    cell: ({ row }) => (
      <AssuntoCellEditavel
        assunto={row.original.ASSUNTO_CHAMADO}
        codChamado={row.original.COD_CHAMADO}
        onUpdateAssunto={async (codChamado, novoAssunto) => {
          try {
            const response = await fetch(
              `/api/atualizar-assunto-chamado/${codChamado}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  assuntoChamado: novoAssunto,
                  codChamado: codChamado.toString(),
                }),
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Erro ao atualizar Assunto');
            }

            // Atualizar o estado local apenas se a API retornou sucesso
            row.original.ASSUNTO_CHAMADO = novoAssunto;
          } catch (err) {
            console.error('Erro ao atualizar Assunto:', err);
            throw err; // Re-throw para que o componente AssuntoCellEditavel possa tratar
          }
        }}
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    ),
  },
  // =====

  // status do chamado (editável)
  {
    accessorKey: 'STATUS_CHAMADO',
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <StatusCellClicavel
        status={row.original.STATUS_CHAMADO}
        codChamado={row.original.COD_CHAMADO}
        onUpdateStatus={async (codChamado, newStatus) => {
          try {
            const response = await fetch(
              `/api/atualizar-status-chamado/${codChamado}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  statusChamado: newStatus,
                  codChamado: codChamado.toString(),
                }),
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Erro ao atualizar Status');
            }

            // Atualizar o estado local apenas se a API retornou sucesso
            row.original.STATUS_CHAMADO = newStatus;
          } catch (err) {
            console.error('Erro ao atualizar Status:', err);
            throw err; // Re-throw para que o componente StatusCellClicavel possa tratar
          }
        }}
      />
    ),
  },

  // email do chamado
  {
    accessorKey: 'EMAIL_CHAMADO',
    header: () => <div className="text-center">Email</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;

      return (
        <div>
          {value ? (
            <Link href={`mailto:${value}`} className="hover:underline">
              <div className="">{value}</div>
            </Link>
          ) : (
            <div className="text-center">-</div>
          )}
        </div>
      );
    },
  },
  // =====

  // ações com menu circular
  {
    id: 'actions',
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => {
      const chamado = row.original;

      return <CircularActionsMenu chamado={chamado} acoes={acoes} />;
    },
  },
];
