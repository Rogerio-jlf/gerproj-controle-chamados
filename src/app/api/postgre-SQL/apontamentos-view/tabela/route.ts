import { solutiiPrisma } from '@/lib/prisma/solutii-prisma';
import { NextResponse } from 'next/server';

// Função para formatar duração em milissegundos para "hh:mm"
function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / (1000 * 60)); // Converte milissegundos para minutos
  const horas = Math.floor(totalMinutes / 60); // Calcula as horas
  const minutos = totalMinutes % 60; // Calcula os minutos restantes
  return `${String(horas).padStart(2, '0')}h:${String(minutos).padStart(2, '0')}min`; // Retorna no formato "hh:mm"
}

// Função handler para requisições GET
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url); // Extrai os parâmetros da URL

    const isAdmin = searchParams.get('isAdmin') === 'true'; // Verifica se o usuário é admin
    const codCliente = searchParams.get('codCliente')?.trim(); // Obtém e remove espaços do código do cliente

    const mesParam = Number(searchParams.get('mes')); // Obtém e converte o parâmetro 'mes' para número
    const anoParam = Number(searchParams.get('ano')); // Obtém e converte o parâmetro 'ano' para número
    const clienteQuery = searchParams.get('cliente')?.trim(); // Obtém e remove espaços do nome do cliente
    const recursoQuery = searchParams.get('recurso'); // Obtém o parâmetro 'recurso'
    const statusQuery = searchParams.get('status'); // Obtém o parâmetro 'status'

    // Valida o parâmetro 'mes'
    if (!mesParam || mesParam < 1 || mesParam > 12) {
      return NextResponse.json(
        { error: "Parâmetro 'mes' deve ser um número entre 1 e 12" }, // Retorna erro se inválido
        { status: 400 } // Código de erro HTTP 400
      );
    }

    // Valida o parâmetro 'ano'
    if (!anoParam || anoParam < 2000 || anoParam > 3000) {
      return NextResponse.json(
        { error: "Parâmetro 'ano' deve ser um número válido" }, // Retorna erro se inválido
        { status: 400 } // Código de erro HTTP 400
      );
    }

    // Se não for admin, exige o código do cliente
    if (!isAdmin && !codCliente) {
      return NextResponse.json(
        {
          error: "Parâmetro 'codCliente' é obrigatório para usuários não admin", // Mensagem de erro
        },
        { status: 400 } // Código de erro HTTP 400
      );
    }

    const dataInicio = new Date(anoParam, mesParam - 1, 1, 0, 0, 0, 0); // Cria a data de início do mês
    const dataFim = new Date(anoParam, mesParam, 1, 0, 0, 0, 0); // Cria a data de início do próximo mês

    // Cria objeto para filtros da consulta
    const filtros: Record<string, unknown> = {
      dthrini_apont: {
        gte: dataInicio, // Data de início maior ou igual ao início do mês
        lt: dataFim, // Data de início menor que o início do próximo mês
      },
    };

    // Se não for admin
    if (!isAdmin) {
      filtros.cod_cliente = codCliente; // Filtra pelo código do cliente
      // Se for admin e informou cliente
    } else if (clienteQuery) {
      filtros.nome_cliente = clienteQuery; // Filtra pelo nome do cliente
    }

    // Se informou recurso
    if (recursoQuery) {
      filtros.nome_recurso = recursoQuery; // Filtra pelo nome do recurso
    }

    // Se informou status
    if (statusQuery) {
      filtros.status_chamado = statusQuery; // Filtra pelo status do chamado
    }

    // --------------------------------------------------------------------------------

    // Busca os apontamentos no banco de dados
    const apontamentos = await solutiiPrisma.apontamentos.findMany({
      where: filtros, // Aplica os filtros definidos
      orderBy: [
        { nome_recurso: 'asc' }, // 2º critério (desempate, se mesma data/hora)
        { dthrini_apont: 'asc' }, // 1º critério
      ],
      // Define os campos que serão retornados
      select: {
        chamado_os: true, // Número do chamado
        dtini_os: true, // Data de início do chamado
        nome_cliente: true, // Nome do cliente
        status_chamado: true, // Status do chamado
        nome_recurso: true, // Nome do recurso
        hrini_os: true, // Hora de início do chamado
        hrfim_os: true, // Hora de fim do chamado
        dthrini_apont: true, // Data/hora inicial do apontamento
        dthrfim_apont: true, // Data/hora final do apontamento
        obs: true, // Observações
      },
    });

    // Mapeia os dados para adicionar o campo total_horas
    let totalMsGeral = 0; // Acumulador de milissegundos

    const apontamentosComTotalHoras = apontamentos.map(apontamento => {
      const inicio = apontamento.dthrini_apont
        ? new Date(apontamento.dthrini_apont)
        : null;
      const fim = apontamento.dthrfim_apont
        ? new Date(apontamento.dthrfim_apont)
        : null;

      let totalHoras = '-';

      if (inicio && fim && fim > inicio) {
        const diffMs = fim.getTime() - inicio.getTime(); // Diferença em milissegundos
        totalMsGeral += diffMs; // Soma no total geral
        totalHoras = formatDuration(diffMs); // Formata como "hh:mm"
      }

      return {
        chamado_os: apontamento.chamado_os,
        dtini_os: apontamento.dtini_os,
        nome_cliente: apontamento.nome_cliente,
        status_chamado: apontamento.status_chamado,
        nome_recurso: apontamento.nome_recurso,
        hrini_os: apontamento.hrini_os,
        hrfim_os: apontamento.hrfim_os,
        total_horas: totalHoras,
        obs: apontamento.obs,
      };
    });

    // Converte o total geral acumulado para "hh:mm"
    const totalHorasGeral = formatDuration(totalMsGeral);

    return NextResponse.json({
      totalHorasGeral, // Total acumulado
      apontamentos: apontamentosComTotalHoras, // Lista de apontamentos
    }); // Retorna os dados em formato JSON
    // Se ocorrer algum erro
  } catch (error) {
    console.error('Erro na API:', error); // Exibe o erro no console
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, // Retorna mensagem de erro genérica
      { status: 500 } // Código de erro HTTP 500
    );
  }
}
