export default function Info() {
  return (
    <div className="flex flex-col items-start justify-center text-left">
      {/* Título com gradiente */}
      <h2 className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-7xl leading-tight font-extrabold tracking-tighter text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.3)] select-none">
        Solutii Sistemas
      </h2>

      {/* Linha decorativa */}
      <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]"></div>

      {/* Subtítulo */}
      <span className="mt-5 max-w-md text-2xl font-semibold tracking-wide text-white italic drop-shadow-[0_1px_6px_rgba(255,255,255,0.15)] select-none">
        Gerproj gestão de chamados
      </span>
    </div>
  );
}
