import { OctagonX } from 'lucide-react';

interface ErrorProps {
  error: Error;
}

export default function Erro({ error }: ErrorProps) {
  return (
    <>
      <div className="flex flex-col items-center justify-center space-y-6 py-40">
        {/* Ícone */}
        <OctagonX className="text-red-600" size={80} />

        {/* Título */}
        <h3 className="text-2xl font-bold tracking-wider text-red-600 select-none">
          Oops... Algo deu errado! Não foi possível carregar os dados.
        </h3>

        {/* Mensagem */}
        <p className="text-base font-semibold tracking-wider text-red-600 italic select-none">
          {error.message || 'Erro desconhecido. Tente novamente mais tarde.'}
        </p>
      </div>
    </>
  );
}
