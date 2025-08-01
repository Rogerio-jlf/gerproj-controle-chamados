// components/ChamadoModal.tsx
'use client';

import {
  X,
  Calendar,
  User,
  Clock,
  FileText,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { useEffect } from 'react';

export type ChamadoProps = {
  chamado_os: string;
  dtini_os: string;
  nome_cliente: string;
  status_chamado: string;
  nome_recurso: string;
  hrini_os: string;
  hrfim_os: string;
  total_horas: string;
  obs: string;
};

interface ChamadoModalProps {
  chamado: ChamadoProps | null;
  onClose: () => void;
}

export function ChamadoModal({ chamado, onClose }: ChamadoModalProps) {
  // Fecha o modal com a tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Previne scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!chamado) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'reprovado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendente':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '0:00';
    // Se já está no formato correto (ex: "8:30"), retorna como está
    if (timeString.includes(':')) return timeString;
    // Se é um número (ex: "8.5"), converte para horas:minutos
    const hours = parseFloat(timeString);
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  // Fecha modal ao clicar no backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Chamado #{chamado.chamado_os}
              </h2>
              <p className="text-sm text-slate-600">Detalhes do apontamento</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${getStatusColor(chamado.status_chamado)}`}
            >
              <AlertCircle className="h-4 w-4" />
              {chamado.status_chamado}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Informações Básicas */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <User className="h-5 w-5 text-blue-600" />
                  Informações Básicas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Data de Abertura
                      </p>
                      <p className="text-slate-900">
                        {formatDate(chamado.dtini_os)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                    <User className="mt-0.5 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Cliente
                      </p>
                      <p className="font-medium text-slate-900">
                        {chamado.nome_cliente}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                    <Settings className="mt-0.5 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Recurso
                      </p>
                      <p className="text-slate-900">{chamado.nome_recurso}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes de Tempo */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Controle de Tempo
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-sm font-medium text-emerald-700">
                        Hora Início
                      </p>
                      <p className="text-lg font-bold text-emerald-900">
                        {formatTime(chamado.hrini_os)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-sm font-medium text-emerald-700">
                        Hora Fim
                      </p>
                      <p className="text-lg font-bold text-emerald-900">
                        {formatTime(chamado.hrfim_os)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-700">
                        Total de Horas
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <p className="text-xl font-bold text-blue-900">
                          {formatTime(chamado.total_horas)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          {chamado.obs && (
            <div className="mt-8">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
                <FileText className="h-5 w-5 text-amber-600" />
                Observações
              </h3>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="leading-relaxed whitespace-pre-wrap text-slate-800">
                  {chamado.obs}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50 p-6 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-6 py-2.5 font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-white focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
