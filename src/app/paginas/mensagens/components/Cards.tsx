'use client';

import { Clock, Loader2 } from 'lucide-react';
import { FaEye, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import Modal from './Modal';
import { useState } from 'react';
import { useVizualizarChamadoView } from '../hooks/useVizualizarChamadoView';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface Message {
  id: string;
  chamadoOs: string;
  nomeCliente: string;
  motivo: string;
  timestamp: Date;
  read: boolean;
}

interface ListaMensagensProps {
  messages: Message[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function Cards({
  messages,
  onMarkAsRead,
  onDelete,
}: ListaMensagensProps) {
  const [selectedChamadoOs, setSelectedChamadoOs] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: selectedChamado,
    isLoading,
    error,
    refetch,
  } = useVizualizarChamadoView(selectedChamadoOs);

  const handleViewChamado = async (chamadoOs: string) => {
    setSelectedChamadoOs(chamadoOs); // define o chamado
    const result = await refetch(); // força a refetch manual
    if (result.data) {
      setIsModalOpen(true); // abre o modal só se houver dados
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;

    return format(new Date(date), 'dd/MM');
  };

  // ---------------------------------------------------------------------------------

  return (
    // ===== div - container principal =====
    <div className="space-y-8">
      {messages.map(message => (
        <div
          key={message.id}
          className={`group relative overflow-hidden rounded-2xl bg-white shadow-md shadow-black transition-all ${
            !message.read ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          <div
            className={`absolute top-0 left-0 h-full w-3 ${
              !message.read ? 'bg-red-500' : 'bg-green-500'
            }`}
          />

          {/* div - conteúdo */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Lado esquerdo - status e conteúdo */}
              <div className="flex flex-1 items-start gap-6">
                {/* Ícone de status */}
                <div
                  className={`flex shrink-0 items-center justify-center rounded-xl p-4 ${
                    !message.read
                      ? 'bg-red-500 text-white shadow-md shadow-black'
                      : 'bg-green-500 text-white shadow-md shadow-black'
                  }`}
                >
                  <FaExclamationTriangle size={28} />
                </div>

                {/* Conteúdo da mensagem */}
                <div className="min-w-0 flex-1">
                  {/* Cabeçalho */}
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-wider text-slate-800 select-none">
                        Chamado #{message.chamadoOs}
                      </h3>
                      <p className="text-lg font-semibold tracking-wider text-slate-600 italic select-none">
                        {message.nomeCliente}
                      </p>
                    </div>

                    <div className="mr-8 flex items-center gap-2 text-lg font-semibold tracking-wider text-slate-800 italic select-none">
                      <Clock className="text-slate-800" size={20} />
                      {formatRelativeTime(message.timestamp)}
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="rounded-md border border-slate-300 bg-white p-4 shadow-sm">
                    <p className="mb-2 text-base font-bold tracking-wider text-slate-800 select-none">
                      Motivo:
                    </p>
                    <p className="ml-8 text-lg font-semibold tracking-wider text-slate-600 italic select-none">
                      {message.motivo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center gap-4">
                {/* Ver detalhes */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleViewChamado(message.chamadoOs)}
                      disabled={isLoading}
                      className="flex items-center justify-center rounded-xl bg-blue-500 p-3 shadow-md shadow-black transition-all hover:shadow-lg"
                    >
                      {isLoading ? (
                        <Loader2
                          className="animate-spin text-white"
                          size={24}
                        />
                      ) : (
                        <FaEye className="text-white" size={24} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="end"
                    sideOffset={20}
                    className="border border-slate-300 bg-slate-900 text-base font-semibold tracking-wider text-white italic"
                  >
                    Visualizar detalhes do chamado
                  </TooltipContent>
                </Tooltip>

                {/* Marcar como lida */}
                {/* Marcar como lida */}
                {!message.read && (
                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <button className="flex items-center justify-center rounded-xl bg-green-500 p-3 shadow-md shadow-black transition-all hover:shadow-lg">
                            <FaCheckCircle className="text-white" size={24} />
                          </button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="end"
                        sideOffset={20}
                        className="border border-slate-300 bg-slate-900 text-base font-semibold tracking-wider text-white italic"
                      >
                        Marcar como lida
                      </TooltipContent>
                    </Tooltip>

                    <AlertDialogContent className="bg-white shadow-md shadow-black">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="mb-2 border-b border-black text-2xl font-bold tracking-wider text-slate-800 select-none">
                          Confirmação de leitura
                        </AlertDialogTitle>
                        <AlertDialogDescription className="mb-8 text-base font-semibold tracking-wider text-slate-600 italic select-none">
                          Tem certeza que deseja marcar esta mensagem como lida?
                          Essa ação é irreversível.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter className="flex items-center justify-center gap-6">
                        <AlertDialogCancel className="rounded-md border-none bg-blue-500 px-6 py-2 text-lg font-semibold tracking-wider text-white transition-all hover:bg-blue-800 hover:shadow-lg hover:shadow-black">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="rounded-md border-none bg-green-500 px-6 py-2 text-lg font-semibold tracking-wider text-white transition-all hover:bg-green-800 hover:shadow-lg hover:shadow-black"
                          onClick={() => onMarkAsRead(message.id)}
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Excluir mensagem */}
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <button className="flex items-center justify-center rounded-xl bg-red-500 p-3 shadow-md shadow-black transition-all hover:shadow-lg">
                          <MdDelete className="text-white" size={24} />
                        </button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="end"
                      sideOffset={20}
                      className="border border-slate-300 bg-slate-900 text-base font-semibold tracking-wider text-white italic"
                    >
                      Excluir mensagem
                    </TooltipContent>
                  </Tooltip>

                  <AlertDialogContent className="bg-white shadow-md shadow-black">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="mb-2 border-b border-black text-2xl font-bold tracking-wider text-slate-800 select-none">
                        Confirmação de exclusão
                      </AlertDialogTitle>
                      <AlertDialogDescription className="mb-8 text-base font-semibold tracking-wider text-slate-600 italic select-none">
                        Tem certeza que deseja excluir esta mensagem? Essa ação
                        é irreversível.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex items-center justify-center gap-6">
                      <AlertDialogCancel className="rounded-md border-none bg-blue-500 px-6 py-2 text-lg font-semibold tracking-wider text-white transition-all hover:bg-blue-800 hover:shadow-lg hover:shadow-black">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="rounded-md border-none bg-red-500 px-6 py-2 text-lg font-semibold tracking-wider text-white transition-all hover:bg-red-800 hover:shadow-lg hover:shadow-black"
                        onClick={() => onDelete(message.id)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ===== modal ===== */}
      {isModalOpen && (
        <Modal
          chamado={selectedChamado}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
