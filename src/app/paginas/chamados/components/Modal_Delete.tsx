'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ModalExcluirOSProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (codOS: string) => Promise<void>;
  codOS: string | null;
  isLoading?: boolean;
}

export function ModalExcluirOS({
  isOpen,
  onClose,
  onConfirm,
  codOS,
  isLoading = false,
}: ModalExcluirOSProps) {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!codOS) return;

    setError(null);
    try {
      await onConfirm(codOS);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir OS');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
      {/* Overlay com blur melhorado */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[90vh] w-full max-w-md overflow-hidden rounded-3xl border border-gray-200/50 bg-white shadow-2xl transition-all duration-500 ease-out">
        {/* Header com gradiente */}
        <header className="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Ícone com animação */}
              <div className="rounded-2xl border border-red-400/30 bg-gradient-to-br from-red-400/20 to-orange-500/20 p-4 backdrop-blur-sm">
                <AlertTriangle
                  className="drop-shadow-glow text-red-400"
                  size={32}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-wide text-white drop-shadow-sm">
                  Confirmar Exclusão
                </h1>
                <p className="mt-1 text-sm font-medium text-red-300">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={isLoading}
              className="group rounded-full border border-transparent p-3 text-white transition-all duration-200 hover:border-red-400/50 hover:bg-red-500/20 disabled:opacity-50"
            >
              <X className="h-5 w-5 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-6">
          {/* Alert de erro */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-600" size={20} />
                <p className="font-semibold text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Seção de Confirmação */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 p-4">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <Trash2 className="text-red-500" size={18} />
                Exclusão de Ordem de Serviço
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="text-red-600" size={32} />
                </div>
                <p className="mb-2 text-lg font-semibold text-slate-800">
                  Tem certeza que deseja excluir a OS
                </p>
                <div className="inline-flex items-center rounded-full bg-red-100 px-4 py-2">
                  <span className="font-bold text-red-700">{codOS}</span>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Todos os dados relacionados a esta ordem de serviço serão
                  permanentemente removidos do sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-gray-100 px-6 py-4 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirm}
              disabled={isLoading || !codOS}
              className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-red-700 hover:to-red-800 hover:shadow-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Confirmar Exclusão
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
