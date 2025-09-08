import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Users, Brain } from 'lucide-react';
import ModalAtribuicaoInteligente from '../app/paginas/chamados/components/Modal_Atribuicao_Inteligente';
// Interface para o chamado
interface ChamadoProps {
   COD_CHAMADO: number;
   DATA_CHAMADO: string;
   ASSUNTO_CHAMADO: string;
   STATUS_CHAMADO: string;
   EMAIL_CHAMADO: string;
   PRIOR_CHAMADO: string;
   COD_CLIENTE: number;
   NOME_CLIENTE: string;
   COD_RECURSO?: number;
   NOME_RECURSO?: string;
}

interface BotaoAtribuicaoInteligenteProps {
   chamado: ChamadoProps;
   onAtribuicaoSuccess?: () => void;
   disabled?: boolean;
}

const BotaoAtribuicaoInteligente: React.FC<BotaoAtribuicaoInteligenteProps> = ({
   chamado,
   onAtribuicaoSuccess,
   disabled = false,
}) => {
   const [modalOpen, setModalOpen] = useState(false);

   // Verificar se o chamado já está atribuído
   const jaAtribuido = chamado.COD_RECURSO && chamado.COD_RECURSO > 0;

   // Determinar a cor do botão baseado na prioridade
   const getPrioridadeColor = () => {
      const prioridade = parseInt(chamado.PRIOR_CHAMADO) || 100;
      if (prioridade <= 50)
         return 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700';
      if (prioridade <= 100)
         return 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700';
      return 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
   };

   const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
         setModalOpen(true);
      }
   };

   const handleSuccess = () => {
      setModalOpen(false);
      onAtribuicaoSuccess?.();
   };

   return (
      <>
         <motion.button
            onClick={handleClick}
            disabled={disabled}
            className={`relative inline-flex items-center justify-center rounded-lg bg-gradient-to-r p-2 ${getPrioridadeColor()} text-sm font-medium text-white transition-all duration-200 ${
               disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'shadow-lg hover:scale-105 hover:shadow-xl active:scale-95'
            } ${jaAtribuido ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-800' : ''} `}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            title={
               jaAtribuido
                  ? `Reatribuir chamado (atual: ${chamado.NOME_RECURSO})`
                  : 'Atribuir chamado usando IA'
            }
         >
            <div className="flex items-center space-x-1">
               <Brain size={16} />
               <span className="hidden sm:inline">
                  {jaAtribuido ? 'Reatribuir' : 'IA'}
               </span>
            </div>

            {/* Indicador de prioridade */}
            <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-white">
               <div
                  className={`h-2 w-2 rounded-full ${
                     parseInt(chamado.PRIOR_CHAMADO) <= 50
                        ? 'bg-red-500'
                        : parseInt(chamado.PRIOR_CHAMADO) <= 100
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                  }`}
               />
            </div>

            {/* Efeito de brilho para chamados não atribuídos */}
            {!jaAtribuido && !disabled && (
               <div className="absolute inset-0 -skew-x-12 transform rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity duration-300 hover:opacity-20" />
            )}
         </motion.button>

         <ModalAtribuicaoInteligente
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            chamado={chamado}
            onAtribuicaoSuccess={handleSuccess}
         />
      </>
   );
};

export default BotaoAtribuicaoInteligente;

// Componente para ser usado no menu circular das ações
export const BotaoAtribuicaoCircular: React.FC<
   BotaoAtribuicaoInteligenteProps
> = ({ chamado, onAtribuicaoSuccess, disabled = false }) => {
   const [modalOpen, setModalOpen] = useState(false);

   const handleClick = () => {
      if (!disabled) {
         setModalOpen(true);
      }
   };

   const handleSuccess = () => {
      setModalOpen(false);
      onAtribuicaoSuccess?.();
   };

   return (
      <>
         <motion.button
            onClick={handleClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white transition-all duration-200 hover:from-purple-700 hover:to-blue-700 ${
               disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'shadow-lg ring-2 ring-purple-400 hover:scale-110 hover:shadow-xl active:scale-95'
            } `}
            whileHover={disabled ? {} : { scale: 1.1 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            title="Atribuição Inteligente"
         >
            <Brain size={18} />
         </motion.button>

         <ModalAtribuicaoInteligente
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            chamado={chamado}
            onAtribuicaoSuccess={handleSuccess}
         />
      </>
   );
};

// Hook personalizado para verificar permissões de atribuição
export const useAtribuicaoPermissions = () => {
   // Aqui você pode implementar a lógica de verificação de permissões
   // baseada no usuário logado, tipo de acesso, etc.

   return {
      canAtribuir: true, // Por exemplo, apenas admins podem atribuir
      canReatribuir: true, // Permissão para reatribuir chamados já atribuídos
      canViewDashboard: true, // Permissão para ver o dashboard completo
   };
};
