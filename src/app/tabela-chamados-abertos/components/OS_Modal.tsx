'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, FileText } from 'lucide-react';

interface OSData {
  COD_OS: string;
  CODTRF_OS: string;
  DTINI_OS: string;
  HRINI_OS: string;
  OBS_OS: string;
  STATUS_OS: string;
  PRODUTIVO_OS: string;
  CODREC_OS: string;
  PRODUTIVO2_OS: string;
  RESPCLI_OS: string;
  REMDES_OS: string;
  ABONO_OS: string;
  DESLOC_OS: string;
  OBS: string;
  DTINC_OS: string;
  FATURADO_OS: string;
  PERC_OS: string;
  COD_FATURAMENTO: string;
  COMP_OS: string;
  VALID_OS: string;
  VRHR_OS: string;
  NUM_OS: string;
  CHAMADO_OS: string;
}

interface OSModalProps {
  isOpen: boolean;
  onClose: () => void;
  codChamado: number | null;
}

export default function OSModal({ isOpen, onClose, codChamado }: OSModalProps) {
  const [osData, setOsData] = useState<OSData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados quando o modal abrir
  useEffect(() => {
    const fetchOSData = async () => {
      if (!codChamado) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/firebird/os/${codChamado}`);

        if (!response.ok) {
          throw new Error(`Erro: ${response.status}`);
        }

        const data = await response.json();
        setOsData(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao buscar dados da OS:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && codChamado) {
      fetchOSData();
    }
  }, [isOpen, codChamado]);

  // Limpar dados quando fechar
  const handleClose = () => {
    setOsData(null);
    setError(null);
    onClose();
  };

  // Formatar data
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Formatar hora
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';
    const hora = timeStr.toString().padStart(4, '0');
    const hh = hora.slice(0, 2);
    const mm = hora.slice(2, 4);
    return `${hh}:${mm}`;
  };

  // Formatar valor monetário
  const formatCurrency = (value: string | null) => {
    if (!value || isNaN(parseFloat(value))) return '-';
    return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
  };

  if (!isOpen) return null;

  return (
    // ===== CONTAINER PRINCIPAL =====
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ===== OVERLAY ===== */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ===== CONTAINER MODAL ===== */}
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-7xl overflow-hidden rounded-lg border border-slate-600 bg-white">
        {/* mx-4 max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl */}

        {/* ===== CONATAINER HEADER ===== */}
        <div className="flex items-center justify-between border-b border-slate-600 bg-slate-950 p-6">
          {/* ===== CONTAINER ===== */}
          <div className="flex items-center gap-4">
            {/* ÍCONE */}
            <div className="rounded-full bg-white p-3">
              <FileText className="h-7 w-7 text-black" />
            </div>
            {/* ---------- */}

            {/* TÍTULO */}
            <h1 className="text-3xl font-bold tracking-wider text-white italic">
              Detalhes da OS - Chamado {codChamado}
            </h1>
          </div>
          {/* ---------- */}

          {/* BOTÃO FECHAR */}
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto bg-slate-100 p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="mr-2 animate-spin text-blue-600" size={24} />
              <span className="text-slate-700">Carregando dados da OS...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12 text-red-600">
              <AlertCircle className="mr-2" size={24} />
              <span>Erro ao carregar dados: {error}</span>
            </div>
          )}

          {osData && osData.length > 0 && (
            <div className="space-y-6">
              {osData.map((os, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-md"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Informações básicas */}
                    <div className="space-y-4">
                      <h3 className="border-b border-slate-300 pb-2 text-lg font-bold text-slate-800">
                        Informações Básicas
                      </h3>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Código OS:
                        </label>
                        <p className="rounded border bg-blue-50 p-2 text-slate-900">
                          {os.COD_OS || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Número OS:
                        </label>
                        <p className="rounded border bg-blue-50 p-2 text-slate-900">
                          {os.NUM_OS || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Chamado:
                        </label>
                        <p className="rounded border bg-blue-50 p-2 text-slate-900">
                          {os.CHAMADO_OS || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Status:
                        </label>
                        <p className="rounded border bg-blue-50 p-2 text-slate-900">
                          {os.STATUS_OS || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Datas e horários */}
                    <div className="space-y-4">
                      <h3 className="border-b border-slate-300 pb-2 text-lg font-bold text-slate-800">
                        Datas e Horários
                      </h3>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Data Início:
                        </label>
                        <p className="rounded border bg-green-50 p-2 text-slate-900">
                          {formatDate(os.DTINI_OS)}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Hora Início:
                        </label>
                        <p className="rounded border bg-green-50 p-2 text-slate-900">
                          {formatTime(os.HRINI_OS)}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Data Inclusão:
                        </label>
                        <p className="rounded border bg-green-50 p-2 text-slate-900">
                          {formatDate(os.DTINC_OS)}
                        </p>
                      </div>
                    </div>

                    {/* Informações financeiras */}
                    <div className="space-y-4">
                      <h3 className="border-b border-slate-300 pb-2 text-lg font-bold text-slate-800">
                        Informações Financeiras
                      </h3>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Valor Hora:
                        </label>
                        <p className="rounded border bg-yellow-50 p-2 font-mono text-slate-900">
                          {formatCurrency(os.VRHR_OS)}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Percentual:
                        </label>
                        <p className="rounded border bg-yellow-50 p-2 text-slate-900">
                          {os.PERC_OS ? `${os.PERC_OS}%` : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Faturado:
                        </label>
                        <p className="rounded border bg-yellow-50 p-2 text-slate-900">
                          {os.FATURADO_OS || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">
                          Cód. Faturamento:
                        </label>
                        <p className="rounded border bg-yellow-50 p-2 text-slate-900">
                          {os.COD_FATURAMENTO || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Informações adicionais */}
                    <div className="space-y-4 md:col-span-2 lg:col-span-3">
                      <h3 className="border-b border-slate-300 pb-2 text-lg font-bold text-slate-800">
                        Informações Adicionais
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-600">
                            Produtivo:
                          </label>
                          <p className="rounded border bg-purple-50 p-2 text-slate-900">
                            {os.PRODUTIVO_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-600">
                            Produtivo 2:
                          </label>
                          <p className="rounded border bg-purple-50 p-2 text-slate-900">
                            {os.PRODUTIVO2_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-600">
                            Responsável Cliente:
                          </label>
                          <p className="rounded border bg-purple-50 p-2 text-slate-900">
                            {os.RESPCLI_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-600">
                            Código Recurso:
                          </label>
                          <p className="rounded border bg-purple-50 p-2 text-slate-900">
                            {os.CODREC_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-600">
                            Código Tarefa:
                          </label>
                          <p className="rounded border bg-purple-50 p-2 text-slate-900">
                            {os.CODTRF_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-600">
                            Deslocamento:
                          </label>
                          <p className="rounded border bg-purple-50 p-2 text-slate-900">
                            {os.DESLOC_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-600">
                            Abono:
                          </label>
                          <p className="rounded border bg-purple-50 p-2 text-slate-900">
                            {os.ABONO_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-600">
                            Complemento:
                          </label>
                          <p className="rounded border bg-purple-50 p-2 text-slate-900">
                            {os.COMP_OS || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    {(os.OBS_OS || os.OBS) && (
                      <div className="space-y-4 md:col-span-2 lg:col-span-3">
                        <h3 className="border-b border-slate-300 pb-2 text-lg font-bold text-slate-800">
                          Observações
                        </h3>
                        {os.OBS_OS && (
                          <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                              Observação OS:
                            </label>
                            <div className="min-h-[80px] rounded border bg-gray-50 p-4 whitespace-pre-wrap text-slate-900">
                              {os.OBS_OS}
                            </div>
                          </div>
                        )}
                        {os.OBS && (
                          <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-600">
                              Observação Geral:
                            </label>
                            <div className="min-h-[80px] rounded border bg-gray-50 p-4 whitespace-pre-wrap text-slate-900">
                              {os.OBS}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {osData && osData.length === 0 && (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="mb-2 text-lg font-semibold text-slate-700">
                Nenhuma OS encontrada
              </h3>
              <p className="text-slate-500">
                Não foram encontradas ordens de serviço para este chamado.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t bg-slate-50 p-6">
          <button
            onClick={handleClose}
            className="rounded-lg bg-slate-600 px-6 py-2 font-medium text-white transition-colors hover:bg-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
