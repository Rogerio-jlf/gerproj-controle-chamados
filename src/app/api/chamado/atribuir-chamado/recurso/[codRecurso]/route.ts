import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../../../lib/firebird/firebird-client';
import jwt from 'jsonwebtoken';

// GET /api/dashboard/recurso/[codRecurso]
export async function GET(
   request: Request,
   { params }: { params: Promise<{ codRecurso: string }> }
) {
   try {
      // Await dos params (Next.js 13+ requirement)
      const { codRecurso } = await params;

      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return NextResponse.json(
            { error: 'Token não fornecido' },
            { status: 401 }
         );
      }

      const token = authHeader.replace('Bearer ', '');
      let decoded: any;

      try {
         decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'minha_chave_secreta'
         );
      } catch {
         return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      const isAdmin = decoded.tipo === 'ADM';
      const codRecursoToken = decoded.recurso?.id;
      const codRecursoParam = parseInt(codRecurso);

      if (isNaN(codRecursoParam)) {
         return NextResponse.json(
            { error: 'Código do recurso inválido' },
            { status: 400 }
         );
      }

      // Verificar permissões
      if (!isAdmin && codRecursoToken !== codRecursoParam) {
         return NextResponse.json(
            { error: 'Sem permissão para visualizar este recurso' },
            { status: 403 }
         );
      }

      // Função auxiliar para calcular dias (compatível com Firebird)
      const calcularDiasDesde = (dataFirebird: string) => {
         if (!dataFirebird) return 0;
         const data = new Date(dataFirebird);
         const hoje = new Date();
         return Math.ceil(
            Math.abs(hoje.getTime() - data.getTime()) / (1000 * 60 * 60 * 24)
         );
      };

      // 1. Dados básicos do recurso
      const sqlRecurso = `
      SELECT COD_RECURSO, NOME_RECURSO, EMAIL_RECURSO, ATIVO_RECURSO
      FROM RECURSO
      WHERE COD_RECURSO = ?
        AND ATIVO_RECURSO = 1
    `;

      // 2. Chamados ativos detalhados (sem funções de data no SQL)
      const sqlChamadosAtivos = `
      SELECT 
        c.COD_CHAMADO,
        c.DATA_CHAMADO,
        c.HORA_CHAMADO,
        c.ASSUNTO_CHAMADO,
        c.STATUS_CHAMADO,
        c.PRIOR_CHAMADO,
        c.COD_CLIENTE,
        c.COD_CLASSIFICACAO,
        cl.NOME_CLIENTE
      FROM CHAMADO c
      LEFT JOIN CLIENTE cl ON c.COD_CLIENTE = cl.COD_CLIENTE
      WHERE c.COD_RECURSO = ? 
        AND c.STATUS_CHAMADO NOT IN ('FINALIZADO')
      ORDER BY c.PRIOR_CHAMADO ASC, c.DATA_CHAMADO ASC
    `;

      // 3. Estatísticas últimos 30 dias (usando CAST para compatibilidade)
      const sqlEstatisticas30Dias = `
      SELECT 
        COUNT(*) AS TOTAL_CHAMADOS,
        COUNT(CASE WHEN STATUS_CHAMADO IN ('FINALIZADO') THEN 1 END) AS CONCLUIDOS,
        COUNT(CASE WHEN PRIOR_CHAMADO <= 50 THEN 1 END) AS CHAMADOS_ALTA_PRIORIDADE
      FROM CHAMADO
      WHERE COD_RECURSO = ?
        AND CAST(DATA_CHAMADO AS TIMESTAMP) >= CAST('NOW' AS TIMESTAMP) - 30
    `;

      // 4. Histórico status últimos 90 dias
      const sqlHistoricoStatus = `
      SELECT 
        STATUS_CHAMADO,
        COUNT(*) AS QUANTIDADE
      FROM CHAMADO
      WHERE COD_RECURSO = ?
        AND CAST(DATA_CHAMADO AS TIMESTAMP) >= CAST('NOW' AS TIMESTAMP) - 90
      GROUP BY STATUS_CHAMADO
      ORDER BY QUANTIDADE DESC
    `;

      // 5. Top clientes últimos 90 dias
      const sqlTopClientes = `
      SELECT 
        cl.COD_CLIENTE,
        cl.NOME_CLIENTE,
        COUNT(c.COD_CHAMADO) AS TOTAL_CHAMADOS,
        COUNT(CASE WHEN c.STATUS_CHAMADO NOT IN ('FINALIZADO') THEN 1 END) AS CHAMADOS_ATIVOS
      FROM CHAMADO c
      LEFT JOIN CLIENTE cl ON c.COD_CLIENTE = cl.COD_CLIENTE
      WHERE c.COD_RECURSO = ?
        AND CAST(c.DATA_CHAMADO AS TIMESTAMP) >= CAST('NOW' AS TIMESTAMP) - 90
      GROUP BY cl.COD_CLIENTE, cl.NOME_CLIENTE
      HAVING COUNT(c.COD_CHAMADO) > 0
      ORDER BY TOTAL_CHAMADOS DESC
    `;

      // Executar queries
      const [
         dadosRecurso,
         chamadosAtivos,
         estatisticas30Dias,
         historicoStatus,
         topClientes,
      ] = await Promise.all([
         firebirdQuery(sqlRecurso, [codRecursoParam]),
         firebirdQuery(sqlChamadosAtivos, [codRecursoParam]),
         firebirdQuery(sqlEstatisticas30Dias, [codRecursoParam]),
         firebirdQuery(sqlHistoricoStatus, [codRecursoParam]),
         firebirdQuery(sqlTopClientes, [codRecursoParam]),
      ]);

      if (!dadosRecurso || dadosRecurso.length === 0) {
         return NextResponse.json(
            { error: 'Recurso não encontrado ou inativo' },
            { status: 404 }
         );
      }

      const recurso = dadosRecurso[0];
      const stats = estatisticas30Dias[0] || {};

      // Processar chamados ativos (calcular dias em aberto no código)
      const chamadosProcessados = chamadosAtivos.map((c: any) => {
         const diasEmAberto = calcularDiasDesde(c.DATA_CHAMADO);
         const nivelPrioridade =
            c.PRIOR_CHAMADO <= 50
               ? 'ALTA'
               : c.PRIOR_CHAMADO <= 100
                 ? 'MÉDIA'
                 : 'BAIXA';

         let situacao = 'NORMAL';
         if (c.PRIOR_CHAMADO <= 50 && diasEmAberto > 3) {
            situacao = 'CRÍTICO';
         } else if (diasEmAberto > 7) {
            situacao = 'ATRASADO';
         } else if (diasEmAberto > 2) {
            situacao = 'ATENÇÃO';
         }

         return {
            ...c,
            DIAS_EM_ABERTO: diasEmAberto,
            NIVEL_PRIORIDADE: nivelPrioridade,
            SITUACAO: situacao,
         };
      });

      // Chamados críticos e atrasados
      const chamadosCriticos = chamadosProcessados.filter(
         (c: any) => c.SITUACAO === 'CRÍTICO'
      );
      const chamadosAtrasados = chamadosProcessados.filter(
         (c: any) => c.SITUACAO === 'ATRASADO'
      );
      const chamadosAltaPrioridade = chamadosProcessados.filter(
         (c: any) => c.NIVEL_PRIORIDADE === 'ALTA'
      );

      // Taxa de conclusão
      const taxaConclusao =
         stats.TOTAL_CHAMADOS > 0
            ? Math.round((stats.CONCLUIDOS / stats.TOTAL_CHAMADOS) * 100)
            : 0;

      // Status de carga
      let statusCarga = 'LEVE';
      let recomendacao = 'Recurso pode receber novos chamados';

      if (chamadosProcessados.length > 15) {
         statusCarga = 'PESADA';
         recomendacao = 'Evitar atribuir novos chamados';
      } else if (
         chamadosProcessados.length > 8 ||
         chamadosCriticos.length > 0
      ) {
         statusCarga = 'MODERADA';
         recomendacao = 'Cuidado ao atribuir novos chamados';
      }

      if (chamadosCriticos.length > 2) {
         statusCarga = 'CRÍTICA';
         recomendacao = 'Recurso precisa de suporte urgente';
      }

      const response = {
         recurso,
         resumo: {
            totalChamadosAtivos: chamadosProcessados.length,
            chamadosCriticos: chamadosCriticos.length,
            chamadosAtrasados: chamadosAtrasados.length,
            chamadosAltaPrioridade: chamadosAltaPrioridade.length,
            idadeMediaChamados:
               chamadosProcessados.length > 0
                  ? Math.round(
                       chamadosProcessados.reduce(
                          (acc: number, c: any) => acc + c.DIAS_EM_ABERTO,
                          0
                       ) / chamadosProcessados.length
                    )
                  : 0,
            statusCarga,
            recomendacao,
         },
         chamadosAtivos: chamadosProcessados.map((c: any) => ({
            ...c,
            PRIORIDADE_VISUAL:
               c.NIVEL_PRIORIDADE === 'ALTA'
                  ? '🔴'
                  : c.NIVEL_PRIORIDADE === 'MÉDIA'
                    ? '🟡'
                    : '🟢',
            SITUACAO_VISUAL:
               c.SITUACAO === 'CRÍTICO'
                  ? '🚨'
                  : c.SITUACAO === 'ATRASADO'
                    ? '⏰'
                    : c.SITUACAO === 'ATENÇÃO'
                      ? '⚠️'
                      : '✅',
         })),
         estatisticas30Dias: {
            ...stats,
            TAXA_CONCLUSAO: taxaConclusao,
         },
         historicoStatus,
         topClientes,
         alertas: [
            ...(chamadosCriticos.length > 0
               ? [
                    chamadosCriticos.length === 1
                       ? '1 chamado em situação crítica'
                       : `${chamadosCriticos.length} chamados em situação crítica`,
                 ]
               : []),
            ...(chamadosAtrasados.length > 0
               ? [
                    chamadosAtrasados.length === 1
                       ? '1 chamado atrasado'
                       : `${chamadosAtrasados.length} chamados atrasados`,
                 ]
               : []),
            ...(recurso.ATIVO_RECURSO !== 1 ? ['Recurso está inativo'] : []),
            ...(taxaConclusao < 70 && stats.TOTAL_CHAMADOS > 5
               ? ['Taxa de conclusão baixa nos últimos 30 dias']
               : []),
         ],
      };

      return NextResponse.json(response, { status: 200 });
   } catch (error) {
      console.error('Erro ao analisar recurso específico:', error);
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
