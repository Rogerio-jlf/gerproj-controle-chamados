import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';
import jwt from 'jsonwebtoken';

// GET /api/dashboard/recurso/[codRecurso]
export async function GET(
   request: Request,
   { params }: { params: { codRecurso: string } }
) {
   try {
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
      } catch (err) {
         return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      const isAdmin = decoded.tipo === 'ADM';
      const codRecursoToken = decoded.recurso?.id;
      const codRecursoParam = parseInt(params.codRecurso);

      // Verificar permissões
      if (!isAdmin && codRecursoToken !== codRecursoParam) {
         return NextResponse.json(
            { error: 'Sem permissão para visualizar este recurso' },
            { status: 403 }
         );
      }

      if (isNaN(codRecursoParam)) {
         return NextResponse.json(
            { error: 'Código do recurso inválido' },
            { status: 400 }
         );
      }

      // 1. Dados básicos do recurso
      const sqlRecurso = `
      SELECT COD_RECURSO, NOME_RECURSO, EMAIL_RECURSO, ATIVO
      FROM RECURSO 
      WHERE COD_RECURSO = ?
    `;

      // 2. Chamados ativos detalhados
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
        cl.NOME_CLIENTE,
        CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER) as DIAS_EM_ABERTO,
        CASE 
          WHEN c.PRIOR_CHAMADO <= 50 THEN 'ALTA'
          WHEN c.PRIOR_CHAMADO <= 100 THEN 'MÉDIA'
          ELSE 'BAIXA'
        END as NIVEL_PRIORIDADE,
        CASE 
          WHEN c.PRIOR_CHAMADO <= 50 AND CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER) > 3 THEN 'CRÍTICO'
          WHEN CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER) > 7 THEN 'ATRASADO'
          WHEN CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER) > 2 THEN 'ATENÇÃO'
          ELSE 'NORMAL'
        END as SITUACAO
      FROM CHAMADO c
      LEFT JOIN CLIENTE cl ON c.COD_CLIENTE = cl.COD_CLIENTE
      WHERE c.COD_RECURSO = ? 
        AND c.STATUS_CHAMADO NOT IN ('CONCLUIDO', 'CANCELADO', 'FECHADO')
      ORDER BY 
        CASE WHEN c.PRIOR_CHAMADO <= 50 THEN 1 ELSE 2 END,
        c.DATA_CHAMADO ASC
    `;

      // 3. Estatísticas dos últimos 30 dias
      const sqlEstatisticas30Dias = `
      SELECT 
        COUNT(*) as TOTAL_CHAMADOS,
        COUNT(CASE WHEN STATUS_CHAMADO IN ('CONCLUIDO', 'FECHADO') THEN 1 END) as CONCLUIDOS,
        AVG(CASE 
          WHEN CONCLUSAO_CHAMADO IS NOT NULL 
          THEN CAST(CONCLUSAO_CHAMADO - DATA_CHAMADO AS INTEGER)
          ELSE NULL 
        END) as TEMPO_MEDIO_RESOLUCAO,
        COUNT(CASE WHEN PRIOR_CHAMADO <= 50 THEN 1 END) as CHAMADOS_ALTA_PRIORIDADE,
        MIN(DATA_CHAMADO) as PRIMEIRO_CHAMADO,
        MAX(DATA_CHAMADO) as ULTIMO_CHAMADO
      FROM CHAMADO 
      WHERE COD_RECURSO = ? 
        AND DATA_CHAMADO >= CURRENT_DATE - 30
    `;

      // 4. Histórico por status (últimos 90 dias)
      const sqlHistoricoStatus = `
      SELECT 
        STATUS_CHAMADO,
        COUNT(*) as QUANTIDADE,
        AVG(CASE 
          WHEN CONCLUSAO_CHAMADO IS NOT NULL 
          THEN CAST(CONCLUSAO_CHAMADO - DATA_CHAMADO AS INTEGER)
          ELSE NULL 
        END) as TEMPO_MEDIO_DIAS
      FROM CHAMADO 
      WHERE COD_RECURSO = ? 
        AND DATA_CHAMADO >= CURRENT_DATE - 90
      GROUP BY STATUS_CHAMADO
      ORDER BY QUANTIDADE DESC
    `;

      // 5. Top clientes por quantidade de chamados
      const sqlTopClientes = `
      SELECT 
        cl.COD_CLIENTE,
        cl.NOME_CLIENTE,
        COUNT(c.COD_CHAMADO) as TOTAL_CHAMADOS,
        COUNT(CASE WHEN c.STATUS_CHAMADO NOT IN ('CONCLUIDO', 'CANCELADO', 'FECHADO') THEN 1 END) as CHAMADOS_ATIVOS
      FROM CHAMADO c
      LEFT JOIN CLIENTE cl ON c.COD_CLIENTE = cl.COD_CLIENTE
      WHERE c.COD_RECURSO = ?
        AND c.DATA_CHAMADO >= CURRENT_DATE - 90
      GROUP BY cl.COD_CLIENTE, cl.NOME_CLIENTE
      HAVING COUNT(c.COD_CHAMADO) > 0
      ORDER BY TOTAL_CHAMADOS DESC
      ROWS 10
    `;

      // Executar todas as queries
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
            { error: 'Recurso não encontrado' },
            { status: 404 }
         );
      }

      const recurso = dadosRecurso[0];
      const stats = estatisticas30Dias[0] || {};

      // Análise dos chamados ativos
      const chamadosCriticos = chamadosAtivos.filter(
         (c: any) => c.SITUACAO === 'CRÍTICO'
      );
      const chamadosAtrasados = chamadosAtivos.filter(
         (c: any) => c.SITUACAO === 'ATRASADO'
      );
      const chamadosAltaPrioridade = chamadosAtivos.filter(
         (c: any) => c.NIVEL_PRIORIDADE === 'ALTA'
      );

      // Cálculo de produtividade
      const taxaConclusao =
         stats.TOTAL_CHAMADOS > 0
            ? Math.round((stats.CONCLUIDOS / stats.TOTAL_CHAMADOS) * 100)
            : 0;

      // Recomendação de carga
      let statusCarga = 'LEVE';
      let recomendacao = 'Recurso pode receber novos chamados';

      if (chamadosAtivos.length > 15) {
         statusCarga = 'PESADA';
         recomendacao = 'Evitar atribuir novos chamados';
      } else if (chamadosAtivos.length > 8 || chamadosCriticos.length > 0) {
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
            totalChamadosAtivos: chamadosAtivos.length,
            chamadosCriticos: chamadosCriticos.length,
            chamadosAtrasados: chamadosAtrasados.length,
            chamadosAltaPrioridade: chamadosAltaPrioridade.length,
            idadeMediaChamados:
               chamadosAtivos.length > 0
                  ? Math.round(
                       chamadosAtivos.reduce(
                          (acc: number, c: any) => acc + c.DIAS_EM_ABERTO,
                          0
                       ) / chamadosAtivos.length
                    )
                  : 0,
            statusCarga,
            recomendacao,
         },
         chamadosAtivos: chamadosAtivos.map((chamado: any) => ({
            ...chamado,
            PRIORIDADE_VISUAL:
               chamado.NIVEL_PRIORIDADE === 'ALTA'
                  ? '🔴'
                  : chamado.NIVEL_PRIORIDADE === 'MÉDIA'
                    ? '🟡'
                    : '🟢',
            SITUACAO_VISUAL:
               chamado.SITUACAO === 'CRÍTICO'
                  ? '🚨'
                  : chamado.SITUACAO === 'ATRASADO'
                    ? '⏰'
                    : chamado.SITUACAO === 'ATENÇÃO'
                      ? '⚠️'
                      : '✅',
         })),
         estatisticas30Dias: {
            ...stats,
            TAXA_CONCLUSAO: taxaConclusao,
            TEMPO_MEDIO_RESOLUCAO: stats.TEMPO_MEDIO_RESOLUCAO
               ? Math.round(stats.TEMPO_MEDIO_RESOLUCAO * 10) / 10
               : null,
         },
         historicoStatus,
         topClientes,
         alertas: [
            ...(chamadosCriticos.length > 0
               ? [`${chamadosCriticos.length} chamados em situação crítica`]
               : []),
            ...(chamadosAtrasados.length > 0
               ? [`${chamadosAtrasados.length} chamados atrasados`]
               : []),
            ...(recurso.ATIVO === 'N' ? ['Recurso está inativo'] : []),
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
