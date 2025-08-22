import { useEffect } from 'react';
import { FaDatabase } from 'react-icons/fa6';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BsDatabaseFill } from 'react-icons/bs';
import { Card } from './ui/card';
// ====================================================================================================

export default function LoadingComponent() {
  useEffect(() => {
    AOS.init({
      duration: 800, // tempo da animação
      once: true, // anima só uma vez
    });
  }, []);
  // ==========

  // ====================================================================================================
  return (
    <div className="flex items-center justify-center">
      <Card
        className="h-[500px] w-[1400px] rounded-2xl border-t border-blue-200 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 p-8 shadow-lg shadow-black"
        data-aos="zoom-in"
      >
        {/* Conteúdo */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Ícone principal */}
          <div
            className="relative mx-auto flex h-32 w-32 items-center justify-center"
            data-aos="fade-down"
            data-aos-delay="200"
          >
            {/* Anel externo */}
            <div className="absolute inset-0 animate-spin rounded-full border-6 border-slate-600">
              <div className="absolute inset-0 rounded-full border-5 border-transparent border-t-blue-600 border-r-blue-500"></div>
            </div>

            {/* Anel interno */}
            <div
              className="absolute inset-2 animate-spin rounded-full border-5 border-blue-200"
              style={{
                animationDirection: 'reverse',
                animationDuration: '1.5s',
              }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500"></div>
            </div>

            {/* Centro com ícone */}
            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-blue-100 shadow-md shadow-black">
              <FaDatabase className="text-blue-600" size={32} />
            </div>
          </div>
          {/* ===== */}

          {/* Título e subtítulo */}
          <div
            className="flex flex-col items-center justify-center text-center"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <h3 className="text-2xl font-extrabold tracking-wider text-slate-900 select-none">
              Realizando a busca de informações no banco de dados
            </h3>
            <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
              Por favor, aguarde...
            </p>
          </div>
          {/* ===== */}

          {/* Barra de carregamento e indicadores de status */}
          <div
            className="flex flex-col items-center justify-center gap-6"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            <div className="h-3 w-100 overflow-hidden rounded-full border border-blue-600 bg-white">
              <div
                className="animate-loading-bar h-3 rounded-full bg-blue-600"
                style={{
                  animation: 'loadingBar 2s ease-in-out infinite',
                }}
              ></div>
            </div>

            <div className="flex items-center gap-20">
              <div className="flex items-center gap-2">
                <BsDatabaseFill className="text-blue-500" size={24} />
                <span className="text-base font-bold tracking-wider text-slate-700 italic select-none">
                  Sem conexão
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-3 w-3 animate-ping rounded-full bg-blue-600"></div>
                <span className="text-base font-bold tracking-wider text-slate-700 italic select-none">
                  Carregando...
                </span>
              </div>
            </div>
          </div>
          {/* ===== */}
        </div>
      </Card>

      {/* CSS personalizado para animação da barra de carregamento */}
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
      {/* ===== */}
    </div>
  );
}
