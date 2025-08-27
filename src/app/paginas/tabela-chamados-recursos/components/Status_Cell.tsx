'use client';
import { useState, useRef, useEffect } from 'react';
import { getStylesStatus } from './Colunas_Tabela_Chamados';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';
// ================================================================================

interface Props {
  status: string;
  codChamado: number;
  onUpdateStatus: (codChamado: number, newStatus: string) => Promise<void>;
}
// ================================================================================

const statusOptions = [
  'NAO FINALIZADO',
  'EM ATENDIMENTO',
  'FINALIZADO',
  'NAO INICIADO',
  'STANDBY',
  'ATRIBUIDO',
  'AGUARDANDO VALIDACAO',
];
// ================================================================================

export default function StatusCellClicavel({
  status: initialStatus,
  codChamado,
  onUpdateStatus,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Abre automaticamente o select quando entra em modo de edição
  useEffect(() => {
    if (editing && selectRef.current) {
      setTimeout(() => {
        const select = selectRef.current;
        if (select) {
          select.focus();
          if ('showPicker' in select) {
            (select as any).showPicker();
          } else {
            (select as HTMLSelectElement).click();
          }
        }
      }, 10);
    }
  }, [editing]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;

    // Se selecionou o mesmo status, apenas fecha a edição
    if (newStatus === status) {
      setEditing(false);
      return;
    }

    // Armazena o novo status pendente e mostra confirmação
    setPendingStatus(newStatus);
    setEditing(false);
    setShowConfirmDialog(true);
  };

  const handleConfirmChange = async () => {
    if (!pendingStatus) return;

    setIsUpdating(true);
    try {
      await onUpdateStatus(codChamado, pendingStatus);
      setStatus(pendingStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      // Você pode adicionar uma notificação de erro aqui se quiser
    } finally {
      setIsUpdating(false);
      setPendingStatus(null);
      setShowConfirmDialog(false);
    }
  };

  const handleCancelChange = () => {
    setPendingStatus(null);
    setShowConfirmDialog(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  const getStatusDisplayName = (statusValue: string) => {
    // Converte para um formato mais amigável se necessário
    return statusValue;
  };
  // ================================================================================

  return (
    <>
      <div className="text-center">
        {editing ? (
          <select
            ref={selectRef}
            autoFocus
            value={status}
            onBlur={() => setEditing(false)}
            onChange={handleSelectChange}
            onKeyDown={handleKeyDown}
            className={`rounded-md p-1 font-semibold ${getStylesStatus(status)}`}
            disabled={isUpdating}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>
                {getStatusDisplayName(opt)}
              </option>
            ))}
          </select>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`block cursor-pointer rounded-md p-2 transition-all hover:opacity-80 ${getStylesStatus(status)} ${
                    isUpdating ? 'cursor-wait opacity-50' : ''
                  }`}
                  onClick={() => !isUpdating && setEditing(true)}
                >
                  {isUpdating ? 'Atualizando...' : (status ?? 'Sem status')}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                sideOffset={8}
                className="bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
              >
                <p>
                  {isUpdating ? 'Aguarde...' : 'Clique para alterar o status'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="!max-w-2xl bg-white p-6 shadow-md shadow-black">
          <AlertDialogHeader className="space-y-4 pb-6">
            <AlertDialogTitle className="flex items-center justify-center gap-4 text-center text-2xl font-bold tracking-wider text-gray-900 select-none">
              <div className="flex items-center justify-center">
                <span className="">
                  <FaExclamationTriangle className="text-red-600" size={32} />
                </span>
              </div>
              Confirmar Alteração
            </AlertDialogTitle>

            <div className="flex flex-col gap-4 rounded-md bg-gray-50 p-6 shadow-md shadow-black">
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg font-bold tracking-wider text-gray-900 select-none">
                  Alterar status do chamado
                </p>
                <div className="text-3xl font-bold tracking-widest text-gray-900 italic select-none">
                  #{codChamado}
                </div>
              </div>
              {/* ===== */}

              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-lg font-semibold tracking-wider text-gray-900 italic select-none">
                    de:
                  </p>
                  <div
                    className={`inline-block rounded-md px-4 py-2 text-lg font-bold tracking-wider select-none ${getStylesStatus(status)}`}
                  >
                    {getStatusDisplayName(status)}
                  </div>
                </div>

                <FaArrowRightLong className="mt-6 text-gray-900" size={28} />

                <div className="flex flex-col items-center justify-center">
                  <p className="text-lg font-semibold tracking-wider text-gray-900 italic select-none">
                    para:
                  </p>
                  <div
                    className={`inline-block rounded-md px-4 py-2 text-lg font-bold tracking-wider select-none ${getStylesStatus(pendingStatus || '')}`}
                  >
                    {pendingStatus ? getStatusDisplayName(pendingStatus) : ''}
                  </div>
                </div>
              </div>
            </div>

            <AlertDialogDescription className="text-center text-base font-semibold tracking-wider text-gray-900 select-none">
              Esta ação será salva no banco de dados e não poderá ser desfeita
              automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-6">
            <AlertDialogCancel
              onClick={handleCancelChange}
              className="cursor-pointer rounded-md border-none bg-red-600 px-6 py-2 text-lg font-extrabold tracking-widest text-white transition-all select-none hover:scale-105 hover:bg-red-800 hover:shadow-md hover:shadow-black"
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmChange}
              disabled={isUpdating}
              className="cursor-pointer rounded-md border-none bg-green-600 px-6 py-2 text-lg font-extrabold tracking-widest text-white transition-all select-none hover:scale-105 hover:bg-green-800 hover:shadow-lg hover:shadow-black"
            >
              {isUpdating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Atualizando...
                </div>
              ) : (
                'Confirmar Alteração'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
