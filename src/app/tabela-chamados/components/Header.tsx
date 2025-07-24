import { RefreshCw } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-red-500 bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-5 w-5 animate-pulse rounded-full bg-green-500"></div>
          <h2 className="text-4xl font-extrabold tracking-wider text-black">
            Chamados
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-base font-semibold tracking-wider text-black italic">
            Última atualização
          </p>
          <p className="text-base font-bold tracking-wider text-black">
            {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-2 text-red-500 transition-all duration-200 hover:scale-110 active:scale-90"
          title="Atualizar dados"
        >
          <RefreshCw className="h-10 w-10" />
        </button>
      </div>
    </header>
  );
}
