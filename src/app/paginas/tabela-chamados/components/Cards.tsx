import { LucideIcon } from 'lucide-react';
import { Card } from '../../../../components/ui/card';

interface CardsProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  iconBgColor?: string;
}

export default function Cards({
  icon: Icon,
  title,
  value,
  iconBgColor = 'bg-white/30',
}: CardsProps) {
  return (
    <Card className="rounded-lg border border-white/20 bg-white/10 px-6 py-2 select-none">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg ${iconBgColor} p-2`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <p className="text-sm tracking-wider text-white">{title}</p>
          <p className="text-left text-xl font-bold tracking-wider text-white">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}
