import { useState } from 'react';
// ================================================================================
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
// ================================================================================
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
// ================================================================================
import { FaEdit, FaExclamationTriangle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
// ================================================================================
// ================================================================================

interface Props {
  assunto: string;
  codChamado: number;
  onUpdateAssunto?: (codChamado: number, novoAssunto: string) => Promise<void>;
  onClose: () => void;
}
// ================================================================================

export default function AssuntoCellEditavel({
  onClose,
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

  const handleClose = () => {
    setTimeout(() => {
      setIsModalOpen(false);
      onClose();
    }, 300);
  };
  // ==============================

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="group relative cursor-pointer truncate rounded-md p-2 text-left transition-all"
            onClick={handleOpenModal}
          >
            <span className="block pr-6 font-medium">
              {corrigirTextoCorrompido(assunto)}
            </span>
            <FaEdit
              className="absolute top-1/2 right-2 -translate-y-1/2 text-black opacity-0 transition-opacity group-hover:opacity-100"
              size={20}
            />
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="left"
          align="end"
          sideOffset={8}
          className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
        >
          <div>
            <div className="max-w-xs break-words">
              {corrigirTextoCorrompido(assunto)}
            </div>
            <div className="mt-1 text-xs font-semibold tracking-wider text-gray-700 italic select-none">
              Clique para editar
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="!max-w-4xl border border-blue-500 bg-white p-6">
          <AlertDialogHeader className="space-y-4 pb-6">
            <AlertDialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaEdit className="text-gray-900" size={32} />
                <h3 className="text-2xl font-bold tracking-wider text-gray-900 select-none">
                  Editar Assunto - Chamado #{codChamado}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="group rounded-full bg-red-900 p-2 text-white transition-all select-none hover:scale-110 hover:rotate-180 hover:bg-red-500 active:scale-90"
              >
                <IoClose size={24} />
              </button>
            </AlertDialogTitle>

            <div className="grid gap-6 py-4">
              <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-md shadow-black">
                <div className="mb-6 flex flex-col items-center justify-center gap-4">
                  <div className="flex items-center justify-center gap-2">
                    <FaEdit className="text-blue-600" size={20} />
                    <h4 className="text-lg font-bold tracking-wider text-gray-900 select-none">
                      Você está editando o assunto do chamado
                    </h4>
                  </div>

                  <div className="rounded-lg bg-white p-4 shadow-inner">
                    <div className="text-center">
                      <p className="text-sm font-semibold tracking-wider text-gray-700 select-none">
                        Chamado
                      </p>
                      <div className="text-3xl font-bold tracking-widest text-gray-900 select-none">
                        #{codChamado}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
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
                      className="min-h-[120px] resize-none border-2 border-gray-300 bg-white shadow-md shadow-black transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                      maxLength={1000}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-semibold tracking-wider text-gray-700 select-none">
                          Máximo de 1000 caracteres
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${novoAssunto.length > 800 ? 'bg-red-500' : novoAssunto.length > 450 ? 'bg-orange-500' : 'bg-green-500'}`}
                        ></div>
                        <span
                          className={`text-sm font-semibold tracking-wider select-none ${
                            novoAssunto.length > 800
                              ? 'text-red-600'
                              : novoAssunto.length > 450
                                ? 'text-orange-600'
                                : 'text-green-600'
                          }`}
                        >
                          {novoAssunto.length}/1000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AlertDialogDescription className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4 text-center text-base font-semibold tracking-wider text-gray-900 select-none">
              <div className="flex items-center justify-center gap-2">
                <FaExclamationTriangle className="text-blue-600" size={16} />
                <span>
                  Esta alteração será salva no banco de dados e não poderá ser
                  desfeita automaticamente.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-6 pt-4">
            <AlertDialogCancel
              onClick={handleCancel}
              className="cursor-pointer rounded-md border-none bg-red-600 px-8 py-3 text-lg font-extrabold tracking-widest text-white transition-all select-none hover:scale-105 hover:bg-red-800 hover:shadow-lg hover:shadow-black active:scale-95"
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleSave}
              disabled={isLoading || novoAssunto.trim().length === 0}
              className="cursor-pointer rounded-md border-none bg-green-600 px-8 py-3 text-lg font-extrabold tracking-widest text-white transition-all select-none hover:scale-105 hover:bg-green-800 hover:shadow-lg hover:shadow-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FaEdit size={16} />
                  <span>Salvar Alteração</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
