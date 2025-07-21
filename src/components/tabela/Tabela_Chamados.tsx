'use client';

import { useAuth } from '@/context/AuthContext';
import { corrigirTextoCorrompido } from '@/utils/corrigirTextoCorrompido';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { TableRowProps, columns } from './Colunas_Tabela';
import { ExportaExcelButton } from './Exportar_Excel_Button';
import { ExportaPDFButton } from './Exportar_PDF_Button';
import ModalChamado from './Modal_Chamado';
import StatusBadge from './Status_Badge';

// Interface para os filtros recebidos como props.
interface FiltersProps {
  ano: string;
  mes: string;
  cliente?: string;
  recurso?: string;
  status?: string;
}

// Função utilitária para criar os headers de autenticação para requisições.
const createAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'x-is-logged-in': localStorage.getItem('isLoggedIn') || 'false',
    'x-is-admin': localStorage.getItem('isAdmin') || 'false',
    'x-user-email': localStorage.getItem('userEmail') || '',
    'x-cod-cliente': localStorage.getItem('codCliente') || '',
  };
};

// Componente principal da tabela de chamados.
export default function TabelaChamados({
  ano,
  mes,
  cliente,
  recurso,
  status,
}: FiltersProps) {
  // Estados para dados, loading, erro, modal, linha selecionada e total de horas.
  const [data, setData] = useState<TableRowProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableRowProps | null>(null);
  const [totalHorasGeral, setTotalHorasGeral] = useState('');

  // Obtém informações de autenticação do contexto.
  const { isAdmin, codCliente, isLoggedIn } = useAuth();

  // Normaliza valores dos filtros para evitar undefined.
  const clienteValue = cliente ?? '';
  const recursoValue = recurso ?? '';
  const statusValue = status ?? '';
  const isLoggedInValue = isLoggedIn ?? false;
  const isAdminValue = isAdmin ?? false;
  const codClienteValue = codCliente ?? '';

  // Função para abrir o modal com os dados da linha selecionada.
  const openModal = (row: TableRowProps) => {
    console.log('Dados da linha clicada:', row);
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  // Função para fechar o modal e limpar a linha selecionada.
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  // Efeito para buscar os dados dos chamados quando filtros mudam.
  useEffect(() => {
    if (!isLoggedInValue) {
      setError('Você precisa estar logado para visualizar os chamados');
      return;
    }

    // Monta os parâmetros da query string conforme filtros e permissões.
    const params = new URLSearchParams({
      ano,
      mes,
      isAdmin: isAdminValue.toString(),
      ...(isAdminValue && codClienteValue
        ? { codCliente: codClienteValue }
        : {}),
      ...(clienteValue ? { cliente: clienteValue } : {}),
      ...(recursoValue ? { recurso: recursoValue } : {}),
      ...(statusValue ? { status: statusValue } : {}),
    });

    // Adiciona codCliente para não-admins.
    if (!isAdminValue && codClienteValue) {
      params.append('codCliente', codClienteValue);
    }

    setLoading(true);
    setError(null);

    // Faz a requisição para a API de chamados.
    axios
      .get(`/api/tabela/tabela_chamado?${params.toString()}`, {
        headers: createAuthHeaders(),
      })
      .then((response) => {
        const apiData = response.data as {
          apontamentos: TableRowProps[];
          totalHorasGeral: string;
        };
        setData(apiData.apontamentos);
        setTotalHorasGeral(apiData.totalHorasGeral);
      })
      .catch((err) => {
        console.error('Erro ao carregar chamados:', err);
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          'Erro ao carregar chamados';
        setError(errorMessage);
        setData([]);
      })
      .then(() => setLoading(false));
  }, [
    ano,
    mes,
    clienteValue,
    recursoValue,
    statusValue,
    isLoggedInValue,
    isAdminValue,
    codClienteValue,
  ]);

  // Corrige possíveis textos corrompidos no campo 'obs' dos dados.
  const dataCorrigida = useMemo(() => {
    return data.map((item) => ({
      ...item,
      obs: corrigirTextoCorrompido(item.obs),
    }));
  }, [data]);

  // Inicializa a tabela usando TanStack Table.
  const table = useReactTable<TableRowProps>({
    data: dataCorrigida,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Renderiza mensagem de acesso restrito se não estiver logado.
  if (!isLoggedIn) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-white">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-24 w-24 text-gray-300">
              <svg
                className="h-full w-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Acesso Restrito
            </h3>
            <p className="text-gray-500">
              Você precisa estar logado para visualizar os chamados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Renderiza indicador de carregamento enquanto busca dados.
  if (loading) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-white">
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="font-medium text-gray-600">
              Carregando chamados...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Renderiza mensagem de erro caso ocorra algum problema na requisição.
  if (error) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-white">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-24 w-24 text-red-300">
              <AlertCircle className="h-full w-full" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Erro ao Carregar Chamados
            </h3>
            <p className="mx-auto max-w-md text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderiza a tabela de chamados, exportações e modal.
  return (
    <>
      {/* Bloco principal da tabela e cabeçalho */}
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-white">
        {/* Cabeçalho com título, totais e botões de exportação */}
        <div className="border-b border-gray-400 bg-indigo-300 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Chamados - {mes}/{ano}
              </h3>
              {/* Exibe total de chamados */}
              <p className="text-md mt-1 font-semibold text-gray-800 italic">
                {data.length > 0 && (
                  <>
                    {' • '}
                    Total de chamados: {data.length}{' '}
                  </>
                )}
              </p>
              {/* Exibe total de recursos utilizados */}
              <p className="text-md mt-1 font-semibold text-gray-800 italic">
                {data.length > 0 && (
                  <>
                    {' • '}
                    Total de recursos utilizados:{' '}
                    {
                      Array.from(
                        new Set(data.map((item) => item.nome_recurso || '')),
                      ).filter(Boolean).length
                    }
                  </>
                )}
              </p>
              {/* Exibe total de horas executadas */}
              <p className="text-md mt-1 font-semibold text-gray-800 italic">
                {data.length > 0 && (
                  <>
                    {' • '}
                    Total de horas executadas: {totalHorasGeral || '0 horas'}
                  </>
                )}
              </p>
            </div>

            {/* Botões de exportação para Excel e PDF */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <ExportaExcelButton
                  data={data}
                  fileName={`relatorio_${mes}_${ano}`}
                  buttonText="Exportar para Excel"
                  columns={[
                    { key: 'chamado_os', label: 'N° OS' },
                    { key: 'nome_cliente', label: 'Nome Completo' },
                    { key: 'dtini_os', label: 'Data' },
                    { key: 'status_chamado', label: 'Status' },
                    { key: 'hrini_os', label: 'Hora Início' },
                    { key: 'hrfim_os', label: 'Hora Fim' },
                    { key: 'total_horas', label: 'Duração' },
                    { key: 'obs', label: 'Observação' },
                  ]}
                  className="ml-2"
                  autoFilter={true}
                  freezeHeader={true}
                />

                <ExportaPDFButton
                  data={data}
                  fileName={`relatorio_chamados_${mes}_${ano}`}
                  title={`Relatório de Chamados - ${mes}/${ano}`}
                  columns={[
                    { key: 'chamado_os', label: 'N° OS' },
                    { key: 'nome_cliente', label: 'Cliente' },
                    { key: 'dtini_os', label: 'Data' },
                    { key: 'status_chamado', label: 'Status' },
                    { key: 'hrini_os', label: 'Hora Início' },
                    { key: 'hrfim_os', label: 'Hora Fim' },
                    { key: 'total_horas', label: 'Duração' },
                    { key: 'obs', label: 'Observação' },
                  ]}
                  logoUrl="/caminho/para/logo.png"
                  footerText="Gerado pelo sistema em"
                  className="ml-2"
                />
              </div>
            </div>

            {/* Exibe status de administrador */}
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-2 lg:px-4">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
              <span className="text-xs font-semibold text-emerald-700 lg:text-sm">
                {isAdmin ? 'Administrador' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Corpo da tabela com rolagem */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className="flex-1 overflow-y-auto lg:max-h-none"
            style={{ maxHeight: 'calc(100vh - 280px)' }}
          >
            <table className="w-full border-separate border-spacing-0 text-sm">
              {/* Cabeçalho da tabela */}
              <thead className="sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        className={`border-b border-gray-400 bg-blue-200 px-6 py-4 text-left font-semibold text-gray-700 backdrop-blur-sm ${
                          index === 0 ? 'pl-6' : ''
                        } ${index === headerGroup.headers.length - 1 ? 'pr-6' : ''}`}
                      >
                        <div className="flex items-center space-x-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              {/* Corpo da tabela com linhas de dados */}
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={`group transition-all duration-200 ease-in-out hover:bg-blue-300/50 ${
                      rowIndex % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'
                    } cursor-pointer`}
                    onClick={() => openModal(row.original)}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <td
                        key={cell.id}
                        className={`px-6 py-2.5 whitespace-nowrap text-gray-900 ${
                          cellIndex === 0 ? 'pl-6' : ''
                        } ${cellIndex === row.getVisibleCells().length - 1 ? 'pr-6' : ''}`}
                      >
                        {/* Renderiza badge de status ou valor padrão da célula */}
                        {cell.column.id === 'status' ? (
                          <StatusBadge status={cell.getValue() as string} />
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para exibir detalhes do chamado selecionado */}
      <ModalChamado
        isOpen={isModalOpen}
        selectedRow={selectedRow}
        onClose={closeModal}
      />
    </>
  );
}
