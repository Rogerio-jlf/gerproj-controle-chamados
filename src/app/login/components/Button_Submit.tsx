import { ImSpinner2 } from 'react-icons/im';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';

type ButtonSubmitProps = {
  isLoading: boolean;
};

export default function ButtonSubmit({ isLoading }: ButtonSubmitProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`group relative flex w-full transform cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 p-4 transition-all duration-300 ${
        isLoading
          ? 'cursor-not-allowed opacity-60'
          : 'hover:-translate-y-1 hover:scale-[1.02] hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 active:scale-[0.90]'
      }`}
    >
      {isLoading ? (
        <span className="relative z-10 flex items-center gap-2 font-semibold tracking-wider text-white">
          <ImSpinner2 className="h-5 w-5 animate-spin" />
          Entrando...
        </span>
      ) : (
        <>
          <span className="relative z-10 mr-2 text-lg font-bold tracking-wider text-white">
            Entrar
          </span>
          <MdOutlineKeyboardArrowRight className="relative z-10 h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-2" />
        </>
      )}
    </button>
  );
}
