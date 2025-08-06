'use client';

import { useEffect } from 'react';
import { X, FileText, TriangleAlert } from 'lucide-react';
import IsLoading from './IsLoading';
import Erro from './Erro';
import { Card } from '../../../../components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { corrigirTextoCorrompido } from '@/lib/corrigirTextoCorrompido';

interface OSModalProps {
  isOpen: boolean;
  onClose: () => void;
  codChamado: number | null;
}

export default function ModalOS({ isOpen, onClose, codChamado }: OSModalProps) {
  // função para buscar os dados
  // Função assíncrona para buscar os dados da OS (ordem de serviço) pelo número do chamado
  const fetchDataOS = async (codChamado: number) => {
    // Faz uma requisição GET para a API com o código do chamado
    const response = await fetch(`/api/firebird-SQL//os/${codChamado}`);

    // Se a resposta não for bem-sucedida, lança um erro com o status HTTP
    if (!response.ok) throw new Error(`Erro: ${response.status}`);

    // Converte a resposta da API de JSON para objeto JavaScript
    const data = await response.json();

    // Garante que o retorno seja sempre um array (mesmo que venha um único objeto)
    return Array.isArray(data) ? data : [data];
  };

  // Hook useQuery do React Query para buscar os dados de forma automática e controlada
  const {
    data: dataOS, // Dados retornados da API (renomeado para 'dataOS')
    isLoading: isLoading, // Booleano: true enquanto os dados estão sendo carregados
    isError: isError, // Booleano: true se ocorrer algum erro durante a requisição
    error, // Objeto com informações do erro (caso exista)
    refetch, // Função para recarregar os dados manualmente
  } = useQuery({
    // Chave única para o cache e controle da query (diferente para cada codChamado)
    queryKey: ['dataOS', codChamado],

    // Função que busca os dados da OS
    queryFn: () => fetchDataOS(codChamado!), // Usa o codChamado com "non-null assertion" (!)

    // A query só será executada se o modal estiver aberto e o codChamado for válido
    enabled: isOpen && !!codChamado,

    // Tempo que os dados são considerados frescos (1 minuto), evita re-fetch desnecessário
    staleTime: 1000 * 60 * 1,
  });

  // Efeito colateral para recarregar os dados quando o modal abrir ou o codChamado mudar
  // Isso garante que sempre que o modal for aberto, os dados mais recentes sejam buscados
  useEffect(() => {
    if (isOpen && codChamado) {
      refetch();
    }
  }, [isOpen, codChamado, refetch]);

  const handleClose = () => {
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';
    const hora = timeStr.toString().padStart(4, '0');
    const hh = hora.slice(0, 2);
    const mm = hora.slice(2, 4);
    return `${hh}:${mm}`;
  };

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

      {/* ===== MODAL ===== */}
      <div className="relative z-10 mx-4 max-h-[100vh] w-full max-w-7xl overflow-hidden rounded-2xl border border-slate-600">
        {/* mx-4 max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl */}

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
                Chamado #{codChamado} - Ordem de Serviço
              </h1>

              {/* subtítulo */}
              <p className="text-base font-semibold tracking-wider text-slate-200 italic select-none">
                {dataOS && dataOS.length > 0
                  ? `${dataOS.length} ordem(ns) de serviço encontrada(s)`
                  : ''}
              </p>
            </div>
          </div>

          {/* botão - fechar modal */}
          <button
            onClick={handleClose}
            className="group rounded-full p-2 text-slate-200 hover:scale-125 hover:bg-red-500/50 hover:text-red-500"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        {/* ===== CONTEÚDO PRINCIPAL ===== */}
        <div className="max-h-[calc(100vh-210px)] overflow-y-auto bg-white p-6">
          {/* loading */}
          {isLoading && <IsLoading title="Buscando ordens de serviço" />}

          {/* erro */}
          {isError && error && <Erro error={error as Error} />}

          {/* dados da OS */}
          {dataOS && dataOS.length > 0 && (
            <>
              {dataOS.map((os, index) => (
                <div
                  key={index}
                  className={`mb-8 space-y-6 rounded-xl p-6 ${index % 2 === 0 ? 'border border-slate-300 bg-white shadow-md shadow-black' : 'border border-slate-300 bg-white shadow-md shadow-black'}`}
                >
                  {/* Cabeçalho da OS com número e separador */}
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900'}`}
                    >
                      <span className="text-lg font-bold tracking-wider text-slate-200 select-none">
                        {index + 1}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-wider text-slate-800 italic select-none">
                      OS #{os.COD_OS}
                    </h2>
                    <div
                      className={`h-1 flex-grow rounded ${index % 2 === 0 ? 'bg-gradient-to-r from-slate-900 via-slate-700 to-transparent' : 'bg-gradient-to-r from-slate-900 via-slate-700 to-transparent'}`}
                    ></div>
                  </div>
                  {/* div - linha 1 - informações básicas / data e horários / informações financeiras */}
                  <div className="grid grid-cols-3 gap-6">
                    {/* card - informações básicas */}
                    <Card className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md shadow-black">
                      <h3 className="border-b border-red-500 text-xl font-bold tracking-wider text-slate-800 select-none">
                        Informações Básicas
                      </h3>

                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Código OS
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              #{os.COD_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Número OS
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.NUM_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Chamado
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.CHAMADO_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Status
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.STATUS_OS || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* div - datas e horários */}
                    <Card className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md shadow-black">
                      <h3 className="flex items-center border-b border-red-500 text-xl font-bold tracking-wider text-slate-800 select-none">
                        Datas e Horários
                      </h3>

                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Data Início
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {formatDate(os.DTINI_OS) || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Hora Início
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {formatTime(os.HRINI_OS) || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Data Inclusão
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {formatDate(os.DTINC_OS) || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* div - informações financeiras */}
                    <Card className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md shadow-black">
                      <h3 className="flex items-center border-b border-red-500 text-xl font-bold tracking-wider text-slate-800 select-none">
                        Informações Financeiras
                      </h3>

                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Valor Hora
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {formatCurrency(os.VRHR_OS) || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Percentual
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.PERC_OS ? `${os.PERC_OS}%` : '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Faturado
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.FATURADO_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Código Faturamento
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.COD_FATURAMENTO || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* div - linha 2 - informações adicionais */}
                  <div className="gid-cols-4 grid gap-6 space-y-4">
                    <Card className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md shadow-black">
                      <h3 className="flex items-center border-b border-red-500 text-xl font-bold tracking-wider text-slate-800 select-none">
                        Informações Adicionais
                      </h3>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Produtivo
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.PRODUTIVO_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Produtivo 2
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.PRODUTIVO2_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Responsável Cliente
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.RESPCLI_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Código Recurso
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.CODREC_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Código Tarefa
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.CODTRF_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Deslocamento
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.DESLOC_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Abono
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.ABONO_OS || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                              Complemento
                            </p>
                            <p className="text-base font-semibold tracking-wider text-white italic select-none">
                              {os.COMP_OS || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* div - linha 3 - observações */}
                  {(os.OBS_OS || os.OBS) && (
                    <div className="space-y-4">
                      <Card className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md shadow-black">
                        <h3 className="flex items-center border-b border-red-500 text-xl font-bold tracking-wider text-slate-800 select-none">
                          Observações
                        </h3>

                        <div className="space-y-3">
                          {os.OBS_OS && (
                            <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                              <div className="space-y-1">
                                <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                                  Observação OS:
                                </p>
                                <p className="min-h-[100px] text-base font-semibold tracking-wider text-white italic select-none">
                                  {corrigirTextoCorrompido(os.OBS_OS) || '-'}
                                </p>
                              </div>
                            </div>
                          )}

                          {os.OBS && (
                            <div className="flex items-center rounded-md bg-slate-800 px-6 py-1 shadow-md shadow-black">
                              <div className="space-y-1">
                                <p className="text-xs font-semibold tracking-wider text-slate-200 select-none">
                                  Observação Geral:
                                </p>
                                <p className="min-h-[100px] text-base font-semibold tracking-wider text-white italic select-none">
                                  {corrigirTextoCorrompido(os.OBS) || '-'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Mensagem quando não há OS */}
          {dataOS && dataOS.length === 0 && (
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
