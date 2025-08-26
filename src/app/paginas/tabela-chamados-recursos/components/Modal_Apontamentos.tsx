import React, { useState } from 'react';
import { X, Clock, Save, Calendar } from 'lucide-react';

interface ModalApontamentosProps {
  isOpen: boolean;
  onClose: () => void;
  codChamado: number | null;
  codOS: string | null;
}

export default function ModalApontamentos({
  isOpen,
  onClose,
  codChamado,
  codOS,
}: ModalApontamentosProps) {
  const [formData, setFormData] = useState({
    observacaoOS: '',
    dataInicioOS: new Date().toISOString().split('T')[0], // data atual
    horaInicioOS: '',
    horaFimOS: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validações básicas (redundantes, mas mantidas para UX)
      if (!formData.observacaoOS.trim()) {
        throw new Error('Observação é obrigatória');
      }
      if (!formData.horaInicioOS || !formData.horaFimOS) {
        throw new Error('Hora início e hora fim são obrigatórias');
      }
      if (formData.horaInicioOS >= formData.horaFimOS) {
        throw new Error('Hora fim deve ser maior que hora início');
      }

      // Dados que serão enviados para a API (nomes corretos)
      const payload = {
        codOS: codOS, // Vem das props
        dataInicioOS: formData.dataInicioOS,
        horaInicioOS: formData.horaInicioOS,
        horaFimOS: formData.horaFimOS,
        observacaoOS: formData.observacaoOS,
      };

      console.log('TESTE - Dados enviados para API:', payload);

      const response = await fetch('/api/apontamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('TESTE - Resposta da API:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `Erro ${response.status}`);
      }

      setSuccess(true);

      // Resetar form após sucesso
      setTimeout(() => {
        setFormData({
          observacaoOS: '',
          dataInicioOS: new Date().toISOString().split('T')[0],
          horaInicioOS: '',
          horaFimOS: '',
        });
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        observacaoOS: '',
        dataInicioOS: new Date().toISOString().split('T')[0],
        horaInicioOS: '',
        horaFimOS: '',
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-600">
        {/* Header */}
        <header className="relative flex items-center justify-between bg-slate-950 p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-400/40 p-3">
              <Clock className="text-blue-400" size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-slate-200 select-none">
                Atualizar Apontamento
              </h1>
              <p className="text-sm font-semibold tracking-wider text-slate-300 italic select-none">
                Chamado #{codChamado} {codOS && `- OS ${codOS}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isLoading}
            className="group rounded-full p-2 text-slate-200 hover:scale-110 hover:bg-red-500/50 hover:text-red-500 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Content */}
        <div className="bg-white p-6">
          {success && (
            <div className="mb-4 rounded-lg border border-green-300 bg-green-100 p-4">
              <p className="font-semibold text-green-800">
                ✅ Apontamento atualizado com sucesso!
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-100 p-4">
              <p className="font-semibold text-red-800">❌ {error}</p>
            </div>
          )}

          {/* INFO DE TESTE */}
          <div className="mb-4 rounded-lg border border-blue-300 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>MODO TESTE:</strong> Abra o DevTools (F12) → Console para
              ver os dados enviados e respostas da API
            </p>
            <p className="mt-1 text-xs text-blue-600">
              codOS que será enviado:{' '}
              <strong>{codOS || 'não informado'}</strong>
            </p>
          </div>

          <div className="space-y-6">
            {/* Data */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                <Calendar className="mr-1 inline h-4 w-4" />
                Data do Apontamento
              </label>
              <input
                type="date"
                name="dataInicioOS"
                value={formData.dataInicioOS}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Hora Início
                </label>
                <input
                  type="time"
                  name="horaInicioOS"
                  value={formData.horaInicioOS}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Hora Fim
                </label>
                <input
                  type="time"
                  name="horaFimOS"
                  value={formData.horaFimOS}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Observação */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Observação do Serviço
              </label>
              <textarea
                name="observacaoOS"
                value={formData.observacaoOS}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Descreva detalhadamente o serviço realizado..."
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Atualizar Apontamento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
