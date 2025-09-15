import { BsFillXOctagonFill } from 'react-icons/bs';

interface ErrorProps {
   error: Error;
}

export default function Erro({ error }: ErrorProps) {
   const mensagem = error.message || 'Erro desconhecido';

   return (
      <div className="flex flex-col items-center justify-center gap-6 py-40">
         <BsFillXOctagonFill className="text-red-600" size={120} />

         <div className="flex flex-col items-center justify-center gap-4">
            <h3 className="text-3xl font-extrabold tracking-wider text-red-600 select-none">
               Oops... Algo deu errado! Não foi possível carregar os dados.
            </h3>
            <p className="text-lg font-bold tracking-wider text-red-600 italic select-none">
               {mensagem}
            </p>
         </div>
      </div>
   );
}
