'use client';

import { useClientes } from '@/hooks/useClientes';
import { useEmailAtribuirCahamados } from '@/hooks/useEmailAtribuirChamados';
import { useRecursos } from '@/hooks/useRecursos';
import {
  AlertCircle,
  Clock,
  FileText,
  Mail,
  Settings,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Chamado } from './Colunas';

interface ModalChamadoProps {
  isOpen: boolean;
  onClose: () => void;
  chamado: Chamado | null;
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
        codChamado: chamado.cod_chamado,
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

  if (!isOpen || !chamado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 mx-4 max-h-[90vh] w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl transition-all duration-300 dark:border-gray-700 dark:bg-gray-900 ${showForm ? 'max-w-7xl' : 'max-w-4xl'}`}
      >
        {/* Header */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Detalhes do Chamado
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                #{chamado.cod_chamado}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex max-h-[calc(90vh-140px)]">
          {/* Detalhes do chamado - sempre visível */}
          <div
            className={`transition-all duration-300 ${showForm ? 'w-1/2 border-r border-gray-200 dark:border-gray-700' : 'w-full'}`}
          >
            <div className="space-y-6 p-6">
              {/* Informações principais */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Informações do Chamado
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Prioridade:</strong> {chamado.prior_chamado}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Data/Hora:</strong> {chamado.data_chamado} às{' '}
                          {chamado.hora_chamado}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            chamado.status_chamado === 'Aberto'
                              ? 'bg-green-500'
                              : chamado.status_chamado === 'Em Andamento'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Status:</strong> {chamado.status_chamado}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cliente e Recurso
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Cliente:</strong>{' '}
                          {chamado.cliente?.nome_cliente || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Recurso:</strong>{' '}
                          {chamado.recurso?.nome_recurso || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Detalhes Técnicos
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Classificação:</strong>{' '}
                          {chamado.cod_classificacao}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Código TRF:</strong>{' '}
                          {chamado.codtrf_chamado || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Email:</strong>{' '}
                          {chamado.email_chamado || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {chamado.conclusao_chamado && (
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Conclusão
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {chamado.conclusao_chamado}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assunto */}
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Assunto do Chamado
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {chamado.assunto_chamado}
                </p>
              </div>

              {/* Botões - sempre visíveis no final */}
              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-700"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configurar Notificações</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Formulário de configuração - aparece na lateral direita */}
          {showForm && (
            <div className="w-1/2 bg-gray-50 dark:bg-gray-800/50">
              <div className="p-6">
                <div className="mb-6">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Configurar Notificações
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Configure as notificações para este chamado
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-6">
                  {/* Selecionar Cliente */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selecionar Cliente
                    </label>
                    <select
                      value={formData.cliente}
                      onChange={e =>
                        setFormData({ ...formData, cliente: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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

                  {/* Selecionar Recurso */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selecionar Recurso
                    </label>
                    <select
                      value={formData.recurso}
                      onChange={e =>
                        setFormData({ ...formData, recurso: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
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
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                      />
                      <label
                        htmlFor="emailCliente"
                        className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>Enviar email para o cliente</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
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
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                      />
                      <label
                        htmlFor="emailRecurso"
                        className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>Enviar email para o recurso</span>
                      </label>
                    </div>
                  </div>

                  {/* Botações do formulário */}
                  <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-700"
                    >
                      Salvar Configurações
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
