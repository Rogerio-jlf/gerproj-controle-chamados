import { Input } from '@/components/ui/input';
import { useFiltersTabelaChamadosAbertos } from '@/contexts/Filters_Tabela_Chamados_Abertos_Context';
import { useState } from 'react';
import { Search, X, Hash, Loader2 } from 'lucide-react';
import { FiltersProps } from '@/contexts/Filters_Tabela_Chamados_Abertos_Context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';

export default function FiltroNumeroChamado() {
  const { filters, setFilters } = useFiltersTabelaChamadosAbertos();
  const [inputValue, setInputValue] = useState(filters.codChamado || '');
  const [isSearching, setIsSearching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsSearching(true);

      // Simula um delay para mostrar o loader
      await new Promise(resolve => setTimeout(resolve, 800));

      setFilters(
        (prev: FiltersProps): FiltersProps => ({
          ...prev,
          codChamado: inputValue.trim(),
        })
      );

      setIsSearching(false);
    }
  };

  const clearFilter = async () => {
    setIsClearing(true);

    // Simula um delay para mostrar o loader
    await new Promise(resolve => setTimeout(resolve, 600));

    setInputValue('');
    setFilters(
      (prev: FiltersProps): FiltersProps => ({
        ...prev,
        codChamado: '',
      })
    );

    setIsClearing(false);
  };

  // Verifica se há diferença entre o input e o filtro aplicado
  const hasUnappliedChanges = inputValue.trim() !== filters.codChamado;

  // --------------------------------------------------------------------------------

  return (
    // ===== CONTAINER PRINCIPAL =====
    <div className="group relative">
      {/* ===== LABEL ===== */}
      <div className="mb-2 flex items-center gap-2">
        {/* Icon hash */}
        <Hash className="h-5 w-5 text-cyan-400" />

        {/* Label */}
        <label className="text-sm font-semibold tracking-wider text-slate-200 select-none">
          Buscar por chamado
        </label>
      </div>
      {/* ---------- */}

      {/* ===== INPUT SEARCH ===== */}
      <div className="relative">
        {/* Icon loading / Icon search */}
        <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          ) : (
            <Search className="h-5 w-5 text-slate-300 transition-colors duration-300 group-hover:text-cyan-400" />
          )}
        </div>

        {/* Input search */}
        <Input
          type="number"
          placeholder="Digite o chamado..."
          className="h-11 w-full max-w-[300px] border border-white/30 bg-white/10 pr-10 pl-10 font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-300 [-moz-appearance:textfield] placeholder:text-sm placeholder:tracking-wider placeholder:text-slate-300 placeholder:italic hover:border-cyan-400 hover:bg-slate-900 hover:placeholder:text-cyan-400 focus:border-cyan-400 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSearching || isClearing}
        />

        {/* Button clear */}
        {inputValue && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={clearFilter}
                  disabled={isSearching || isClearing}
                  className="absolute top-1/2 right-3 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-red-300 text-black transition-all duration-300 hover:bg-red-500 hover:text-white"
                >
                  {isClearing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                sideOffset={8}
                className="border border-slate-600 bg-white text-sm font-semibold text-black"
              >
                Limpar filtro
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {/* ---------- */}

      {/* ===== INDICADORES DE STATUS ===== */}
      <div className="mt-2 flex items-center justify-between">
        {/* Filtro ativo */}
        {filters.codChamado && !isSearching && !isClearing && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            <span className="text-base font-semibold tracking-wider text-green-400 italic">
              Filtro ativo: #{filters.codChamado}
            </span>
          </div>
        )}

        {/* Carregando dados */}
        {isSearching && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400"></div>
            <span className="text-sm font-semibold tracking-wider text-cyan-400 italic">
              Pesquisando chamado...
            </span>
          </div>
        )}

        {/* Limpando filtro */}
        {isClearing && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-400"></div>
            <span className="text-sm font-semibold tracking-wider text-red-400 italic">
              Limpando filtro...
            </span>
          </div>
        )}

        {/* Alterações não aplicadas */}
        {hasUnappliedChanges &&
          inputValue.trim() &&
          !filters.codChamado &&
          !isSearching &&
          !isClearing && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400"></div>
              <span className="text-sm font-semibold tracking-wider text-yellow-400 italic">
                Pressione Enter para aplicar
              </span>
            </div>
          )}
      </div>
    </div>
  );
}
