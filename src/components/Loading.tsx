import { Database } from 'lucide-react';

export default function LoadingComponent() {
  return (
    <div className="flex min-h-96 items-center justify-center rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 shadow-xl">
      <div className="relative text-center">
        {/* Background decorativo */}
        <div className="absolute -inset-20 rounded-full bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-indigo-400/5 blur-3xl"></div>

        {/* Container principal */}
        <div className="relative space-y-6">
          {/* Spinner principal */}
          <div className="relative mx-auto h-20 w-20">
            {/* Anel externo */}
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-500"></div>
            </div>

            {/* Anel interno */}
            <div
              className="absolute inset-2 animate-spin rounded-full border-3 border-slate-100"
              style={{
                animationDirection: 'reverse',
                animationDuration: '1.5s',
              }}
            >
              <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-indigo-500 border-r-purple-500"></div>
            </div>

            {/* Centro com ícone */}
            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white shadow-lg">
              <Database className="h-6 w-6 animate-pulse text-blue-600" />
            </div>
          </div>

          {/* Textos */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">
              Carregando dados dos clientes
            </h3>
            <p className="text-sm text-slate-600">
              Conectando com o banco de dados...
            </p>

            {/* Barra de progresso animada */}
            <div className="mx-auto mt-4 h-2 w-48 overflow-hidden rounded-full bg-slate-200">
              <div
                className="animate-loading-bar h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                style={{
                  animation: 'loadingBar 2s ease-in-out infinite',
                }}
              ></div>
            </div>
          </div>

          {/* Indicadores de processo */}
          <div className="flex items-center justify-center gap-8 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-ping rounded-full bg-blue-500"></div>
              <span>Conectando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500"></div>
              <span>Processando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-green-500"></div>
              <span>Carregando</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS personalizado para animação da barra */}
      <style jsx>{`
        @keyframes loadingBar {
          0% {
            width: 0%;
            opacity: 0.6;
          }
          50% {
            width: 70%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
