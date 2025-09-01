import React, { useState } from 'react';
// ================================================================================
import { IoClose } from 'react-icons/io5';
import { FaCalendarAlt } from 'react-icons/fa';
import { IoMdClock } from 'react-icons/io';
import { IoDocumentText } from 'react-icons/io5';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaCheckCircle } from 'react-icons/fa';
// ================================================================================
// ================================================================================

// ================================================================================
interface Props {
  isOpen: boolean;
  onClose: () => void;
  codChamado: number | null;
  codOS: string | null;
  nomeCliente?: string;
  onSuccess?: () => void;
}
// ================================================================================

export default function ModalEditarOS({
  isOpen,
  onClose,
  codChamado,
  codOS,
  onSuccess,
  nomeCliente,
}: Props) {
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

    let newValue = value;

    if (name === 'observacaoOS') {
      // Remove espaços no início
      newValue = newValue.trimStart();

      // Se existir texto, coloca a primeira letra em maiúscula
      if (newValue.length > 0) {
        newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };
  // ================================================================================

  // Função para extrair primeiro nome
  const getPrimeiroNome = (nomeCompleto: string): string => {
    return nomeCompleto.trim().split(' ')[0];
  };

  // Função utilitária para remover acentos, mantendo espaços
  const removerAcentos = (texto: string): string => {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // ================================================================================
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

      // FORMATAR A OBSERVAÇÃO COM O NOME DO CLIENTE
      const primeiroNome = nomeCliente ? getPrimeiroNome(nomeCliente) : '';
      const observacaoSemAcentos = removerAcentos(formData.observacaoOS.trim());
      const observacaoFormatada = primeiroNome
        ? `[${primeiroNome}] - ${observacaoSemAcentos}`
        : observacaoSemAcentos;

      const payload = {
        codOS: codOS,
        dataInicioOS: formData.dataInicioOS,
        horaInicioOS: formData.horaInicioOS,
        horaFimOS: formData.horaFimOS,
        observacaoOS: observacaoFormatada,
      };

      console.log('TESTE - Dados enviados para API:', payload);

      const response = await fetch('/api/apontamentos/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };
  // ================================================================================

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
  // ================================================================================

  // ================================================================================
  return (
    <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
      {/* ===== OVERLAY ===== */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xl"
        onClick={handleClose}
      />
      {/* ===== */}

      {/* ===== MODAL CONTAINER ===== */}
      <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-black bg-white transition-all duration-500 ease-out">
        {/* ===== HEADER ===== */}
        <header className="relative bg-yellow-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Ícone */}
              <div className="rounded-2xl border border-black/50 bg-white/10 p-4">
                <IoMdClock className="text-black" size={32} />
              </div>

              <div className="flex flex-col items-start justify-center">
                {/* Título */}
                <h1 className="text-2xl font-bold tracking-wider text-black select-none">
                  Atualizar OS
                </h1>

                <div className="mt-1 inline-block rounded-full bg-black px-4 py-1">
                  {/* Subtítulo */}
                  <p className="text-sm font-semibold tracking-widest text-white select-none">
                    Chamado - {codChamado} {codOS && `/ OS - ${codOS}`}
                  </p>
                </div>
              </div>
            </div>
            {/* ===== */}

            {/* Botão fechar modal */}
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="group cursor-pointer rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
            >
              <IoClose size={24} />
            </button>
          </div>
        </header>
        {/* ===== */}

        {/* ===== CONTEÚDO ===== */}
        <main className="max-h-[calc(95vh-140px)] overflow-y-auto bg-gray-50 p-6">
          {/* Alerta de sucesso */}
          {success && (
            <div className="mb-6 rounded-full border border-green-200 bg-green-600 px-6 py-2">
              <div className="flex items-center gap-3">
                {/* Ícone */}
                <FaCheckCircle className="text-green-500" size={20} />
                {/* Texto */}
                <p className="text-base font-semibold tracking-wider text-white select-none">
                  OS atualizada com sucesso!
                </p>
              </div>
            </div>
          )}
          {/* ===== */}

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
          {/* ===== */}

          {/* Formulário */}
          <div className="space-y-4">
            {/* Data */}
            <FormSection
              title="Data"
              icon={<FaCalendarAlt className="text-black" size={20} />}
            >
              <input
                type="date"
                name="dataInicioOS"
                value={formData.dataInicioOS}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </FormSection>
            {/* ===== */}

            {/* Horários */}
            <FormSection
              title="Horário"
              icon={<IoMdClock className="text-black" size={20} />}
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-1 block text-base font-semibold tracking-wider text-gray-800 select-none">
                    Hora Início
                  </label>
                  <input
                    type="time"
                    name="horaInicioOS"
                    value={formData.horaInicioOS}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-base font-semibold tracking-wider text-gray-800 select-none">
                    Hora Fim
                  </label>
                  <input
                    type="time"
                    name="horaFimOS"
                    value={formData.horaFimOS}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </FormSection>
            {/* ===== */}

            {/* Observação */}
            <FormSection
              title="Observação"
              icon={<IoDocumentText className="text-black" size={20} />}
            >
              <textarea
                name="observacaoOS"
                value={formData.observacaoOS}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={4}
                className="w-full resize-none rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all placeholder:text-gray-500 placeholder:italic focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descreva detalhadamente o serviço realizado, procedimentos executados, materiais utilizados e resultados obtidos..."
              />
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-widest text-black italic select-none">
                  *Apenas 200 caracteres
                </p>
                <p className="text-sm font-semibold tracking-widest text-black italic select-none">
                  {formData.observacaoOS.length}/200
                </p>
              </div>
            </FormSection>
            {/* ===== */}

            {/* Botões de ação */}
            <div className="flex items-center justify-end gap-6 border-t-2 border-red-500 pt-4">
              {/* Botão cancelar */}
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-lg font-extrabold text-white transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              {/* ===== */}

              {/* Botão de atualizar */}
              <button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !formData.observacaoOS.trim() ||
                  !formData.horaInicioOS ||
                  !formData.horaFimOS
                }
                className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-lg font-extrabold text-white transition-all select-none hover:scale-105 hover:bg-blue-900 hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>Atualizar OS</>
                )}
              </button>
            </div>
          </div>
        </main>
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
  <div className="overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm shadow-black">
    <div className="border-b border-gray-300 bg-gray-200 px-4 py-2">
      <h3 className="flex items-center gap-2 text-lg font-bold tracking-wider text-black select-none">
        {icon}
        {title}
      </h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);
