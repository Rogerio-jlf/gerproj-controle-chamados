import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
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
      if (!isAdmin) {
         return NextResponse.json(
            { error: 'Acesso restrito a administradores' },
            { status: 403 }
         );
      }

      // Dados do chamado para análise
      const body = await request.json();
      const { prioridade = 100, codCliente, codClassificacao, assunto } = body;

      // Validações
      if (prioridade < 1 || prioridade > 999) {
         return NextResponse.json(
            { error: 'Prioridade deve estar entre 1 e 999' },
            { status: 400 }
         );
      }

      // Buscar recursos ativos com suas estatísticas
      const sqlRecursos = `
      SELECT 
        r.COD_RECURSO,
        r.NOME_RECURSO,
        r.EMAIL_RECURSO,
        
        -- Chamados ativos atuais
        COUNT(c.COD_CHAMADO) as CHAMADOS_ATIVOS,
        
        -- Chamados por prioridade
        SUM(CASE WHEN c.PRIOR_CHAMADO <= 50 THEN 1 ELSE 0 END) as ALTA_PRIORIDADE,
        SUM(CASE WHEN c.PRIOR_CHAMADO > 50 AND c.PRIOR_CHAMADO <= 100 THEN 1 ELSE 0 END) as MEDIA_PRIORIDADE,
        SUM(CASE WHEN c.PRIOR_CHAMADO > 100 THEN 1 ELSE 0 END) as BAIXA_PRIORIDADE,
        
        -- Idade média dos chamados
        AVG(CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER)) as IDADE_MEDIA,
        
        -- Chamados críticos (alta prioridade há mais de 3 dias)
        SUM(CASE 
          WHEN c.PRIOR_CHAMADO <= 50 
            AND CAST(CURRENT_DATE - c.DATA_CHAMADO AS INTEGER) > 3 
          THEN 1 ELSE 0 
        END) as CHAMADOS_CRITICOS
        
      FROM RECURSO r
      LEFT JOIN CHAMADO c ON r.COD_RECURSO = c.COD_RECURSO 
        AND c.STATUS_CHAMADO NOT IN ('CONCLUIDO', 'CANCELADO', 'FECHADO')
      WHERE (r.ATIVO = 'S' OR r.ATIVO IS NULL)
      GROUP BY r.COD_RECURSO, r.NOME_RECURSO, r.EMAIL_RECURSO
      ORDER BY r.NOME_RECURSO
    `;

      // Se cliente especificado, buscar histórico do cliente com recursos
      let sqlHistoricoCliente = '';
      let historicoParams: any[] = [];

      if (codCliente) {
         sqlHistoricoCliente = `
        SELECT 
          c.COD_RECURSO,
          COUNT(*) as CHAMADOS_CLIENTE,
          AVG(CASE 
            WHEN c.CONCLUSAO_CHAMADO IS NOT NULL 
            THEN CAST(c.CONCLUSAO_CHAMADO - c.DATA_CHAMADO AS INTEGER)
            ELSE NULL 
          END) as TEMPO_MEDIO_RESOLUCAO,
          COUNT(CASE WHEN c.STATUS_CHAMADO IN ('CONCLUIDO', 'FECHADO') THEN 1 END) as CONCLUIDOS,
          MAX(c.DATA_CHAMADO) as ULTIMO_ATENDIMENTO
        FROM CHAMADO c
        WHERE c.COD_CLIENTE = ?
          AND c.COD_RECURSO IS NOT NULL
          AND c.DATA_CHAMADO >= CURRENT_DATE - 180
        GROUP BY c.COD_RECURSO
        ORDER BY ULTIMO_ATENDIMENTO DESC
      `;
         historicoParams = [codCliente];
      }

      // Executar queries
      const recursos = await firebirdQuery(sqlRecursos);
      const historicoCliente = codCliente
         ? await firebirdQuery(sqlHistoricoCliente, historicoParams)
         : [];

      // Processar recursos e calcular score de adequação
      const recursosComScore = recursos.map((recurso: any) => {
         let score = 100; // Score inicial perfeito
         let motivos: string[] = [];
         let vantagens: string[] = [];
         let desvantagens: string[] = [];

         // Penalizar por quantidade de chamados ativos (cada chamado reduz 3 pontos)
         const penalizacaoAtivos = (recurso.CHAMADOS_ATIVOS || 0) * 3;
         score -= penalizacaoAtivos;
         if (penalizacaoAtivos > 0) {
            desvantagens.push(
               `${recurso.CHAMADOS_ATIVOS} chamados ativos (-${penalizacaoAtivos} pontos)`
            );
         } else {
            vantagens.push('Sem chamados ativos no momento');
         }

         // Penalizar muito por chamados críticos (cada um reduz 15 pontos)
         const penalizacaoCriticos = (recurso.CHAMADOS_CRITICOS || 0) * 15;
         score -= penalizacaoCriticos;
         if (penalizacaoCriticos > 0) {
            desvantagens.push(
               `${recurso.CHAMADOS_CRITICOS} chamados críticos (-${penalizacaoCriticos} pontos)`
            );
         }

         // Penalizar por chamados de alta prioridade existentes
         const penalizacaoAltaPrio = (recurso.ALTA_PRIORIDADE || 0) * 8;
         score -= penalizacaoAltaPrio;
         if (penalizacaoAltaPrio > 0) {
            desvantagens.push(
               `${recurso.ALTA_PRIORIDADE} chamados alta prioridade (-${penalizacaoAltaPrio} pontos)`
            );
         }

         // Penalizar por idade média alta dos chamados
         if (recurso.IDADE_MEDIA > 7) {
            const penalizacaoIdade = Math.floor((recurso.IDADE_MEDIA - 7) * 2);
            score -= penalizacaoIdade;
            desvantagens.push(
               `Chamados antigos (média ${Math.round(recurso.IDADE_MEDIA)} dias) (-${penalizacaoIdade} pontos)`
            );
         } else if (recurso.IDADE_MEDIA < 3 && recurso.CHAMADOS_ATIVOS > 0) {
            vantagens.push(
               `Chamados recentes (média ${Math.round(recurso.IDADE_MEDIA || 0)} dias)`
            );
         }

         // Bonus/penalização baseada na prioridade do novo chamado
         if (prioridade <= 50) {
            // Alta prioridade
            // Penalizar recursos já sobrecarregados com alta prioridade
            if ((recurso.ALTA_PRIORIDADE || 0) >= 3) {
               score -= 20;
               desvantagens.push(
                  'Já possui muitos chamados de alta prioridade (-20 pontos)'
               );
            }
            motivos.push(
               'Chamado de ALTA prioridade - priorizando recursos menos carregados'
            );
         } else if (prioridade > 150) {
            // Baixa prioridade
            // Pode ir para recursos com mais carga se necessário
            if ((recurso.CHAMADOS_ATIVOS || 0) <= 5) {
               score += 5;
               vantagens.push(
                  'Chamado de baixa prioridade - recurso pode absorver (+5 pontos)'
               );
            }
         }

         // Bonus por histórico com o cliente (se aplicável)
         if (codCliente) {
            const historico = historicoCliente.find(
               (h: any) => h.COD_RECURSO === recurso.COD_RECURSO
            );
            if (historico) {
               const bonusHistorico = Math.min(
                  15,
                  historico.CHAMADOS_CLIENTE * 2
               );
               score += bonusHistorico;
               vantagens.push(
                  `Histórico com cliente: ${historico.CHAMADOS_CLIENTE} chamados (+${bonusHistorico} pontos)`
               );

               if (historico.TEMPO_MEDIO_RESOLUCAO < 5) {
                  score += 10;
                  vantagens.push(
                     `Resolução rápida para este cliente (${Math.round(historico.TEMPO_MEDIO_RESOLUCAO)} dias) (+10 pontos)`
                  );
               }
            }
         }

         // Garantir que score não seja negativo
         score = Math.max(0, score);

         // Classificar adequação
         let adequacao = 'INADEQUADO';
         let recomendacao = 'Não recomendado';

         if (score >= 80) {
            adequacao = 'EXCELENTE';
            recomendacao = 'Altamente recomendado';
         } else if (score >= 65) {
            adequacao = 'BOM';
            recomendacao = 'Recomendado';
         } else if (score >= 45) {
            adequacao = 'MODERADO';
            recomendacao = 'Pode ser considerado';
         } else if (score >= 25) {
            adequacao = 'BAIXO';
            recomendacao = 'Usar apenas se necessário';
         }

         return {
            ...recurso,
            SCORE_ADEQUACAO: Math.round(score),
            ADEQUACAO: adequacao,
            RECOMENDACAO: recomendacao,
            VANTAGENS: vantagens,
            DESVANTAGENS: desvantagens,
            MOTIVOS_ANALISE: motivos,
            HISTORICO_CLIENTE: codCliente
               ? historicoCliente.find(
                    (h: any) => h.COD_RECURSO === recurso.COD_RECURSO
                 ) || null
               : null,
         };
      });

      // Ordenar por score
      recursosComScore.sort((a, b) => b.SCORE_ADEQUACAO - a.SCORE_ADEQUACAO);

      // Encontrar melhor opção
      const melhorOpcao = recursosComScore[0];
      const opcoesBoas = recursosComScore.filter(r => r.SCORE_ADEQUACAO >= 65);
      const opcoesDisponiveis = recursosComScore.filter(
         r => r.SCORE_ADEQUACAO >= 45
      );

      // Análise do chamado
      let tipoUrgencia = 'NORMAL';
      if (prioridade <= 25) tipoUrgencia = 'CRÍTICA';
      else if (prioridade <= 50) tipoUrgencia = 'ALTA';
      else if (prioridade <= 100) tipoUrgencia = 'MÉDIA';
      else tipoUrgencia = 'BAIXA';

      // Recomendações gerais
      const recomendacoesGerais = [];

      if (opcoesBoas.length === 0) {
         recomendacoesGerais.push(
            '⚠️ Nenhum recurso em condição ideal - considere redistribuir chamados existentes'
         );
      }

      if (prioridade <= 50 && melhorOpcao?.CHAMADOS_CRITICOS > 0) {
         recomendacoesGerais.push(
            '🚨 Chamado de alta prioridade mas melhor recurso já possui chamados críticos'
         );
      }

      if (recursosComScore.filter(r => r.CHAMADOS_ATIVOS === 0).length === 0) {
         recomendacoesGerais.push(
            '💼 Todos os recursos já possuem chamados - considere balanceamento'
         );
      }

      const response = {
         chamadoAnalise: {
            prioridade,
            tipoUrgencia,
            codCliente,
            codClassificacao,
            possuiHistoricoCliente: historicoCliente.length > 0,
         },
         sugestao: {
            recursoRecomendado: melhorOpcao,
            alternativas: recursosComScore.slice(1, 4), // Top 3 alternativas
            totalOpcoesBoas: opcoesBoas.length,
            totalOpcoesDisponiveis: opcoesDisponiveis.length,
         },
         todosRecursos: recursosComScore,
         recomendacoesGerais,
         resumoSistema: {
            totalRecursos: recursos.length,
            recursosLivres: recursosComScore.filter(
               r => r.CHAMADOS_ATIVOS === 0
            ).length,
            recursosSobrecarregados: recursosComScore.filter(
               r => r.CHAMADOS_ATIVOS > 10
            ).length,
            chamadosCriticosTotal: recursosComScore.reduce(
               (acc, r) => acc + (r.CHAMADOS_CRITICOS || 0),
               0
            ),
         },
      };

      return NextResponse.json(response, { status: 200 });
   } catch (error) {
      console.error('Erro ao sugerir recurso:', error);
      return NextResponse.json(
         { error: 'Erro interno no servidor' },
         { status: 500 }
      );
   }
}
