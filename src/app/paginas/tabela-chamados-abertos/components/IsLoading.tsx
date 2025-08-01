import { DatabaseIcon, Loader2 } from 'lucide-react';

export default function IsLoading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-40">
      {/* Ícones */}
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-cyan-200 via-cyan-400 to-cyan-600 opacity-20 blur-lg"></div>

        <div className="relative flex items-center justify-center">
          {/* Ícone Loader2 */}
          <Loader2 className="animate-spin text-blue-600" size={120} />

          {/* Ícone DataBaseIcon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <DatabaseIcon className="text-blue-600" size={60} />
          </div>
        </div>
      </div>

      <div className="space-y-3 text-center">
        {/* Título */}
        <h3 className="text-2xl font-bold tracking-wider text-blue-600 select-none">
          Buscando chamados
        </h3>

        <div className="flex items-center justify-center space-x-1">
          {/* Aguarde */}
          <span className="text-base font-semibold tracking-wider text-blue-600 italic select-none">
            Aguarde
          </span>

          {/* Pontos animados de carregamento */}
          <div className="flex space-x-1">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"></div>
            <div
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
