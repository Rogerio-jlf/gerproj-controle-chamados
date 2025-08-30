'use client';

import { useClientes } from '../../../../hooks/firebird/useClientes';
import { useEmailAtribuirCahamados } from '../../../../hooks/firebird/useEmailAtribuirChamados';
import { useRecursos } from '../../../../hooks/firebird/useRecursos';
import { Card } from '@/components/ui/card';
import { useAuth } from '../../../../contexts/Auth_Context';

import {
  AlertCircle,
  Binary,
  Calendar,
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  Clock,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Shapes,
  User,
  UserCog,
  X,
  Send,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { ChamadosProps } from './Colunas_Tabela_Chamados';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

interface ModalChamadoProps {
  isOpen: boolean;
  onClose: () => void;
  chamado: ChamadosProps | null;
}

interface FormularioData {
  cliente: string;
  recurso: string;
  enviarEmailCliente: boolean;
  enviarEmailRecurso: boolean;
}

export default function ModalChamado({
  isOpen,
  onClose,
  chamado,
}: ModalChamadoProps) {
  const [showForm, setShowForm] = useState(false);
  const [assuntoExpandido, setAssuntoExpandido] = useState(false);
  const [formData, setFormData] = useState<FormularioData>({
    cliente: '',
    recurso: '',
    enviarEmailCliente: false,
    enviarEmailRecurso: false,
  });

  const { isAdmin } = useAuth();

  const { data: clientes = [], isLoading: loadingClientes } = useClientes();
  const { data: recursos = [], isLoading: loadingRecursos } = useRecursos();

  const { mutate, isPending, isSuccess, isError, error } =
    useEmailAtribuirCahamados();

  const handleClose = () => {
    setTimeout(() => {
      setShowForm(false);
      resetForm();
      onClose();
    }, 300);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chamado) return;

    mutate(
      {
        codChamado: chamado.COD_CHAMADO,
        codCliente: Number(formData.cliente),
        codRecurso: Number(formData.recurso),
        enviarEmailCliente: formData.enviarEmailCliente,
        enviarEmailRecurso: formData.enviarEmailRecurso,
      },
      {
        onSuccess: () => {
          console.log('Notificação configurada com sucesso');
          setShowForm(false);
          onClose();
        },
        onError: err => {
          console.error('Erro ao configurar notificação:', err);
          alert('Erro ao enviar notificação');
        },
      }
    );
  };

  const resetForm = () => {
    setFormData({
      cliente: '',
      recurso: '',
      enviarEmailCliente: false,
      enviarEmailRecurso: false,
    });
    setShowForm(false);
  };

  const formateDateISO = (dataISO: string | null) => {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    if (isNaN(data.getTime())) return '-';

    return data.toLocaleDateString('pt-BR');
  };

  const formateTime = (horario: number | string) => {
    const horarioFormatado = horario.toString().padStart(4, '0');
    const horas = horarioFormatado.slice(0, 2);
    const minutos = horarioFormatado.slice(2, 4);
    return `${horas}:${minutos}`;
  };

  const getStyleStatus = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
      case 'NAO FINALIZADO':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border border-yellow-300 shadow-yellow-500/30';

      case 'EM ATENDIMENTO':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-300 shadow-blue-500/30';

      case 'FINALIZADO':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-300 shadow-green-500/30';

      case 'NAO INICIADO':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-300 shadow-red-500/30';

      case 'STANDBY':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border border-orange-300 shadow-orange-500/30';

      case 'ATRIBUIDO':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-300 shadow-blue-500/30';

      case 'AGUARDANDO VALIDACAO':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border border-purple-300 shadow-purple-500/30';

      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border border-gray-300 shadow-gray-500/30';
    }
  };

  if (!isOpen || !chamado) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center duration-300">
      {/* Overlay com blur melhorado */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={`animate-in slide-in-from-bottom-4 relative z-10 mx-4 overflow-hidden rounded-3xl border border-gray-200/50 bg-white shadow-2xl transition-all duration-500 ease-out ${
          showForm ? 'h-[95vh] w-[1500px]' : 'h-[95vh] w-[1000px]'
        }`}
      >
        {/* Header com gradiente */}
        <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Ícone com animação */}
              <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 p-4 backdrop-blur-sm">
                <FileText
                  className="drop-shadow-glow text-cyan-400"
                  size={40}
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow-sm">
                  Chamado #{chamado.COD_CHAMADO}
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-300">
                  Visualizar e gerenciar atendimento
                </p>
              </div>
            </div>

            {/* Status Badge no header */}
            <div className="flex items-center gap-4">
              <div
                className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${getStyleStatus(chamado.STATUS_CHAMADO)}`}
              >
                {chamado.STATUS_CHAMADO ?? 'Não atribuído'}
              </div>

              <button
                onClick={handleClose}
                className="group rounded-full border border-transparent p-3 text-white transition-all duration-200 hover:border-red-400/50 hover:bg-red-500/20"
              >
                <X className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="flex h-[calc(95vh-140px)] overflow-hidden">
          {/* Seção de Informações */}
          <div
            className={`overflow-y-auto bg-gradient-to-br from-gray-50 to-white transition-all duration-500 ${
              showForm ? 'w-3/5 border-r border-gray-200' : 'w-full'
            }`}
          >
            <div className="space-y-6 p-6">
              {/* Card Informações Gerais */}
              <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
                <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <User className="text-blue-600" size={20} />
                    Informações Gerais
                  </h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Coluna esquerda */}
                    <div className="space-y-4">
                      <InfoItem
                        icon={
                          <Calendar className="text-emerald-500" size={18} />
                        }
                        label="Data"
                        value={formateDateISO(chamado.DATA_CHAMADO)}
                      />

                      <InfoItem
                        icon={<User className="text-blue-500" size={18} />}
                        label="Cliente"
                        value={chamado.NOME_CLIENTE || '-'}
                      />

                      <InfoItem
                        icon={
                          <AlertCircle className="text-orange-500" size={18} />
                        }
                        label="Prioridade"
                        value={chamado.PRIOR_CHAMADO || '-'}
                      />
                    </div>

                    {/* Coluna direita */}
                    <div className="space-y-4">
                      <InfoItem
                        icon={<Clock className="text-purple-500" size={18} />}
                        label="Horário"
                        value={formateTime(chamado.HORA_CHAMADO)}
                      />

                      <InfoItem
                        icon={<UserCog className="text-indigo-500" size={18} />}
                        label="Recurso"
                        value={chamado.NOME_RECURSO || '-'}
                      />

                      <InfoItem
                        icon={
                          <CircleCheckBig
                            className="text-green-500"
                            size={18}
                          />
                        }
                        label="Conclusão"
                        value={formateDateISO(chamado.CONCLUSAO_CHAMADO) || '-'}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card Detalhes Técnicos */}
              <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
                <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <Settings className="text-purple-600" size={20} />
                    Detalhes Técnicos
                  </h3>
                </div>

                <div className="space-y-4 p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      icon={<Binary className="text-cyan-500" size={18} />}
                      label="Classificação"
                      value={
                        chamado.COD_CLASSIFICACAO !== undefined &&
                        chamado.COD_CLASSIFICACAO !== null
                          ? String(chamado.COD_CLASSIFICACAO)
                          : '-'
                      }
                    />

                    <InfoItem
                      icon={<Mail className="text-red-500" size={18} />}
                      label="Email"
                      value={chamado.EMAIL_CHAMADO || '-'}
                    />

                    <InfoItem
                      icon={<Shapes className="text-yellow-500" size={18} />}
                      label="Código TRF"
                      value={chamado.CODTRF_CHAMADO || '-'}
                    />
                  </div>

                  {/* Assunto expandível */}
                  <div
                    className="cursor-pointer rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md"
                    onClick={() => setAssuntoExpandido(prev => !prev)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <MessageSquare className="text-blue-500" size={18} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-600">
                            Assunto
                          </p>
                          <p
                            className={`font-medium text-gray-900 transition-all duration-300 ${
                              assuntoExpandido
                                ? 'break-words whitespace-pre-wrap'
                                : 'truncate'
                            }`}
                          >
                            {corrigirTextoCorrompido(
                              chamado.ASSUNTO_CHAMADO || '-'
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="ml-2 shrink-0">
                        {assuntoExpandido ? (
                          <ChevronDown
                            className="text-gray-400 transition-transform duration-300"
                            size={18}
                          />
                        ) : (
                          <ChevronRight
                            className="text-gray-400 transition-transform duration-300"
                            size={18}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Botão Atribuir - apenas para admin */}
              {!showForm && isAdmin && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowForm(true)}
                    className="group flex transform items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25"
                  >
                    <Send
                      size={20}
                      className="transition-transform group-hover:translate-x-1"
                    />
                    Atribuir Chamado
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Formulário de Atribuição */}
          {showForm && isAdmin && (
            <div className="w-2/5 overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
              <div className="h-full p-6">
                {/* Header do formulário */}
                <div className="mb-8 border-b border-gray-200 pb-4">
                  <h2 className="mb-2 text-2xl font-bold text-slate-800">
                    Atribuir Chamado
                  </h2>
                  <p className="text-slate-600">
                    Configure a atribuição e notificações
                  </p>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-8">
                  {/* Seleções */}
                  <div className="space-y-6">
                    {/* Select Cliente */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Cliente
                      </label>
                      <select
                        value={formData.cliente}
                        onChange={e =>
                          setFormData({ ...formData, cliente: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white p-4 font-medium text-slate-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        disabled={loadingClientes}
                        required
                      >
                        <option value="">
                          {loadingClientes
                            ? 'Carregando...'
                            : 'Selecione um cliente'}
                        </option>
                        {clientes.map(
                          (cliente: {
                            cod_cliente: number;
                            nome_cliente: string;
                          }) => (
                            <option
                              key={cliente.cod_cliente}
                              value={cliente.cod_cliente}
                            >
                              {cliente.nome_cliente}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* Select Recurso */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Recurso
                      </label>
                      <select
                        value={formData.recurso}
                        onChange={e =>
                          setFormData({ ...formData, recurso: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white p-4 font-medium text-slate-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        disabled={loadingRecursos}
                        required
                      >
                        <option value="">
                          {loadingRecursos
                            ? 'Carregando...'
                            : 'Selecione um recurso'}
                        </option>
                        {recursos.map(
                          (recurso: {
                            cod_recurso: number;
                            nome_recurso: string;
                          }) => (
                            <option
                              key={recurso.cod_recurso}
                              value={recurso.cod_recurso}
                            >
                              {recurso.nome_recurso}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes de notificação */}
                  <div className="space-y-4">
                    <h3 className="border-b border-gray-200 pb-2 text-sm font-semibold text-slate-700">
                      Notificações por Email
                    </h3>

                    <CheckboxItem
                      checked={formData.enviarEmailCliente}
                      onChange={checked =>
                        setFormData({
                          ...formData,
                          enviarEmailCliente: checked,
                        })
                      }
                      label="Enviar email para o cliente"
                      description="O cliente receberá uma notificação sobre a atribuição"
                    />

                    <CheckboxItem
                      checked={formData.enviarEmailRecurso}
                      onChange={checked =>
                        setFormData({
                          ...formData,
                          enviarEmailRecurso: checked,
                        })
                      }
                      label="Enviar email para o recurso"
                      description="O recurso receberá uma notificação sobre o chamado"
                    />
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-3 border-t border-gray-200 pt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Atribuição'
                      )}
                    </button>
                  </div>
                </form>

                {/* Feedback */}
                {isSuccess && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-center font-medium text-green-700">
                      ✅ Atribuição realizada com sucesso!
                    </p>
                  </div>
                )}

                {isError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-center font-medium text-red-700">
                      ❌{' '}
                      {error instanceof Error
                        ? error.message
                        : 'Erro ao salvar atribuição'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares
const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-colors duration-200 hover:bg-gray-100">
    {icon}
    <div>
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const CheckboxItem = ({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) => (
  <label className="group cursor-pointer">
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center gap-3">
        <Mail className="text-blue-500 group-hover:text-blue-600" size={18} />
        <div>
          <span className="block font-medium text-gray-900">{label}</span>
          <span className="text-sm text-gray-600">{description}</span>
        </div>
      </div>
    </div>
  </label>
);
