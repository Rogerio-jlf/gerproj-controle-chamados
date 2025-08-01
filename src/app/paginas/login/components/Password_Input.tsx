import { IoEye, IoEyeOff, IoLockClosed } from 'react-icons/io5';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../components/ui/tooltip';

interface Props {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
}

export default function PasswordInput({
  value,
  onChange,
  showPassword,
  toggleShowPassword,
}: Props) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="password"
        className="block text-sm font-semibold tracking-wider text-white select-none"
      >
        Senha
      </label>

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
          <IoLockClosed className="h-5 w-5 text-white transition-colors duration-300 group-focus-within:text-purple-300" />
        </div>

        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          name="password"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Digite sua senha"
          required
          className="block w-full rounded-lg border border-white/20 bg-white/10 py-4 pr-3 pl-10 text-sm tracking-wider text-white placeholder-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/30 focus:border-transparent focus:ring-2 focus:ring-purple-400 focus:outline-none"
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleShowPassword}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 z-10 flex touch-manipulation items-center pr-3 transition-transform duration-300 hover:scale-110 focus:outline-none active:scale-90"
            >
              {showPassword ? (
                <IoEyeOff className="h-5 w-5 text-white" />
              ) : (
                <IoEye className="h-5 w-5 text-white" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-md -translate-x-10 border border-slate-700 bg-slate-900 tracking-wider break-words text-white transition-all duration-300"
          >
            <p className="text-xs">
              {showPassword ? 'Ocultar senha' : 'Exibir senha'}
            </p>
          </TooltipContent>
        </Tooltip>
        <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100"></div>
      </div>
    </div>
  );
}
