import React, { useState } from 'react';
import {
  X,
  Clock,
  Save,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ChamadosProps {
  COD_CHAMADO: number;
  DATA_CHAMADO: string;
  STATUS_CHAMADO: string;
  CODTRF_CHAMADO: number;
  COD_CLIENTE: number;
  ASSUNTO_CHAMADO: string;
  NOME_TAREFA: string;
  NOME_CLIENTE: string;
}

export interface ModalCriarOSProps {
  isOpen: boolean;
  onClose: () => void;
  chamado: ChamadosProps | null;
}

export default function ModalCriarOS({
  isOpen,
  onClose,
  chamado,
}: ModalCriarOSProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
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
      if (!formData.description.trim()) {
        throw new Error('Descrição é obrigatória');
      }
      if (!formData.startTime || !formData.endTime) {
        throw new Error('Hora início e hora fim são obrigatórias');
      }
      if (formData.startTime >= formData.endTime) {
        throw new Error('Hora fim deve ser maior que hora início');
      }
      if (!chamado) {
        throw new Error('Chamado não selecionado');
      }
      if (!user?.recurso?.id) {
        throw new Error('Usuário sem recurso definido');
      }

      const payload = {
        os: {
          COD_TAREFA: chamado.CODTRF_CHAMADO,
          NOME_TAREFA: chamado.NOME_TAREFA,
          RESPCLI_PROJETO: user.nome || '',
          FATURA_TAREFA: 'SIM',
        },
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        recurso: user.recurso.id.toString(),
        codChamado: chamado.COD_CHAMADO, // ← Adicione esta linha
        chamado: chamado,
      };

      console.log('TESTE - Dados enviados para API:', payload);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('/api/apontamentos/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
          description: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
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
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  // Função para formatar o status
  const getStatusText = (status: number): string => {
    const statusMap: Record<number, string> = {
      1: 'Aberto',
      2: 'Em Andamento',
      3: 'Finalizado',
      4: 'Cancelado',
      5: 'Pausado',
    };

    return statusMap[status] || 'Desconhecido';
  };

  if (!isOpen || !chamado) return null;

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
        <header className="relative bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Ícone com animação */}
              <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/20 to-green-500/20 p-4 backdrop-blur-sm">
                <Plus className="drop-shadow-glow text-emerald-400" size={32} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-wide text-white drop-shadow-sm">
                  Criar Nova OS
                </h1>
                <p className="mt-1 text-sm font-medium text-emerald-300">
                  Chamado #{chamado.COD_CHAMADO} • {chamado.ASSUNTO_CHAMADO}
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
                  OS criada com sucesso!
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

          {/* Informações do Chamado */}
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4 shadow-sm">
            <h3 className="mb-3 font-bold text-emerald-800">
              Informações do Chamado
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-emerald-700">Código:</span>
                <span className="ml-2 text-emerald-600">
                  {chamado.COD_CHAMADO}
                </span>
              </div>
              <div>
                <span className="font-semibold text-emerald-700">Status:</span>
                <span className="ml-2 text-emerald-600">
                  {getStatusText(Number(chamado.STATUS_CHAMADO))}
                </span>
              </div>
              <div>
                <span className="font-semibold text-emerald-700">Cliente:</span>
                <span className="ml-2 text-emerald-600">
                  {chamado.NOME_CLIENTE}
                </span>
              </div>
              <div>
                <span className="font-semibold text-emerald-700">Tarefa:</span>
                <span className="ml-2 text-emerald-600">
                  {chamado.NOME_TAREFA}
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-emerald-700">Assunto:</span>
                <span className="ml-2 text-emerald-600">
                  {chamado.ASSUNTO_CHAMADO}
                </span>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-6">
            {/* Data */}
            <FormSection
              title="Data da OS"
              icon={<Calendar className="text-emerald-500" size={18} />}
            >
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-300 bg-white p-4 font-medium text-slate-700 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-gray-300 bg-white p-4 font-medium text-slate-700 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Hora Fim
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-gray-300 bg-white p-4 font-medium text-slate-700 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-50"
                  />
                </div>
              </div>
            </FormSection>

            {/* Descrição */}
            <FormSection
              title="Descrição do Serviço"
              icon={<FileText className="text-blue-500" size={18} />}
            >
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white p-4 font-medium text-slate-700 shadow-sm transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-50"
                placeholder="Descreva detalhadamente o serviço a ser realizado, procedimentos necessários, materiais a serem utilizados e resultados esperados..."
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Seja específico sobre o trabalho a ser realizado
                </p>
                <p className="text-xs text-gray-400">
                  {formData.description.length}/1000
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
                  !formData.description.trim() ||
                  !formData.startTime ||
                  !formData.endTime
                }
                className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Criar OS
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
