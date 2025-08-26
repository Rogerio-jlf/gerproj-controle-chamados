import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { corrigirTextoCorrompido } from '@/lib/corrigirTextoCorrompido';
// ================================================================================

interface Props {
  assunto: string;
  codChamado: number;
  onUpdateAssunto?: (codChamado: number, novoAssunto: string) => Promise<void>;
}
// ================================================================================

export default function AssuntoCellEditavel({
  assunto,
  codChamado,
  onUpdateAssunto,
}: Props) {
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
  // ================================================================================

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
            <FaEdit
              className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-700 opacity-0 transition-opacity duration-200 group-hover:opacity-60"
              size={20}
            />
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          align="center"
          sideOffset={8}
          className="bg-white text-sm font-semibold tracking-wider text-gray-900 select-none"
        >
          <div>
            <div className="break-words">
              {corrigirTextoCorrompido(assunto)}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-wider text-gray-700 italic select-none">
              Clique para editar
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="!max-w-4xl bg-white p-6 shadow-md shadow-black">
          <AlertDialogHeader className="space-y-4 pb-6">
            <AlertDialogTitle className="flex items-center justify-center gap-4 text-center text-2xl font-bold tracking-wider text-gray-900 select-none">
              <FaEdit className="text-gray-900" size={32} />
              Editar Assunto - Chamado #{codChamado}
            </AlertDialogTitle>

            <div className="grid gap-4 py-4">
              <div className="flex flex-col justify-center space-y-1">
                <label
                  htmlFor="assunto"
                  className="text-base font-bold tracking-wider text-gray-900 select-none"
                >
                  Assunto do Chamado
                </label>
                <Textarea
                  id="assunto"
                  value={novoAssunto}
                  onChange={e => setNovoAssunto(e.target.value)}
                  placeholder="Digite o assunto do chamado..."
                  className="min-h-[120px] resize-none bg-gray-50 shadow-md shadow-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                  maxLength={500}
                />
                <div className="mt-2 flex justify-between">
                  <span className="text-sm font-semibold tracking-widest text-gray-900 italic select-none">
                    Máximo de 500 caracteres
                  </span>
                  <span
                    className={`text-sm font-semibold tracking-widest ${novoAssunto.length > 450 ? 'text-orange-600' : 'text-gray-900'} italic select-none`}
                  >
                    {novoAssunto.length}/500
                  </span>
                </div>
              </div>
            </div>

            <AlertDialogDescription className="text-center text-base font-semibold tracking-wider text-gray-900 select-none">
              Esta ação será salva no banco de dados e não poderá ser desfeita
              automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-6">
            <AlertDialogCancel
              onClick={handleCancel}
              className="cursor-pointer rounded-md border-none bg-red-600 px-6 py-2 text-lg font-extrabold tracking-widest text-white transition-all select-none hover:scale-105 hover:bg-red-800 hover:shadow-md hover:shadow-black"
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleSave}
              disabled={isLoading || novoAssunto.trim().length === 0}
              className="cursor-pointer rounded-md border-none bg-green-600 px-6 py-2 text-lg font-extrabold tracking-widest text-white transition-all select-none hover:scale-105 hover:bg-green-800 hover:shadow-lg hover:shadow-black"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Salvando...
                </div>
              ) : (
                'Salvar Alteração'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
