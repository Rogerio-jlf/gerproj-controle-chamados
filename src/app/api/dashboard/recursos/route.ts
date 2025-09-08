import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
   try {
      // Autenticação
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

      if (!isAdmin) {
         return NextResponse.json(
            { error: 'Acesso restrito a administradores' },
            { status: 403 }
         );
      }

      // Parâmetros de filtro
      const { searchParams } = new URL(request.url);
      const incluirInativos = searchParams.get('incluirInativos') === 'true';

      // 1. Buscar estatísticas gerais dos recursos com chamados ativos
      const sqlRecursosStats = `
      SELECT 
        r.COD_RECURSO,
        r.NOME_RECURSO,
        COUNT(c.COD_CHAMADO) as TOTAL_CHAMADOS_ATIVOS,
        
        -- Contagem por status
        SUM(CASE WHEN c.STATUS_CHAMADO = 'ABERTO' THEN 1 ELSE 0 END) as CHAMADOS_ABERTOS,
        SUM(CASE WHEN c.STATUS_CHAMADO = 'EM_ANDAMENTO' THEN 1 ELSE 0 END) as CHAMADOS_EM_ANDAMENTO,
        SUM(CASE WHEN c.STATUS_CHAMADO = 'PENDENTE' THEN 1 ELSE 0 END) as CHAMADOS_PENDENTES,
        SUM(CASE WHEN c.STATUS_CHAMADO = 'AGUARDANDO' THEN 1 ELSE 0 END) as CHAMADOS_AGUARDANDO,
        
        -- Contagem por prioridade
        SUM(CASE WHEN c.PRIOR_CHAMADO <= 50 THEN 1 ELSE 0 END) as CHAMADOS_ALTA_PRIORIDADE,
        SUM(CASE WHEN c.PRIOR_CHAMADO > 50 AND c.PRIOR_CHAMADO <= 100 THEN 1 ELSE 0 END) as CHAMADOS_MEDIA_PRIORIDADE,
        SUM(CASE WHEN c.PRIOR_CHAMADO > 100 THEN 1 ELSE 0 END) as CHAMADOS_BAIXA_PRIORIDADE,
        
        -- Análise temporal
        AVG(CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER)) as IDADE_MEDIA_CHAMADOS,
        MAX(CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER)) as CHAMADO_MAIS_ANTIGO_DIAS,
        MIN(CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER)) as CHAMADO_MAIS_RECENTE_DIAS,
        
        -- Chamados críticos (mais de 3 dias em aberto com alta prioridade)
        SUM(CASE 
          WHEN c.PRIOR_CHAMADO <= 50 
            AND CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER) > 3 
          THEN 1 ELSE 0 
        END) as CHAMADOS_CRITICOS
        
      FROM RECURSO r
      LEFT JOIN CHAMADO c ON r.COD_RECURSO = c.COD_RECURSO 
        AND c.STATUS_CHAMADO NOT IN ('CONCLUIDO', 'CANCELADO', 'FECHADO')
      ${incluirInativos ? '' : "WHERE r.ATIVO = 'S' OR r.ATIVO IS NULL"}
      GROUP BY r.COD_RECURSO, r.NOME_RECURSO
      ORDER BY TOTAL_CHAMADOS_ATIVOS DESC, CHAMADOS_ALTA_PRIORIDADE DESC
    `;

      // 2. Buscar chamados mais antigos por recurso
      const sqlChamadosAntigos = `
      SELECT 
        c.COD_RECURSO,
        c.COD_CHAMADO,
        c.DATA_CHAMADO,
        c.ASSUNTO_CHAMADO,
        c.PRIOR_CHAMADO,
        c.STATUS_CHAMADO,
        cl.NOME_CLIENTE,
        CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER) as DIAS_EM_ABERTO
      FROM CHAMADO c
      LEFT JOIN CLIENTE cl ON c.COD_CLIENTE = cl.COD_CLIENTE
      WHERE c.STATUS_CHAMADO NOT IN ('CONCLUIDO', 'CANCELADO', 'FECHADO')
        AND c.COD_RECURSO IS NOT NULL
        AND CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER) > 2
      ORDER BY c.COD_RECURSO, c.DATA_CHAMADO ASC
    `;

      // 3. Análise de distribuição de trabalho (últimos 30 dias)
      const sqlDistribuicaoTrabalho = `
      SELECT 
        r.COD_RECURSO,
        r.NOME_RECURSO,
        COUNT(c.COD_CHAMADO) as CHAMADOS_ULTIMOS_30_DIAS,
        AVG(CASE 
          WHEN c.CONCLUSAO_CHAMADO IS NOT NULL 
          THEN CAST(c.CONCLUSAO_CHAMADO - c.DATA_CHAMADO AS INTEGER)
          ELSE NULL 
        END) as TEMPO_MEDIO_RESOLUCAO_DIAS
      FROM RECURSO r
      LEFT JOIN CHAMADO c ON r.COD_RECURSO = c.COD_RECURSO
        AND c.DATA_CHAMADO >= CURRENT_DATE - 30
      ${incluirInativos ? '' : "WHERE r.ATIVO = 'S' OR r.ATIVO IS NULL"}
      GROUP BY r.COD_RECURSO, r.NOME_RECURSO
      ORDER BY CHAMADOS_ULTIMOS_30_DIAS DESC
    `;

      // Executar queries
      const [recursosStats, chamadosAntigos, distribuicaoTrabalho] =
         await Promise.all([
            firebirdQuery(sqlRecursosStats),
            firebirdQuery(sqlChamadosAntigos),
            firebirdQuery(sqlDistribuicaoTrabalho),
         ]);

      // Processar dados para criar insights
      const recursosComInsights = recursosStats.map((recurso: any) => {
         // Buscar chamados antigos deste recurso
         const chamadosAntigosRecurso = chamadosAntigos.filter(
            (ch: any) => ch.COD_RECURSO === recurso.COD_RECURSO
         );

         // Buscar dados de distribuição
         const dadosDistribuicao = distribuicaoTrabalho.find(
            (dt: any) => dt.COD_RECURSO === recurso.COD_RECURSO
         );

         // Calcular score de carga de trabalho (quanto maior, mais sobrecarregado)
         let scoreCarga = 0;
         scoreCarga += (recurso.TOTAL_CHAMADOS_ATIVOS || 0) * 2;
         scoreCarga += (recurso.CHAMADOS_ALTA_PRIORIDADE || 0) * 5;
         scoreCarga += (recurso.CHAMADOS_CRITICOS || 0) * 10;
         scoreCarga += (recurso.IDADE_MEDIA_CHAMADOS || 0) * 0.5;

         // Calcular recomendação
         let recomendacao = 'DISPONÍVEL';
         let motivoRecomendacao = 'Recurso com baixa carga de trabalho';

         if (scoreCarga > 50) {
            recomendacao = 'SOBRECARREGADO';
            motivoRecomendacao = 'Recurso com alta carga de trabalho';
         } else if (scoreCarga > 25) {
            recomendacao = 'MODERADO';
            motivoRecomendacao = 'Recurso com carga moderada de trabalho';
         }

         if (recurso.CHAMADOS_CRITICOS > 0) {
            recomendacao = 'CRÍTICO';
            motivoRecomendacao = `${recurso.CHAMADOS_CRITICOS} chamados críticos precisam de atenção`;
         }

         return {
            ...recurso,
            CHAMADOS_ANTIGOS: chamadosAntigosRecurso.slice(0, 3), // Top 3 mais antigos
            TEMPO_MEDIO_RESOLUCAO:
               dadosDistribuicao?.TEMPO_MEDIO_RESOLUCAO_DIAS || null,
            CHAMADOS_ULTIMOS_30_DIAS:
               dadosDistribuicao?.CHAMADOS_ULTIMOS_30_DIAS || 0,
            SCORE_CARGA_TRABALHO: Math.round(scoreCarga),
            RECOMENDACAO: recomendacao,
            MOTIVO_RECOMENDACAO: motivoRecomendacao,
            PERCENTUAL_ALTA_PRIORIDADE:
               recurso.TOTAL_CHAMADOS_ATIVOS > 0
                  ? Math.round(
                       (recurso.CHAMADOS_ALTA_PRIORIDADE /
                          recurso.TOTAL_CHAMADOS_ATIVOS) *
                          100
                    )
                  : 0,
         };
      });

      // Estatísticas gerais do sistema
      const totalChamadosAtivos = recursosStats.reduce(
         (sum: number, r: any) => sum + (r.TOTAL_CHAMADOS_ATIVOS || 0),
         0
      );
      const totalChamadosCriticos = recursosStats.reduce(
         (sum: number, r: any) => sum + (r.CHAMADOS_CRITICOS || 0),
         0
      );
      const recursosDisponiveis = recursosComInsights.filter(
         r => r.RECOMENDACAO === 'DISPONÍVEL'
      ).length;

      const response = {
         resumoGeral: {
            totalChamadosAtivos,
            totalChamadosCriticos,
            totalRecursos: recursosStats.length,
            recursosDisponiveis,
            recursosSobrecarregados: recursosComInsights.filter(
               r => r.RECOMENDACAO === 'SOBRECARREGADO'
            ).length,
         },
         recursos: recursosComInsights,
         recomendacoes: {
            melhorRecursoParaNovoChamado:
               recursosComInsights
                  .filter(r => r.RECOMENDACAO === 'DISPONÍVEL')
                  .sort(
                     (a, b) => a.SCORE_CARGA_TRABALHO - b.SCORE_CARGA_TRABALHO
                  )[0] || null,
            recursosComAtencaoUrgente: recursosComInsights
               .filter(r => r.RECOMENDACAO === 'CRÍTICO')
               .sort((a, b) => b.CHAMADOS_CRITICOS - a.CHAMADOS_CRITICOS),
         },
         alertas: [
            ...(totalChamadosCriticos > 0
               ? [`${totalChamadosCriticos} chamados críticos no sistema`]
               : []),
            ...(recursosDisponiveis === 0
               ? ['Nenhum recurso disponível para novos chamados']
               : []),
         ],
      };

      return NextResponse.json(response, { status: 200 });
   } catch (error) {
      console.error('Erro ao gerar dashboard de recursos:', error);
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
