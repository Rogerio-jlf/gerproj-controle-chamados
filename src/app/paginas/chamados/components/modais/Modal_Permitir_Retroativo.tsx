'use client';
// ================================================================================
import { useState, useEffect, useCallback } from 'react';
// ================================================================================
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '../../../../../components/ui/tooltip';
// ================================================================================
import { TabelaRecursoProps } from '../../../../../types/types';
// ================================================================================
import { Loader2 } from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import {
   FaUserCog,
   FaCheck,
   FaTimes,
   FaUsers,
   FaExclamationTriangle,
   FaCalendarAlt,
   FaUser,
} from 'react-icons/fa';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================
interface PermitirRetroativoProps {
   resourceId: string;
   resourceName: string;
   chamadoId: string;
   enabled: boolean;
   enabledAt: string;
   enabledBy: string;
}

interface ModalPermitirRetroativoProps {
   isOpen: boolean;
   onClose: () => void;
   currentUserId: string;
   chamadoId: string;
}

// ================================================================================
// HOOK PARA GERENCIAR PERMISSÕES (AGORA COM API)
// ================================================================================

export const useModalPermitirRetroativo = () => {
   const [permissions, setPermissions] = useState<PermitirRetroativoProps[]>(
      []
   );
   const [loading, setLoading] = useState(false);

   // Função para fazer chamadas à API
   const makeApiCall = async (method: string, data?: any): Promise<any> => {
      const token = localStorage.getItem('token');
      if (!token) {
         throw new Error('Token não encontrado');
      }

      const options: RequestInit = {
         method,
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      };

      if (
         data &&
         (method === 'POST' || method === 'DELETE' || method === 'PUT')
      ) {
         options.body = JSON.stringify(data);
      }

      const response = await fetch('/api/permitir-retroativo', options);

      if (!response.ok) {
         throw new Error(`Erro na API: ${response.statusText}`);
      }

      return response.json();
   };

   // Carregar permissões da API
   const loadPermissions = useCallback(
      async (resourceId?: string, chamadoId?: string) => {
         setLoading(true);
         try {
            let url = '/api/permitir-retroativo';
            const params = new URLSearchParams();

            if (resourceId) params.append('resourceId', resourceId);
            if (chamadoId) params.append('chamadoId', chamadoId);

            if (params.toString()) {
               url += `?${params.toString()}`;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(url, {
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
            });

            if (response.ok) {
               const data = await response.json();
               setPermissions(Array.isArray(data) ? data : []);
            }
         } catch (error) {
            console.error('Erro ao carregar permissões:', error);
            setPermissions([]);
         } finally {
            setLoading(false);
         }
      },
      []
   );

   // Habilitar permissão para um recurso em um chamado específico
   const enablePermission = async (
      resourceId: string,
      resourceName: string,
      chamadoId: string,
      adminId: string
   ): Promise<boolean> => {
      try {
         console.log('📤 Fazendo POST para habilitar permissão:', {
            resourceId,
            resourceName,
            chamadoId,
            adminId,
         });

         await makeApiCall('POST', {
            resourceId,
            resourceName,
            chamadoId,
            adminId,
         });

         // Atualizar estado local
         setPermissions(prev => {
            const filtered = prev.filter(
               p => !(p.resourceId === resourceId && p.chamadoId === chamadoId)
            );
            return [
               ...filtered,
               {
                  resourceId,
                  resourceName,
                  chamadoId,
                  enabled: true,
                  enabledAt: new Date().toISOString(),
                  enabledBy: adminId,
               },
            ];
         });

         console.log('✅ Permissão habilitada com sucesso');
         return true;
      } catch (error) {
         console.error('❌ Erro ao habilitar permissão:', error);
         return false;
      }
   };

   // Desabilitar permissão para um recurso em um chamado específico
   const disablePermission = async (
      resourceId: string,
      chamadoId: string
   ): Promise<boolean> => {
      try {
         console.log('📤 Fazendo DELETE para desabilitar permissão:', {
            resourceId,
            chamadoId,
         });

         await makeApiCall('DELETE', {
            resourceId,
            chamadoId,
         });

         // Atualizar estado local
         setPermissions(prev =>
            prev.filter(
               p => !(p.resourceId === resourceId && p.chamadoId === chamadoId)
            )
         );

         console.log('✅ Permissão desabilitada com sucesso');
         return true;
      } catch (error) {
         console.error('❌ Erro ao desabilitar permissão:', error);
         return false;
      }
   };

   // Verificar se um recurso tem permissão para um chamado específico
   const hasPermission = (resourceId: string, chamadoId: string): boolean => {
      return permissions.some(
         p =>
            p.resourceId === resourceId &&
            p.chamadoId === chamadoId &&
            p.enabled
      );
   };

   // Obter todas as permissões ativas
   const getActivePermissions = (): PermitirRetroativoProps[] => {
      return permissions.filter(p => p.enabled);
   };

   return {
      permissions,
      loading,
      loadPermissions,
      enablePermission,
      disablePermission,
      hasPermission,
      getActivePermissions,
   };
};

// ================================================================================
// MODAL DE GERENCIAMENTO DE PERMISSÕES (ATUALIZADO)
// ================================================================================

export const ModalPermitirRetroativo: React.FC<
   ModalPermitirRetroativoProps
> = ({ isOpen, onClose, currentUserId, chamadoId }) => {
   const {
      hasPermission,
      enablePermission,
      disablePermission,
      getActivePermissions,
      loadPermissions,
      loading: permissionsLoading,
   } = useModalPermitirRetroativo();

   const [resources, setResources] = useState<TabelaRecursoProps[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [chamadoInfo, setChamadoInfo] = useState<{
      assunto: string;
      cliente: string;
      status: string;
   } | null>(null);

   // 🆕 Estado para controlar permissões pendentes (não salvas ainda)
   const [pendingPermissions, setPendingPermissions] = useState<{
      [resourceId: string]: boolean;
   }>({});

   // 🆕 Estado para loading do botão Concluir
   const [savingPermissions, setSavingPermissions] = useState(false);

   const fetchChamadoAndResources = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
         const token = localStorage.getItem('token');
         if (!token) {
            throw new Error('Token não encontrado');
         }

         // Buscar dados do chamado específico
         const chamadoResponse = await fetch(
            `/api/chamados?codChamado=${chamadoId}`,
            {
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
            }
         );

         if (!chamadoResponse.ok) {
            throw new Error('Erro ao carregar dados do chamado');
         }

         const chamadoData = await chamadoResponse.json();

         if (!chamadoData || chamadoData.length === 0) {
            throw new Error('Chamado não encontrado');
         }

         const chamado = chamadoData[0];

         // Salvar informações do chamado
         setChamadoInfo({
            assunto: chamado.ASSUNTO_CHAMADO || 'Sem assunto',
            cliente: chamado.NOME_CLIENTE || 'Cliente não informado',
            status: chamado.STATUS_CHAMADO || 'Status não informado',
         });

         // Se o status for "EM ATENDIMENTO", não permitir permissões
         if (chamado.STATUS_CHAMADO === 'EM ATENDIMENTO') {
            setError(
               'Não é possível conceder permissões para chamados em atendimento'
            );
            return;
         }

         // Buscar dados do recurso responsável
         if (chamado.COD_RECURSO) {
            const recursoResponse = await fetch(
               `/api/recursos?codRecurso=${chamado.COD_RECURSO}`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                     'Content-Type': 'application/json',
                  },
               }
            );

            if (!recursoResponse.ok) {
               throw new Error('Erro ao carregar dados do recurso');
            }

            const recursoData = await recursoResponse.json();

            if (recursoData && recursoData.length > 0) {
               setResources(recursoData);
            } else {
               // Se não encontrou o recurso específico, buscar todos como fallback
               const allResourcesResponse = await fetch('/api/recursos', {
                  headers: {
                     Authorization: `Bearer ${token}`,
                     'Content-Type': 'application/json',
                  },
               });

               if (allResourcesResponse.ok) {
                  const allResourcesData = await allResourcesResponse.json();
                  setResources(allResourcesData);
               } else {
                  throw new Error('Erro ao carregar recursos');
               }
            }
         } else {
            // Se o chamado não tem recurso definido, buscar todos
            const allResourcesResponse = await fetch('/api/recursos', {
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
            });

            if (allResourcesResponse.ok) {
               const allResourcesData = await allResourcesResponse.json();
               setResources(allResourcesData);
            } else {
               throw new Error('Erro ao carregar recursos');
            }
         }

         // Carregar permissões existentes para este chamado
         await loadPermissions(undefined, chamadoId);
      } catch (err) {
         console.error('Erro ao carregar dados:', err);
         setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
         setLoading(false);
      }
   }, [chamadoId, loadPermissions]);

   // Fetch recursos responsáveis pelo chamado quando o modal abre
   useEffect(() => {
      if (isOpen) {
         fetchChamadoAndResources();
         // 🆕 Limpar permissões pendentes ao abrir
         setPendingPermissions({});
      }
   }, [isOpen, fetchChamadoAndResources]);

   // 🆕 Função para marcar/desmarcar permissões (só armazena localmente)
   const handlePermissionToggle = (
      resource: TabelaRecursoProps,
      enabled: boolean
   ) => {
      const resourceId = resource.COD_RECURSO.toString();

      console.log('🔄 Toggle permissão local:', {
         resource: resource.NOME_RECURSO,
         enabled,
         resourceId,
         currentUserId,
      });

      setPendingPermissions(prev => ({
         ...prev,
         [resourceId]: enabled,
      }));
   };

   // 🆕 Função para salvar todas as permissões pendentes
   const handleSavePermissions = async () => {
      if (!currentUserId) {
         alert('ID do usuário não informado. Não é possível salvar.');
         return;
      }

      setSavingPermissions(true);
      console.log('💾 Iniciando salvamento das permissões...');
      console.log('📋 Permissões pendentes:', pendingPermissions);

      let hasErrors = false;

      try {
         // Processar cada permissão pendente
         for (const [resourceId, enabled] of Object.entries(
            pendingPermissions
         )) {
            const resource = resources.find(
               r => r.COD_RECURSO.toString() === resourceId
            );

            if (!resource) {
               console.warn(`⚠️ Recurso não encontrado: ${resourceId}`);
               continue;
            }

            let success = false;

            if (enabled) {
               // Habilitar permissão
               success = await enablePermission(
                  resourceId,
                  resource.NOME_RECURSO,
                  chamadoId,
                  currentUserId
               );
            } else {
               // Desabilitar permissão
               success = await disablePermission(resourceId, chamadoId);
            }

            if (!success) {
               console.error(
                  `❌ Falha ao processar permissão para recurso: ${resource.NOME_RECURSO}`
               );
               hasErrors = true;
            }
         }

         if (hasErrors) {
            alert(
               'Algumas permissões não puderam ser salvas. Verifique o console para detalhes.'
            );
         } else {
            console.log('✅ Todas as permissões foram salvas com sucesso!');
            // 🆕 Limpar permissões pendentes após salvar
            setPendingPermissions({});
            onClose();
         }
      } catch (error) {
         console.error('❌ Erro geral ao salvar permissões:', error);
         alert('Erro ao salvar permissões. Tente novamente.');
      } finally {
         setSavingPermissions(false);
      }
   };

   // 🆕 Função para verificar se um recurso está habilitado (considerando pendentes)
   const isResourceEnabled = (resourceId: string): boolean => {
      // Se tem permissão pendente, usar ela
      if (resourceId in pendingPermissions) {
         return pendingPermissions[resourceId];
      }

      // Senão, usar permissão existente da API
      return hasPermission(resourceId, chamadoId);
   };

   const activePermissions = getActivePermissions().filter(
      p => p.chamadoId === chamadoId
   );

   // 🆕 Verificar se há pelo menos uma permissão ativa (incluindo pendentes)
   const hasPendingChanges = Object.keys(pendingPermissions).length > 0;
   const hasActivePermissions =
      activePermissions.length > 0 || hasPendingChanges;

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg">
         <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-[800px] overflow-hidden rounded-2xl border-0 bg-white shadow-xl shadow-black transition-all duration-500 ease-out">
            {/* ===== HEADER ===== */}
            <header className="relative flex items-center justify-between bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 p-6 shadow-md shadow-black">
               <div className="flex items-center justify-center gap-6">
                  <div className="rounded-md border-none bg-white/10 p-3 shadow-md shadow-black">
                     <FaUserCog className="text-white" size={32} />
                  </div>
                  {/* ========== */}
                  <div className="flex flex-col">
                     <h1 className="text-3xl font-extrabold tracking-wider text-white select-none">
                        Apontamento Retroativo
                     </h1>
                     {/* ===== */}
                     <p className="text-xl font-bold tracking-widest text-white italic select-none">
                        Chamado - #{chamadoId}
                     </p>
                  </div>
               </div>
               {/* ========== */}

               {/* Botão Fechar Modal */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <button
                        onClick={onClose}
                        className="group cursor-pointer rounded-full bg-red-500/50 p-3 text-white shadow-md shadow-black transition-all select-none hover:scale-125 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                        <IoClose size={24} />
                     </button>
                  </TooltipTrigger>
                  <TooltipContent
                     side="top"
                     align="center"
                     sideOffset={8}
                     className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-black select-none"
                  >
                     Sair
                  </TooltipContent>
               </Tooltip>
            </header>
            {/* ============================== */}
            <div className="flex flex-col gap-6 p-6">
               {/* ===== INFORMAÇÕES DO CHAMADO ===== */}
               {chamadoInfo && (
                  <div className="flex flex-col gap-2 rounded-lg border border-l-8 border-blue-500 bg-blue-100 p-4">
                     <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-blue-800" size={20} />
                        {/* ===== */}
                        <span className="text-base font-extrabold tracking-wider text-blue-800 uppercase select-none">
                           Informações do chamado
                        </span>
                     </div>
                     {/* ========== */}
                     <div className="flex flex-col gap-1">
                        <p>
                           <span className="text-xs font-extrabold tracking-widest text-blue-800 uppercase select-none">
                              Assunto:
                           </span>{' '}
                           <span className="text-sm font-bold tracking-widest text-blue-800 italic select-none">
                              {chamadoInfo.assunto}
                           </span>
                        </p>
                        {/* ===== */}
                        <p>
                           <span className="text-xs font-extrabold tracking-widest text-blue-800 uppercase select-none">
                              Cliente:
                           </span>{' '}
                           <span className="text-sm font-bold tracking-widest text-blue-800 italic select-none">
                              {chamadoInfo.cliente}
                           </span>
                        </p>
                        {/* ===== */}
                        <p>
                           <span className="text-xs font-extrabold tracking-widest text-blue-800 uppercase select-none">
                              Status:
                           </span>{' '}
                           <span className="text-sm font-bold tracking-widest text-blue-800 italic select-none">
                              {chamadoInfo.status}
                           </span>
                        </p>
                     </div>
                  </div>
               )}
               {/* ==================== */}

               {/* ===== ATENÇÃO ===== */}
               <div className="flex flex-col gap-2 rounded-lg border border-l-8 border-amber-500 bg-amber-100 p-4">
                  <div className="flex items-center gap-3">
                     <FaExclamationTriangle
                        className="text-yellow-800"
                        size={20}
                     />
                     {/* ===== */}
                     <span className="text-base font-extrabold tracking-wider text-amber-800 uppercase select-none">
                        Atenção!
                     </span>
                  </div>
                  {/* ========== */}
                  <p className="text-sm text-yellow-700">
                     Recursos marcados poderão criar apontamentos em datas
                     anteriores ao mês atual, apenas para o Chamado #{chamadoId}
                     . Esta permissão é específica e temporária.{' '}
                     <strong>
                        As permissões são compartilhadas entre todos os
                        dispositivos.
                     </strong>
                  </p>
               </div>
               {/* ==================== */}

               {/* 🆕 AVISO SOBRE ALTERAÇÕES PENDENTES */}
               {hasPendingChanges && (
                  <div className="flex flex-col gap-2 rounded-lg border border-l-8 border-orange-500 bg-orange-100 p-4">
                     <div className="flex items-center gap-3">
                        <FaExclamationTriangle
                           className="text-orange-800"
                           size={20}
                        />
                        <span className="text-base font-extrabold tracking-wider text-orange-800 uppercase select-none">
                           Alterações não salvas!
                        </span>
                     </div>
                     <p className="text-sm text-orange-700">
                        Você tem alterações pendentes. Clique em{' '}
                        <strong>"Salvar e Concluir"</strong> para confirmar as
                        mudanças.
                     </p>
                  </div>
               )}

               {/* ===== RECURSO RESPONSÁVEL ===== */}
               <div className="">
                  {/* Loader */}
                  {loading || permissionsLoading ? (
                     <div className="flex flex-col items-center justify-center py-12">
                        <Loader2
                           className="mb-4 animate-spin text-purple-600"
                           size={40}
                        />
                        <p className="text-base font-bold tracking-widest text-black italic select-none">
                           {loading
                              ? 'Carregando recursos do chamado...'
                              : 'Carregando permissões...'}
                        </p>
                     </div>
                  ) : // ==========
                  // Error
                  error ? (
                     <div className="flex flex-col items-center justify-center py-12">
                        <FaTimes className="mb-4 text-red-500" size={40} />
                        <p className="text-base font-bold tracking-widest text-red-600 italic select-none">
                           Erro ao carregar dados
                        </p>
                        <p className="text-base font-bold tracking-widest italic select-none">
                           {error}
                        </p>
                        <button
                           onClick={fetchChamadoAndResources}
                           className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
                        >
                           Tentar Novamente
                        </button>
                     </div>
                  ) : // =========
                  // Não há recursos
                  resources.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-12">
                        <FaUsers className="mb-4 text-gray-400" size={40} />
                        <p className="text-gray-600">
                           Nenhum recurso encontrado para este chamado
                        </p>
                     </div>
                  ) : (
                     // =========
                     // Lista de Recursos
                     <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
                        {resources.map(resource => {
                           const resourceId = resource.COD_RECURSO.toString();
                           const isEnabled = isResourceEnabled(resourceId);

                           return (
                              <div
                                 key={resource.COD_RECURSO}
                                 className={`flex items-center justify-between p-4 ${
                                    isEnabled
                                       ? 'rounded-lg border border-l-8 border-green-500 bg-green-100'
                                       : 'rounded-lg border border-l-8 border-slate-500 bg-slate-100'
                                 }`}
                              >
                                 <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                       {resources.length === 1 ? (
                                          <FaUser
                                             className="text-green-800"
                                             size={20}
                                          />
                                       ) : (
                                          <FaUsers
                                             className="text-green-800"
                                             size={20}
                                          />
                                       )}
                                       {/* ===== */}

                                       {resources.length === 1 ? (
                                          <h3 className="text-base font-bold tracking-widest text-green-800 uppercase">
                                             Recurso responsável pelo chamado
                                          </h3>
                                       ) : (
                                          <h3 className="text-base font-bold tracking-widest text-green-800 uppercase">
                                             Recursos responsáveis pelo chamado
                                          </h3>
                                       )}
                                    </div>
                                    {/* ========== */}

                                    <div className="flex flex-col gap-1">
                                       <p className="text-sm font-extrabold tracking-widest text-green-700 italic select-none">
                                          Recurso:{' '}
                                          <span className="font-semibold">
                                             {resource.NOME_RECURSO}
                                          </span>
                                       </p>
                                       <p className="text-sm font-extrabold tracking-widest text-green-700 italic select-none">
                                          <span className="font-semibold">
                                             CÓD:
                                          </span>{' '}
                                          {resource.COD_RECURSO}
                                       </p>
                                    </div>
                                 </div>
                                 {/* ================== */}

                                 <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                       type="checkbox"
                                       checked={isEnabled}
                                       onChange={e =>
                                          handlePermissionToggle(
                                             resource,
                                             e.target.checked
                                          )
                                       }
                                       className="sr-only"
                                    />
                                    <div
                                       className={`flex h-6 w-6 items-center justify-center rounded border shadow-md shadow-black transition-all hover:scale-110 active:scale-95 ${
                                          isEnabled
                                             ? 'border-green-800 bg-green-500 text-black'
                                             : 'border-slate-800'
                                       }`}
                                    >
                                       {isEnabled && <FaCheck size={14} />}
                                    </div>
                                    <span
                                       className={`font-medium ${
                                          isEnabled
                                             ? 'text-base font-semibold tracking-widest text-green-700 italic select-none'
                                             : 'text-base font-semibold tracking-widest text-slate-700 italic select-none'
                                       }`}
                                    >
                                       {isEnabled
                                          ? 'Habilitado'
                                          : 'Desabilitado'}
                                    </span>
                                 </label>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>

            {/* Footer */}
            <footer className="border-t-2 border-purple-500 bg-purple-200 p-6">
               <div className="flex items-center justify-between">
                  <div className="text-base font-semibold tracking-wider text-purple-700 select-none">
                     {hasActivePermissions && !hasPendingChanges && (
                        <span className="text-base font-semibold tracking-wider text-purple-700 select-none">
                           Permissões ativas para o Chamado #{chamadoId}
                        </span>
                     )}
                     {hasPendingChanges && (
                        <span className="text-base font-semibold tracking-wider text-orange-700 select-none">
                           {Object.keys(pendingPermissions).length}{' '}
                           alteração(ões) pendente(s)
                        </span>
                     )}
                  </div>
                  {/* ========== */}

                  <div className="flex gap-3">
                     {/* 🆕 Botão Cancelar (quando há mudanças pendentes) */}
                     {hasPendingChanges && (
                        <button
                           onClick={() => {
                              setPendingPermissions({});
                              console.log('❌ Alterações canceladas');
                           }}
                           disabled={savingPermissions}
                           className="cursor-pointer rounded-xl border-none bg-gray-500 px-6 py-2 text-lg font-extrabold text-white shadow-sm shadow-black transition-all select-none hover:scale-105 hover:bg-gray-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                           Cancelar
                        </button>
                     )}

                     {/* 🆕 Botão principal - muda baseado no estado */}
                     <button
                        onClick={
                           hasPendingChanges ? handleSavePermissions : onClose
                        }
                        disabled={savingPermissions}
                        className={`cursor-pointer rounded-xl border-none px-6 py-2 text-lg font-extrabold text-white shadow-sm shadow-black select-none ${
                           hasPendingChanges
                              ? 'bg-green-500 transition-all hover:scale-105 hover:bg-green-700 hover:shadow-md hover:shadow-black active:scale-95'
                              : 'bg-purple-500 transition-all hover:scale-105 hover:bg-purple-900 hover:shadow-md hover:shadow-black active:scale-95'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                     >
                        {savingPermissions ? (
                           <div className="flex items-center gap-2">
                              <Loader2 className="animate-spin" size={16} />
                              Salvando...
                           </div>
                        ) : hasPendingChanges ? (
                           'Salvar e Concluir'
                        ) : (
                           'Concluir'
                        )}
                     </button>
                  </div>
               </div>
            </footer>
         </div>
      </div>
   );
};

// ================================================================================
// FUNÇÕES AUXILIARES PARA INTEGRAÇÃO
// ================================================================================

// Função para verificar se o usuário atual pode usar datas retroativas para um chamado específico
export const canUseBackdatedAppointments = (
   userId: string,
   chamadoId: string
): boolean => {
   const STORAGE_KEY = 'backdated_appointments_permissions';

   if (!userId || !chamadoId) return false;

   try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const permissions = JSON.parse(stored);
      return (
         Array.isArray(permissions) &&
         permissions.some(
            (p: any) =>
               p.resourceId === userId && p.chamadoId === chamadoId && p.enabled
         )
      );
   } catch {
      return false;
   }
};

// Função helper para obter o ID do usuário atual independente do sistema usado
export const getCurrentUserId = (user: any): string => {
   // Para o hook useAuth (segunda versão)
   if (user?.recurso?.id) {
      return user.recurso.id.toString();
   }

   // Para o AuthContext (primeira versão)
   if (user?.codRecurso) {
      return user.codRecurso.toString();
   }

   // Fallback para ID geral
   if (user?.id) {
      return user.id.toString();
   }

   return '';
};

// Função helper para verificar se é admin independente do sistema usado
export const isUserAdmin = (user: any): boolean => {
   // Para o hook useAuth (segunda versão)
   if (user?.tipo === 'ADM') return true;

   // Para o AuthContext (primeira versão)
   if (user?.isAdmin === true) return true;

   return false;
};
