'use client';

import { useNotifications } from '@/contexts/NotificationContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChamadoModal } from '../mensagens/components/ChamadoModal';
import {
  MessageSquare,
  Trash2,
  ArrowLeft,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Mail,
  MailOpen,
} from 'lucide-react';
import { format } from 'date-fns';

export default function MensagensPage() {
  const router = useRouter();
  const { messages, unreadCount, markAsRead, deleteMessage } =
    useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedChamado, setSelectedChamado] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMessages = messages.filter(msg =>
    filter === 'all' ? true : !msg.read
  );

  const handleViewChamado = async (chamadoOs: string) => {
    try {
      const response = await fetch(`/api/apontamentos-view/${chamadoOs}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedChamado(data);
        setIsModalOpen(true);
      } else {
        console.error('Erro ao buscar chamado:', data.error);
      }
    } catch (error) {
      console.error('Erro ao buscar chamado:', error);
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    markAsRead(messageId);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (
      confirm('Tem certeza que deseja excluir esta mensagem permanentemente?')
    ) {
      deleteMessage(messageId);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;

    return format(date, 'dd/MM');
  };

  if (messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center rounded-full p-2 text-slate-600 transition-all hover:bg-white hover:shadow-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-3 shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Mensagens de Reprovação
                </h1>
                <p className="text-slate-600">Nenhuma mensagem encontrada</p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Mail className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Nenhuma mensagem
              </h3>
              <p className="text-slate-600">
                Você não possui mensagens de reprovação no momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center rounded-full p-2 text-slate-600 transition-all hover:bg-white hover:shadow-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 p-3 shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Mensagens de Reprovação
                </h1>
                <p className="text-slate-600">
                  {unreadCount > 0
                    ? `${unreadCount} ${unreadCount === 1 ? 'não lida' : 'não lidas'}`
                    : 'Todas lidas'}
                </p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-white text-slate-800 shadow-lg ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <MailOpen className="h-4 w-4" />
              Todas ({messages.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-white text-slate-800 shadow-lg ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <Mail className="h-4 w-4" />
              Não lidas ({unreadCount})
            </button>
          </div>
        </div>

        {/* Lista de mensagens */}
        <div className="space-y-4">
          {filteredMessages.map(message => (
            <article
              key={message.id}
              className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all hover:shadow-lg hover:ring-slate-300 ${
                !message.read
                  ? 'bg-red-50/30 ring-red-200'
                  : 'bg-emerald-50/20 ring-emerald-200'
              }`}
            >
              <div
                className={`absolute top-0 left-0 h-full w-1 ${
                  !message.read
                    ? 'bg-gradient-to-b from-red-500 to-orange-500'
                    : 'bg-gradient-to-b from-emerald-500 to-green-500'
                }`}
              />

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-4">
                    {/* Status Icon */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        !message.read
                          ? 'bg-red-100 text-red-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      <AlertTriangle className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900">
                            Chamado #{message.chamadoOs}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {message.nomeCliente}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(message.timestamp)}
                          {!message.read ? (
                            <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-500" />
                          ) : (
                            <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                      </div>

                      {/* Motivo */}
                      <div className="mb-4 rounded-xl bg-slate-50 p-4">
                        <p className="mb-1 text-sm font-medium text-slate-700">
                          Motivo da reprovação:
                        </p>
                        <p className="leading-relaxed text-slate-800">
                          {message.motivo}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewChamado(message.chamadoOs)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:scale-105 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      title="Ver detalhes do chamado"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {!message.read && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white transition-all hover:scale-105 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        title="Marcar como lida"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white transition-all hover:scale-105 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Excluir mensagem"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal de detalhes do chamado */}
      {isModalOpen && (
        <ChamadoModal
          chamado={selectedChamado}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
