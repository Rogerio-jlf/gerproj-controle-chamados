import { ColumnDef } from '@tanstack/react-table';
// ================================================================================
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
// ================================================================================
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import { formatarDataParaBR } from '../../../../utils/formatters';
// ================================================================================
import { FaDownload } from 'react-icons/fa';
// ================================================================================
// ================================================================================

export interface ChamadosProps {
    COD_CHAMADO: number;
    DATA_CHAMADO: string;
    STATUS_CHAMADO: string;
    CODTRF_CHAMADO: number;
    COD_CLIENTE: number;
    ASSUNTO_CHAMADO: string;
    NOME_TAREFA: string;
    NOME_CLIENTE: string;
}
// =====

interface ColunasProps {
    onCriarOS?: (chamado: ChamadosProps) => void;
}
// ================================================================================

// Função para definir a cor de fundo com base no status
export const getStylesStatus = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
        case 'NAO FINALIZADO':
            return 'bg-yellow-600 text-white ring-1 ring-white';

        case 'EM ATENDIMENTO':
            return 'bg-blue-600 text-white ring-1 ring-white';

        case 'FINALIZADO':
            return 'bg-green-600 text-white ring-1 ring-white';

        case 'NAO INICIADO':
            return 'bg-red-600 text-white ring-1 ring-white';

        case 'STANDBY':
            return 'bg-orange-600 text-white ring-1 ring-white';

        case 'ATRIBUIDO':
            return 'bg-blue-600 text-white ring-1 ring-white';

        case 'AGUARDANDO VALIDACAO':
            return 'bg-purple-600 text-white ring-1 ring-white';

        default:
            return 'bg-gray-600 text-white ring-1 ring-white';
    }
};
// ================================================================================

// ===== COMPONENTE DE COLUNAS DA TABELA =====
export const colunasTabela = (): ColumnDef<ChamadosProps>[] => [
    // Código do chamado
    {
        accessorKey: 'COD_CHAMADO',
        header: () => <div className="text-center">Código</div>,
        cell: ({ getValue }) => (
            <div className="rounded-md bg-pink-600 p-2 text-center text-white ring-1 ring-white">
                {getValue() as string}
            </div>
        ),
    },
    // =====

    // Data do chamado
    {
        accessorKey: 'DATA_CHAMADO',
        header: () => <div className="text-center">Data</div>,
        cell: ({ getValue }) => {
            const dateString = getValue() as string;
            const dataFormatada = formatarDataParaBR(dateString);

            return (
                <div className="rounded-md bg-blue-600 p-2 text-center text-white ring-1 ring-white">
                    {dataFormatada}
                </div>
            );
        },
    },
    // =====

    // Status do chamado
    {
        accessorKey: 'STATUS_CHAMADO',
        header: () => <div className="text-center">Status</div>,
        cell: ({ getValue }) => {
            const status = getValue() as string;
            const bgColor = getStylesStatus(status);

            return (
                <div
                    className={`rounded-md ${bgColor} p-2 text-center text-white ring-1 ring-white`}
                >
                    {status || 'Desconhecido'}
                </div>
            );
        },
    },
    // =====

    // Assunto do chamado
    {
        accessorKey: 'ASSUNTO_CHAMADO',
        header: () => <div className="text-center">Assunto</div>,
        cell: ({ getValue }) => {
            const value = getValue() as string;
            const textoCorrigido = corrigirTextoCorrompido(value);

            return (
                <div className="truncate px-2 py-1">
                    {textoCorrigido || '-'}
                </div>
            );
        },
    },
    // =====

    // Nome da tarefa
    {
        accessorKey: 'NOME_TAREFA',
        header: () => <div className="text-center">Nome Tarefa</div>,
        cell: ({ getValue }) => {
            const value = getValue() as string;
            const textoCorrigido = corrigirTextoCorrompido(value);

            return (
                <div className="truncate px-2 py-1">
                    {textoCorrigido || '-'}
                </div>
            );
        },
    },
    // =====

    // Nome do cliente
    {
        accessorKey: 'NOME_CLIENTE',
        header: () => <div className="text-center">Cliente</div>,
        cell: ({ getValue }) => {
            const value = getValue() as string;
            const textoCorrigido = corrigirTextoCorrompido(value);

            return (
                <div className="truncate px-2 py-1">
                    {textoCorrigido || '-'}
                </div>
            );
        },
    },
    // =====

    // Ações
    {
        id: 'actions',
        header: () => <div className="text-center">Ações</div>,
        cell: ({ row }) => {
            const chamado = row.original;

            const handleDownload = () => {
                const blob = new Blob([JSON.stringify(chamado, null, 2)], {
                    type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chamado_${chamado.COD_CHAMADO}.json`;
                a.click();
                URL.revokeObjectURL(url);
            };

            return (
                <div className="flex items-center justify-center gap-4">
                    {/* Botão Download */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleDownload}
                                className="cursor-pointer transition-all hover:scale-110"
                            >
                                <FaDownload size={24} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent
                            side="left"
                            align="end"
                            sideOffset={8}
                            className="border-t-4 border-blue-600 bg-white text-sm font-semibold tracking-wider text-gray-900 shadow-lg shadow-black select-none"
                        >
                            Baixar Arquivos
                        </TooltipContent>
                    </Tooltip>
                </div>
            );
        },
    },
];
