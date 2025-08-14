'use client';
import React, { useState } from 'react';
import PerformanceAPI from './Performance_API';
import Header from './components/Header';
import Cards from './components/Cards';
import Overview from './components/Overview';
import HorasContratadasDashboard from './components/Horas_Contradas_Horas_Executadas';
import TabelaAnalises from './components/Tabela_Analises';
import Financeiro from './components/Financeiro';
import ConsolidadoDashboard from './components/Consolidado';
import {
  Users,
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { GoCheckCircleFill } from 'react-icons/go';
import { GoAlertFill } from 'react-icons/go';
import { AiFillAlert } from 'react-icons/ai';

const Layout_Page: React.FC = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [collapsed, setCollapsed] = useState(false);

  const [tipoVisualizacao, setTipoVisualizacao] = useState<
    | 'overview'
    | 'performance'
    | 'financeiro'
    | 'tabela performance'
    | 'consolidado'
  >('overview');

  const handleToggleSidebar = () => setCollapsed(prev => !prev);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  // Função para verificar se o mês selecionado é o mês corrente
  const isCurrentMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    return mes === currentMonth && ano === currentYear;
  };

  // Função para obter o nome do mês
  const getMonthName = (monthNumber: number) => {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return months[monthNumber - 1];
  };

  return (
    // <div className="flex h-screen w-screen overflow-hidden">
    <div className="bg-white p-10">
      {/* <Sidebar
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        onLogout={handleLogout}
      /> */}

      {/* <main
        className={`flex flex-1 flex-col space-y-6 overflow-auto transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-80'
        } p-4`}
      > */}
      <div className="flex w-full flex-col gap-8">
        <PerformanceAPI mes={mes} ano={ano}>
          {({ dadosAPI, dadosNumericosAPI, dadosProcessados }) => {
            return (
              <>
                <Header
                  mes={mes}
                  ano={ano}
                  setMes={setMes}
                  setAno={setAno}
                  tipoVisualizacao={tipoVisualizacao}
                  setTipoVisualizacao={setTipoVisualizacao}
                />

                {/* Cards não exibidos para as abas: performance e/ou consolidado */}
                {tipoVisualizacao !== 'performance' &&
                  tipoVisualizacao !== 'consolidado' && (
                    // div - cards
                    <div className="grid grid-cols-6 gap-6">
                      <Cards
                        icon={<Users size={24} className="text-white" />}
                        title="Total de Recursos"
                        value={dadosAPI.quantidade_total_geral_recursos}
                        color="bg-gradient-to-r from-blue-600 to-indigo-600"
                      />
                      {/* ---------- */}

                      <Cards
                        icon={<Target size={24} className="text-white" />}
                        title="Meta Geral"
                        value={`${dadosNumericosAPI.metaAtingidaMedia}%`}
                        subtitle={
                          dadosNumericosAPI.metaAtingidaMedia >= 100
                            ? '🎯 Meta atingida!'
                            : '📈 Em progresso'
                        }
                        trend={
                          dadosNumericosAPI.metaAtingidaMedia >= 80
                            ? 'up'
                            : 'down'
                        }
                        color="bg-gradient-to-r from-green-600 to-emerald-600"
                      />
                      {/* ---------- */}

                      <Cards
                        icon={<Activity size={24} className="text-white" />}
                        title="Eficiência Média"
                        value={`${dadosNumericosAPI.eficienciaMedia}%`}
                        subtitle={`${dadosNumericosAPI.horasImprodutivas}h improdutivas`}
                        color="bg-gradient-to-r from-purple-600 to-violet-600"
                      />
                      {/* ---------- */}

                      <Cards
                        icon={<Clock size={24} className="text-white" />}
                        title="Utilização"
                        value={`${dadosNumericosAPI.utilizacaoMedia}%`}
                        subtitle={`${dadosNumericosAPI.horasOciosas}h ociosas`}
                        color="bg-gradient-to-r from-orange-600 to-red-600"
                      />
                      {/* ---------- */}

                      <Cards
                        icon={<CheckCircle size={24} className="text-white" />}
                        title="Top Performers"
                        value={dadosNumericosAPI.recursosExcelentes}
                        subtitle={`${((dadosNumericosAPI.recursosExcelentes / dadosProcessados.length) * 100).toFixed(0)}% da equipe`}
                        color="bg-gradient-to-r from-teal-600 to-lime-600"
                      />
                      {/* ---------- */}

                      <Cards
                        icon={
                          <AlertTriangle size={24} className="text-white" />
                        }
                        title="Recursos Críticos"
                        value={dadosNumericosAPI.recursosCriticos}
                        subtitle={`${((dadosNumericosAPI.recursosCriticos / dadosProcessados.length) * 100).toFixed(0)}% da equipe`}
                        color="bg-gradient-to-r from-red-600 to-rose-600"
                      />
                    </div>
                  )}

                {/* aba consolidado */}
                {tipoVisualizacao === 'consolidado' && (
                  // <div className="rounded-2xl border border-slate-100 bg-white p-10 shadow-md shadow-black">
                  <div className="bg-white">
                    {/* Aviso para mês corrente */}
                    {isCurrentMonth() && (
                      <div className="mb-6 rounded-lg border-l-8 border-blue-500 bg-blue-50 p-4">
                        <div className="flex items-center">
                          <Info className="mr-3 h-5 w-5 text-blue-700" />
                          <p className="text-base font-semibold tracking-wider text-blue-700 italic select-none">
                            Os dados apresentados para {getMonthName(mes)}/{ano}{' '}
                            são calculados com base na média dos últimos 3
                            meses, uma vez que o mês em questão, ainda não foi
                            finalizado.
                          </p>
                        </div>
                      </div>
                    )}
                    {/* ---------- */}

                    <div className="mb-10 flex items-center justify-between"></div>

                    <ConsolidadoDashboard
                      dados={dadosAPI}
                      dadosProcessados={dadosProcessados}
                      dadosNumericosAPI={dadosNumericosAPI}
                    />
                  </div>
                )}

                {tipoVisualizacao === 'overview' && (
                  <div className="rounded-2xl border border-slate-300 bg-white p-10 shadow-md shadow-black">
                    <div className="mb-10 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold tracking-wider text-slate-800 select-none">
                          Desempenho Operacional
                        </h2>
                        <p className="text-base font-semibold tracking-wider text-slate-600 italic select-none">
                          Comparativo de capacidade, produção e eficácia
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold tracking-wider text-slate-600 italic select-none">
                          Total de recursos ativos:
                        </span>

                        <span className="text-lg font-semibold tracking-wider text-blue-600 italic select-none">
                          {dadosProcessados.length}
                        </span>
                      </div>
                    </div>

                    <Overview
                      chunks={(() => {
                        const chunkSize = 8;
                        const filtered = dadosProcessados.filter(
                          r =>
                            r.horasDisponiveis > 0 ||
                            r.horasExecutadas > 0 ||
                            r.horasFaturadas > 0
                        );
                        const sorted = [...filtered].sort(
                          (a, b) => b.horasFaturadas - a.horasFaturadas
                        );

                        if (sorted.length === 0) {
                          return [[]];
                        }

                        const chunks = [];
                        for (let i = 0; i < sorted.length; i += chunkSize) {
                          chunks.push(sorted.slice(i, i + chunkSize));
                        }

                        return chunks;
                      })()}
                      totalRecursos={dadosProcessados.length}
                    />
                  </div>
                )}

                {tipoVisualizacao === 'performance' && (
                  <HorasContratadasDashboard mes={mes} ano={ano} />
                )}

                {tipoVisualizacao === 'financeiro' && (
                  <Financeiro metricas={dadosNumericosAPI} dados={dadosAPI} />
                )}

                {tipoVisualizacao === 'tabela performance' && (
                  <div className="rounded-2xl border border-slate-300 bg-white p-10 shadow-md shadow-black">
                    <h2 className="mb-6 text-2xl font-bold tracking-wider text-slate-800 select-none">
                      Tabela de Performance
                    </h2>
                    <TabelaAnalises dadosProcessados={dadosProcessados} />
                  </div>
                )}
              </>
            );
          }}
        </PerformanceAPI>
      </div>
      {/* </main> */}
    </div>
  );
};

export default Layout_Page;
