import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BsDatabaseFillX } from 'react-icons/bs';
import { FaTriangleExclamation } from 'react-icons/fa6';
import { HiRefresh } from 'react-icons/hi';
import { Card } from './ui/card';
// ====================================================================================================

export default function ErrorComponent() {
  useEffect(() => {
    AOS.init({
      duration: 800, // tempo da animação
      once: true, // anima só uma vez
    });
  }, []);
  // ==========

  // ===== Função para tentar novamente, recarregar a página =====
  function onRetry() {
    window.location.reload();
  }

  // ====================================================================================================
  return (
    <div className="flex items-center justify-center">
      <Card
        className="h-[500px] w-[1400px] rounded-2xl border-t border-red-200 bg-gradient-to-r from-red-200 via-red-100 to-red-200 p-8 shadow-lg shadow-black"
        data-aos="zoom-in"
      >
        {/* Conteúdo */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Ícone principal */}
          <div
            className="relative mx-auto h-32 w-32"
            data-aos="fade-down"
            data-aos-delay="200"
          >
            <div className="absolute inset-0 rounded-full border-6 border-red-600"></div>
            <div
              className="absolute inset-2 animate-bounce rounded-full border-4 border-amber-500"
              style={{ animationDuration: '1s' }}
            ></div>
            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-red-100 shadow-md shadow-black">
              <FaTriangleExclamation className="text-red-600" size={32} />
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
              Erro ao tentar conectar com o banco de dados
            </h3>
            <p className="text-base font-semibold tracking-wider text-slate-700 italic select-none">
              Não foi possível carregar os dados. Verifique sua conexão e tente
              novamente.
            </p>
          </div>
          {/* ===== */}

          {/* Barra de carregamento e indicadores de status */}
          <div
            className="flex flex-col items-center justify-center gap-6"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            <div className="h-3 w-100 overflow-hidden rounded-full border border-red-600 bg-white">
              <div
                className="animate-error-bar h-3 rounded-full bg-red-600"
                style={{ animation: 'errorBar 2s ease-in-out infinite' }}
              ></div>
            </div>

            <div className="flex items-center gap-20">
              <div className="flex items-center gap-2">
                <BsDatabaseFillX className="text-red-600" size={24} />
                <span className="text-base font-bold tracking-wider text-slate-700 italic select-none">
                  Sem conexão
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-3 w-3 animate-ping rounded-full bg-red-600"></div>
                <span className="text-base font-bold tracking-wider text-slate-700 italic select-none">
                  Aguardando...
                </span>
              </div>
            </div>
          </div>
          {/* ===== */}

          {/* Botão tentar novamente */}
          <div data-aos="fade-up" data-aos-delay="800">
            <button
              onClick={onRetry}
              className="group mt-8 inline-flex items-center gap-4 rounded-md bg-blue-500 px-6 py-2 text-lg font-extrabold text-white shadow-black transition-all hover:scale-105 hover:bg-blue-800 hover:shadow-md focus:outline-none active:scale-95"
            >
              <HiRefresh
                className="transition-all group-hover:rotate-180"
                size={24}
              />
              Tentar novamente
            </button>
          </div>
          {/* ===== */}
        </div>
      </Card>

      {/* CSS personalizado para animação da barra de carregamento */}
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
      {/* ===== */}
    </div>
  );
}
