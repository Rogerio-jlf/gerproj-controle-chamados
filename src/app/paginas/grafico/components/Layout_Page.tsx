'use client';
import React, { useState } from 'react';
import DashboardRecursosAPI from './DashboardRecursoAPI';
import Header from './Header';
import Cards from './Cards';
import Overview from './Overview';
import HorasContratadasDashboard from './Horas_Contradas_Horas_Executadas';
import TabelaAnalises from './Tabela_Analises';
import Financeiro from './Financeiro';
import ConsolidadoDashboard from './Consolidado';
import {
  Users,
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

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
        <DashboardRecursosAPI mes={mes} ano={ano}>
          {({ dados, metricas, dadosProcessados }) => {
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

                {/* Cards apenas para visualizações que não sejam 'performance' ou 'consolidado' */}
                {tipoVisualizacao !== 'performance' &&
                  tipoVisualizacao !== 'consolidado' && (
                    <div className="grid grid-cols-6 gap-6">
                      <Cards
                        icon={<Users size={24} className="text-white" />}
                        title="Total de Recursos"
                        value={dados.quantidade_total_geral_recursos}
                        color="bg-gradient-to-r from-blue-600 to-indigo-600"
                      />
                      {/* ---------- */}

                      <Cards
                        icon={<Target size={24} className="text-white" />}
                        title="Meta Geral"
                        value={`${metricas.metaGeral}%`}
                        subtitle={
                          metricas.metaGeral >= 100
                            ? '🎯 Meta atingida!'
                            : '📈 Em progresso'
                        }
                        trend={metricas.metaGeral >= 80 ? 'up' : 'down'}
                        color="bg-gradient-to-r from-green-600 to-emerald-600"
                      />
                      {/* ---------- */}

                      <Cards
                        icon={<Activity size={24} className="text-white" />}
                        title="Eficiência Média"
                        value={`${metricas.eficienciaMedia}%`}
                        subtitle={`${metricas.horasImprodutivas}h improdutivas`}
                        color="bg-gradient-to-r from-purple-600 to-violet-600"
                      />
                      {/* ---------- */}

                      <Cards
                        icon={<Clock size={24} className="text-white" />}
                        title="Utilização"
                        value={`${metricas.utilizacaoMedia}%`}
                        subtitle={`${metricas.horasOciosas}h ociosas`}
                        color="bg-gradient-to-r from-orange-600 to-red-600"
                      />
                      {/* ---------- */}

                      <Cards
                        icon={<CheckCircle size={24} className="text-white" />}
                        title="Top Performers"
                        value={metricas.recursosExcelentes}
                        subtitle={`${((metricas.recursosExcelentes / dadosProcessados.length) * 100).toFixed(0)}% da equipe`}
                        color="bg-gradient-to-r from-teal-600 to-lime-600"
                      />
                      {/* ---------- */}

                      <Cards
                        icon={
                          <AlertTriangle size={24} className="text-white" />
                        }
                        title="Recursos Críticos"
                        value={metricas.recursosCriticos}
                        subtitle={`${((metricas.recursosCriticos / dadosProcessados.length) * 100).toFixed(0)}% da equipe`}
                        color="bg-gradient-to-r from-red-600 to-rose-600"
                      />
                    </div>
                  )}

                {/* Nova aba Consolidado */}
                {tipoVisualizacao === 'consolidado' && (
                  <div className="rounded-2xl border border-slate-300 bg-white p-10 shadow-md shadow-black">
                    <div className="mb-10 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold tracking-wider text-slate-800 select-none">
                          Dashboard Executivo Consolidado
                        </h2>
                        <p className="text-base font-semibold tracking-wider text-slate-600 italic select-none">
                          Visão estratégica consolidada • Dados agregados sem
                          exposição individual
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold tracking-wider text-slate-600 italic select-none">
                          Status do período:
                        </span>

                        <span
                          className={`text-lg font-semibold tracking-wider italic select-none ${
                            metricas.metaGeral >= 100
                              ? 'text-green-600'
                              : metricas.metaGeral >= 80
                                ? 'text-orange-600'
                                : 'text-red-600'
                          }`}
                        >
                          {metricas.metaGeral >= 100
                            ? '✅ Meta atingida'
                            : metricas.metaGeral >= 80
                              ? '⚠️ Próximo da meta'
                              : '🚨 Abaixo da meta'}
                        </span>
                      </div>
                    </div>

                    <ConsolidadoDashboard
                      metricas={metricas}
                      dados={dados}
                      dadosProcessados={dadosProcessados}
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
                  <Financeiro metricas={metricas} dados={dados} />
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
        </DashboardRecursosAPI>
      </div>
      {/* </main> */}
    </div>
  );
};

export default Layout_Page;
