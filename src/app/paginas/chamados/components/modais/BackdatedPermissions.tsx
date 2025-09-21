'use client';

import { useState, useEffect } from 'react';
import {
   FaUserCog,
   FaCheck,
   FaTimes,
   FaClock,
   FaUsers,
   FaExclamationTriangle,
   FaCalendarAlt,
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { Loader2 } from 'lucide-react';

// ================================================================================
// INTERFACES E TIPOS
// ================================================================================

interface BackdatedPermission {
   resourceId: string;
   resourceName: string;
   chamadoId: string;
   enabled: boolean;
   enabledAt: string;
   enabledBy: string;
}

interface Resource {
   cod_recurso: number;
   nome_recurso: string;
   hrdia_decimal: number;
   hrdia_formatado: string;
   custo_recurso: number;
   receita_recurso: number;
   tpcusto_recurso: number;
}

interface BackdatedPermissionsModalProps {
   isOpen: boolean;
   onClose: () => void;
   currentUserId: string;
   chamadoId: string; // Nova propriedade obrigatória
}

// ================================================================================
// HOOK PARA GERENCIAR PERMISSÕES
// ================================================================================

export const useBackdatedPermissions = () => {
   const [permissions, setPermissions] = useState<BackdatedPermission[]>([]);
   const STORAGE_KEY = 'backdated_appointments_permissions';

   // Carregar permissões do localStorage na inicialização
   useEffect(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
         try {
            const parsed = JSON.parse(stored);
            setPermissions(Array.isArray(parsed) ? parsed : []);
         } catch (error) {
            console.error('Erro ao carregar permissões:', error);
            setPermissions([]);
         }
      }
   }, []);

   // Salvar no localStorage sempre que as permissões mudarem
   const saveToStorage = (newPermissions: BackdatedPermission[]) => {
      try {
         localStorage.setItem(STORAGE_KEY, JSON.stringify(newPermissions));
      } catch (error) {
         console.error('Erro ao salvar permissões:', error);
      }
   };

   // Habilitar permissão para um recurso em um chamado específico
   const enablePermission = (
      resourceId: string,
      resourceName: string,
      chamadoId: string,
      adminId: string
   ) => {
      setPermissions(prev => {
         const newPermissions = prev.filter(
            p => !(p.resourceId === resourceId && p.chamadoId === chamadoId)
         );
         const updatedPermissions = [
            ...newPermissions,
            {
               resourceId,
               resourceName,
               chamadoId,
               enabled: true,
               enabledAt: new Date().toISOString(),
               enabledBy: adminId,
            },
         ];
         saveToStorage(updatedPermissions);
         return updatedPermissions;
      });
   };

   // Desabilitar permissão para um recurso em um chamado específico
   const disablePermission = (resourceId: string, chamadoId: string) => {
      setPermissions(prev => {
         const updatedPermissions = prev.filter(
            p => !(p.resourceId === resourceId && p.chamadoId === chamadoId)
         );
         saveToStorage(updatedPermissions);
         return updatedPermissions;
      });
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
   const getActivePermissions = (): BackdatedPermission[] => {
      return permissions.filter(p => p.enabled);
   };

   return {
      permissions,
      enablePermission,
      disablePermission,
      hasPermission,
      getActivePermissions,
   };
};

// ================================================================================
// MODAL DE GERENCIAMENTO DE PERMISSÕES
// ================================================================================

export const BackdatedPermissionsModal: React.FC<
   BackdatedPermissionsModalProps
> = ({ isOpen, onClose, currentUserId, chamadoId }) => {
   const {
      hasPermission,
      enablePermission,
      disablePermission,
      getActivePermissions,
   } = useBackdatedPermissions();

   const [resources, setResources] = useState<Resource[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   // Fetch recursos quando o modal abre
   useEffect(() => {
      if (isOpen) {
         fetchResources();
      }
   }, [isOpen]);

   const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
         const response = await fetch('/api/recursos');
         if (!response.ok) {
            throw new Error('Erro ao carregar recursos');
         }

         const data = await response.json();
         setResources(data);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
         setLoading(false);
      }
   };

   const handlePermissionToggle = (resource: Resource, enabled: boolean) => {
      if (enabled) {
         enablePermission(
            resource.cod_recurso.toString(),
            resource.nome_recurso,
            chamadoId,
            currentUserId
         );
      } else {
         disablePermission(resource.cod_recurso.toString(), chamadoId);
      }
   };

   const activePermissions = getActivePermissions().filter(
      p => p.chamadoId === chamadoId
   );

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
         <div className="relative max-h-[90vh] w-[800px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <header className="flex items-center justify-between bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 p-6">
               <div className="flex items-center gap-4">
                  <div className="rounded-md bg-white/20 p-3">
                     <FaUserCog className="text-white" size={32} />
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold text-white">
                        Apontamento Retroativo - Chamado #{chamadoId}
                     </h1>
                     <p className="text-purple-100">
                        Permissões especiais para este chamado específico
                     </p>
                  </div>
               </div>

               <button
                  onClick={onClose}
                  className="rounded-full bg-red-500/20 p-2 text-white transition-all hover:bg-red-500/40"
               >
                  <IoClose size={24} />
               </button>
            </header>

            {/* Aviso */}
            <div className="mx-6 mt-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
               <div className="flex items-center gap-3">
                  <FaExclamationTriangle
                     className="text-yellow-600"
                     size={20}
                  />
                  <div>
                     <p className="font-semibold text-yellow-800">Atenção!</p>
                     <p className="text-sm text-yellow-700">
                        Recursos marcados poderão criar apontamentos em datas
                        anteriores
                        <strong> APENAS para o Chamado #{chamadoId}</strong>.
                        Esta permissão é específica e temporária.
                     </p>
                  </div>
               </div>
            </div>

            {/* Stats */}
            {activePermissions.length > 0 && (
               <div className="mx-6 mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                     <FaCalendarAlt className="text-green-600" size={16} />
                     <span className="font-semibold text-green-800">
                        {activePermissions.length} recurso(s) com permissão
                        ativa para este chamado
                     </span>
                  </div>
               </div>
            )}

            {/* Content */}
            <div className="p-6">
               {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                     <Loader2
                        className="mb-4 animate-spin text-purple-600"
                        size={40}
                     />
                     <p className="text-gray-600">Carregando recursos...</p>
                  </div>
               ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12">
                     <FaTimes className="mb-4 text-red-500" size={40} />
                     <p className="font-semibold text-red-600">
                        Erro ao carregar recursos
                     </p>
                     <p className="text-sm text-gray-600">{error}</p>
                     <button
                        onClick={fetchResources}
                        className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
                     >
                        Tentar Novamente
                     </button>
                  </div>
               ) : resources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                     <FaUsers className="mb-4 text-gray-400" size={40} />
                     <p className="text-gray-600">Nenhum recurso encontrado</p>
                  </div>
               ) : (
                  <div>
                     <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <FaUsers className="text-purple-600" size={18} />
                        Recursos Disponíveis ({resources.length})
                     </h3>

                     <div className="max-h-96 space-y-2 overflow-y-auto">
                        {resources.map(resource => {
                           const isEnabled = hasPermission(
                              resource.cod_recurso.toString(),
                              chamadoId
                           );

                           return (
                              <div
                                 key={resource.cod_recurso}
                                 className={`flex items-center justify-between rounded-lg border-2 p-4 transition-all ${
                                    isEnabled
                                       ? 'border-green-300 bg-green-50'
                                       : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                                 }`}
                              >
                                 <div className="flex items-center gap-3">
                                    <div
                                       className={`h-3 w-3 rounded-full ${
                                          isEnabled
                                             ? 'bg-green-500'
                                             : 'bg-gray-400'
                                       }`}
                                    />
                                    <div>
                                       <p className="font-semibold text-gray-800">
                                          {resource.nome_recurso}
                                       </p>
                                       <p className="text-sm text-gray-600">
                                          ID: {resource.cod_recurso} • Jornada:{' '}
                                          {resource.hrdia_formatado}
                                       </p>
                                    </div>
                                 </div>

                                 <label className="flex cursor-pointer items-center gap-2">
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
                                       className={`flex h-6 w-6 items-center justify-center rounded border-2 transition-all ${
                                          isEnabled
                                             ? 'border-green-500 bg-green-500 text-white'
                                             : 'border-gray-300 hover:border-purple-400'
                                       }`}
                                    >
                                       {isEnabled && <FaCheck size={14} />}
                                    </div>
                                    <span
                                       className={`font-medium ${
                                          isEnabled
                                             ? 'text-green-700'
                                             : 'text-gray-600'
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
                  </div>
               )}
            </div>

            {/* Footer */}
            <footer className="border-t bg-gray-50 p-6">
               <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                     {activePermissions.length > 0 && (
                        <span>
                           Permissões ativas para Chamado #{chamadoId}:{' '}
                           {activePermissions.length}
                        </span>
                     )}
                  </div>
                  <button
                     onClick={onClose}
                     className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-purple-700"
                  >
                     Concluir
                  </button>
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
