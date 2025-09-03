'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { MdDeleteSweep, MdDelete } from 'react-icons/md';
import { IoIosInformationCircle } from 'react-icons/io';

interface ModalExcluirOSProps {
  isOpen: boolean;
  onClose: () => void;
  codOS: string | null;
  onSuccess?: () => void;
}

export function ModalExcluirOS({
  isOpen,
  onClose,
  codOS,
  onSuccess,
}: ModalExcluirOSProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!codOS) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/apontamentos/delete/${codOS}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir OS');
      }

      setSuccess(true);

      // Aguarda um pouco para mostrar a mensagem de sucesso
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onSuccess?.(); // Chama refetch na tabela pai
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir OS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
      {/* ===== OVERLAY ===== */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xl"
        onClick={handleClose}
      />

      {/* ===== MODAL CONTAINER ===== */}
      <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-black bg-white transition-all duration-500 ease-out">
        {/* ===== HEADER ===== */}
        <header className="relative bg-yellow-600 p-6">
          <section className="flex items-center justify-between">
            <div className="flex items-center justify-between gap-6">
              {/* Ícone */}
              <div className="rounded-2xl border border-black/50 bg-white/10 p-4">
                <AlertTriangle className="text-black" size={40} />
              </div>

              <div className="flex flex-col items-center justify-center">
                {/* Título */}
                <h1 className="text-2xl font-bold tracking-wider text-black select-none">
                  Excluir OS
                </h1>

                <div className="inline-block rounded-full bg-black px-8 py-1">
                  {/* Valor */}
                  <p className="text-base font-extrabold tracking-widest text-white italic select-none">
                    OS - #{codOS}
                  </p>
                </div>
              </div>
            </div>

            {/* Botão fechar modal */}
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="group cursor-pointer rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IoClose size={24} />
            </button>
          </section>
        </header>

        {/* ===== CONTEÚDO ===== */}
        <main className="max-h-[calc(95vh-140px)] space-y-6 overflow-y-auto bg-gray-100 p-6">
          {/* Alerta de sucesso */}
          {success && (
            <div className="mb-6 rounded-full border border-green-200 bg-green-600 px-6 py-2">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-500" size={20} />
                <p className="text-base font-semibold tracking-wider text-white select-none">
                  OS excluída com sucesso!
                </p>
              </div>
            </div>
          )}

          {/* Alerta de erro */}
          {error && (
            <div className="mb-6 rounded-full border border-red-200 bg-red-600 px-6 py-2">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-red-500" size={20} />
                <p className="text-base font-semibold tracking-wider text-white select-none">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Seção de Confirmação */}
          <section className="overflow-hidden rounded-md bg-white shadow-sm shadow-black">
            <div className="bg-black p-4">
              <div className="flex items-center gap-4 font-bold text-slate-800">
                <MdDeleteSweep className="text-white" size={32} />
                <h3 className="text-lg font-semibold tracking-wider text-white select-none">
                  Exclusão de Ordem de Serviço
                </h3>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-10 p-6">
              <div className="flex items-center justify-center gap-4">
                <FaExclamationTriangle className="text-black" size={32} />
                <p className="text-lg font-semibold text-slate-800">
                  Tem certeza que deseja excluir a OS
                </p>
                <span className="text-2xl font-extrabold tracking-widest text-slate-800 italic select-none">
                  #{codOS}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <IoIosInformationCircle className="text-black" size={32} />
                <p className="text-xs font-semibold tracking-wider text-gray-800 italic select-none">
                  Todos os dados relacionados a essa OS serão permanentemente
                  removidos do sistema.
                </p>
              </div>
            </div>
          </section>

          {/* Botões de ação */}
          <section className="flex items-center justify-end gap-6">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-lg font-extrabold text-white transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirm}
              disabled={isLoading || !codOS}
              className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-lg font-extrabold text-white transition-all select-none hover:scale-105 hover:bg-blue-900 hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <MdDelete size={20} />
                  Confirmar Exclusão
                </>
              )}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
