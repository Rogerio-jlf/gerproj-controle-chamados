'use client';
import { useState, useRef, useEffect } from 'react';
// ================================================================================
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
// ================================================================================
import { getStylesStatus } from './Colunas_Tabela_Chamados';
// ================================================================================
import { FaExclamationTriangle, FaEdit, FaSync } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
// ================================================================================
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
  // ================================================================================

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

  // Nova função para lidar com cliques no select
  const handleSelectClick = (e: React.MouseEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(false);
  };

  const handleConfirmChange = async () => {
    if (!pendingStatus) return;

    setIsUpdating(true);
    try {
      await onUpdateStatus(codChamado, pendingStatus);
      setStatus(pendingStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
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

  // Função para lidar com blur - só fecha se não foi um clique
  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    // Pequeno delay para permitir que o clique seja processado primeiro
    setTimeout(() => {
      setEditing(false);
    }, 100);
  };

  const handleCloseModal = () => {
    setTimeout(() => {
      setShowConfirmDialog(false);
      setPendingStatus(null);
    }, 300);
  };

  const getStatusDisplayName = (statusValue: string) => {
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
            onBlur={handleBlur}
            onChange={handleSelectChange}
            onClick={handleSelectClick}
            onKeyDown={handleKeyDown}
            className={`min-w-[120px] rounded-md px-6 py-2 font-semibold ${getStylesStatus(status)}`}
            disabled={isUpdating}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt} className="bg-white text-gray-900">
                {getStatusDisplayName(opt)}
              </option>
            ))}
          </select>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`group relative cursor-pointer rounded-md p-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-black ${getStylesStatus(status)} ${
                    isUpdating ? 'cursor-wait opacity-50' : ''
                  }`}
                  onClick={() => !isUpdating && setEditing(true)}
                >
                  <div className="flex items-center justify-center gap-4">
                    {isUpdating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        <span className="font-semibold">Atualizando...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">
                          {status ?? 'Sem status'}
                        </span>
                        <FaEdit
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          size={16}
                        />
                      </>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="start"
                sideOffset={8}
                className="bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
              >
                <div>
                  <div className="break-words">Status atual: {status}</div>
                  <div className="mt-1 text-xs font-semibold tracking-wider text-gray-700 italic select-none">
                    {isUpdating ? 'Aguarde...' : 'Clique para alterar o status'}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="!max-w-4xl border border-orange-500 bg-white p-6">
          <AlertDialogHeader className="space-y-4 pb-6">
            <AlertDialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaSync className="text-gray-900" size={32} />
                <h3 className="text-2xl font-bold tracking-wider text-gray-900 select-none">
                  Alterar Status - Chamado #{codChamado}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="group rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-110 hover:rotate-180 hover:bg-red-500 active:scale-90"
              >
                <IoClose size={24} />
              </button>
            </AlertDialogTitle>

            <div className="grid gap-6 py-4">
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-md shadow-black">
                <div className="flex items-center justify-center gap-2">
                  <FaExclamationTriangle
                    className="text-orange-600"
                    size={20}
                  />
                  <h4 className="text-lg font-bold tracking-wider text-gray-900 select-none">
                    Você está prestes a alterar o status
                  </h4>
                </div>

                <div className="rounded-lg bg-white p-4 shadow-inner">
                  <div className="text-center">
                    <p className="text-sm font-semibold tracking-wider text-gray-700 select-none">
                      Chamado
                    </p>
                    <div className="text-3xl font-bold tracking-widest text-gray-900 select-none">
                      #{codChamado}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-semibold tracking-wider text-gray-700 uppercase select-none">
                      Status Atual
                    </p>
                    <div
                      className={`rounded-lg px-6 py-3 text-base font-bold tracking-wider shadow-md shadow-black transition-all select-none ${getStylesStatus(status)}`}
                    >
                      {getStatusDisplayName(status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <FaArrowRightLong className="text-gray-600" size={32} />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-semibold tracking-wider text-gray-700 uppercase select-none">
                      Novo Status
                    </p>
                    <div
                      className={`rounded-lg px-6 py-3 text-base font-bold tracking-wider shadow-md shadow-black transition-all select-none ${getStylesStatus(pendingStatus || '')}`}
                    >
                      {pendingStatus ? getStatusDisplayName(pendingStatus) : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AlertDialogDescription className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4 text-center text-base font-semibold tracking-wider text-gray-900 select-none">
              <div className="flex items-center justify-center gap-2">
                <FaExclamationTriangle className="text-yellow-600" size={16} />
                <span>
                  Esta alteração será salva no banco de dados e não poderá ser
                  desfeita automaticamente.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-6 pt-4">
            <AlertDialogCancel
              onClick={handleCancelChange}
              className="cursor-pointer rounded-md border-none bg-red-600 px-8 py-3 text-lg font-extrabold tracking-widest text-white transition-all select-none hover:scale-105 hover:bg-red-800 hover:shadow-lg hover:shadow-black active:scale-95"
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmChange}
              disabled={isUpdating}
              className="cursor-pointer rounded-md border-none bg-green-600 px-8 py-3 text-lg font-extrabold tracking-widest text-white transition-all select-none hover:scale-105 hover:bg-green-800 hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isUpdating ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FaSync size={16} />
                  <span>Confirmar Alteração</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
