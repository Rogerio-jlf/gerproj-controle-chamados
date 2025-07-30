'use client';

import { useClientes } from '@/hooks/useClientes';
import { useEmailAtribuirCahamados } from '@/hooks/useEmailAtribuirChamados';
import { useRecursos } from '@/hooks/useRecursos';
import { Card } from '@/components/ui/card';
import {
  AlertCircle,
  Binary,
  Calendar,
  CircleCheckBig,
  Clock,
  FileText,
  Loader2,
  Mail,
  MessageSquareDot,
  Shapes,
  TrendingUp,
  User,
  UserCog,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ChamadosProps } from './Colunas';

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

export default function Modal({ isOpen, onClose, chamado }: ModalChamadoProps) {
  const [showForm, setShowForm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState<FormularioData>({
    cliente: '',
    recurso: '',
    enviarEmailCliente: false,
    enviarEmailRecurso: false,
  });

  const { data: clientes = [], isLoading: loadingClientes } = useClientes();
  const { data: recursos = [], isLoading: loadingRecursos } = useRecursos();

  const { mutate, isPending, isSuccess, isError, error } =
    useEmailAtribuirCahamados();

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      setShowForm(false);
      resetForm();
      onClose();
      setIsClosing(false);
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

  const formatarDataISO = (dataISO: string) => {
    const data = new Date(dataISO);
    if (isNaN(data.getTime())) return 'Data inválida';

    return data.toLocaleDateString('pt-BR');
  };

  const formatarHorario = (horario: number | string) => {
    const horarioFormatado = horario.toString().padStart(4, '0');
    const horas = horarioFormatado.slice(0, 2);
    const minutos = horarioFormatado.slice(2, 4);
    return `${horas}:${minutos}`;
  };

  const getStatusStyle = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
      case 'NAO FINALIZADO':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg shadow-yellow-500/30';
      case 'EM ATENDIMENTO':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30';
      case 'FINALIZADO':
        return 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30';
      case 'NAO INICIADO':
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30';
      case 'STANDBY':
        return 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/30';
      case 'ATRIBUIDO':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30';
      case 'AGUARDANDO VALIDACAO':
        return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/30';
    }
  };

  if (!isOpen || !chamado) return null;

  return (
    // ===== CONTAINER PRINCIPAL =====
    <div className="animate-in fade-out fixed inset-0 z-50 flex items-center justify-center duration-200">
      {/* ===== OVERLAY ===== */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={handleClose}
      />

      {/* ===== CONTAINER MODAL ===== */}
      <div
        className={`animate-in slide-in-from-bottom relative z-10 mx-4 overflow-hidden rounded-xl ${
          showForm ? 'w-[1600px]' : 'max-w-5xl'
        }`}
      >
        {/* Header */}
        <header className="relative flex items-center justify-between bg-slate-950 p-6">
          <div className="flex items-center gap-4">
            {/* Ícone header */}
            <div className="rounded-full bg-cyan-400/20 p-4">
              <FileText className="text-cyan-400" size={40} />
            </div>

            <div>
              {/* Título header */}
              <h1 className="text-2xl font-bold tracking-wider text-slate-200 select-none">
                Chamado #{chamado.COD_CHAMADO}
              </h1>

              {/* Subtítulo header */}
              <p className="text-sm font-semibold tracking-wider text-slate-200 italic select-none">
                Detalhes do atendimento
              </p>
            </div>
          </div>

          {/* Botão fechar modal */}
          <button
            onClick={handleClose}
            className="group rounded-full p-2 text-slate-200 hover:scale-125 hover:bg-red-500/50 hover:text-red-500"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        {/* ===== CONTEÚDO PRINCIPAL ===== */}
        <div className="flex max-h-[calc(110vh-180px)] overflow-hidden bg-white">
          <div
            className={`transition-all duration-500 ease-in-out ${
              showForm ? 'w-1/2 border-r border-slate-500' : 'w-full'
            }`}
          >
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Card de informações principais */}
                <Card className="rounded-lg bg-slate-900 p-6">
                  <h3 className="flex items-center border-b border-slate-500 text-xl font-bold tracking-wider text-white select-none">
                    Informações do Chamado
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3">
                      <Calendar className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-400">Data</p>
                        <p className="font-semibold text-white">
                          {formatarDataISO(chamado.DATA_CHAMADO)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3">
                      <Clock className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-400">Horário</p>
                        <p className="font-semibold text-white">
                          {formatarHorario(chamado.HORA_CHAMADO)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3">
                      <User className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-400">Cliente</p>
                        <p className="font-semibold text-white">
                          {chamado.NOME_CLIENTE || 'Não atribuído'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3">
                      <UserCog className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-400">Recurso</p>
                        <p className="font-semibold text-white">
                          {chamado.NOME_RECURSO || 'Não atribuído'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3">
                      <AlertCircle className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-400">Recurso</p>
                        <p className="font-semibold text-white">
                          {chamado.PRIOR_CHAMADO || 'Não atribuído'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center rounded-lg bg-slate-700/50 p-3">
                      <p
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(
                          chamado.STATUS_CHAMADO
                        )}`}
                      >
                        {chamado.STATUS_CHAMADO ?? 'Não atribuído'}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Card de detalhes técnicos */}
                <Card className="rounded-lg bg-slate-900 p-6">
                  <h3 className="flex items-center border-b border-slate-500 text-xl font-bold tracking-wider text-white select-none">
                    Detalhes Técnicos
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3">
                      <Binary className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">Classificação</p>
                        <p className="font-semibold text-white">
                          {chamado.COD_CLASSIFICACAO}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3">
                      <Shapes className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">Código TRF</p>
                        <p className="font-semibold text-white">
                          {chamado.CODTRF_CHAMADO || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-3">
                      <Mail className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">Email</p>
                        <p className="font-semibold text-white">
                          {chamado.EMAIL_CHAMADO || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {chamado.CONCLUSAO_CHAMADO && (
                      <div className="flex items-start gap-3 rounded-lg bg-slate-700/50 p-3">
                        <CircleCheckBig className="mt-0.5 h-5 w-5 text-green-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-400">Conclusão</p>
                          <p className="font-semibold text-white">
                            {chamado.CONCLUSAO_CHAMADO}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="rounded-lg bg-slate-700/50 p-3">
                      <div className="flex items-start gap-3">
                        <MessageSquareDot className="mt-0.5 h-5 w-5 text-purple-400" />
                        <div className="flex-1">
                          <p className="mb-1 text-xs text-slate-400">Assunto</p>
                          <p className="leading-relaxed font-semibold text-white">
                            {chamado.ASSUNTO_CHAMADO}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end gap-4 bg-white pt-4">
                <button
                  onClick={handleClose}
                  disabled={isClosing}
                  className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-red-600 hover:to-red-700 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isClosing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fechando...
                    </div>
                  ) : (
                    'Cancelar'
                  )}
                </button>

                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl active:scale-95"
                  >
                    Atribuir Chamado
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Painel do formulário */}
          {showForm && (
            <div className="w-1/2 bg-gradient-to-br from-white to-slate-50">
              <div className="h-full overflow-y-auto p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Atribuir Chamado
                  </h2>
                  <p className="text-slate-600">
                    Configure a atribuição e notificações
                  </p>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-6">
                  {/* Select Cliente */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Selecionar Cliente
                    </label>
                    <select
                      value={formData.cliente}
                      onChange={e =>
                        setFormData({ ...formData, cliente: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-800 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                      Selecionar Recurso
                    </label>
                    <select
                      value={formData.recurso}
                      onChange={e =>
                        setFormData({ ...formData, recurso: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-800 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Notificações por Email
                    </h3>

                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all duration-200 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={formData.enviarEmailCliente}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              enviarEmailCliente: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-blue-600 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                        />
                        <Mail className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-slate-800">
                          Enviar email para o cliente
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition-all duration-200 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={formData.enviarEmailRecurso}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              enviarEmailRecurso: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-blue-600 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                        />
                        <Mail className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-slate-800">
                          Enviar email para o recurso
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Botões do formulário */}
                  <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-gray-600 hover:to-gray-700 active:scale-95"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-green-700 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Salvando...
                        </div>
                      ) : (
                        'Salvar Atribuição'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
