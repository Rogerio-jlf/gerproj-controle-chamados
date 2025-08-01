import { IoMail } from 'react-icons/io5';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function EmailInput({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="email"
        className="block text-sm font-semibold tracking-wider text-white select-none"
      >
        Email
      </label>

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
          <IoMail className="h-5 w-5 text-white transition-colors duration-300 group-focus-within:text-purple-300" />
        </div>

        <input
          type="email"
          id="email"
          name="email"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="seu@email.com"
          required
          className="block w-full rounded-lg border border-white/20 bg-white/10 py-4 pr-3 pl-10 text-sm tracking-wider text-white placeholder-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/30 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
        <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100"></div>
      </div>
    </div>
  );
}
