import Background from './Background';
import LoginForm from './Form';
import LogoHeader from './Logo_Header';
import Info from './Info';

export default function LayoutPage() {
  return (
    <div className="kodchasan relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Background */}
      <div className="absolute inset-0">
        <Background />
      </div>

      {/* Grid Principal */}
      <div className="relative z-10 grid w-full grid-cols-2 items-center">
        {/* Esquerda - Informações */}
        <div className="pl-[140px]">
          <Info />
        </div>

        {/* Direita - Formulário */}
        <div className="ml-auto pr-[160px]">
          <div className="w-[440px] overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-2xl shadow-black backdrop-blur-xl">
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

            <div className="relative px-6 pt-8 pb-6 text-center">
              <LogoHeader />
              <h1 className="mb-2 text-2xl leading-tight font-bold tracking-wide text-white select-none">
                Bem-vindo de volta!
              </h1>
              <p className="px-2 text-xs font-semibold tracking-wide text-white italic select-none">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>

            <div className="px-6 pb-8">
              <LoginForm />
            </div>
          </div>

          <div className="mt-6 px-4 text-center">
            <p className="text-xs font-semibold tracking-wider text-white italic select-none">
              © 2025 Solutii. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
