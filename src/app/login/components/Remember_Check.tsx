interface Props {
  rememberMe: boolean;
  onToggle: () => void;
}

export default function RememberCheck({ rememberMe, onToggle }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="group flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={onToggle}
          className="h-4 w-4 cursor-pointer border-white/20"
        />
        <label
          htmlFor="remember-me"
          className="ml-3 cursor-pointer text-sm tracking-wider text-white italic select-none"
        >
          Lembrar de mim
        </label>
      </div>
    </div>
  );
}
