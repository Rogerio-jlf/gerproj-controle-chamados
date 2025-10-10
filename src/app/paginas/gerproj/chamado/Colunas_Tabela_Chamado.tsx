import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { SpeedDial } from 'primereact/speeddial';
import { MenuItem } from 'primereact/menuitem';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { useRef, useState } from 'react';
// ================================================================================
import { TabelaChamadoProps } from '../../../../types/types';
// ================================================================================
import {
   formatarDataParaBR,
   formatCodChamado,
} from '../../../../utils/formatters';
import { corrigirTextoCorrompido } from '../../../../lib/corrigirTextoCorrompido';
import { ModalAtualizarStatusApontarOsChamado } from './Modal_Atualizar_Status_Apontar_Os_Chamado';
// ================================================================================
import { IoCall } from 'react-icons/io5';
import { GrServices } from 'react-icons/gr';
import { HiMiniSquaresPlus } from 'react-icons/hi2';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import { FaDownload, FaTasks, FaBrain } from 'react-icons/fa';

// Importar CSS do PrimeReact
import 'primereact/resources/themes/saga-orange/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// ================================================================================
// INTERFACES
// ================================================================================
interface AcoesTabelaChamadosProps {
   onVisualizarChamado: (codChamado: number) => void;
   onVisualizarOSChamado: (codChamado: number) => void;
   onVisualizarOS: () => void;
   onVisualizarTarefa: () => void;
   onAtribuicaoInteligente: (chamado: TabelaChamadoProps) => void;
   onUpdateStatus?: (
      codChamado: number,
      newStatus: string,
      codClassificacao?: number,
      codTarefa?: number
   ) => Promise<void>;
   onOpenApontamentos?: (codChamado: number, newStatus: string) => void;
   onExcluirChamado: (codChamado: number) => void;
   userType?: string;
}

interface SpeedDialMenuProps {
   chamado: TabelaChamadoProps;
   acoes: AcoesTabelaChamadosProps;
}

// ================================================================================
// COMPONENTE SPEEDDIAL CUSTOMIZADO
// ================================================================================
const SpeedDialMenu = ({ chamado, acoes }: SpeedDialMenuProps) => {
   const toast = useRef<Toast>(null);
   const [isOpen, setIsOpen] = useState(false);

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

   const handleDeleteClick = () => {
      acoes.onExcluirChamado(chamado.COD_CHAMADO);
   };

   // Configurar itens do menu
   const items: MenuItem[] = [
      {
         label: 'Visualizar Chamado',
         icon: 'pi pi-eye',
         command: () => {
            acoes.onVisualizarChamado(chamado.COD_CHAMADO);
         },
         className: 'speeddial-item-blue speeddial-tooltip',
         tooltip: 'Visualizar detalhes do chamado',
      },
      {
         label: "Visualizar OS's",
         icon: 'pi pi-briefcase',
         command: () => {
            acoes.onVisualizarOSChamado(chamado.COD_CHAMADO);
         },
         className: 'speeddial-item-green speeddial-tooltip',
         tooltip: 'Ver ordens de serviço relacionadas',
      },
      {
         label: 'Visualizar Tarefas',
         icon: 'pi pi-list-check',
         command: () => {
            acoes.onVisualizarTarefa();
         },
         className: 'speeddial-item-orange speeddial-tooltip',
         tooltip: 'Ver tarefas do chamado',
      },
      {
         label: "Download Arquivo's",
         icon: 'pi pi-download',
         command: handleDownload,
         className: 'speeddial-item-purple speeddial-tooltip',
         tooltip: 'Baixar arquivos do chamado',
      },
   ];

   // Adicionar item de atribuição se for ADM
   if (acoes.userType === 'ADM') {
      items.push({
         label: 'Atribuir Chamado',
         icon: 'pi pi-users',
         command: () => {
            acoes.onAtribuicaoInteligente?.(chamado);
         },
         className: 'speeddial-item-pink speeddial-tooltip',
         tooltip: 'Atribuir chamado a um consultor',
      });
   }

   // Adicionar item de exclusão se for ADM
   if (acoes.userType === 'ADM') {
      items.push({
         label: 'Excluir Chamado',
         icon: 'pi pi-trash',
         command: handleDeleteClick,
         className: 'speeddial-item-red speeddial-tooltip',
         tooltip: 'Excluir este chamado permanentemente',
      });
   }

   return (
      <>
         <Toast ref={toast} />

         {/* Tooltip para os botões do SpeedDial */}
         <Tooltip
            target=".speeddial-tooltip"
            position="bottom"
            showDelay={100}
         />

         {/* Overlay escuro quando o SpeedDial está aberto */}
         {isOpen && (
            <div
               className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs"
               onClick={() => setIsOpen(false)}
            />
         )}

         <style jsx global>{`
            /* SpeedDial customizado com z-index e posicionamento */
            .speeddial-custom {
               position: static !important;
               z-index: 1000;
            }

            .p-speeddial {
               position: static !important;
            }

            .p-speeddial-list {
               position: fixed !important;
               z-index: 1050 !important;
               right: 12rem !important;
            }

            .p-speeddial-action {
               z-index: 1051 !important;
               width: 5rem !important;
               height: 5rem !important;
            }

            .speeddial-button-custom {
               border: none;
               width: 3rem;
               height: 3rem;
               position: relative;
               z-index: 1052 !important;
            }

            .speeddial-button-custom:hover {
               background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
               transform: scale(1.1);
            }

            .p-speeddial-item {
               margin: 0.3rem;
            }
         `}</style>
         <SpeedDial
            model={items}
            direction="left"
            showIcon={<HiMiniSquaresPlus size={20} />}
            hideIcon="pi pi-times"
            buttonClassName="p-button-rounded speeddial-button-custom"
            className="speeddial-custom"
            type="linear"
            onShow={() => setIsOpen(true)}
            onHide={() => setIsOpen(false)}
         />
      </>
   );
};

// ================================================================================
// COMPONENTE PRINCIPAL
// ================================================================================
export const colunasTabelaChamados = (
   acoes: AcoesTabelaChamadosProps,
   userType?: string
): ColumnDef<TabelaChamadoProps>[] => {
   // Array base de colunas
   const baseColumns: ColumnDef<TabelaChamadoProps>[] = [
      // Chamado
      {
         accessorKey: 'COD_CHAMADO',
         header: () => <div className="text-center">Chamado</div>,
         cell: ({ getValue }) => {
            const value = getValue() as number;
            return (
               <div className="flex items-center justify-center text-center">
                  {formatCodChamado(value) || '-----'}
               </div>
            );
         },
      },

      // Data chamado
      {
         accessorKey: 'DATA_CHAMADO',
         header: () => <div className="text-center">Data</div>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            const dataFormatada = formatarDataParaBR(value);

            return (
               <div className="flex items-center justify-center text-center">
                  {dataFormatada || '----------'}
               </div>
            );
         },
      },

      // Assunto
      {
         accessorKey: 'ASSUNTO_CHAMADO',
         header: () => <div className="text-center">Assunto</div>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            const isEmpty = !value;
            return (
               <div
                  className={`flex items-center ${isEmpty ? 'justify-center text-center' : 'justify-start text-left'}`}
               >
                  {isEmpty ? (
                     '------------------------------'
                  ) : (
                     <span className="block w-full truncate">{value}</span>
                  )}
               </div>
            );
         },
      },

      // Status (clicável)
      {
         accessorKey: 'STATUS_CHAMADO',
         header: () => <div className="text-center">Status</div>,
         cell: ({ row }) => (
            <ModalAtualizarStatusApontarOsChamado
               status={row.original.STATUS_CHAMADO}
               codChamado={row.original.COD_CHAMADO}
               nomeCliente={row.original.NOME_CLIENTE ?? '-'}
               onUpdateSuccess={() => {}}
            />
         ),
      },

      // Data Atribuição
      {
         accessorKey: 'DTENVIO_CHAMADO',
         header: () => <div className="text-center">DT. Atribuição</div>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            const dataFormatada = formatarDataParaBR(value);

            if (
               dataFormatada !== null &&
               dataFormatada !== undefined &&
               dataFormatada !== '-'
            ) {
               return (
                  <div className="flex items-center justify-center text-center">
                     {dataFormatada}
                  </div>
               );
            }
            return (
               <div className="flex items-center justify-center rounded-sm bg-yellow-500 p-1 text-center text-black uppercase italic">
                  Não atribuído
               </div>
            );
         },
      },
   ];

   // Coluna de Recurso
   const recursoColumn: ColumnDef<TabelaChamadoProps> = {
      accessorKey: 'NOME_RECURSO',
      header: () => <div className="text-center">Consultor</div>,
      cell: ({ row }) => {
         const recurso = row.original.NOME_RECURSO;
         const codRecurso = row.original.COD_RECURSO;

         if (codRecurso !== null && codRecurso !== undefined && recurso) {
            return (
               <div className="flex items-center justify-start text-left">
                  {corrigirTextoCorrompido(
                     recurso.split(' ').slice(0, 2).join(' ')
                  )}
               </div>
            );
         }

         return (
            <div className="flex items-center justify-center rounded-sm bg-yellow-500 p-1 text-center text-black uppercase italic">
               Não atribuído
            </div>
         );
      },
   };

   // Colunas finais
   const finalColumns: ColumnDef<TabelaChamadoProps>[] = [
      // Email
      {
         accessorKey: 'EMAIL_CHAMADO',
         header: () => <div className="text-center">Email</div>,
         cell: ({ getValue }) => {
            const value = getValue() as string;
            const isEmpty = !value;

            return (
               <Link
                  href={`mailto:${value}`}
                  className={`flex items-center ${isEmpty ? 'justify-center text-center' : 'justify-start text-left'}`}
               >
                  {isEmpty ? (
                     '------------------------------'
                  ) : (
                     <span className="block w-full truncate">{value}</span>
                  )}
               </Link>
            );
         },
      },

      // Ações - USANDO SPEEDDIAL
      {
         id: 'actions',
         header: () => <div className="text-center">Ações</div>,
         cell: ({ row }) => {
            const chamado = row.original;
            return (
               <div className="flex items-center justify-center">
                  <SpeedDialMenu chamado={chamado} acoes={acoes} />
               </div>
            );
         },
      },
   ];

   // Montar array final de colunas condicionalmente
   const allColumns = [
      ...baseColumns,
      ...(userType === 'ADM' || acoes.userType === 'ADM'
         ? [recursoColumn]
         : []),
      ...finalColumns,
   ];

   return allColumns;
};
