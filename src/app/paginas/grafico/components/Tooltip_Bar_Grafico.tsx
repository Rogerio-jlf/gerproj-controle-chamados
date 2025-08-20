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
    <div className="max-w-md space-y-4 rounded-2xl border-t border-slate-200 bg-white p-4 shadow-md shadow-black">
      <h4 className="text-lg font-bold tracking-wider text-slate-800 select-none">
        {corrigirTextoCorrompido(data.nomeCompleto)}
      </h4>

      <div className="grid grid-cols-2 items-center justify-between gap-2 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-600" />
            <span className="font-semibold tracking-wider text-slate-700 select-none">
              Disponíveis:
            </span>
            <span className="font-semibold tracking-wider text-slate-700 select-none">
              {data.horasDisponiveis}h
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-600" />
            <span className="font-semibold tracking-wider text-slate-700 select-none">
              Faturadas:
            </span>
            <span className="font-semibold tracking-wider text-slate-700 select-none">
              {data.horasFaturadas}h
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-600" />
            <span className="font-semibold tracking-wider text-slate-700 select-none">
              Não Faturadas:
            </span>
            <span className="font-semibold tracking-wider text-slate-700 select-none">
              {data.horasNaoFaturadas}h
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-right">
            <div
              className="text-xl font-bold tracking-wider select-none"
              style={{ color: data.statusCor }}
            >
              {data.percentualAtingido}%
            </div>
            <div className="text-xs font-semibold tracking-wider text-slate-700 select-none">
              Meta
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold tracking-wider text-blue-800 select-none">
              {data.percentualEficiencia}%
            </div>
            <div className="text-xs font-semibold tracking-wider text-slate-700 select-none">
              Eficiência
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-extrabold tracking-wider text-slate-700 select-none">
            Status:
          </span>
          <span
            className="text-base font-extrabold tracking-wider select-none"
            style={{ color: data.statusCor }}
          >
            {data.statusTexto}
          </span>
        </div>
      </div>
    </div>
  );
}
