'use client';
import React, { useState, useEffect } from 'react';
import {
  Target,
  Users,
  Activity,
  AlertTriangle,
  Zap,
  Award,
} from 'lucide-react';

// ====================================================================================================

interface MetricsCardsProps {
  dadosNumericosAPI?: any;
  dados?: any;
  dadosProcessados?: any[];
  className?: string;
}

// ====================================================================================================

export default function MetricsCards({
  dadosNumericosAPI = {},
  dados = {},
  dadosProcessados = [],
  className = '',
}: MetricsCardsProps) {
  const [visibleCards, setVisibleCards] = useState(0);

  // Animações de entrada dos cards
  useEffect(() => {
    const cardTimer = setInterval(() => {
      setVisibleCards(prev => Math.min(prev + 1, 6));
    }, 200);

    setTimeout(() => clearInterval(cardTimer), 1200);

    return () => {
      clearInterval(cardTimer);
    };
  }, []);

  // Dados dos cards com proteções
  const cardsData = [
    {
      icon: <Users size={24} className="text-white" />,
      title: 'Total de Recursos',
      value: dados?.quantidade_total_geral_recursos || 0,
      subtitle: `${dados?.quantidade_total_geral_recursos || 0} recursos ativos`,
      color: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700',
      delay: 0,
    },
    {
      icon: <Target size={24} className="text-white" />,
      title: 'Meta Geral',
      value: `${dadosNumericosAPI?.metaAtingidaMedia || 0}%`,
      subtitle:
        (dadosNumericosAPI?.metaAtingidaMedia || 0) >= 100
          ? '🎯 Meta atingida!'
          : '📈 Em progresso',
      color: 'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700',
      delay: 200,
    },
    {
      icon: <Zap size={24} className="text-white" />,
      title: 'Eficiência Média',
      value: `${dadosNumericosAPI?.eficienciaMedia || 0}%`,
      subtitle: `${dadosNumericosAPI?.horasImprodutivas || 0}h improdutivas`,
      color: 'bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700',
      delay: 400,
    },
    {
      icon: <Activity size={24} className="text-white" />,
      title: 'Utilização',
      value: `${dadosNumericosAPI?.utilizacaoMedia || 0}%`,
      subtitle: `${dadosNumericosAPI?.horasOciosas || 0}h ociosas`,
      color: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600',
      delay: 600,
    },
    {
      icon: <Award size={24} className="text-white" />,
      title: 'Top Performers',
      value: dadosNumericosAPI?.recursosExcelentes || 0,
      subtitle: `${(((dadosNumericosAPI?.recursosExcelentes || 0) / (dadosProcessados.length || 1)) * 100).toFixed(0)}% da equipe`,
      color: 'bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700',
      delay: 800,
    },
    {
      icon: <AlertTriangle size={24} className="text-white" />,
      title: 'Recursos Críticos',
      value: dadosNumericosAPI?.recursosCriticos || 0,
      subtitle: `${(((dadosNumericosAPI?.recursosCriticos || 0) / (dadosProcessados.length || 1)) * 100).toFixed(0)}% da equipe`,
      color: 'bg-gradient-to-br from-red-500 via-rose-600 to-red-700',
      delay: 1000,
    },
  ];

  return (
    <section className={`grid grid-cols-6 gap-6 ${className}`}>
      {cardsData.map((card, index) => (
        <div
          key={index}
          className={`transform transition-all duration-700 ${
            visibleCards > index
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-8 scale-95 opacity-0'
          }`}
          style={{ transitionDelay: `${card.delay}ms` }}
        >
          <div
            className={`${card.color} space-y-1 rounded-2xl p-6 shadow-md shadow-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-black`}
          >
            <div className="flex items-center justify-between">
              <div className="mb-3 rounded-lg bg-white/20 p-3 shadow-md shadow-black">
                {card.icon}
              </div>
            </div>
            <h2 className="text-base font-semibold tracking-wider text-white select-none">
              {card.title}
            </h2>
            <p className="text-2xl font-extrabold tracking-wider text-white italic select-none">
              {card.value}
            </p>
            {card.subtitle && (
              <p className="text-sm font-semibold tracking-wider text-white select-none">
                {card.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
