'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  PlayCircle,
  Timer,
  MessageSquare,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { useNotifications } from '../../../contexts/NotificationContext';
import { useNotificationSound } from '../../../contexts/NotificationContext';

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

// Interface do tipo de props da tabela.
interface TableRowProps {
  chamado_os: string;
  nome_cliente: string;
  status_chamado: string;
  dtini_os: string;
  hrini_os: string;
  hrfim_os: string;
  total_horas: string;
  obs: string;
}

// Função utilitária para retornar o ícone e cores de acordo com o status do chamado.
const getStatusIcon = (status: string) => {
  const statusLower = status?.toLowerCase() || '';

  const statusConfig = {
    finalizado: {
      icon: CheckCircle,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    'aguardando validacao': {
      icon: PlayCircle,
      color: 'text-violet-700',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
    },
    atribuido: {
      icon: CheckCircle,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
    standby: {
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    'em atendimento': {
      icon: Timer,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
  };

  const matchedStatus = Object.keys(statusConfig).find(
    key => statusLower.includes(key) || key.includes(statusLower)
  );

  return matchedStatus
    ? statusConfig[matchedStatus as keyof typeof statusConfig]
    : {
        icon: FileText,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
      };
};

// Componente visual para exibir o status do chamado com ícone e cor.
const StatusBadge = ({ status }: { status: string }) => {
  const { icon: Icon, color, bg, border } = getStatusIcon(status);

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-medium ${bg} ${color} ${border}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};

// Componente principal do modal de chamado.
export default function Modal({ isOpen, selectedRow, onClose }: ModalProps) {
  const { addMessage } = useNotifications();
  const { playNotificationSound } = useNotificationSound();
  const [modalData, setModalData] = useState<ModalDataProps>({
    concordaPagar: true,
    observacao: '',
  });

  const [validationError, setValidationError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
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
    setModalData(prev => ({
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
        'Para desmarcar a concordância, você deve informar o motivo na observação.'
      );
      return false;
    }

    setValidationError('');
    return true;
  };

  // Envia notificação por e-mail via API.
  const sendEmailNotification = async (
    chamado: TableRowProps,
    observacao: string
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
    observacao: string
  ) => {
    const phoneNumber = process.env.WHATSAPP_NUMBER || '5531999635544';
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
        // Adicionar a mensagem ao sistema de notificações
        addMessage({
          chamadoOs: selectedRow.chamado_os,
          nomeCliente: selectedRow.nome_cliente,
          motivo: modalData.observacao.trim(),
        });

        // Reproduzir som de notificação
        playNotificationSound();

        await Promise.all([
          sendEmailNotification(selectedRow, modalData.observacao),
          new Promise(resolve => {
            sendWhatsAppNotification(selectedRow, modalData.observacao);
            resolve(true);
          }),
        ]);

        alert(
          'Chamado reprovado! Notificações enviadas e mensagem adicionada ao sistema.'
        );
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
        'Para desmarcar a concordância, você deve informar o motivo na observação.'
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

  if (!selectedRow) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg overflow-y-auto bg-white p-0">
        {/* Botão de Fechar */}
        <DialogClose className="absolute top-4 right-4 rounded-full p-1 text-indigo-200 transition-colors hover:bg-indigo-500 hover:text-white">
          <X className="h-5 w-5" />
        </DialogClose>
        {/* Header do formulário */}
        <div className="relative bg-indigo-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold tracking-wider text-white italic">
                Aprovar Chamado
              </DialogTitle>
            </div>
          </div>
        </div>

        {/* Corpo do formulário */}
        <div className="space-y-2 p-4">
          {/* Resumo do chamado */}
          <div className="space-y-4 rounded-lg bg-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wider text-black italic">
                Chamado:
              </span>
              <span className="ml-2 text-sm font-semibold tracking-wider">
                {selectedRow.chamado_os || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wider text-black italic">
                Status:
              </span>
              <StatusBadge status={selectedRow.status_chamado || 'N/A'} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wider text-black italic">
                Data:
              </span>
              <span className="ml-2 text-sm font-semibold tracking-wider">
                {selectedRow.dtini_os || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wider text-black italic">
                Tempo:
              </span>
              <span className="ml-2 text-sm font-semibold tracking-wider">
                {selectedRow.total_horas || 'N/A'}
              </span>
            </div>

            {selectedRow.obs && (
              <div>
                <span className="mb-2 text-sm font-semibold tracking-wider text-black italic">
                  Observação:
                </span>
                <p className="text-xs tracking-wider text-gray-800 italic">
                  {selectedRow.obs}
                </p>
              </div>
            )}
          </div>

          {/* Formulário */}
          <form
            onSubmit={e => {
              e.preventDefault();
              saveModalData();
            }}
            className="space-y-6"
          >
            {/* Campo de aprovação */}
            <div className="space-y-2">
              <Label className="text-base font-semibold tracking-wider text-black">
                Aprovação do Chamado
              </Label>

              <div className="space-y-6">
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <Checkbox
                    id="aprovar"
                    checked={modalData.concordaPagar}
                    onCheckedChange={handleCheckboxChange}
                    className="mt-2 h-5 w-5 cursor-pointer"
                  />
                  <div className="">
                    <Label
                      htmlFor="aprovar"
                      className="text-sm font-semibold tracking-wider text-emerald-800 italic"
                    >
                      Aprovar este chamado para pagamento
                    </Label>
                    <p className="text-xs tracking-wider text-emerald-700 italic">
                      Confirmo que os serviços foram executados corretamente
                    </p>
                  </div>
                </div>

                {!modalData.concordaPagar && (
                  <Alert className="border-amber-200 bg-amber-100 p-4">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription>
                      <span className="text-sm font-semibold tracking-wider text-amber-800 italic">
                        Reprovação ativada!
                      </span>
                      <p className="text-xs tracking-wider text-amber-700 italic">
                        Você deve informar o motivo abaixo. Notificações
                        automáticas serão enviadas.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Campo de observação */}
            <div className="space-y-2">
              <Label htmlFor="observacao" className="flex items-center gap-3">
                {!modalData.concordaPagar ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold tracking-wider text-red-800 italic">
                      Motivo da Reprovação
                    </span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 text-black" />
                    Observações Adicionais
                  </>
                )}
              </Label>

              <Textarea
                id="observacao"
                value={modalData.observacao}
                onChange={e =>
                  setModalData(old => ({
                    ...old,
                    observacao: e.target.value,
                  }))
                }
                rows={4}
                className={`resize-none text-xs text-red-800 transition-all ${
                  !modalData.concordaPagar
                    ? 'border-red-200 bg-red-50 focus-visible:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder={
                  !modalData.concordaPagar
                    ? 'Descreva detalhadamente o motivo da reprovação. Seja específico sobre a discordância...'
                    : 'Adicione observações sobre o chamado, se necessário...'
                }
                required={!modalData.concordaPagar}
              />
            </div>

            {/* Erro de validação */}
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {/* BOTÕES AÇÃO */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSending}
                className="flex-1 border border-gray-400 bg-white text-base font-semibold tracking-wider text-black italic hover:bg-gray-100"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isSending}
                className={`flex-1 border text-base font-semibold tracking-normal text-white active:scale-90 ${
                  modalData.concordaPagar
                    ? 'border-emerald-900 bg-emerald-600 hover:bg-emerald-800'
                    : 'border-red-800 bg-red-500 hover:bg-red-700'
                }`}
              >
                {isSending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border border-white" />
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {modalData.concordaPagar ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-white" />
                        Aprovar
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-white" />
                        Reprovar
                      </>
                    )}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
