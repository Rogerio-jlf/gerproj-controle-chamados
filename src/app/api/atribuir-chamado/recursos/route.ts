import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
   try {
      // =======================
      // Autenticação
      // =======================
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

      if (decoded.tipo !== 'ADM') {
         return NextResponse.json(
            { error: 'Acesso restrito a administradores' },
            { status: 403 }
         );
      }

      // =======================
      // Queries
      // =======================

      // 1. Estatísticas gerais dos recursos
      const sqlRecursosStats = `
         SELECT 
            r.COD_RECURSO,
            r.NOME_RECURSO,
            COUNT(c.COD_CHAMADO) as TOTAL_CHAMADOS_ATIVOS,
            SUM(CASE WHEN c.STATUS_CHAMADO = 'NAO INICIADO' THEN 1 ELSE 0 END) as CHAMADOS_NAO_INICIADOS,
            SUM(CASE WHEN c.STATUS_CHAMADO = 'EM ATENDIMENTO' THEN 1 ELSE 0 END) as CHAMADOS_EM_ATENDIMENTO,
            SUM(CASE WHEN c.STATUS_CHAMADO = 'ATRIBUIDO' THEN 1 ELSE 0 END) as CHAMADOS_ATRIBUIDOS,
            SUM(CASE WHEN c.STATUS_CHAMADO = 'AGUARDANDO VALIDACAO' THEN 1 ELSE 0 END) as CHAMADOS_AGUARDANDO_VALIDACAO,
            SUM(CASE WHEN c.STATUS_CHAMADO = 'STANDBY' THEN 1 ELSE 0 END) as CHAMADOS_STANDBY,
            SUM(CASE WHEN c.STATUS_CHAMADO = 'NAO FINALIZADO' THEN 1 ELSE 0 END) as CHAMADOS_NAO_FINALIZADOS,
            SUM(CASE WHEN c.PRIOR_CHAMADO <= 50 THEN 1 ELSE 0 END) as CHAMADOS_ALTA_PRIORIDADE,
            SUM(CASE WHEN c.PRIOR_CHAMADO > 50 AND c.PRIOR_CHAMADO <= 100 THEN 1 ELSE 0 END) as CHAMADOS_MEDIA_PRIORIDADE,
            SUM(CASE WHEN c.PRIOR_CHAMADO > 100 THEN 1 ELSE 0 END) as CHAMADOS_BAIXA_PRIORIDADE
         FROM RECURSO r
         LEFT JOIN CHAMADO c ON r.COD_RECURSO = c.COD_RECURSO 
            AND c.STATUS_CHAMADO NOT IN ('FINALIZADO', 'CANCELADO')
         WHERE r.ATIVO_RECURSO = 1
         GROUP BY r.COD_RECURSO, r.NOME_RECURSO
         ORDER BY TOTAL_CHAMADOS_ATIVOS DESC, CHAMADOS_ALTA_PRIORIDADE DESC
      `;

      // 2. Chamados mais antigos por recurso
      const sqlChamadosAntigos = `
         SELECT 
            c.COD_RECURSO,
            c.COD_CHAMADO,
            c.DATA_CHAMADO,
            c.ASSUNTO_CHAMADO,
            c.PRIOR_CHAMADO,
            c.STATUS_CHAMADO,
            cl.NOME_CLIENTE
         FROM CHAMADO c
         LEFT JOIN CLIENTE cl ON c.COD_CLIENTE = cl.COD_CLIENTE
         WHERE c.STATUS_CHAMADO NOT IN ('FINALIZADO', 'CANCELADO')
            AND c.COD_RECURSO IS NOT NULL
         ORDER BY c.COD_RECURSO, c.DATA_CHAMADO ASC
      `;

      // 3. Distribuição de trabalho últimos 30 dias
      const sqlDistribuicaoTrabalho = `
         SELECT 
            r.COD_RECURSO,
            r.NOME_RECURSO,
            COUNT(c.COD_CHAMADO) as CHAMADOS_ULTIMOS_30_DIAS
         FROM RECURSO r
         LEFT JOIN CHAMADO c ON r.COD_RECURSO = c.COD_RECURSO
            AND EXTRACT(YEAR FROM c.DATA_CHAMADO) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP)
            AND EXTRACT(MONTH FROM c.DATA_CHAMADO) = EXTRACT(MONTH FROM CURRENT_TIMESTAMP)
            AND c.STATUS_CHAMADO NOT IN ('FINALIZADO', 'CANCELADO')
         WHERE r.ATIVO_RECURSO = 1
         GROUP BY r.COD_RECURSO, r.NOME_RECURSO
         ORDER BY CHAMADOS_ULTIMOS_30_DIAS DESC
      `;

      // Executar queries em paralelo
      const [recursosStats, chamadosAntigos, distribuicaoTrabalho] =
         await Promise.all([
            firebirdQuery(sqlRecursosStats),
            firebirdQuery(sqlChamadosAntigos),
            firebirdQuery(sqlDistribuicaoTrabalho),
         ]);

      // =======================
      // Funções auxiliares
      // =======================
      const calcularDiasDesde = (dataFirebird: string) => {
         if (!dataFirebird) return 0;
         const data = new Date(dataFirebird);
         const hoje = new Date();
         return Math.ceil(
            Math.abs(hoje.getTime() - data.getTime()) / (1000 * 60 * 60 * 24)
         );
      };

      // =======================
      // Processar dados e gerar insights
      // =======================
      const recursosComInsights = recursosStats.map((recurso: any) => {
         const chamadosDoRecurso = chamadosAntigos
            .filter(ch => ch.COD_RECURSO === recurso.COD_RECURSO)
            .map(ch => ({
               ...ch,
               DIAS_EM_ABERTO: calcularDiasDesde(ch.DATA_CHAMADO),
            }));

         const chamadosAntigosRecurso = chamadosDoRecurso.filter(
            ch => ch.DIAS_EM_ABERTO > 2
         );

         const dadosDistribuicao = distribuicaoTrabalho.find(
            dt => dt.COD_RECURSO === recurso.COD_RECURSO
         );

         const idadesChamados = chamadosDoRecurso.map(ch => ch.DIAS_EM_ABERTO);
         const idadeMedia =
            idadesChamados.length > 0
               ? idadesChamados.reduce((sum, d) => sum + d, 0) /
                 idadesChamados.length
               : 0;
         const chamadoMaisAntigo =
            idadesChamados.length > 0 ? Math.max(...idadesChamados) : 0;
         const chamadoMaisRecente =
            idadesChamados.length > 0 ? Math.min(...idadesChamados) : 0;

         const chamadosCriticos = chamadosDoRecurso.filter(
            ch => ch.PRIOR_CHAMADO <= 50 && ch.DIAS_EM_ABERTO > 3
         ).length;

         let scoreCarga =
            (recurso.TOTAL_CHAMADOS_ATIVOS || 0) * 2 +
            (recurso.CHAMADOS_ALTA_PRIORIDADE || 0) * 5 +
            (chamadosCriticos || 0) * 10 +
            (idadeMedia || 0) * 0.5;

         let recomendacao = 'DISPONÍVEL';
         let motivoRecomendacao = 'Recurso com baixa carga de trabalho';

         if (scoreCarga > 50) {
            recomendacao = 'SOBRECARREGADO';
            motivoRecomendacao = 'Recurso com alta carga de trabalho';
         } else if (scoreCarga > 25) {
            recomendacao = 'MODERADO';
            motivoRecomendacao = 'Recurso com carga moderada de trabalho';
         }

         if (chamadosCriticos > 0) {
            recomendacao = 'CRÍTICO';
            motivoRecomendacao = `${chamadosCriticos} chamados críticos precisam de atenção`;
         }

         return {
            COD_RECURSO: recurso.COD_RECURSO,
            NOME_RECURSO: recurso.NOME_RECURSO,
            TOTAL_CHAMADOS_ATIVOS: recurso.TOTAL_CHAMADOS_ATIVOS || 0,
            CHAMADOS_NAO_INICIADOS: recurso.CHAMADOS_NAO_INICIADOS || 0,
            CHAMADOS_EM_ATENDIMENTO: recurso.CHAMADOS_EM_ATENDIMENTO || 0,
            CHAMADOS_ATRIBUIDOS: recurso.CHAMADOS_ATRIBUIDOS || 0,
            CHAMADOS_AGUARDANDO_VALIDACAO:
               recurso.CHAMADOS_AGUARDANDO_VALIDACAO || 0,
            CHAMADOS_STANDBY: recurso.CHAMADOS_STANDBY || 0,
            CHAMADOS_NAO_FINALIZADOS: recurso.CHAMADOS_NAO_FINALIZADOS || 0,
            CHAMADOS_ALTA_PRIORIDADE: recurso.CHAMADOS_ALTA_PRIORIDADE || 0,
            CHAMADOS_MEDIA_PRIORIDADE: recurso.CHAMADOS_MEDIA_PRIORIDADE || 0,
            CHAMADOS_BAIXA_PRIORIDADE: recurso.CHAMADOS_BAIXA_PRIORIDADE || 0,
            CHAMADOS_ANTIGOS: chamadosAntigosRecurso
               .slice(0, 3)
               .sort((a, b) => b.DIAS_EM_ABERTO - a.DIAS_EM_ABERTO),
            IDADE_MEDIA_CHAMADOS: Math.round(idadeMedia),
            CHAMADO_MAIS_ANTIGO_DIAS: chamadoMaisAntigo,
            CHAMADO_MAIS_RECENTE_DIAS: chamadoMaisRecente,
            CHAMADOS_CRITICOS: chamadosCriticos,
            CHAMADOS_ULTIMOS_30_DIAS:
               dadosDistribuicao?.CHAMADOS_ULTIMOS_30_DIAS || 0,
            SCORE_CARGA_TRABALHO: Math.round(scoreCarga),
            RECOMENDACAO: recomendacao,
            MOTIVO_RECOMENDACAO: motivoRecomendacao,
            PERCENTUAL_ALTA_PRIORIDADE: recurso.TOTAL_CHAMADOS_ATIVOS
               ? Math.round(
                    (recurso.CHAMADOS_ALTA_PRIORIDADE /
                       recurso.TOTAL_CHAMADOS_ATIVOS) *
                       100
                 )
               : 0,
         };
      });

      // =======================
      // Estatísticas gerais
      // =======================
      const totalChamadosAtivos = recursosStats.reduce(
         (sum, r) => sum + (r.TOTAL_CHAMADOS_ATIVOS || 0),
         0
      );
      const totalChamadosCriticos = recursosComInsights.reduce(
         (sum, r) => sum + (r.CHAMADOS_CRITICOS || 0),
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
