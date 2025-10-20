'use client';

import { useRef, useState, useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ConditionalTooltipProps {
   content: string;
   children: React.ReactNode;
}

export function ConditionalTooltip({
   content,
   children,
}: ConditionalTooltipProps) {
   const textRef = useRef<HTMLSpanElement>(null);
   const [showTooltip, setShowTooltip] = useState(false);

   useEffect(() => {
      const checkOverflow = () => {
         if (textRef.current) {
            const isOverflowing =
               textRef.current.scrollWidth > textRef.current.clientWidth ||
               textRef.current.scrollHeight > textRef.current.clientHeight;
            setShowTooltip(isOverflowing);
         }
      };

      checkOverflow();
      window.addEventListener('resize', checkOverflow);

      return () => window.removeEventListener('resize', checkOverflow);
   }, [content]);

   if (!showTooltip) {
      return (
         <span ref={textRef} className="truncate">
            {children}
         </span>
      );
   }

   return (
      <Tooltip.Provider delayDuration={200}>
         <Tooltip.Root>
            <Tooltip.Trigger asChild>
               <span ref={textRef} className="cursor-help truncate">
                  {children}
               </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
               <Tooltip.Content
                  side="top"
                  align="end"
                  className="animate-in fade-in-0 zoom-in-95 z-[70] max-w-[800px] rounded-lg bg-black px-6 py-2 text-sm font-semibold tracking-widest text-white shadow-sm shadow-black"
                  sideOffset={5}
               >
                  <div className="break-words">{content}</div>
                  <Tooltip.Arrow className="fill-red-500" />
               </Tooltip.Content>
            </Tooltip.Portal>
         </Tooltip.Root>
      </Tooltip.Provider>
   );
}
