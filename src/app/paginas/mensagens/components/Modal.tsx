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
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

export type ChamadoProps = {
  chamado_os: string;
  cod_os: string;
  dtini_os: string;
  nome_cliente: string;
  status_chamado: string;
  nome_recurso: string;
  hrini_os: string;
  hrfim_os: string;
  obs: string;
  duracaoHoras?: number | null; // Adiciona a propriedade opcional para duração
};

interface ChamadoModalProps {
  chamado: ChamadoProps | null;
  onClose: () => void;
}

export default function Modal({ chamado, onClose }: ChamadoModalProps) {
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

  const getStyleStatus = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
      case 'NAO FINALIZADO':
        return 'bg-yellow-700 text-white ring-1 ring-yellow-300';

      case 'EM ATENDIMENTO':
        return 'bg-blue-700 text-white ring-1 ring-blue-300';

      case 'FINALIZADO':
        return 'bg-green-700 text-white ring-1 ring-green-300';

      case 'NAO INICIADO':
        return 'bg-red-700 text-white ring-1 ring-red-300';

      case 'STANDBY':
        return 'bg-orange-700 text-white ring-1 ring-orange-300';

      case 'ATRIBUIDO':
        return 'bg-blue-700 text-white ring-1 ring-blue-300';

      case 'AGUARDANDO VALIDACAO':
        return 'bg-purple-700 text-white ring-1 ring-purple-300';

      default:
        return 'bg-gray-700 text-white ring-1 ring-gray-300';
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

  // ----------------------------------------------------------------------------------

  return (
    // ===== div - backdrop =====
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={handleBackdropClick}
    >
      <div className="animate-in slide-in-from-bottom relative w-full max-w-5xl border border-slate-500 bg-white transition-all">
        {/* ===== header ===== */}
        <header className="relative flex items-center justify-between bg-slate-950 p-6">
          <div className="flex items-center gap-4">
            {/* ícone */}
            <div className="rounded-full bg-cyan-400/20 p-4">
              <FileText className="text-cyan-400" size={40} />
            </div>

            {/* ===== div - conteúdo ===== */}
            <div className="flex flex-col">
              {/* título */}
              <h1 className="text-2xl font-bold tracking-wider text-slate-200 select-none">
                Chamado #{chamado.chamado_os}
              </h1>

              {/* subtítulo */}
              <p className="text-sm font-semibold tracking-wider text-slate-200 italic select-none">
                Detalhes do chamado
              </p>
            </div>
          </div>

          {/* botão - fechar modal */}
          <button
            onClick={onClose}
            className="group rounded-full p-2 text-slate-200 hover:scale-125 hover:bg-red-500/50 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </header>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`flex items-center justify-center gap-3 rounded-md p-8 text-xl font-semibold tracking-wider ${getStyleStatus(chamado.status_chamado)}`}
            >
              <AlertCircle size={20} />
              {chamado.status_chamado}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Informações Básicas */}
            <div className="">
              <h3 className="mb-4 flex items-center gap-2 border-b-1 border-red-500 text-lg font-semibold tracking-wider text-slate-800 select-none">
                Informações Básicas
              </h3>

              <div className="space-y-4">
                {/* Data de Abertura */}
                <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-50 p-3">
                  <div className="flex items-center justify-center">
                    <Calendar className="text-slate-800" size={20} />
                  </div>

                  <div className="flex flex-col">
                    <p className="text-sm font-semibold tracking-wider text-slate-800 select-none">
                      Data de Abertura
                    </p>

                    <p className="text-base font-semibold tracking-wider text-slate-800 italic select-none">
                      {formatDate(chamado.dtini_os)}
                    </p>
                  </div>
                </div>

                {/* Cliente */}
                <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-50 p-3">
                  <div className="flex items-center justify-center">
                    <User className="text-slate-800" size={20} />
                  </div>

                  <div className="flex flex-col">
                    <p className="text-sm font-semibold tracking-wider text-slate-800 select-none">
                      Cliente
                    </p>

                    <p className="text-base font-semibold tracking-wider text-slate-800 italic select-none">
                      {chamado.nome_cliente}
                    </p>
                  </div>
                </div>

                {/* Recurso */}
                <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-50 p-3">
                  <div className="flex items-center justify-center">
                    <Settings className="text-slate-800" size={20} />
                  </div>

                  <div className="flex flex-col">
                    <p className="text-sm font-semibold tracking-wider text-slate-800 select-none">
                      Recurso
                    </p>

                    <p className="text-base font-semibold tracking-wider text-slate-800 italic select-none">
                      {chamado.nome_recurso}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes de Tempo */}
            <div className="">
              <h3 className="mb-4 flex items-center gap-2 border-b-1 border-red-500 text-lg font-semibold tracking-wider text-slate-800 select-none">
                Controle de Tempo
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Hora Início */}
                  <div className="flex gap-3 rounded-md border border-emerald-300 bg-emerald-50 p-3">
                    <div className="flex items-center justify-center">
                      <Clock className="text-emerald-800" size={20} />
                    </div>

                    <div className="flex flex-col">
                      <p className="text-sm font-semibold tracking-wider text-emerald-800 select-none">
                        Hora Início
                      </p>

                      <p className="text-base font-semibold tracking-wider text-emerald-800 italic select-none">
                        {formatTime(chamado.hrini_os)}
                      </p>
                    </div>
                  </div>

                  {/* Hora Fim */}
                  <div className="flex gap-3 rounded-md border border-emerald-300 bg-emerald-50 p-3">
                    <div className="flex items-center justify-center">
                      <Clock className="text-emerald-800" size={20} />
                    </div>

                    <div className="flex flex-col">
                      <p className="text-sm font-semibold tracking-wider text-emerald-800 select-none">
                        Hora Fim
                      </p>

                      <p className="text-base font-semibold tracking-wider text-emerald-800 italic select-none">
                        {formatTime(chamado.hrfim_os)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold tracking-wider text-emerald-800 select-none">
                      Total de Horas
                    </p>

                    <div className="flex items-center gap-3">
                      <Clock className="text-emerald-800" size={20} />

                      <p className="text-base font-semibold tracking-wider text-emerald-800 italic select-none">
                        {formatTime(chamado.duracaoHoras?.toString() || '0:00')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          {chamado.obs && (
            <div className="flex flex-col">
              {/* título */}
              <h3 className="mb-4 flex items-center gap-2 border-b-1 border-red-500 text-lg font-semibold tracking-wider text-slate-800 select-none">
                Observações
              </h3>

              {/* descrição */}
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
                <p className="text-base font-semibold tracking-wider text-slate-800 select-none">
                  {corrigirTextoCorrompido(chamado.obs)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
