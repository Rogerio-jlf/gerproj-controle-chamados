import React, { useState } from 'react';
import { z } from 'zod';
// ================================================================================
import { IoClose } from 'react-icons/io5';
import { FaCalendarAlt } from 'react-icons/fa';
import { IoMdClock } from 'react-icons/io';
import { IoDocumentText } from 'react-icons/io5';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaCheckCircle } from 'react-icons/fa';
// ================================================================================

// Schema de validação com Zod
const formSchema = z
  .object({
    observacaoOS: z
      .string()
      .min(1, 'Observação é obrigatória')
      .min(10, 'Observação deve ter pelo menos 10 caracteres')
      .max(200, 'Observação deve ter no máximo 200 caracteres')
      .refine(
        val => val.trim().length > 0,
        'Observação não pode ser apenas espaços'
      ),

    dataInicioOS: z
      .string()
      .min(1, 'Data é obrigatória')
      .refine(dateString => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, 'Data não pode ser anterior a hoje'),

    horaInicioOS: z
      .string()
      .min(1, 'Hora de início é obrigatória')
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),

    horaFimOS: z
      .string()
      .min(1, 'Hora de fim é obrigatória')
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  })
  .refine(
    data => {
      if (!data.horaInicioOS || !data.horaFimOS) return true; // Deixa os campos individuais validarem primeiro

      const [startHours, startMinutes] = data.horaInicioOS
        .split(':')
        .map(Number);
      const [endHours, endMinutes] = data.horaFimOS.split(':').map(Number);

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      return endTimeInMinutes > startTimeInMinutes;
    },
    {
      message: 'Hora de fim deve ser maior que hora de início',
      path: ['horaFimOS'], // Aplica o erro ao campo horaFimOS
    }
  )
  .refine(
    data => {
      if (!data.horaInicioOS || !data.horaFimOS) return true;

      const [startHours, startMinutes] = data.horaInicioOS
        .split(':')
        .map(Number);
      const [endHours, endMinutes] = data.horaFimOS.split(':').map(Number);

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;
      const diffInMinutes = endTimeInMinutes - startTimeInMinutes;

      return diffInMinutes >= 15; // Mínimo de 15 minutos
    },
    {
      message: 'Diferença mínima entre horários deve ser de 15 minutos',
      path: ['horaFimOS'],
    }
  );

type FormData = z.infer<typeof formSchema>;
type FormErrors = Partial<Record<keyof FormData | 'root', string>>;

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
  const [formData, setFormData] = useState<FormData>({
    observacaoOS: '',
    dataInicioOS: new Date().toISOString().split('T')[0],
    horaInicioOS: '',
    horaFimOS: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validação em tempo real (opcional)
  const validateField = (name: keyof FormData, value: string) => {
    try {
      const fieldSchema = formSchema.shape[name];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [name]: error.issues[0]?.message }));
      }
    }
  };

  // Função para lidar com mudanças nos inputs
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

    // Limpa erro do campo específico quando usuário começa a digitar
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Validação em tempo real (opcional - remova se achar muito intrusivo)
    if (newValue.length > 0) {
      setTimeout(() => validateField(name as keyof FormData, newValue), 500);
    }
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

  const validateForm = (): boolean => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach(err => {
          const path = err.path[0] as keyof FormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // ================================================================================
  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validação com Zod
      if (!validateForm()) {
        setIsLoading(false);
        return;
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
        resetForm();
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setErrors({ root: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  // ================================================================================

  const resetForm = () => {
    setFormData({
      observacaoOS: '',
      dataInicioOS: new Date().toISOString().split('T')[0],
      horaInicioOS: '',
      horaFimOS: '',
    });
    setErrors({});
    setSuccess(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  // Calcula duração do trabalho
  const calculateDuration = (): string => {
    if (!formData.horaInicioOS || !formData.horaFimOS) return '';

    const [startHours, startMinutes] = formData.horaInicioOS
      .split(':')
      .map(Number);
    const [endHours, endMinutes] = formData.horaFimOS.split(':').map(Number);

    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;

    if (endTimeInMinutes <= startTimeInMinutes) return '';

    const diffInMinutes = endTimeInMinutes - startTimeInMinutes;
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  };

  const isFormValid = () => {
    return (
      Object.keys(errors).length === 0 &&
      formData.observacaoOS.trim() &&
      formData.horaInicioOS &&
      formData.horaFimOS &&
      formData.dataInicioOS
    );
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
          <section className="flex items-center justify-between">
            <div className="flex items-center justify-between gap-6">
              {/* Ícone */}
              <div className="rounded-2xl border border-black/50 bg-white/10 p-4">
                <IoMdClock className="text-black" size={40} />
              </div>

              <div className="flex flex-col items-center justify-center">
                {/* Título */}
                <h1 className="text-2xl font-bold tracking-wider text-black select-none">
                  Editar OS
                </h1>

                <div className="inline-block rounded-full bg-black px-8 py-1">
                  {/* Valor */}
                  <p className="text-base font-extrabold tracking-widest text-white italic select-none">
                    OS - #{codOS}
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
          </section>
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

          {/* Alerta de erro geral */}
          {errors.root && (
            <div className="mb-6 rounded-full border border-red-200 bg-red-600 px-6 py-2">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-red-500" size={20} />
                <p className="text-base font-semibold tracking-wider text-white select-none">
                  {errors.root}
                </p>
              </div>
            </div>
          )}
          {/* ===== */}

          {/* Resumo da duração */}
          {calculateDuration() && (
            <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-2">
              <p className="text-center text-sm font-semibold text-blue-800">
                Duração total: {calculateDuration()}
              </p>
            </div>
          )}

          {/* ===== FORMULÁRIO ===== */}
          <section className="space-y-6">
            {/* Data */}
            <FormSection
              title="Data"
              icon={<FaCalendarAlt className="text-white" size={20} />}
              error={errors.dataInicioOS}
            >
              <input
                type="date"
                name="dataInicioOS"
                value={formData.dataInicioOS}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.dataInicioOS
                    ? 'border-red-500 ring-2 ring-red-200'
                    : ''
                }`}
              />
            </FormSection>
            {/* ===== */}

            {/* Horários */}
            <FormSection
              title="Horário"
              icon={<IoMdClock className="text-white" size={20} />}
              error={errors.horaInicioOS || errors.horaFimOS}
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
                    className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.horaInicioOS
                        ? 'border-red-500 ring-2 ring-red-200'
                        : ''
                    }`}
                  />
                  {errors.horaInicioOS && (
                    <p className="mt-1 text-sm font-semibold text-red-600">
                      {errors.horaInicioOS}
                    </p>
                  )}
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
                    className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.horaFimOS
                        ? 'border-red-500 ring-2 ring-red-200'
                        : ''
                    }`}
                  />
                  {errors.horaFimOS && (
                    <p className="mt-1 text-sm font-semibold text-red-600">
                      {errors.horaFimOS}
                    </p>
                  )}
                </div>
              </div>
            </FormSection>
            {/* ===== */}

            {/* Observação */}
            <FormSection
              title="Observação"
              icon={<IoDocumentText className="text-white" size={20} />}
              error={errors.observacaoOS}
            >
              <textarea
                name="observacaoOS"
                value={formData.observacaoOS}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={4}
                maxLength={200}
                className={`w-full resize-none rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all placeholder:text-gray-500 placeholder:italic focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.observacaoOS
                    ? 'border-red-500 ring-2 ring-red-200'
                    : ''
                }`}
                placeholder="Descreva detalhadamente o serviço realizado, procedimentos executados, materiais utilizados e resultados obtidos..."
              />
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs font-extrabold tracking-widest text-black italic select-none">
                  *Mínimo 10, máximo 200 caracteres
                </p>
                <p
                  className={`text-xs font-extrabold tracking-widest italic select-none ${
                    formData.observacaoOS.length > 200
                      ? 'text-red-600'
                      : 'text-black'
                  }`}
                >
                  {formData.observacaoOS.length}/200
                </p>
              </div>
            </FormSection>
            {/* ===== */}

            {/* Botões de ação */}
            <section className="flex items-center justify-end gap-6">
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
                disabled={isLoading || !isFormValid()}
                className={`flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-lg font-extrabold text-white transition-all select-none active:scale-95 ${
                  isLoading || !isFormValid()
                    ? 'disabled:cursor-not-allowed disabled:opacity-50'
                    : 'hover:scale-105 hover:bg-blue-900 hover:shadow-lg hover:shadow-black'
                }`}
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
            </section>
          </section>
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
  error,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  error?: string;
}) => (
  <div
    className={`overflow-hidden rounded-md bg-white shadow-sm shadow-black ${
      error ? 'ring-2 ring-red-200' : ''
    }`}
  >
    <div className={`px-4 py-2 ${error ? 'bg-red-600' : 'bg-black'}`}>
      <h3 className="flex items-center gap-2 text-lg font-bold tracking-wider text-white select-none">
        {icon}
        {title}
        {error && <span className="ml-auto text-sm">⚠️</span>}
      </h3>
    </div>
    <div className="p-6">
      {children}
      {error && (
        <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>
      )}
    </div>
  </div>
);
