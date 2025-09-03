import React, { useState } from 'react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
// ================================================================================
import { DBTarefaProps } from '../../../../types/types';
// ================================================================================
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { IoMdClock } from 'react-icons/io';
import { FaUserClock } from 'react-icons/fa';
import { IoClose, IoDocumentText } from 'react-icons/io5';
// ================================================================================

// Schema de validação com Zod
const formSchema = z
  .object({
    description: z
      .string()
      .min(1, 'Descrição é obrigatória')
      .min(10, 'Descrição deve ter pelo menos 10 caracteres')
      .max(200, 'Descrição deve ter no máximo 200 caracteres')
      .refine(
        val => val.trim().length > 0,
        'Descrição não pode ser apenas espaços'
      ),

    date: z
      .string()
      .min(1, 'Data é obrigatória')
      .refine(dateString => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, 'Data não pode ser anterior a hoje'),

    startTime: z
      .string()
      .min(1, 'Hora de início é obrigatória')
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),

    endTime: z
      .string()
      .min(1, 'Hora de fim é obrigatória')
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  })
  .refine(
    data => {
      if (!data.startTime || !data.endTime) return true; // Deixa os campos individuais validarem primeiro

      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      return endTimeInMinutes > startTimeInMinutes;
    },
    {
      message: 'Hora de fim deve ser maior que hora de início',
      path: ['endTime'], // Aplica o erro ao campo endTime
    }
  )
  .refine(
    data => {
      if (!data.startTime || !data.endTime) return true;

      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;
      const diffInMinutes = endTimeInMinutes - startTimeInMinutes;

      return diffInMinutes >= 15; // Mínimo de 15 minutos
    },
    {
      message: 'Diferença mínima entre horários deve ser de 15 minutos',
      path: ['endTime'],
    }
  );

type FormData = z.infer<typeof formSchema>;
type FormErrors = Partial<Record<keyof FormData | 'root', string>>;

export interface ModalApontamentoProps {
  isOpen: boolean;
  onClose: () => void;
  tarefa: DBTarefaProps | null;
}

export default function ModalCriarOS({
  isOpen,
  onClose,
  tarefa,
}: ModalApontamentoProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpa erro do campo específico quando usuário começa a digitar
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Validação em tempo real (opcional - remova se achar muito intrusivo)
    if (value.length > 0) {
      setTimeout(() => validateField(name as keyof FormData, value), 500);
    }
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

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validação com Zod
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // Validações de negócio
      if (!tarefa) {
        throw new Error('Tarefa não selecionada');
      }
      if (!user?.recurso?.id) {
        throw new Error('Usuário sem recurso definido');
      }

      const payload = {
        os: {
          COD_TAREFA: tarefa.COD_TAREFA,
          NOME_TAREFA: tarefa.NOME_TAREFA,
          RESPCLI_PROJETO: user.nome || '',
          FATURA_TAREFA: 'SIM',
        },
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        recurso: user.recurso.id.toString(),
        codTarefa: tarefa.COD_TAREFA,
        tarefa: tarefa,
      };

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
        resetForm();
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setErrors({ root: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
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
    if (!formData.startTime || !formData.endTime) return '';

    const [startHours, startMinutes] = formData.startTime
      .split(':')
      .map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);

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
      formData.description.trim() &&
      formData.startTime &&
      formData.endTime &&
      formData.date
    );
  };

  if (!isOpen || !tarefa) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-300">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xl"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="animate-in slide-in-from-bottom-4 relative z-10 max-h-[100vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-black bg-white transition-all duration-500 ease-out">
        {/* Header */}
        <header className="relative bg-yellow-600 p-6">
          <section className="flex items-center justify-between">
            <div className="flex items-center justify-between gap-6">
              <div className="rounded-2xl border border-black/50 bg-white/10 p-4">
                <FaUserClock className="text-black" size={40} />
              </div>

              <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold tracking-wider text-black select-none">
                  Realizar Apontamento
                </h1>
                <div className="inline-block rounded-full bg-black px-8 py-1">
                  <p className="text-base font-extrabold tracking-widest text-white italic select-none">
                    Tarefa #{tarefa.COD_TAREFA}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={isLoading}
              className="group cursor-pointer rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-125 hover:rotate-180 hover:bg-red-500 active:scale-95"
            >
              <IoClose size={24} />
            </button>
          </section>
        </header>

        {/* Conteúdo Principal */}
        <main className="max-h-[calc(95vh-140px)] overflow-y-auto bg-gray-50 p-6">
          {/* Alerta de sucesso */}
          {success && (
            <div className="mb-6 rounded-full border border-green-200 bg-green-600 px-6 py-2">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-500" size={20} />
                <p className="text-base font-semibold tracking-wider text-white select-none">
                  OS criada com sucesso!
                </p>
              </div>
            </div>
          )}

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

          {/* Resumo da duração */}
          {calculateDuration() && (
            <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-2">
              <p className="text-center text-sm font-semibold text-blue-800">
                Duração total: {calculateDuration()}
              </p>
            </div>
          )}

          {/* Formulário */}
          <section className="space-y-6">
            {/* Data */}
            <FormSection
              title="Data"
              icon={<FaCalendarAlt className="text-white" size={20} />}
              error={errors.date}
            >
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.date ? 'border-red-500 ring-2 ring-red-200' : ''
                }`}
              />
            </FormSection>

            {/* Horários */}
            <FormSection
              title="Horário"
              icon={<IoMdClock className="text-white" size={20} />}
              error={errors.startTime || errors.endTime}
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-1 block text-base font-semibold tracking-wider text-gray-800 select-none">
                    Hora Início
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.startTime
                        ? 'border-red-500 ring-2 ring-red-200'
                        : ''
                    }`}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm font-semibold text-red-600">
                      {errors.startTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-base font-semibold tracking-wider text-gray-800 select-none">
                    Hora Fim
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full cursor-pointer rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.endTime ? 'border-red-500 ring-2 ring-red-200' : ''
                    }`}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm font-semibold text-red-600">
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>
            </FormSection>

            {/* Observação */}
            <FormSection
              title="Observação"
              icon={<IoDocumentText className="text-white" size={20} />}
              error={errors.description}
            >
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={4}
                maxLength={200}
                className={`w-full resize-none rounded-md bg-white px-4 py-2 font-semibold text-gray-800 shadow-sm shadow-black transition-all placeholder:text-gray-500 placeholder:italic focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.description ? 'border-red-500 ring-2 ring-red-200' : ''
                }`}
                placeholder="Descreva detalhadamente o serviço a ser realizado, procedimentos necessários, materiais a serem utilizados e resultados esperados..."
              />
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs font-extrabold tracking-widest text-black italic select-none">
                  *Mínimo 10, máximo 200 caracteres
                </p>
                <p
                  className={`text-xs font-extrabold tracking-widest italic select-none ${
                    formData.description.length > 200
                      ? 'text-red-600'
                      : 'text-black'
                  }`}
                >
                  {formData.description.length}/200
                </p>
              </div>
            </FormSection>

            {/* Botões de Ação */}
            <section className="flex items-center justify-end gap-6">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-lg font-extrabold text-white transition-all select-none hover:scale-105 hover:bg-red-900 hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

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
                  <>Criar OS</>
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
