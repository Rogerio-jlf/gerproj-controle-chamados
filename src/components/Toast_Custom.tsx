import { cn } from '@/lib/utils';
// ================================================================================
import {
   BsCheckCircleFill,
   BsXCircleFill,
   BsInfoCircleFill,
   BsExclamationTriangleFill,
} from 'react-icons/bs';

// ================================================================================
// INTERFACES
// ================================================================================
interface ToastCustomProps {
   type?: 'success' | 'error' | 'info' | 'warning';
   title: string;
   description?: string;
   information?: string;
}

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export function ToastCustom({
   type = 'info',
   title,
   description,
   information,
}: ToastCustomProps) {
   const icons = {
      success: <BsCheckCircleFill className="text-green-600" size={32} />,
      error: <BsXCircleFill className="text-red-600" size={32} />,
      info: <BsInfoCircleFill className="text-blue-600" size={32} />,
      warning: (
         <BsExclamationTriangleFill className="text-yellow-600" size={32} />
      ),
   };

   // ================================================================================
   // RENDERIZAÇÃO
   // ================================================================================
   return (
      <div
         className={cn(
            'flex w-[700px] items-start gap-4 rounded-xl border p-10 shadow-xl shadow-black',
            type === 'success' && 'border-green-500/20 bg-green-200',
            type === 'error' && 'border-red-500/20 bg-red-200',
            type === 'info' && 'border-blue-500/20 bg-blue-200'
         )}
      >
         {icons[type]}
         <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold tracking-widest italic select-none">
               {title}
            </h3>
            {/* ===== */}
            {description && (
               <p className="text-lg font-bold tracking-widest italic select-none">
                  {description}
               </p>
            )}
            {/* ===== */}
            {information && (
               <span className="text-base font-bold tracking-widest italic select-none">
                  {information}
               </span>
            )}
         </div>
      </div>
   );
}
