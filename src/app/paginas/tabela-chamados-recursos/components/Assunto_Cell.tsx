import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';

import { corrigirTextoCorrompido } from '@/lib/corrigirTextoCorrompido';

interface AssuntoEditavelProps {
  assunto: string;
  codChamado: number;
  onUpdateAssunto?: (codChamado: number, novoAssunto: string) => Promise<void>;
}

const AssuntoEditavel = ({
  assunto,
  codChamado,
  onUpdateAssunto,
}: AssuntoEditavelProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoAssunto, setNovoAssunto] = useState(assunto);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!onUpdateAssunto) {
      console.warn('Função onUpdateAssunto não foi fornecida');
      return;
    }

    if (novoAssunto.trim() === assunto.trim()) {
      setIsModalOpen(false);
      return;
    }

    if (novoAssunto.trim().length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateAssunto(codChamado, novoAssunto.trim());
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar assunto:', error);
      // Aqui você pode adicionar uma notificação de erro (toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNovoAssunto(assunto);
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setNovoAssunto(assunto);
    setIsModalOpen(true);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="group relative cursor-pointer truncate rounded p-2 text-left transition-colors duration-200 hover:bg-slate-50"
            onClick={handleOpenModal}
          >
            <span className="block pr-6">
              {corrigirTextoCorrompido(assunto)}
            </span>
            <FaEdit className="absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-slate-500 opacity-0 transition-opacity duration-200 group-hover:opacity-60" />
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          align="end"
          sideOffset={12}
          className="max-w-xs border border-slate-300 bg-white text-base font-semibold tracking-wider text-slate-800"
        >
          <div>
            <div className="break-words">
              {corrigirTextoCorrompido(assunto)}
            </div>
            <div className="mt-1 text-xs font-normal text-slate-500">
              Clique para editar
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FaEdit className="h-4 w-4" />
              Editar Assunto - Chamado #{codChamado}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="assunto"
                className="text-sm font-medium text-slate-700"
              >
                Assunto do Chamado
              </label>
              <Textarea
                id="assunto"
                value={novoAssunto}
                onChange={e => setNovoAssunto(e.target.value)}
                placeholder="Digite o assunto do chamado..."
                className="min-h-[120px] resize-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Máximo 500 caracteres</span>
                <span
                  className={novoAssunto.length > 450 ? 'text-orange-600' : ''}
                >
                  {novoAssunto.length}/500
                </span>
              </div>
            </div>

            {/* Preview do texto corrigido */}
            {novoAssunto.trim() && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Preview (texto corrigido):
                </label>
                <div className="rounded-md border bg-slate-50 p-3 text-sm">
                  {corrigirTextoCorrompido(novoAssunto)}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || novoAssunto.trim().length === 0}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssuntoEditavel;
