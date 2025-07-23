import { Info, MessageSquare } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';

interface ObservacaoCellProps {
  value: string;
  maxLength?: number;
  showIcon?: boolean;
}

export const ObservacaoCell = ({
  value,
  maxLength = 30,
  showIcon = true,
}: ObservacaoCellProps) => {
  const hasContent = value && value.trim() !== '' && value !== 'N/A';

  if (!hasContent) {
    return (
      <span className="text-sm font-semibold tracking-wider text-black italic">
        Sem observação
      </span>
    );
  }

  const isTruncated = value.length > maxLength;
  const truncatedText = isTruncated
    ? `${value.substring(0, maxLength)}...`
    : value;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="group/obs flex cursor-pointer items-center gap-2">
          <span className="whitespace-nowrap">{truncatedText}</span>
          {isTruncated && showIcon && (
            <Info className="h-4 w-4 text-blue-500" />
          )}
        </div>
      </TooltipTrigger>

      <TooltipContent className="max-w-sm border border-red-500 bg-white">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-1.5 h-4 w-4 flex-shrink-0 text-black" />
          <div>
            <div className="mb-2 text-base font-bold tracking-wider text-black">
              Observação
            </div>
            <p className="text-sm leading-relaxed tracking-wider text-black">
              {value}
            </p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
