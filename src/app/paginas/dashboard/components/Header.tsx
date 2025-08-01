import { Users2 } from 'lucide-react';

interface HeaderProps {
  titulo: string;
  subtitulo: string;
}

export default function Header({ titulo, subtitulo }: HeaderProps) {
  return (
    <>
      {/* HEADER */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-6">
            {/* ÍCONE */}
            <div className="group relative">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-lg bg-purple-800">
                <Users2 className="h-7 w-7 animate-pulse text-white" />
              </div>
            </div>

            <div>
              {/* TÍTULO */}
              <h2 className="text-3xl font-extrabold tracking-wider text-black italic">
                {titulo}
              </h2>
              {/* SUBTÍTULO */}
              <p className="text-base font-semibold tracking-wider text-black italic">
                {subtitulo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
