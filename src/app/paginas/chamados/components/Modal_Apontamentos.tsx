import React, { useState } from 'react';
import {
  X,
  Clock,
  Save,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

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
    dataInicioOS: new Date().toISOString().split('T')[0],
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
      // Validações básicas
      if (!formData.observacaoOS.trim()) {
        throw new Error('Observação é obrigatória');
      }
      if (!formData.horaInicioOS || !formData.horaFimOS) {
        throw new Error('Hora início e hora fim são obrigatórias');
      }
      if (formData.horaInicioOS >= formData.horaFimOS) {
        throw new Error('Hora fim deve ser maior que hora início');
      }

      const payload = {
        codOS: codOS,
        dataInicioOS: formData.dataInicioOS,
        horaInicioOS: formData.horaInicioOS,
        horaFimOS: formData.horaFimOS,
        observacaoOS: formData.observacaoOS,
      };

      console.log('TESTE - Dados enviados para API:', payload);

      const response = await fetch('/api/apontamentos/update', {
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
    <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
      {/* Overlay com blur melhorado */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200/50 bg-white shadow-2xl transition-all duration-500 ease-out">
        {/* Header com gradiente */}
        <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Ícone com animação */}
              <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 p-4 backdrop-blur-sm">
                <Clock className="drop-shadow-glow text-blue-400" size={32} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-wide text-white drop-shadow-sm">
                  Atualizar Apontamento
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-300">
                  Chamado #{codChamado} {codOS && `• OS ${codOS}`}
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
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto bg-gradient-to-br from-gray-50 to-white p-6">
          {/* Alertas de Feedback */}
          {success && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <p className="font-semibold text-green-800">
                  Apontamento atualizado com sucesso!
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <p className="font-semibold text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <div className="space-y-6">
            {/* Data */}
            <FormSection
              title="Data do Apontamento"
              icon={<Calendar className="text-emerald-500" size={18} />}
            >
              <input
                type="date"
                name="dataInicioOS"
                value={formData.dataInicioOS}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 bg-white p-4 font-medium text-slate-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </FormSection>

            {/* Horários */}
            <FormSection
              title="Horário de Execução"
              icon={<Clock className="text-purple-500" size={18} />}
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Hora Início
                  </label>
                  <input
                    type="time"
                    name="horaInicioOS"
                    value={formData.horaInicioOS}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-gray-300 bg-white p-4 font-medium text-slate-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Hora Fim
                  </label>
                  <input
                    type="time"
                    name="horaFimOS"
                    value={formData.horaFimOS}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-gray-300 bg-white p-4 font-medium text-slate-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                  />
                </div>
              </div>
            </FormSection>

            {/* Observação */}
            <FormSection
              title="Observação do Serviço"
              icon={<FileText className="text-blue-500" size={18} />}
            >
              <textarea
                name="observacaoOS"
                value={formData.observacaoOS}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white p-4 font-medium text-slate-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                placeholder="Descreva detalhadamente o serviço realizado, procedimentos executados, materiais utilizados e resultados obtidos..."
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Seja específico sobre o trabalho realizado
                </p>
                <p className="text-xs text-gray-400">
                  {formData.observacaoOS.length}/1000
                </p>
              </div>
            </FormSection>

            {/* Botões de Ação */}
            <div className="flex gap-4 border-t border-gray-200 pt-4">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 rounded-xl bg-gray-100 px-6 py-4 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !formData.observacaoOS.trim() ||
                  !formData.horaInicioOS ||
                  !formData.horaFimOS
                }
                className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
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

// Componente auxiliar para seções do formulário
const FormSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 p-4">
      <h3 className="flex items-center gap-2 font-bold text-slate-800">
        {icon}
        {title}
      </h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);
