'use client';

import {
  // AlertCircle,
  // AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  PlayCircle,
  X,
} from 'lucide-react';
// Importação de hooks do React.
import { useEffect, useState } from 'react';
// Importação do tipo de props da tabela.
import { TableRowProps } from './Colunas_Tabela';

// Interface para os dados do modal (estado interno).
interface ModalDataProps {
  concordaPagar: boolean;
  observacao: string;
}

// Interface das props recebidas pelo componente ModalChamado.
interface ModalProps {
  isOpen: boolean;
  selectedRow: TableRowProps | null;
  onClose: () => void;
}

// Função utilitária para retornar o ícone e cores de acordo com o status do chamado.
const getStatusIcon = (status: string) => {
  const statusLower = status?.toLowerCase() || '';

  const statusConfig = {
    finalizado: {
      icon: CheckCircle,
      color: 'text-green-700',
      bg: 'bg-green-200',
    },
    'aguardando validacao': {
      icon: PlayCircle,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
    },
    atribuido: {
      icon: CheckCircle,
      color: 'text-pink-600',
      bg: 'bg-pink-200',
    },
    standby: {
      icon: Clock,
      color: 'text-yellow-700',
      bg: 'bg-yellow-200',
    },
    'em atendimento': {
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  };

  // Busca o status correspondente na configuração.
  const matchedStatus = Object.keys(statusConfig).find(
    (key) => statusLower.includes(key) || key.includes(statusLower),
  );

  // Retorna o ícone e cores do status, ou padrão se não encontrar.
  return matchedStatus
    ? statusConfig[matchedStatus as keyof typeof statusConfig]
    : { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-50' };
};

// Componente visual para exibir o status do chamado com ícone e cor.
const StatusBadge = ({ status }: { status: string }) => {
  const { icon: Icon, color, bg } = getStatusIcon(status);

  return (
    <div
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${bg} ${color}`}
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {status}
    </div>
  );
};

// Componente principal do modal de chamado.
export default function ModalChamados({
  isOpen,
  selectedRow,
  onClose,
}: ModalProps) {
  // Estado para os dados do formulário do modal.
  const [modalData, setModalData] = useState<ModalDataProps>({
    concordaPagar: true,
    observacao: '',
  });

  // Estado para mensagem de erro de validação.
  const [validationError, setValidationError] = useState('');
  // Estado para controlar se os dados já foram carregados.
  const [dataLoaded, setDataLoaded] = useState(false);
  // Estado para indicar se está enviando dados.
  const [isSending, setIsSending] = useState(false);

  // Função para carregar dados salvos do localStorage para o modal.
  const loadModalData = (chamadoOs: string) => {
    const saved = localStorage.getItem(`chamado_${chamadoOs}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setModalData({
          concordaPagar:
            parsed.concordaPagar !== undefined ? parsed.concordaPagar : true,
          observacao: parsed.observacao || '',
        });
      } catch {
        setModalData({ concordaPagar: true, observacao: '' });
      }
    } else {
      setModalData({ concordaPagar: true, observacao: '' });
    }
  };

  // Manipula a mudança do checkbox de concordância.
  const handleCheckboxChange = (checked: boolean) => {
    setModalData((prev) => ({
      ...prev,
      concordaPagar: checked,
    }));

    if (checked) {
      setValidationError('');
    }
  };

  // Valida o formulário antes de salvar.
  const validateForm = (): boolean => {
    if (!modalData.concordaPagar && modalData.observacao.trim() === '') {
      setValidationError(
        'Para desmarcar a concordância, você deve informar o motivo na observação.',
      );
      return false;
    }

    setValidationError('');
    return true;
  };

  // Envia notificação por e-mail via API.
  const sendEmailNotification = async (
    chamado: TableRowProps,
    observacao: string,
  ) => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chamado,
          observacao,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar notificação');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw error;
    }
  };

  // Envia notificação via WhatsApp abrindo uma nova aba com a mensagem.
  const sendWhatsAppNotification = (
    chamado: TableRowProps,
    observacao: string,
  ) => {
    const phoneNumber = '5531999635544'; // Substitua pelo número correto
    const message =
      `🚨 *Discordância no Chamado ${chamado.chamado_os}*\n\n` +
      `*Cliente:* ${chamado.nome_cliente}\n` +
      `*OS:* ${chamado.chamado_os}\n` +
      `*Status:* ${chamado.status_chamado}\n` +
      `*Data:* ${chamado.dtini_os}\n\n` +
      `*Motivo da Discordância:*\n${observacao}\n\n` +
      `Por favor, verifique este chamado com urgência.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Abre em nova aba
    window.open(whatsappUrl, '_blank');
  };

  // Salva os dados do modal e envia notificações se necessário.
  const saveModalData = async () => {
    if (!selectedRow) return;
    if (!validateForm()) return;

    setIsSending(true);
    const key = `chamado_${selectedRow.chamado_os}`;
    localStorage.setItem(key, JSON.stringify(modalData));

    try {
      if (!modalData.concordaPagar && modalData.observacao.trim() !== '') {
        await Promise.all([
          sendEmailNotification(selectedRow, modalData.observacao),
          new Promise((resolve) => {
            sendWhatsAppNotification(selectedRow, modalData.observacao);
            resolve(true);
          }),
        ]);
        alert('Dados salvos e notificações enviadas com sucesso!');
      } else {
        alert('Dados salvos com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      alert('Dados salvos, mas houve um erro ao enviar as notificações.');
    } finally {
      setIsSending(false);
      handleClose();
    }
  };

  // Fecha o modal e reseta os estados.
  const handleClose = () => {
    if (!modalData.concordaPagar && modalData.observacao.trim() === '') {
      setValidationError(
        'Para desmarcar a concordância, você deve informar o motivo na observação.',
      );
      return;
    }

    setModalData({ concordaPagar: true, observacao: '' });
    setValidationError('');
    setDataLoaded(false);
    onClose();
  };

  // Efeito para carregar dados do chamado selecionado quando o modal abre.
  useEffect(() => {
    if (isOpen && selectedRow && !dataLoaded) {
      loadModalData(selectedRow.chamado_os);
      setDataLoaded(true);
    }
  }, [isOpen, selectedRow, dataLoaded]);

  // Se o modal não estiver aberto ou não houver linha selecionada, não renderiza nada.
  if (!isOpen || !selectedRow) return null;

  // Renderização do modal propriamente dito.
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="animate-fadeIn relative mx-4 w-full max-w-lg rounded-2xl border border-indigo-100 bg-white p-8 shadow-2xl">
        {/* Botão para fechar o modal */}
        <button
          aria-label="Fechar"
          className="absolute top-4 right-4 text-indigo-400 transition hover:text-indigo-700"
          onClick={handleClose}
        >
          <X className="h-6 w-6" />
        </button>

        {/* Título do modal */}
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-indigo-800">
          <FileText className="h-6 w-6 text-indigo-400" />
          Detalhes do Chamado
        </h2>

        {/* Exibição dos detalhes do chamado selecionado */}
        <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-2 text-gray-800 sm:grid-cols-2">
          <div>
            <span className="block text-xs text-gray-500">OS</span>
            <span className="font-semibold">
              {selectedRow.chamado_os || 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Cliente</span>
            <span className="font-semibold">
              {selectedRow.nome_cliente || 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Status</span>
            <span>
              <StatusBadge status={selectedRow.status_chamado || 'N/A'} />
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Data</span>
            <span className="font-semibold">
              {selectedRow.dtini_os || 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Hora Início</span>
            <span className="font-semibold">
              {selectedRow.hrini_os || 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Hora Fim</span>
            <span className="font-semibold">
              {selectedRow.hrfim_os || 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Tempo Total</span>
            <span className="font-semibold">
              {selectedRow.total_horas || 'N/A'}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="block text-xs text-gray-500">Observação</span>
            <span className="font-semibold">{selectedRow.obs || 'N/A'}</span>
          </div>
        </div>

        {/* Formulário para aceitar ou discordar do chamado */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveModalData();
          }}
          className="space-y-5"
        >
          {/* Checkbox de concordância */}
          {/* <label className="flex cursor-pointer items-center gap-3 select-none">
            <input
              type="checkbox"
              checked={modalData.concordaPagar}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="form-checkbox h-5 w-5 rounded-md border-gray-300 text-indigo-600 transition focus:ring-indigo-500"
            />
            <span className="font-medium text-indigo-700">Chamado aceito</span>
          </label> */}

          {/* Alerta caso o usuário desmarque a concordância */}
          {/* {!modalData.concordaPagar && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Atenção!</p>
                <p>
                  Ao desmarcar a concordância, você deve informar o motivo na observação abaixo.
                  Será enviado um e-mail e mensagem no WhatsApp automaticamente.
                </p>
              </div>
            </div>
          )} */}

          {/* Campo de observação adicional */}
          <div>
            {/* <label
              htmlFor="observacao"
              className="mb-1 block text-sm font-semibold text-indigo-700"
            >
              Observação Adicional
              {!modalData.concordaPagar && <span className="ml-1 text-red-500">*</span>}
            </label> */}
            {/* <textarea
              id="observacao"
              value={modalData.observacao}
              onChange={(e) =>
                setModalData((old) => ({
                  ...old,
                  observacao: e.target.value,
                }))
              }
              rows={3}
              className={`w-full rounded-lg border shadow-sm transition focus:ring-2 ${
                !modalData.concordaPagar
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-indigo-200 focus:border-indigo-400 focus:ring-indigo-100'
              }`}
              placeholder={
                !modalData.concordaPagar
                  ? 'Por favor, informe o motivo da discordância...'
                  : 'Digite uma observação, se necessário...'
              }
              required={!modalData.concordaPagar}
            /> */}
            {/* Mensagem de obrigatoriedade do campo de observação */}
            {/* {!modalData.concordaPagar && (
              <p className="mt-1 text-xs text-red-600">
                Este campo é obrigatório quando você não concorda em pagar pelo chamado. Uma
                notificação será enviada automaticamente.
              </p>
            )} */}
          </div>

          {/* Exibe mensagem de erro de validação, se houver */}
          {/* {validationError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{validationError}</p>
            </div>
          )} */}

          {/* Botões de ação do formulário */}
          {/* <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 font-medium text-gray-600 transition hover:bg-gray-100"
              disabled={isSending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-2 font-semibold text-white shadow transition hover:from-indigo-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSending}
            >
              {isSending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                'Salvar'
              )}
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
}
