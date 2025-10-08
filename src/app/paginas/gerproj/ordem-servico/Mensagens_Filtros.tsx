import React, { useMemo } from 'react';
import { FaFilterCircleXmark } from 'react-icons/fa6';
import { FaExclamationTriangle } from 'react-icons/fa';
import { BsEraserFill } from 'react-icons/bs';
import { formatCodChamado } from '../../../../utils/formatters';

// Componente para gerar mensagens personalizadas de filtro
export function MensagemFiltroNaoEncontrado({
   filters,
   clearFilters,
   ano,
   mes,
   dia,
}: {
   filters: {
      filterChamadoOs: string;
      filterCodOs: string;
      filterDtiniOs: string;
      filterDtincOs: string;
      filterCompOs: string;
      filterNomeCliente: string;
      filterFaturadoOs: string;
      filterNomeRecurso: string;
      filterValidOs: string;
      filterTarefaCompleta: string;
      filterProjetoCompleto: string;
   };
   clearFilters: () => void;
   ano: number | 'todos';
   mes: number | 'todos';
   dia: number | 'todos';
}) {
   // Mapeamento de nomes amigáveis para os campos
   const fieldNames = useMemo<Record<string, string>>(
      () => ({
         filterChamadoOs: 'Chamado',
         filterCodOs: 'Código da OS',
         filterDtiniOs: 'Data de Início',
         filterDtincOs: 'Data de Inclusão',
         filterCompOs: 'Complemento',
         filterNomeCliente: 'Nome do Cliente',
         filterFaturadoOs: 'Faturado',
         filterNomeRecurso: 'Nome do Recurso',
         filterValidOs: 'Validado',
         filterTarefaCompleta: 'Tarefa',
         filterProjetoCompleto: 'Projeto',
      }),
      []
   );

   // Identifica filtros ativos
   const activeFilters = useMemo(() => {
      return Object.entries(filters)
         .filter(([_, value]) => value && value.trim())
         .map(([key, value]) => ({
            field: fieldNames[key] || key,
            value: value.trim(),
         }));
   }, [fieldNames, filters]);

   // Gera a mensagem personalizada
   const filterMessage = useMemo(() => {
      if (activeFilters.length === 0) return null;

      // if (activeFilters.length === 1) {
      //    const { field, value } = activeFilters[0];
      //    return (
      //       <>
      //          Nenhuma OS encontrada para <strong>{field}</strong>{' '}
      //          <span className="font-black text-yellow-400">"{value}"</span>
      //       </>
      //    );
      // }

      // if (activeFilters.length === 2) {
      //    const [first, second] = activeFilters;
      //    return (
      //       <>
      //          Nenhuma OS foi encontrada para <strong>{first.field}</strong>{' '}
      //          contendo{' '}
      //          <span className="font-black text-yellow-400">
      //             "{first.value}"
      //          </span>{' '}
      //          e <strong>{second.field}</strong> contendo{' '}
      //          <span className="font-black text-yellow-400">
      //             "{second.value}"
      //          </span>
      //       </>
      //    );
      // }

      // Para 3 ou mais filtros, lista todos
      return (
         <>
            <div className="flex flex-col items-start justify-start gap-6">
               <span className="text-2xl font-bold tracking-widest text-white select-none">
                  Nenhuma OS foi encontrada com os seguintes filtros:
               </span>
               <ul className="flex flex-col items-start justify-start gap-2">
                  {activeFilters.map(({ field, value }, index) => (
                     <li
                        key={index}
                        className="pl-10 text-lg font-bold tracking-widest text-white select-none"
                     >
                        <span>{field}:</span>{' '}
                        <span className="font-bold tracking-widest text-yellow-400 italic select-none">
                           "{formatCodChamado(Number(value))}"
                        </span>
                     </li>
                  ))}
               </ul>
            </div>
         </>
      );
   }, [activeFilters]);

   // Gera período formatado
   const periodoFormatado = useMemo(() => {
      const parts: string[] = [];
      if (dia !== 'todos') parts.push(dia.toString().padStart(2, '0'));
      if (mes !== 'todos') parts.push(mes.toString().padStart(2, '0'));
      if (ano !== 'todos') parts.push(ano.toString());
      return parts.join('/');
   }, [ano, mes, dia]);

   const hasTableFilters = activeFilters.length > 0;
   const hasPeriodFilter =
      ano !== 'todos' || mes !== 'todos' || dia !== 'todos';

   return (
      <div className="flex items-center justify-center bg-slate-900 p-10">
         <div className="flex max-w-7xl flex-col items-center justify-center gap-10 p-10">
            {/* Ícone */}
            <FaFilterCircleXmark className="mx-auto text-red-600" size={80} />

            <div className="flex flex-col items-start justify-start gap-2">
               <h3>
                  {hasTableFilters ? filterMessage : 'Nenhuma OS encontrada'}
               </h3>

               {hasPeriodFilter && (
                  <p className="mb-4 flex items-center gap-2 pl-10 text-lg font-semibold tracking-widest text-white italic select-none">
                     <span>
                        {hasTableFilters ? 'Período:' : 'para o período:'}
                     </span>
                     <span className="font-black text-yellow-400">
                        {periodoFormatado}
                     </span>
                  </p>
               )}
            </div>

            <div className="flex flex-col items-center justify-center gap-3">
               <p className="text-base font-semibold tracking-wider text-white italic select-none">
                  Tente ajustar os filtros ou limpe-os para visualizar os
                  registros.
               </p>

               {/* Botão para limpar filtros */}
               {hasTableFilters && (
                  <button
                     onClick={clearFilters}
                     className="flex cursor-pointer items-center gap-4 rounded-md border-[1px] border-red-700 bg-red-600 px-6 py-2 text-lg font-extrabold tracking-wider text-white italic transition-all select-none hover:scale-105 hover:bg-red-800 active:scale-95"
                  >
                     <BsEraserFill className="text-white" size={24} />
                     Limpar Filtros
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}

// Componente para quando não há OS no período (sem filtros de tabela)
export function MensagemDadosSemPeriodo({
   ano,
   mes,
   dia,
}: {
   ano: number | 'todos';
   mes: number | 'todos';
   dia: number | 'todos';
}) {
   const periodoFormatado = useMemo(() => {
      const parts: string[] = [];
      if (dia !== 'todos') parts.push(dia.toString().padStart(2, '0'));
      if (mes !== 'todos') parts.push(mes.toString().padStart(2, '0'));
      if (ano !== 'todos') parts.push(ano.toString());
      return parts.join('/');
   }, [ano, mes, dia]);

   return (
      <div className="flex flex-col items-center justify-center gap-4 bg-slate-900 py-20 text-center">
         <FaExclamationTriangle className="mx-auto text-yellow-500" size={80} />
         <h3 className="text-2xl font-bold tracking-wider text-white select-none">
            Nenhuma OS foi encontrada para o período{' '}
            <span className="text-yellow-400">{periodoFormatado}</span>
         </h3>
      </div>
   );
}

// Exemplo de uso no componente principal
export function ExampleUsage() {
   const [filters, setFilters] = React.useState({
      filterChamadoOs: '',
      filterCodOs: '13555',
      filterDtiniOs: '',
      filterDtincOs: '',
      filterCompOs: '',
      filterNomeCliente: 'João',
      filterFaturadoOs: '',
      filterNomeRecurso: '',
      filterValidOs: '',
      filterTarefaCompleta: '',
      filterProjetoCompleto: '',
   });

   const clearFilters = () => {
      setFilters({
         filterChamadoOs: '',
         filterCodOs: '',
         filterDtiniOs: '',
         filterDtincOs: '',
         filterCompOs: '',
         filterNomeCliente: '',
         filterFaturadoOs: '',
         filterNomeRecurso: '',
         filterValidOs: '',
         filterTarefaCompleta: '',
         filterProjetoCompleto: '',
      });
   };

   // Simula diferentes cenários
   const [scenario, setScenario] = React.useState(1);

   return (
      <div className="min-h-screen bg-gray-100 p-8">
         <div className="mx-auto max-w-6xl space-y-8">
            <div className="rounded-lg bg-white p-6 shadow-lg">
               <h2 className="mb-4 text-2xl font-bold">Controle de Cenários</h2>
               <div className="flex gap-4">
                  <button
                     onClick={() => setScenario(1)}
                     className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                     Cenário 1: Sem dados no período
                  </button>
                  <button
                     onClick={() => setScenario(2)}
                     className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                     Cenário 2: 1 filtro ativo
                  </button>
                  <button
                     onClick={() => setScenario(3)}
                     className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                     Cenário 3: 2 filtros ativos
                  </button>
                  <button
                     onClick={() => setScenario(4)}
                     className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                     Cenário 4: 3+ filtros ativos
                  </button>
               </div>
            </div>

            {scenario === 1 && (
               <MensagemDadosSemPeriodo ano={2024} mes={10} dia={15} />
            )}

            {scenario === 2 && (
               <MensagemFiltroNaoEncontrado
                  filters={{
                     ...filters,
                     filterCodOs: '13555',
                     filterNomeCliente: '',
                  }}
                  clearFilters={clearFilters}
                  ano={2024}
                  mes={10}
                  dia={15}
               />
            )}

            {scenario === 3 && (
               <MensagemFiltroNaoEncontrado
                  filters={{
                     ...filters,
                     filterCodOs: '13555',
                     filterNomeCliente: 'João Silva',
                  }}
                  clearFilters={clearFilters}
                  ano={2024}
                  mes={10}
                  dia="todos"
               />
            )}

            {scenario === 4 && (
               <MensagemFiltroNaoEncontrado
                  filters={filters}
                  clearFilters={clearFilters}
                  ano="todos"
                  mes="todos"
                  dia="todos"
               />
            )}
         </div>
      </div>
   );
}
