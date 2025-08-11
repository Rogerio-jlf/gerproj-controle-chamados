'use client';
import React from 'react';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';

interface TooltipProps {
  active: boolean;
  payload: any[];
}

export default function TooltipBarGrafico({ active, payload }: TooltipProps) {
  if (!active || !payload?.[0]?.payload) return null;

  const data = payload[0].payload;

  return (
    <div className="max-w-md space-y-4 rounded-2xl border border-slate-300 bg-white/90 p-6 shadow-md shadow-black backdrop-blur-sm">
      <h4 className="text-lg font-bold tracking-wider text-slate-800 select-none">
        {corrigirTextoCorrompido(data.nomeCompleto)}
      </h4>

      <div className="grid grid-cols-2 items-center justify-between gap-2 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="font-semibold tracking-wider text-slate-600 select-none">
              Disponíveis:
            </span>
            <span className="font-semibold tracking-wider text-slate-600 select-none">
              {data.horasDisponiveis}h
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="font-semibold tracking-wider text-slate-600 select-none">
              Faturadas:
            </span>
            <span className="font-semibold tracking-wider text-slate-600 select-none">
              {data.horasFaturadas}h
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="font-semibold tracking-wider text-slate-600 select-none">
              Não Faturadas:
            </span>
            <span className="font-semibold tracking-wider text-slate-600 select-none">
              {data.horasNaoFaturadas}h
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-right">
            <div
              className="text-2xl font-bold tracking-wider select-none"
              style={{ color: data.statusCor }}
            >
              {data.percentualAtingido}%
            </div>
            <div className="text-xs font-semibold tracking-wider text-slate-600 select-none">
              Meta Atingida
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-purple-700">
              {data.percentualEficiencia}%
            </div>
            <div className="text-xs font-semibold tracking-wider text-slate-600 select-none">
              Eficiência
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-500 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wider text-slate-600 select-none">
            Status:
          </span>
          <span
            className="text-sm font-semibold tracking-wider select-none"
            style={{ color: data.statusCor }}
          >
            {data.statusTexto}
          </span>
        </div>
      </div>
    </div>
  );
}
