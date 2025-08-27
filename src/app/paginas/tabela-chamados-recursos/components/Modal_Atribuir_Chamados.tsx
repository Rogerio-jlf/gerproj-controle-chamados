'use client';

import { useClientes } from '@/hooks/firebird/useClientes';
import { useEmailAtribuirCahamados } from '@/hooks/firebird/useEmailAtribuirChamados';
import { useRecursos } from '@/hooks/firebird/useRecursos';
import { Card } from '@/components/ui/card';
// Importar o hook ou context (escolha uma das opções)
// Opção 1: Se usar o AuthContext melhorado
import { useAuth } from '../../../../contexts/Auth_Context';
// Opção 2: Se usar o hook simples
// import { useIsAdmin } from '@/hooks/useIsAdmin';

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

  // Verificação de admin - escolha uma das opções:

  // Opção 1: Usando AuthContext melhorado
  const { isAdmin } = useAuth();

  // Opção 2: Usando hook simples
  // const { isAdmin, loading: adminLoading } = useIsAdmin();

  // Se quiser usar adminLoading, descomente a linha abaixo e comente a linha acima:
  // const { isAdmin, loading: adminLoading } = useIsAdmin();

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
        return 'bg-yellow-700 text-white ring-1 ring-yellow-300';

      case 'EM ATENDIMENTO':
        return 'bg-blue-700 text-white ring-1 ring-blue-300';

      case 'FINALIZADO':
        return 'bg-green-700 text-white ring-1 ring-green-300';

      case 'NAO INICIADO':
        return 'bg-red-700 text-white ring-1 ring-red-300';

      case 'STANDBY':
        return 'bg-orange-700 text-white ring-1 ring-orange-300';

      case 'ATRIBUIDO':
        return 'bg-blue-700 text-white ring-1 ring-blue-300';

      case 'AGUARDANDO VALIDACAO':
        return 'bg-purple-700 text-white ring-1 ring-purple-300';

      default:
        return 'bg-gray-700 text-white ring-1 ring-gray-300';
    }
  };

  if (!isOpen || !chamado) return null;

  // Se ainda estiver carregando as informações de admin, pode mostrar um loader
  // Removido o bloco adminLoading pois não está definido

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
        className={`animate-in slide-in-from-bottom relative z-10 mx-4 overflow-hidden rounded-2xl border border-slate-500 ${
          showForm ? 'w-[1600px]' : 'w-[900px]'
        }`}
      >
        {/* ===== HEADER ===== */}
        <header className="relative flex items-center justify-between bg-slate-950 p-6">
          <div className="flex items-center gap-4">
            {/* ícone */}
            <div className="rounded-full bg-cyan-400/40 p-4">
              <FileText className="text-cyan-400" size={40} />
            </div>

            <div>
              {/* título */}
              <h1 className="text-2xl font-bold tracking-wider text-slate-200 select-none">
                Chamado #{chamado.COD_CHAMADO}
              </h1>

              {/* subtítulo */}
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
        <div className="flex max-h-[calc(100vh-220px)] overflow-hidden bg-white p-6">
          <div
            className={`mr space-y-6 px-4 transition-all duration-500 ease-in-out ${
              showForm ? 'w-2/3 border-r border-red-500' : 'w-full'
            }`}
          >
            {/* div - cards */}
            <div className="flex flex-col space-y-6">
              {/* cards */}
              <Card className="rounded-2xl border border-slate-300 bg-white p-6 shadow-md shadow-black">
                <h3 className="flex items-center border-b border-red-500 text-xl font-bold tracking-wider text-slate-800 select-none">
                  Informações do Chamado
                </h3>

                {/* Card - informações gerais */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-4 rounded-md bg-slate-800 px-4 py-1 shadow-md shadow-black">
                      <Calendar className="text-cyan-400" size={20} />
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                          Data
                        </p>
                        <p className="font-semibold tracking-wider text-white italic select-none">
                          {formateDateISO(chamado.DATA_CHAMADO)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-md bg-slate-800 px-4 py-1 shadow-md shadow-black">
                      <User className="text-cyan-400" size={20} />
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                          Cliente
                        </p>
                        <p className="font-semibold tracking-wider text-white italic select-none">
                          {chamado.NOME_CLIENTE || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-md bg-slate-800 px-4 py-1 shadow-md shadow-black">
                      <AlertCircle className="text-cyan-400" size={20} />
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                          Prioridade
                        </p>
                        <p className="font-semibold tracking-wider text-white italic select-none">
                          {chamado.PRIOR_CHAMADO || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-4 rounded-md bg-slate-800 px-4 py-1 shadow-md shadow-black">
                      <Clock className="text-cyan-400" size={20} />
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                          Horário
                        </p>
                        <p className="font-semibold tracking-wider text-white italic select-none">
                          {formateTime(chamado.HORA_CHAMADO)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-md bg-slate-800 px-4 py-1 shadow-md shadow-black">
                      <UserCog className="text-cyan-400" size={20} />
                      <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                          Recurso
                        </p>
                        <p className="font-semibold tracking-wider text-white italic select-none">
                          {chamado.NOME_RECURSO || '-'}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex h-full items-center justify-center rounded-md px-4 py-1 font-semibold tracking-wider italic select-none ${getStyleStatus(
                        chamado.STATUS_CHAMADO
                      )}`}
                    >
                      {chamado.STATUS_CHAMADO ?? 'Não atribuído'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* card - detalhes técnicos */}
              <Card className="rounded-2xl border border-slate-300 bg-white p-6 shadow-md shadow-black">
                <h3 className="flex items-center border-b border-red-500 text-xl font-bold tracking-wider text-slate-800 select-none">
                  Detalhes Técnicos
                </h3>

                <div className="flex flex-col space-y-3">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center gap-4 rounded-md bg-slate-800 px-4 py-1 shadow-md shadow-black">
                        <Binary className="text-cyan-400" size={20} />
                        <div>
                          <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                            Classificação
                          </p>
                          <p className="font-semibold tracking-wider text-white italic select-none">
                            {chamado.COD_CLASSIFICACAO || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-md bg-slate-800 px-4 py-1 shadow-md shadow-black">
                        <Mail className="text-cyan-400" size={20} />
                        <div>
                          <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                            Email
                          </p>
                          <p className="font-semibold tracking-wider text-white italic select-none">
                            {chamado.EMAIL_CHAMADO || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center gap-4 rounded-md bg-slate-800 px-4 py-1 shadow-md shadow-black">
                        <Shapes className="text-cyan-400" size={20} />
                        <div>
                          <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                            Código TRF
                          </p>
                          <p className="font-semibold tracking-wider text-white italic select-none">
                            {chamado.CODTRF_CHAMADO || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-md bg-slate-800 px-4 py-1 shadow-md shadow-black">
                        <CircleCheckBig className="text-green-400" size={20} />
                        <div>
                          <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                            Conclusão
                          </p>
                          <p className="font-semibold tracking-wider text-white italic select-none">
                            {formateDateISO(chamado.CONCLUSAO_CHAMADO) || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="col-span-2 flex cursor-pointer items-center justify-between gap-4 rounded-md bg-slate-800 px-4 py-1 shadow-md shadow-black"
                    onClick={() => setAssuntoExpandido(prev => !prev)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <MessageSquare className="text-cyan-400" size={20} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                          Assunto
                        </p>
                        <p
                          className={`font-semibold tracking-wider text-white italic transition-all duration-300 select-none ${
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
                          className="rotate-180 text-white transition-transform duration-300"
                          size={18}
                        />
                      ) : (
                        <ChevronRight
                          className="text-white transition-transform duration-300"
                          size={18}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* div - botão atribuir chamado - ONLY ADMIN */}
            <div className="flex justify-end pt-2">
              {!showForm && isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-md bg-blue-600 px-6 py-4 text-lg font-bold tracking-wider text-white shadow-sm shadow-black hover:scale-105 hover:bg-blue-800 hover:shadow-md hover:shadow-black active:scale-95"
                >
                  Atribuir Chamado
                </button>
              )}
            </div>
          </div>

          {/* ===== FORMULÁRIO ===== */}
          {showForm && isAdmin && (
            <div className="w-1/2 bg-white">
              <div className="h-full overflow-y-auto p-4">
                {/* div título e subtítulo */}
                <div className="mb-6">
                  {/* título */}
                  <h2 className="text-2xl font-bold tracking-wider text-slate-800 select-none">
                    Atribuir Chamado
                  </h2>

                  {/* subtítulo */}
                  <p className="font-semibold tracking-wider text-slate-800 italic select-none">
                    Configure a atribuição e notificações
                  </p>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-12">
                  {/* div selects */}
                  <div className="space-y-3">
                    {/* select cliente */}
                    <div className="space-y-1">
                      <label className="block text-base font-semibold tracking-wider text-slate-800 select-none">
                        Selecionar Cliente
                      </label>
                      <select
                        value={formData.cliente}
                        onChange={e =>
                          setFormData({ ...formData, cliente: e.target.value })
                        }
                        className="w-full cursor-pointer rounded-md bg-slate-800 p-4 font-semibold tracking-wider text-slate-200 italic"
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

                    {/* select recurso */}
                    <div className="space-y-1">
                      <label className="block text-base font-semibold tracking-wider text-slate-800 select-none">
                        Selecionar Recurso
                      </label>
                      <select
                        value={formData.recurso}
                        onChange={e =>
                          setFormData({ ...formData, recurso: e.target.value })
                        }
                        className="w-full cursor-pointer rounded-md bg-slate-800 p-4 font-semibold tracking-wider text-slate-200 italic"
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

                  {/* div checkboxes */}
                  <div className="space-y-3">
                    {/* checkbox enviar Email Cliente */}
                    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-300 p-4 shadow-sm shadow-black">
                      <input
                        type="checkbox"
                        checked={formData.enviarEmailCliente}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            enviarEmailCliente: e.target.checked,
                          })
                        }
                        className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-300"
                      />
                      <Mail className="text-blue-600" size={20} />
                      <span className="text-base font-semibold tracking-wider text-slate-800 italic">
                        Enviar email para o cliente
                      </span>
                    </label>

                    {/* checkbox enviar Email Recurso */}
                    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-300 p-4 shadow-sm shadow-black">
                      <input
                        type="checkbox"
                        checked={formData.enviarEmailRecurso}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            enviarEmailRecurso: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded border-slate-300 text-blue-600"
                      />
                      {/* ícone email */}
                      <Mail
                        className="cursor-pointer text-blue-600"
                        size={20}
                      />
                      <span className="text-base font-semibold tracking-wider text-slate-800 italic">
                        Enviar email para o recurso
                      </span>
                    </label>
                  </div>

                  {/* div - botões do formulário */}
                  <div className="flex justify-end gap-4 border-t border-red-500 pt-10">
                    {/* botão cancelar */}
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-md bg-red-600 px-6 py-4 text-lg font-bold tracking-wider text-white shadow-sm shadow-black hover:scale-105 hover:bg-red-800 hover:shadow-md hover:shadow-black active:scale-95"
                    >
                      Cancelar
                    </button>

                    {/* botão salvar atribuição */}
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-md bg-green-600 px-6 py-4 text-lg font-bold tracking-wider text-white shadow-sm shadow-black hover:scale-105 hover:bg-green-800 hover:shadow-md hover:shadow-black active:scale-95 disabled:opacity-70"
                    >
                      {isPending ? 'Salvando...' : 'Salvar Atribuição'}
                    </button>
                  </div>
                </form>

                {/* Feedback de sucesso ou erro */}
                {isSuccess && (
                  <p className="mt-4 text-center font-semibold tracking-wider text-green-600">
                    Atribuição realizada com sucesso!
                  </p>
                )}
                {isError && (
                  <p className="mt-4 text-center font-semibold tracking-wider text-red-600">
                    {error instanceof Error
                      ? error.message
                      : 'Erro ao salvar atribuição.'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
