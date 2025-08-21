import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { BsDatabaseFillX } from 'react-icons/bs';

interface Props {
  onRetry: () => void;
  errorMessage?: string;
  description?: string;
}

export default function ErrorComponent({
  onRetry,
  errorMessage = 'Erro ao tentar conectar com o banco de dados',
  description = 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.',
}: Props) {
  useEffect(() => {
    AOS.init({
      duration: 800, // tempo da animação
      once: true, // anima só uma vez
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="max-w-7xl rounded-2xl border-t border-red-200 bg-red-50 p-8 shadow-lg shadow-black"
        data-aos="zoom-in"
      >
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* ícone */}
          <div
            className="relative mx-auto h-32 w-32"
            data-aos="fade-down"
            data-aos-delay="200"
          >
            <div className="absolute inset-0 animate-pulse rounded-full border-6 border-red-500"></div>
            <div
              className="absolute inset-2 animate-bounce rounded-full border-4 border-amber-500"
              style={{ animationDuration: '1s' }}
            ></div>
            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-red-200 shadow-md shadow-black">
              <AlertTriangle className="animate-pulse text-red-600" size={32} />
            </div>
          </div>

          {/* título e subtítulo */}
          <div
            className="flex flex-col items-center justify-center text-center"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <h3 className="text-2xl font-extrabold tracking-wider text-slate-800 select-none">
              {errorMessage}
            </h3>
            <p className="text-base font-semibold tracking-wider text-slate-600 italic select-none">
              {description}
            </p>
          </div>

          {/* barra de carregamento e status */}
          <div
            className="flex flex-col items-center justify-center gap-6 text-sm font-semibold tracking-wider text-slate-600 italic select-none"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            <div className="h-3 w-64 overflow-hidden rounded-full bg-red-200">
              <div
                className="animate-error-bar h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-600"
                style={{ animation: 'errorBar 2s ease-in-out infinite' }}
              ></div>
            </div>

            <div className="flex items-center gap-20">
              <div className="flex items-center gap-2">
                <BsDatabaseFillX className="text-red-500" size={24} />
                <span>Sem conexão</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 animate-ping rounded-full bg-red-500"></div>
                <span>Aguardando...</span>
              </div>
            </div>
          </div>

          {/* botão tentar novamente */}
          <div data-aos="fade-up" data-aos-delay="800">
            <button
              onClick={onRetry}
              className="group mt-8 inline-flex items-center gap-4 rounded-md bg-blue-500 px-6 py-2 text-lg font-extrabold text-white shadow-black transition-all hover:scale-105 hover:bg-blue-800 hover:shadow-md focus:outline-none active:scale-95"
            >
              <RefreshCw
                className="transition-all group-hover:rotate-180"
                size={20}
              />
              Tentar novamente
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes errorBar {
          0% {
            width: 100%;
            opacity: 0.8;
          }
          50% {
            width: 30%;
            opacity: 1;
          }
          100% {
            width: 0%;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
