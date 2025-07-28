'use client';

import { useClientes } from '@/hooks/useClientes';
import { useEmailAtribuirCahamados } from '@/hooks/useEmailAtribuirChamados';
import { useRecursos } from '@/hooks/useRecursos';
import {
  AlertCircle,
  Binary,
  Calendar,
  CircleCheckBig,
  Clock,
  FileText,
  Mail,
  MessageSquareDot,
  Settings,
  Shapes,
  TrendingUp,
  User,
  UserCog,
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

  // Mock data para os selects - substitua pela sua fonte de dados real

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
    setShowForm(false);
    onClose();
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
        return 'bg-yellow-800/50 text-yellow-400 ring-1 ring-yellow-400';

      case 'EM ATENDIMENTO':
        return 'bg-blue-800/50 text-blue-400 ring-1 ring-blue-400';

      case 'FINALIZADO':
        return 'bg-green-800/50 text-green-400 ring-1 ring-green-400';

      case 'NAO INICIADO':
        return 'bg-gray-800/50 text-gray-400 ring-1 ring-gray-400';

      case 'STANDBY':
        return 'bg-orange-800/50 text-orange-400 ring-1 ring-orange-400';

      case 'ATRIBUIDO':
        return 'bg-sky-800/50 text-sky-400 ring-1 ring-sky-400';

      case 'AGUARDANDO VALIDACAO':
        return 'bg-purple-800/50 text-purple-400 ring-1 ring-purple-400';

      default:
        return 'bg-gray-800/50 text-gray-400 ring-1 ring-gray-400';
    }
  };

  if (!isOpen || !chamado) return null;

  // ------------------------------------------------------------------------------

  return (
    // ===== CONTAINER PRINCIPAL =====
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ===== OVERLAY ===== */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ===== CONTAINER MODAL ===== */}
      <div
        className={`relative z-10 mx-4 max-h-[90vh] w-full overflow-hidden rounded-lg border border-slate-600 bg-slate-950 ${showForm ? 'max-w-7xl' : 'max-w-4xl'}`}
      >
        {/* ===== CONATAINER HEADER ===== */}
        <div className="flex items-center border-b border-slate-600 bg-slate-950 p-6">
          {/* ===== CONTAINER ===== */}
          <div className="flex items-center gap-4">
            {/* ÍCONE */}
            <div className="rounded-full bg-white p-3">
              <FileText className="h-7 w-7 text-black" />
            </div>
            {/* ---------- */}

            {/* TÍTULO */}
            <h1 className="text-3xl font-bold tracking-wider text-white italic">
              Detalhes do Chamado: #{chamado.COD_CHAMADO}
            </h1>
          </div>
        </div>
        {/* ---------- */}

        {/* ===== CONTAINER CARDS / FORMULÁRIO ===== */}
        <div className="flex max-h-[calc(90vh-140px)]">
          {/* ===== CONTAINER ===== */}
          <div
            className={`transition-all duration-300 ${showForm ? 'w-1/2 border-r' : 'w-full'}`}
          >
            <div className="space-y-6 p-6">
              {/* ===== CONTAINER ===== */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  {/* ===== CARD 1 ===== */}
                  <div className="rounded-lg bg-slate-800 p-4">
                    {/* TÍTULO */}
                    <h2 className="mb-3 text-lg font-bold tracking-wider text-white italic">
                      Informações do Chamado
                    </h2>
                    {/* --------- */}

                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <AlertCircle className="h-5 w-5 animate-pulse text-white" />
                        <span className="text-sm font-semibold tracking-wider text-white italic">
                          Prioridade: {chamado.PRIOR_CHAMADO}
                        </span>
                      </div>
                      {/* ---------- */}

                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 animate-pulse text-white" />
                        <span className="text-sm font-semibold tracking-wider text-white italic">
                          Data: {formatarDataISO(chamado.DATA_CHAMADO)}
                        </span>
                      </div>
                      {/* ---------- */}

                      <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 animate-pulse text-white" />
                        <span className="text-sm font-semibold tracking-wider text-white italic">
                          Hora: {formatarHorario(chamado.HORA_CHAMADO)}
                        </span>
                      </div>
                      {/* ---------- */}

                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <User className="h-5 w-5 animate-pulse text-white" />
                          <span className="text-sm font-semibold tracking-wider text-white italic">
                            Cliente: {chamado.CLIENTE?.NOME_CLIENTE || 'N/A'}
                          </span>
                        </div>
                        {/* ---------- */}

                        <div className="flex items-center gap-4">
                          <UserCog className="h-5 w-5 animate-pulse text-white" />
                          <span className="text-sm font-semibold tracking-wider text-white italic">
                            Recurso: {chamado.RECURSO?.NOME_RECURSO || 'N/A'}
                          </span>
                        </div>
                      </div>
                      {/* ---------- */}

                      <div className="flex items-center gap-4">
                        <TrendingUp className="h-5 w-5 animate-pulse text-white" />
                        <div
                          className={`block rounded-lg px-6 py-1 text-base font-semibold tracking-wider italic ${getStatusStyle(chamado.STATUS_CHAMADO)}`}
                        >
                          {chamado.STATUS_CHAMADO ?? 'Não atribuído'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ---------- */}

                  {/* ===== CARD 2 ===== */}
                  <div className="rounded-lg bg-slate-800 p-4">
                    {/* TÍTULO */}
                    <h2 className="mb-3 text-lg font-bold tracking-wider text-white italic">
                      Detalhes Técnicos
                    </h2>
                    {/* ---------- */}

                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Binary className="h-5 w-5 animate-pulse text-white" />
                        <span className="text-sm font-semibold tracking-wider text-white italic">
                          Classificação: {chamado.COD_CLASSIFICACAO}
                        </span>
                      </div>
                      {/* ---------- */}

                      <div className="flex items-center gap-4">
                        <Shapes className="h-5 w-5 animate-pulse text-white" />
                        <span className="text-sm font-semibold tracking-wider text-white italic">
                          Código TRF: {chamado.CODTRF_CHAMADO || 'N/A'}
                        </span>
                      </div>
                      {/* ---------- */}

                      <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 animate-pulse text-white" />
                        <span className="text-sm font-semibold tracking-wider text-white italic">
                          Email: {chamado.EMAIL_CHAMADO || 'N/A'}
                        </span>
                      </div>
                      {/* ---------- */}

                      {chamado.CONCLUSAO_CHAMADO && (
                        <div className="flex items-center gap-4">
                          <CircleCheckBig className="h-5 w-5 animate-pulse text-white" />
                          <span className="text-sm font-semibold tracking-wider text-white italic">
                            Conclusão: {chamado.CONCLUSAO_CHAMADO || 'N/A'}
                          </span>
                        </div>
                      )}
                      {/* ---------- */}

                      <div className="mb-1 flex flex-col">
                        <div className="flex items-center gap-4">
                          <MessageSquareDot className="h-5 w-5 animate-pulse text-white" />
                          <span className="text-sm font-semibold tracking-wider text-white italic">
                            Assunto:
                          </span>
                        </div>
                        <span className="ml-8 text-sm font-semibold tracking-wider text-white italic">
                          {chamado.ASSUNTO_CHAMADO}
                        </span>
                      </div>
                      {/* ---------- */}
                    </div>
                  </div>
                </div>
              </div>
              {/* ---------- */}

              {/* BOTÕES */}
              <div className="flex justify-end gap-6 border-t border-slate-600 pt-4">
                {/* CANCELAR */}
                <button
                  onClick={onClose}
                  className="rounded-lg bg-red-500 px-6 py-1 text-lg font-bold tracking-wider text-white italic transition-all duration-300 hover:scale-110 hover:bg-red-800 active:scale-90"
                >
                  Cancelar
                </button>
                {/* ---------- */}

                {/* ATRIBUIR CHAMADO */}
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="rounded-lg bg-blue-500 px-6 py-1 text-lg font-bold tracking-wider text-white italic transition-all duration-300 hover:scale-110 hover:bg-blue-800 active:scale-90"
                  >
                    Atribuir Chamado
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* ---------- */}

          {/* ===== CONTAINER FORMULÁRIO ===== */}
          {showForm && (
            // ===== CONTAINER =====
            <div className="w-1/2 border border-slate-600 bg-white">
              {/* ===== CONTAINER ===== */}
              <div className="space-y-6 p-6">
                {/* TÍTULO */}
                <h2 className="mb-3 text-lg font-bold tracking-wider text-black italic">
                  Atribuir Chamado
                </h2>
                {/* ---------- */}

                {/* FORMULÁRIO */}
                <form onSubmit={handleSubmitForm} className="space-y-6">
                  {/* SELECT CLIENTE */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold tracking-wider text-black italic">
                      Selecionar Cliente
                    </label>

                    <select
                      value={formData.cliente}
                      onChange={e =>
                        setFormData({ ...formData, cliente: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 p-4 text-white"
                      disabled={loadingClientes}
                      required
                    >
                      <option value="">Selecione um cliente</option>
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
                  {/* ---------- */}

                  {/* SELECT RECURSO */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold tracking-wider text-black italic">
                      Selecionar Recurso
                    </label>

                    <select
                      value={formData.recurso}
                      onChange={e =>
                        setFormData({ ...formData, recurso: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 p-4 text-white"
                      required
                    >
                      <option value="">Selecione um recurso</option>
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
                  {/* ---------- */}

                  {/* ===== CHECK BOXES ===== */}
                  <div className="space-y-4">
                    {/* CHECK EMAIL CLIENTE */}
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        id="emailCliente"
                        checked={formData.enviarEmailCliente}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            enviarEmailCliente: e.target.checked,
                          })
                        }
                        className="h-5 w-5 cursor-pointer hover:scale-110 active:scale-90"
                      />

                      <label
                        htmlFor="emailCliente"
                        className="flex cursor-pointer items-center gap-2 text-sm font-semibold tracking-wider text-black italic select-none"
                      >
                        <Mail className="h-4 w-4 text-black" />
                        <span>Enviar email para o cliente</span>
                      </label>
                    </div>
                    {/* ---------- */}

                    {/* CHECK EMAIL RECURSO */}
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        id="emailRecurso"
                        checked={formData.enviarEmailRecurso}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            enviarEmailRecurso: e.target.checked,
                          })
                        }
                        className="h-5 w-5 cursor-pointer hover:scale-110 active:scale-90"
                      />

                      <label
                        htmlFor="emailRecurso"
                        className="flex cursor-pointer items-center gap-2 text-sm font-semibold tracking-wider text-black italic select-none"
                      >
                        <Mail className="h-4 w-4 text-black" />
                        <span>Enviar email para o recurso</span>
                      </label>
                    </div>
                  </div>
                  {/* ---------- */}

                  {/* BOTÕES */}
                  <div className="flex justify-end gap-6 border-t border-slate-600 pt-4">
                    {/* CANCELAR */}
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg bg-red-500 px-6 py-1 text-lg font-bold tracking-wider text-white italic shadow-md shadow-black transition-all duration-300 hover:scale-110 hover:bg-red-800 active:scale-90"
                    >
                      Cancelar
                    </button>
                    {/* ---------- */}

                    {/* SALVAR */}
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-500 px-6 py-1 text-lg font-bold tracking-wider text-white italic shadow-md shadow-black transition-all duration-300 hover:scale-110 hover:bg-blue-800 active:scale-90"
                    >
                      Salvar
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
