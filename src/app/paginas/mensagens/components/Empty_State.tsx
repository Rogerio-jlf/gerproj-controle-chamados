import { Mail } from 'lucide-react';
import Header from './Header';

export default function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-8">
          <Header onBack={onBack} unreadCount={0} />
        </div>

        {/* ===== div - conteúdo ===== */}
        <div className="mt-68">
          {/* ===== div - ícone / título / descrição ===== */}
          <div className="flex flex-col items-center gap-4">
            {/* ícone */}
            <Mail className="text-slate-800" size={80} />

            {/* título */}
            <h3 className="text-3xl font-bold tracking-wider text-slate-800 select-none">
              Nenhuma mensagem
            </h3>

            {/* descrição */}
            <p className="text-lg font-bold tracking-wider text-slate-800 select-none">
              Você não possui mensagens de reprovação no momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
