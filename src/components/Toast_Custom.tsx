// src/components/ToastCustom.tsx
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { TiWarning } from 'react-icons/ti';

interface ToastCustomProps {
   type?: 'success' | 'error' | 'info' | 'warning';
   title: string;
   description?: string;
}

export function ToastCustom({
   type = 'info',
   title,
   description,
}: ToastCustomProps) {
   const icons = {
      success: <CheckCircle2 className="h-7 w-7 text-green-600" />,
      error: <XCircle className="h-7 w-7 text-red-600" />,
      info: <Info className="h-7 w-7 text-blue-600" />,
      warning: <TiWarning className="h-7 w-7 text-yellow-600" />,
   };

   return (
      <div
         className={cn(
            'flex w-[500px] max-w-full items-start gap-4 rounded-xl border p-10 shadow-xl',
            type === 'success' && 'border-green-500/20 bg-green-200',
            type === 'error' && 'border-red-500/20 bg-red-200',
            type === 'info' && 'border-blue-500/20 bg-blue-200'
         )}
      >
         {icons[type]}
         <div className="flex flex-col">
            <span className="text-xl font-bold tracking-wider select-none">
               {title}
            </span>
            {description && (
               <span className="mt-2 text-base font-semibold tracking-widest select-none">
                  {description}
               </span>
            )}
         </div>
      </div>
   );
}
