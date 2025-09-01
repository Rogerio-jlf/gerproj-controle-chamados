import { OctagonX } from 'lucide-react';

interface ErrorProps {
  error: Error;
}

export default function Erro({ error }: ErrorProps) {
  const mensagem = error.message.includes('Token expirado')
    ? 'Realize login novamente. Seu Token de login expirou!'
    : error.message || 'Erro desconhecido. Tente novamente mais tarde.';

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-40">
      <OctagonX className="text-red-600" size={80} />
      <h3 className="text-2xl font-bold tracking-wider text-red-600 select-none">
        Oops... Algo deu errado! Não foi possível carregar os dados.
      </h3>
      <p className="text-base font-semibold tracking-wider text-red-600 italic select-none">
        {mensagem}
      </p>
    </div>
  );
}
