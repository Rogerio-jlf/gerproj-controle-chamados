import { LucideIcon } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';

interface CardsProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  className?: string; // Adiciona a propriedade className para permitir customização
}

export default function Cards({
  icon: Icon,
  title,
  value,
  className,
}: CardsProps) {
  return (
    <Card
      className={cn(
        'rounded-md border border-white/30 bg-white/10 px-4 py-2 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="rounded-xl border border-white/30 p-2 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-cyan-400" />
        </div>
        {/* Título e Valor */}
        <div className="flex flex-col">
          <p className="text-sm font-semibold tracking-wider text-slate-200 select-none">
            {title}
          </p>
          <p className="text-xl font-bold tracking-wider text-slate-200 italic select-none">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}
