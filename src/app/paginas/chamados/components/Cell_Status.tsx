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
import { FaExclamationTriangle, FaEdit, FaSync, FaTasks } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { MdCategory } from 'react-icons/md';
// ================================================================================

interface Classificacao {
   COD_CLASSIFICACAO: number;
   NOME_CLASSIFICACAO: string;
}

interface Tarefa {
   COD_TAREFA: number;
   NOME_TAREFA: string;
}

interface Props {
   status: string;
   codChamado: number;
   onUpdateStatus: (
      codChamado: number,
      newStatus: string,
      codClassificacao?: number,
      codTarefa?: number
   ) => Promise<void>;
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
   const [classificacoes, setClassificacoes] = useState<Classificacao[]>([]);
   const [tarefas, setTarefas] = useState<Tarefa[]>([]);
   const [selectedClassificacao, setSelectedClassificacao] = useState<
      number | null
   >(null);
   const [selectedTarefa, setSelectedTarefa] = useState<number | null>(null);
   const [loadingClassificacoes, setLoadingClassificacoes] = useState(false);
   const [loadingTarefas, setLoadingTarefas] = useState(false);
   const selectRef = useRef<HTMLSelectElement>(null);
   // ================================================================================

   // Função para buscar classificações
   const fetchClassificacoes = async () => {
      setLoadingClassificacoes(true);
      try {
         const response = await fetch('/api/classificacao');
         if (response.ok) {
            const data = await response.json();
            setClassificacoes(data);
         } else {
            console.error('Erro ao buscar classificações');
         }
      } catch (error) {
         console.error('Erro ao buscar classificações:', error);
      } finally {
         setLoadingClassificacoes(false);
      }
   };

   // Função para buscar tarefas
   const fetchTarefas = async () => {
      setLoadingTarefas(true);
      try {
         const response = await fetch(`/api/atribuir-tarefa/${codChamado}`);
         if (response.ok) {
            const data = await response.json();
            setTarefas(data);
         } else {
            console.error('Erro ao buscar tarefas');
         }
      } catch (error) {
         console.error('Erro ao buscar tarefas:', error);
      } finally {
         setLoadingTarefas(false);
      }
   };

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

   const handleSelectChange = async (
      e: React.ChangeEvent<HTMLSelectElement>
   ) => {
      const newStatus = e.target.value;

      // Se selecionou o mesmo status, apenas fecha a edição
      if (newStatus === status) {
         setEditing(false);
         return;
      }

      // Armazena o novo status pendente
      setPendingStatus(newStatus);
      setEditing(false);

      // Buscar dados necessários baseado no status
      if (newStatus === 'EM ATENDIMENTO') {
         await fetchTarefas();
      } else {
         await fetchClassificacoes();
      }

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

      // Validações específicas por status
      if (pendingStatus === 'EM ATENDIMENTO' && !selectedTarefa) {
         alert('Por favor, selecione uma tarefa.');
         return;
      }

      if (pendingStatus !== 'EM ATENDIMENTO' && !selectedClassificacao) {
         alert('Por favor, selecione uma classificação.');
         return;
      }

      setIsUpdating(true);
      try {
         await onUpdateStatus(
            codChamado,
            pendingStatus,
            pendingStatus !== 'EM ATENDIMENTO'
               ? selectedClassificacao!
               : undefined,
            pendingStatus === 'EM ATENDIMENTO' ? selectedTarefa! : undefined
         );
         setStatus(pendingStatus);
      } catch (error) {
         console.error('Erro ao atualizar status:', error);
      } finally {
         setIsUpdating(false);
         setPendingStatus(null);
         setSelectedClassificacao(null);
         setSelectedTarefa(null);
         setShowConfirmDialog(false);
      }
   };

   const handleCancelChange = () => {
      setPendingStatus(null);
      setSelectedClassificacao(null);
      setSelectedTarefa(null);
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
         setSelectedClassificacao(null);
         setSelectedTarefa(null);
      }, 300);
   };

   const getStatusDisplayName = (statusValue: string) => {
      return statusValue;
   };

   // Verificar se precisa mostrar select de classificação ou tarefa
   const shouldShowClassificacao =
      pendingStatus && pendingStatus !== 'EM ATENDIMENTO';
   const shouldShowTarefa = pendingStatus === 'EM ATENDIMENTO';
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
                     <option
                        key={opt}
                        value={opt}
                        className="bg-white text-gray-900"
                     >
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
                                    <span className="font-semibold">
                                       Atualizando...
                                    </span>
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
                        className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                     >
                        <div>
                           <div className="break-words">
                              Status atual: {status}
                           </div>
                           <div className="mt-1 text-xs font-semibold tracking-wider text-gray-700 italic select-none">
                              {isUpdating
                                 ? 'Aguarde...'
                                 : 'Clique para alterar o status'}
                           </div>
                        </div>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            )}
         </div>

         {/* Dialog de Confirmação */}
         <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
         >
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
                              <FaArrowRightLong
                                 className="text-gray-600"
                                 size={32}
                              />
                           </div>

                           <div className="flex flex-col items-center gap-2">
                              <p className="text-sm font-semibold tracking-wider text-gray-700 uppercase select-none">
                                 Novo Status
                              </p>
                              <div
                                 className={`rounded-lg px-6 py-3 text-base font-bold tracking-wider shadow-md shadow-black transition-all select-none ${getStylesStatus(pendingStatus || '')}`}
                              >
                                 {pendingStatus
                                    ? getStatusDisplayName(pendingStatus)
                                    : ''}
                              </div>
                           </div>
                        </div>

                        {/* Select de Classificação */}
                        {shouldShowClassificacao && (
                           <div className="mt-6 w-full">
                              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
                                 <div className="mb-4 flex items-center gap-2">
                                    <MdCategory
                                       className="text-blue-600"
                                       size={20}
                                    />
                                    <h5 className="text-lg font-bold tracking-wider text-blue-900 select-none">
                                       Selecione uma Classificação
                                    </h5>
                                 </div>

                                 {loadingClassificacoes ? (
                                    <div className="flex items-center justify-center gap-2 py-4">
                                       <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                       <span className="font-medium text-blue-700">
                                          Carregando classificações...
                                       </span>
                                    </div>
                                 ) : (
                                    <select
                                       value={selectedClassificacao || ''}
                                       onChange={e =>
                                          setSelectedClassificacao(
                                             Number(e.target.value) || null
                                          )
                                       }
                                       className="w-full rounded-md border border-blue-300 bg-white px-4 py-3 font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                       required
                                    >
                                       <option value="">
                                          Selecione uma classificação...
                                       </option>
                                       {classificacoes.map(classificacao => (
                                          <option
                                             key={
                                                classificacao.COD_CLASSIFICACAO
                                             }
                                             value={
                                                classificacao.COD_CLASSIFICACAO
                                             }
                                          >
                                             {classificacao.NOME_CLASSIFICACAO}
                                          </option>
                                       ))}
                                    </select>
                                 )}

                                 <p className="mt-2 text-sm text-blue-700 italic">
                                    * Obrigatório para status diferentes de "EM
                                    ATENDIMENTO"
                                 </p>
                              </div>
                           </div>
                        )}

                        {/* Select de Tarefa */}
                        {shouldShowTarefa && (
                           <div className="mt-6 w-full">
                              <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
                                 <div className="mb-4 flex items-center gap-2">
                                    <FaTasks
                                       className="text-green-600"
                                       size={20}
                                    />
                                    <h5 className="text-lg font-bold tracking-wider text-green-900 select-none">
                                       Selecione uma Tarefa
                                    </h5>
                                 </div>

                                 {loadingTarefas ? (
                                    <div className="flex items-center justify-center gap-2 py-4">
                                       <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                                       <span className="font-medium text-green-700">
                                          Carregando tarefas...
                                       </span>
                                    </div>
                                 ) : (
                                    <select
                                       value={selectedTarefa || ''}
                                       onChange={e =>
                                          setSelectedTarefa(
                                             Number(e.target.value) || null
                                          )
                                       }
                                       className="w-full rounded-md border border-green-300 bg-white px-4 py-3 font-medium text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                       required
                                    >
                                       <option value="">
                                          Selecione uma tarefa...
                                       </option>
                                       {tarefas.map(tarefa => (
                                          <option
                                             key={tarefa.COD_TAREFA}
                                             value={tarefa.COD_TAREFA}
                                          >
                                             {tarefa.NOME_TAREFA}
                                          </option>
                                       ))}
                                    </select>
                                 )}

                                 <p className="mt-2 text-sm text-green-700 italic">
                                    * Obrigatório para status "EM ATENDIMENTO"
                                 </p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  <AlertDialogDescription className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4 text-center text-base font-semibold tracking-wider text-gray-900 select-none">
                     <div className="flex items-center justify-center gap-2">
                        <FaExclamationTriangle
                           className="text-yellow-600"
                           size={16}
                        />
                        <span>
                           Esta alteração será salva no banco de dados e não
                           poderá ser desfeita automaticamente.
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
                     disabled={
                        isUpdating ||
                        (shouldShowClassificacao && !selectedClassificacao) ||
                        (shouldShowTarefa && !selectedTarefa)
                     }
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
