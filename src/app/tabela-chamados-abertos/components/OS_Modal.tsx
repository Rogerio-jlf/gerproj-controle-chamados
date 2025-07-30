'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  FileText,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import IsLoading from './IsLoading';
import Erro from './Erro';
import { Card } from '../../../components/ui/card';

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
  const [isClosing, setIsClosing] = useState(false);

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
    setIsClosing(true);

    // Pequeno delay para mostrar o loader
    setTimeout(() => {
      setOsData(null);
      setError(null);
      onClose();
      setIsClosing(false);
    }, 300); // 300ms de delay para mostrar o loader
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

  // ------------------------------------------------------------------------------------------

  return (
    // ===== CONTAINER PRINCIPAL =====
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ===== OVERLAY ===== */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* ===== CONTAINER MODAL ===== */}
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-7xl overflow-hidden rounded-xl">
        {/* mx-4 max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl */}

        {/* ===== CONATAINER HEADER ===== */}
        <header className="flex items-center justify-between bg-slate-950 p-6">
          {/* Ícone e Título */}
          <div className="flex items-center gap-4">
            {/* Ícone */}
            <FileText className="text-cyan-400" size={40} />

            <div className="flex flex-col">
              {/* Título */}
              <h1 className="text-2xl font-bold tracking-wider text-white italic select-none">
                Chamado #{codChamado} - Ordens de Serviço
              </h1>
              <p className="text-base font-semibold tracking-wider text-white italic">
                {osData && osData.length > 0
                  ? `${osData.length} ordem(ns) de serviço encontrada(s)`
                  : ''}
              </p>
            </div>
          </div>
          {/* ---------- */}

          {/* Botão */}
          <button
            onClick={handleClose}
            disabled={isClosing}
            className="cursor-pointer text-white hover:scale-125 hover:text-red-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-white"
          >
            {isClosing ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <X className="h-7 w-7" />
            )}
          </button>
        </header>
        {/* ---------- */}

        {/* ===== CONTEÚDO ===== */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto bg-white p-6">
          {/* Loading */}
          {loading && <IsLoading />}

          {/* Erro */}
          {error && <Erro error={new Error(error)} />}

          {/* Dados da OS */}
          {osData && osData.length > 0 && (
            <div className="space-y-6">
              {osData.map((os, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-300 bg-white p-6 shadow-md shadow-black"
                >
                  <div className="grid grid-cols-3 gap-6">
                    {/* Informações básicas */}
                    <div className="space-y-4">
                      <h3 className="border-b border-slate-600 pb-2 text-xl font-bold tracking-wider text-black">
                        Informações Básicas
                      </h3>

                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Código OS:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {os.COD_OS || '-'}
                        </p>
                      </div>

                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Número OS:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {os.NUM_OS || '-'}
                        </p>
                      </div>

                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Chamado:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {os.CHAMADO_OS || '-'}
                        </p>
                      </div>

                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Status:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {os.STATUS_OS || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Datas e horários */}
                    <div className="space-y-4">
                      <h3 className="border-b border-slate-600 pb-2 text-xl font-bold tracking-wider text-black">
                        Datas e Horários
                      </h3>
                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Data Início:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-200 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {formatDate(os.DTINI_OS)}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Hora Início:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-200 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {formatTime(os.HRINI_OS)}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Data Inclusão:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-200 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {formatDate(os.DTINC_OS)}
                        </p>
                      </div>
                    </div>

                    {/* Informações financeiras */}
                    <div className="space-y-4">
                      <h3 className="border-b border-slate-600 pb-2 text-xl font-bold tracking-wider text-black">
                        Informações Financeiras
                      </h3>
                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Valor Hora:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {formatCurrency(os.VRHR_OS)}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Percentual:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {os.PERC_OS ? `${os.PERC_OS}%` : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Faturado:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {os.FATURADO_OS || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                          Cód. Faturamento:
                        </label>
                        <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                          {os.COD_FATURAMENTO || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Informações adicionais */}
                    <div className="col-span-4 space-y-4">
                      <h3 className="border-b border-slate-600 pb-2 text-xl font-bold tracking-wider text-black">
                        Informações Adicionais
                      </h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                            Produtivo:
                          </label>
                          <p className="rounded-md border border-slate-300 bg-stone-200 px-4 py-2 font-semibold tracking-wider text-black italic">
                            {os.PRODUTIVO_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                            Produtivo 2:
                          </label>
                          <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                            {os.PRODUTIVO2_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                            Responsável Cliente:
                          </label>
                          <p className="rounded-md border border-slate-300 bg-stone-200 px-4 py-2 font-semibold tracking-wider text-black italic">
                            {os.RESPCLI_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                            Código Recurso:
                          </label>
                          <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                            {os.CODREC_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                            Código Tarefa:
                          </label>
                          <p className="rounded-md border border-slate-300 bg-stone-200 px-4 py-2 font-semibold tracking-wider text-black italic">
                            {os.CODTRF_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                            Deslocamento:
                          </label>
                          <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                            {os.DESLOC_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                            Abono:
                          </label>
                          <p className="rounded-md border border-slate-300 bg-stone-200 px-4 py-2 font-semibold tracking-wider text-black italic">
                            {os.ABONO_OS || '-'}
                          </p>
                        </div>
                        <div>
                          <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                            Complemento:
                          </label>
                          <p className="rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider text-black italic">
                            {os.COMP_OS || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    {(os.OBS_OS || os.OBS) && (
                      <div className="space-y-4 md:col-span-2 lg:col-span-3">
                        <h3 className="border-b border-slate-600 pb-2 text-xl font-bold tracking-wider text-black">
                          Observações
                        </h3>
                        {os.OBS_OS && (
                          <div>
                            <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                              Observação OS:
                            </label>
                            <div className="min-h-[80px] rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider whitespace-pre-wrap text-slate-900 italic">
                              {os.OBS_OS}
                            </div>
                          </div>
                        )}
                        {os.OBS && (
                          <div>
                            <label className="mb-1 block text-base font-semibold tracking-wider text-black italic">
                              Observação Geral:
                            </label>
                            <div className="min-h-[80px] rounded-md border border-slate-300 bg-stone-100 px-4 py-2 font-semibold tracking-wider whitespace-pre-wrap text-slate-900 italic">
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

          {/* Mensagem quando não há OS */}
          {osData && osData.length === 0 && (
            <Card className="rounded-xl bg-slate-900 py-40">
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Ícone */}
                <TriangleAlert className="text-yellow-500" size={80} />

                {/* Título */}
                <h3 className="text-2xl font-bold tracking-wider text-yellow-500 italic select-none">
                  Nenhuma OS foi encontrada, para o chamado #{codChamado}.
                </h3>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
