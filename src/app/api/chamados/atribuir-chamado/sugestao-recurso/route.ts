import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../../lib/firebird/firebird-client';
import jwt from 'jsonwebtoken';

// Função auxiliar para calcular dias (compatível com Firebird)
const calcularDiasDesde = (dataFirebird: string) => {
   if (!dataFirebird) return 0;
   const data = new Date(dataFirebird);
   const hoje = new Date();
   return Math.ceil(
      Math.abs(hoje.getTime() - data.getTime()) / (1000 * 60 * 60 * 24)
   );
};

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

      // Buscar recursos ativos com seus chamados ativos
      const sqlRecursos = `
      SELECT 
        r.COD_RECURSO,
        r.NOME_RECURSO,
        r.EMAIL_RECURSO,
        r.ATIVO_RECURSO
      FROM RECURSO r
      WHERE (r.ATIVO_RECURSO = 1 OR r.ATIVO_RECURSO IS NULL)
      ORDER BY r.NOME_RECURSO
    `;

      // Buscar todos os chamados ativos
      const sqlChamadosAtivos = `
      SELECT 
        c.COD_CHAMADO,
        c.COD_RECURSO,
        c.DATA_CHAMADO,
        c.PRIOR_CHAMADO,
        c.STATUS_CHAMADO,
        c.CONCLUSAO_CHAMADO
      FROM CHAMADO c
      WHERE c.STATUS_CHAMADO NOT IN ('FINALIZADO')
    `;

      // Se cliente especificado, buscar histórico do cliente
      let sqlHistoricoCliente = '';
      let historicoParams: any[] = [];

      if (codCliente) {
         sqlHistoricoCliente = `
        SELECT 
          c.COD_RECURSO,
          c.DATA_CHAMADO,
          c.CONCLUSAO_CHAMADO
        FROM CHAMADO c
        WHERE c.COD_CLIENTE = ?
          AND c.COD_RECURSO IS NOT NULL
        ORDER BY c.DATA_CHAMADO DESC
      `;
         historicoParams = [codCliente];
      }

      // Executar queries
      const [recursos, chamadosAtivos, historicoClienteRaw] = await Promise.all(
         [
            firebirdQuery(sqlRecursos),
            firebirdQuery(sqlChamadosAtivos),
            codCliente
               ? firebirdQuery(sqlHistoricoCliente, historicoParams)
               : Promise.resolve([]),
         ]
      );

      // Processar histórico do cliente (se aplicável)
      const historicoClienteProcessado: any[] = [];
      if (codCliente && historicoClienteRaw.length > 0) {
         const historicoPorRecurso: { [key: string]: any } = {};

         historicoClienteRaw.forEach((h: any) => {
            if (!historicoPorRecurso[h.COD_RECURSO]) {
               historicoPorRecurso[h.COD_RECURSO] = {
                  COD_RECURSO: h.COD_RECURSO,
                  CHAMADOS_CLIENTE: 0,
                  TEMPOS_RESOLUCAO: [],
                  ULTIMO_ATENDIMENTO: null,
               };
            }

            historicoPorRecurso[h.COD_RECURSO].CHAMADOS_CLIENTE++;

            if (h.CONCLUSAO_CHAMADO) {
               const diasResolucao = calcularDiasDesde(h.DATA_CHAMADO);
               historicoPorRecurso[h.COD_RECURSO].TEMPOS_RESOLUCAO.push(
                  diasResolucao
               );
            }

            if (
               !historicoPorRecurso[h.COD_RECURSO].ULTIMO_ATENDIMENTO ||
               new Date(h.DATA_CHAMADO) >
                  new Date(
                     historicoPorRecurso[h.COD_RECURSO].ULTIMO_ATENDIMENTO
                  )
            ) {
               historicoPorRecurso[h.COD_RECURSO].ULTIMO_ATENDIMENTO =
                  h.DATA_CHAMADO;
            }
         });

         // Calcular tempo médio de resolução para cada recurso
         Object.values(historicoPorRecurso).forEach((recurso: any) => {
            if (recurso.TEMPOS_RESOLUCAO.length > 0) {
               recurso.TEMPO_MEDIO_RESOLUCAO =
                  recurso.TEMPOS_RESOLUCAO.reduce(
                     (sum: number, time: number) => sum + time,
                     0
                  ) / recurso.TEMPOS_RESOLUCAO.length;
            }
            historicoClienteProcessado.push(recurso);
         });
      }

      // Processar recursos e calcular estatísticas
      const recursosComEstatisticas = recursos.map((recurso: any) => {
         const chamadosDoRecurso = chamadosAtivos.filter(
            (c: any) => c.COD_RECURSO === recurso.COD_RECURSO
         );

         const chamadosAtivosCount = chamadosDoRecurso.length;
         const altaPrioridade = chamadosDoRecurso.filter(
            (c: any) => c.PRIOR_CHAMADO <= 50
         ).length;
         const mediaPrioridade = chamadosDoRecurso.filter(
            (c: any) => c.PRIOR_CHAMADO > 50 && c.PRIOR_CHAMADO <= 100
         ).length;
         const baixaPrioridade = chamadosDoRecurso.filter(
            (c: any) => c.PRIOR_CHAMADO > 100
         ).length;

         // Calcular idade média dos chamados
         let idadeMedia = 0;
         if (chamadosAtivosCount > 0) {
            const totalDias = chamadosDoRecurso.reduce(
               (sum: number, c: any) => {
                  return sum + calcularDiasDesde(c.DATA_CHAMADO);
               },
               0
            );
            idadeMedia = totalDias / chamadosAtivosCount;
         }

         // Calcular chamados críticos
         const chamadosCriticos = chamadosDoRecurso.filter((c: any) => {
            return (
               c.PRIOR_CHAMADO <= 50 && calcularDiasDesde(c.DATA_CHAMADO) > 3
            );
         }).length;

         return {
            ...recurso,
            CHAMADOS_ATIVOS: chamadosAtivosCount,
            ALTA_PRIORIDADE: altaPrioridade,
            MEDIA_PRIORIDADE: mediaPrioridade,
            BAIXA_PRIORIDADE: baixaPrioridade,
            IDADE_MEDIA: idadeMedia,
            CHAMADOS_CRITICOS: chamadosCriticos,
         };
      });

      // Calcular score de adequação
      const recursosComScore = recursosComEstatisticas.map((recurso: any) => {
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
            const historico = historicoClienteProcessado.find(
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

               if (
                  historico.TEMPO_MEDIO_RESOLUCAO &&
                  historico.TEMPO_MEDIO_RESOLUCAO < 5
               ) {
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
               ? historicoClienteProcessado.find(
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
            possuiHistoricoCliente: historicoClienteProcessado.length > 0,
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
