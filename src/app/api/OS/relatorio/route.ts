import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { firebirdQuery } from '../../../../lib/firebird/firebird-client';

export async function GET(request: Request) {
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
      const codRecurso = decoded.recurso?.id;

      const { searchParams } = new URL(request.url);

      // Parâmetros de filtro de período
      const dataInicio = searchParams.get('dataInicio'); // Formato: YYYY-MM-DD
      const dataFim = searchParams.get('dataFim'); // Formato: YYYY-MM-DD
      const mesParam = searchParams.get('mes');
      const anoParam = searchParams.get('ano');

      // Parâmetro de agrupamento
      const agruparPor = searchParams.get('agruparPor') || 'cliente';
      // Opções: 'cliente', 'recurso', 'projeto', 'tarefa', 'mes', 'cliente-recurso'

      // Filtros específicos
      const codClienteFilter = searchParams.get('codCliente');
      const codRecursoFilter = searchParams.get('codRecurso');
      const codProjetoFilter = searchParams.get('codProjeto');
      const faturadoFilter = searchParams.get('faturado'); // 'SIM', 'NAO', ou null (todos)
      const validadoFilter = searchParams.get('validado'); // 'SIM', 'NAO', ou null (todos)

      // Formato de exportação
      const formato = searchParams.get('formato') || 'json'; // 'json' ou 'csv'

      // Validações
      if (!isAdmin && !codRecurso) {
         return NextResponse.json(
            { error: 'Usuário não admin precisa ter codRecurso definido' },
            { status: 400 }
         );
      }

      const whereConditions: string[] = [];
      const params: any[] = [];

      // Filtro de período
      if (dataInicio && dataFim) {
         whereConditions.push('OS.DTINI_OS BETWEEN ? AND ?');
         params.push(dataInicio, dataFim);
      } else if (mesParam && anoParam) {
         const mes = Number(mesParam);
         const ano = Number(anoParam);

         if (isNaN(mes) || mes < 1 || mes > 12 || isNaN(ano)) {
            return NextResponse.json(
               { error: 'Mês ou ano inválido' },
               { status: 400 }
            );
         }

         whereConditions.push(
            'EXTRACT(YEAR FROM OS.DTINI_OS) = ? AND EXTRACT(MONTH FROM OS.DTINI_OS) = ?'
         );
         params.push(ano, mes);
      } else if (anoParam) {
         const ano = Number(anoParam);
         if (isNaN(ano)) {
            return NextResponse.json(
               { error: 'Ano inválido' },
               { status: 400 }
            );
         }
         whereConditions.push('EXTRACT(YEAR FROM OS.DTINI_OS) = ?');
         params.push(ano);
      }

      // Filtro de recurso (admin pode filtrar por recurso específico, não-admin vê apenas seus dados)
      if (!isAdmin && codRecurso) {
         whereConditions.push('OS.CODREC_OS = ?');
         params.push(Number(codRecurso));
      } else if (isAdmin && codRecursoFilter) {
         whereConditions.push('OS.CODREC_OS = ?');
         params.push(Number(codRecursoFilter));
      }

      // Filtros adicionais
      if (codClienteFilter) {
         whereConditions.push('Cliente.COD_CLIENTE = ?');
         params.push(Number(codClienteFilter));
      }

      if (codProjetoFilter) {
         whereConditions.push('Projeto.COD_PROJETO = ?');
         params.push(Number(codProjetoFilter));
      }

      if (faturadoFilter) {
         const faturado = faturadoFilter.toUpperCase();
         if (faturado === 'SIM' || faturado === 'NAO') {
            whereConditions.push('TRIM(UPPER(OS.FATURADO_OS)) = ?');
            params.push(faturado);
         }
      }

      if (validadoFilter) {
         const validado = validadoFilter.toUpperCase();
         if (validado === 'SIM' || validado === 'NAO') {
            whereConditions.push('TRIM(UPPER(OS.VALID_OS)) = ?');
            params.push(validado);
         }
      }

      // Excluir registros sem chamado
      // Excluir registros com chamado vazio, mas manter os NULL
      whereConditions.push(
         '(CAST(OS.CHAMADO_OS AS VARCHAR(20)) <> ? OR OS.CHAMADO_OS IS NULL)'
      );
      params.push('');

      // Query base para buscar todas as OS
      const baseSql = `
         SELECT
            OS.COD_OS,
            OS.DTINI_OS,
            OS.HRINI_OS,
            OS.HRFIM_OS,
            OS.FATURADO_OS,
            OS.VALID_OS,
            OS.COMP_OS,
            OS.CHAMADO_OS,
            Recurso.COD_RECURSO,
            Recurso.NOME_RECURSO,
            Cliente.COD_CLIENTE,
            Cliente.NOME_CLIENTE,
            Tarefa.COD_TAREFA,
            Tarefa.NOME_TAREFA,
            Projeto.COD_PROJETO,
            Projeto.NOME_PROJETO
         FROM OS
         LEFT JOIN RECURSO Recurso ON Recurso.COD_RECURSO = OS.CODREC_OS
         LEFT JOIN CHAMADO Chamado ON Chamado.COD_CHAMADO = OS.CHAMADO_OS
         LEFT JOIN CLIENTE Cliente ON Cliente.COD_CLIENTE = Chamado.COD_CLIENTE
         LEFT JOIN TAREFA Tarefa ON Tarefa.COD_TAREFA = OS.CODTRF_OS
         LEFT JOIN PROJETO Projeto ON Projeto.COD_PROJETO = Tarefa.CODPRO_TAREFA
         ${whereConditions.length ? 'WHERE ' + whereConditions.join(' AND ') : ''}
         ORDER BY OS.DTINI_OS, Cliente.NOME_CLIENTE, Recurso.NOME_RECURSO
      `;

      const rawData = await firebirdQuery(baseSql, params);

      // Função para calcular horas
      const calculateHours = (
         hrini: string | null,
         hrfim: string | null
      ): number => {
         if (!hrini || !hrfim) return 0;

         try {
            const strHrini = String(hrini).trim();
            const strHrfim = String(hrfim).trim();

            if (!strHrini || !strHrfim) return 0;

            const parseTime = (timeStr: string) => {
               const cleanTime = timeStr
                  .replace(/[^0-9]/g, '')
                  .padStart(4, '0');
               if (cleanTime.length < 4) return null;

               const hours = parseInt(cleanTime.substring(0, 2), 10);
               const minutes = parseInt(cleanTime.substring(2, 4), 10);

               if (
                  isNaN(hours) ||
                  isNaN(minutes) ||
                  hours > 23 ||
                  minutes > 59
               ) {
                  return null;
               }

               return hours + minutes / 60;
            };

            const horaInicio = parseTime(strHrini);
            const horaFim = parseTime(strHrfim);

            if (horaInicio === null || horaFim === null) return 0;

            let diferenca = horaFim - horaInicio;
            if (diferenca < 0) diferenca += 24;

            return Math.round(diferenca * 100) / 100;
         } catch (error) {
            return 0;
         }
      };

      // Processar dados e calcular horas
      const processedData = rawData.map((record: any) => ({
         ...record,
         HORAS_TRABALHADAS: calculateHours(record.HRINI_OS, record.HRFIM_OS),
         TAREFA_COMPLETA:
            record.COD_TAREFA && record.NOME_TAREFA
               ? `${record.COD_TAREFA} - ${record.NOME_TAREFA}`
               : null,
         PROJETO_COMPLETO:
            record.COD_PROJETO && record.NOME_PROJETO
               ? `${record.COD_PROJETO} - ${record.NOME_PROJETO}`
               : null,
      }));

      // Função para agrupar dados
      const agruparDados = () => {
         const grupos: any = {};

         processedData.forEach((os: any) => {
            let chave = '';
            let nomeGrupo = '';

            switch (agruparPor) {
               case 'cliente':
                  chave = `${os.COD_CLIENTE || 'SEM_CLIENTE'}`;
                  nomeGrupo = os.NOME_CLIENTE || 'Sem Cliente';
                  break;

               case 'recurso':
                  chave = `${os.COD_RECURSO || 'SEM_RECURSO'}`;
                  nomeGrupo = os.NOME_RECURSO || 'Sem Recurso';
                  break;

               case 'projeto':
                  chave = `${os.COD_PROJETO || 'SEM_PROJETO'}`;
                  nomeGrupo = os.PROJETO_COMPLETO || 'Sem Projeto';
                  break;

               case 'tarefa':
                  chave = `${os.COD_TAREFA || 'SEM_TAREFA'}`;
                  nomeGrupo = os.TAREFA_COMPLETA || 'Sem Tarefa';
                  break;

               case 'mes':
                  if (os.DTINI_OS) {
                     const data = new Date(os.DTINI_OS);
                     const mes = data.getMonth() + 1;
                     const ano = data.getFullYear();
                     chave = `${ano}-${mes.toString().padStart(2, '0')}`;
                     nomeGrupo = `${mes.toString().padStart(2, '0')}/${ano}`;
                  } else {
                     chave = 'SEM_DATA';
                     nomeGrupo = 'Sem Data';
                  }
                  break;

               case 'cliente-recurso':
                  chave = `${os.COD_CLIENTE || 'SEM_CLIENTE'}-${os.COD_RECURSO || 'SEM_RECURSO'}`;
                  nomeGrupo = `${os.NOME_CLIENTE || 'Sem Cliente'} - ${os.NOME_RECURSO || 'Sem Recurso'}`;
                  break;

               default:
                  chave = `${os.COD_CLIENTE || 'SEM_CLIENTE'}`;
                  nomeGrupo = os.NOME_CLIENTE || 'Sem Cliente';
            }

            if (!grupos[chave]) {
               grupos[chave] = {
                  chave,
                  nome: nomeGrupo,
                  totalHoras: 0,
                  quantidadeOS: 0,
                  osFaturadas: 0,
                  osValidadas: 0,
                  detalhes: [],
                  // Informações adicionais dependendo do agrupamento
                  ...(agruparPor === 'cliente' && {
                     codCliente: os.COD_CLIENTE,
                  }),
                  ...(agruparPor === 'recurso' && {
                     codRecurso: os.COD_RECURSO,
                  }),
                  ...(agruparPor === 'projeto' && {
                     codProjeto: os.COD_PROJETO,
                  }),
                  ...(agruparPor === 'tarefa' && {
                     codTarefa: os.COD_TAREFA,
                  }),
                  ...(agruparPor === 'cliente-recurso' && {
                     codCliente: os.COD_CLIENTE,
                     codRecurso: os.COD_RECURSO,
                  }),
               };
            }

            grupos[chave].totalHoras += os.HORAS_TRABALHADAS;
            grupos[chave].quantidadeOS += 1;

            if (os.FATURADO_OS?.trim().toUpperCase() === 'SIM') {
               grupos[chave].osFaturadas += 1;
            }

            if (os.VALID_OS?.trim().toUpperCase() === 'SIM') {
               grupos[chave].osValidadas += 1;
            }

            grupos[chave].detalhes.push({
               codOs: os.COD_OS,
               data: os.DTINI_OS,
               chamado: os.CHAMADO_OS,
               horaInicio: os.HRINI_OS,
               horaFim: os.HRFIM_OS,
               horas: os.HORAS_TRABALHADAS,
               faturado: os.FATURADO_OS?.trim(),
               validado: os.VALID_OS?.trim(),
               competencia: os.COMP_OS,
               ...(agruparPor !== 'cliente' && {
                  cliente: os.NOME_CLIENTE,
                  codCliente: os.COD_CLIENTE,
               }),
               ...(agruparPor !== 'recurso' && {
                  recurso: os.NOME_RECURSO,
                  codRecurso: os.COD_RECURSO,
               }),
               ...(agruparPor !== 'projeto' && {
                  projeto: os.PROJETO_COMPLETO,
                  codProjeto: os.COD_PROJETO,
               }),
               ...(agruparPor !== 'tarefa' && {
                  tarefa: os.TAREFA_COMPLETA,
                  codTarefa: os.COD_TAREFA,
               }),
            });
         });

         return Object.values(grupos);
      };

      const dadosAgrupados: any = agruparDados();

      // Arredondar totais de horas
      dadosAgrupados.forEach((grupo: any) => {
         grupo.totalHoras = Math.round(grupo.totalHoras * 100) / 100;
      });

      // Calcular totalizadores gerais
      const totalizadores = {
         totalGeralHoras: dadosAgrupados.reduce(
            (acc: number, g: any) => acc + g.totalHoras,
            0
         ),
         totalGeralOS: dadosAgrupados.reduce(
            (acc: number, g: any) => acc + g.quantidadeOS,
            0
         ),
         totalOSFaturadas: dadosAgrupados.reduce(
            (acc: number, g: any) => acc + g.osFaturadas,
            0
         ),
         totalOSValidadas: dadosAgrupados.reduce(
            (acc: number, g: any) => acc + g.osValidadas,
            0
         ),
         quantidadeGrupos: dadosAgrupados.length,
      };

      totalizadores.totalGeralHoras =
         Math.round(totalizadores.totalGeralHoras * 100) / 100;

      // Ordenar por total de horas (decrescente)
      dadosAgrupados.sort((a: any, b: any) => b.totalHoras - a.totalHoras);

      // Se formato CSV, gerar CSV
      if (formato === 'csv') {
         const csvLines = [];

         // Cabeçalho
         csvLines.push(
            `Agrupamento;Nome;Código;Total Horas;Quantidade OS;OS Faturadas;OS Validadas`
         );

         // Dados
         dadosAgrupados.forEach((grupo: any) => {
            const codigo =
               grupo.codCliente ||
               grupo.codRecurso ||
               grupo.codProjeto ||
               grupo.codTarefa ||
               '';
            csvLines.push(
               `${agruparPor};${grupo.nome};${codigo};${grupo.totalHoras};${grupo.quantidadeOS};${grupo.osFaturadas};${grupo.osValidadas}`
            );
         });

         // Totalizador
         csvLines.push('');
         csvLines.push(
            `TOTAL GERAL;;${totalizadores.totalGeralHoras};${totalizadores.totalGeralOS};${totalizadores.totalOSFaturadas};${totalizadores.totalOSValidadas}`
         );

         const csvContent = csvLines.join('\n');

         return new NextResponse(csvContent, {
            status: 200,
            headers: {
               'Content-Type': 'text/csv; charset=utf-8',
               'Content-Disposition': `attachment; filename="relatorio_os_${agruparPor}_${new Date().toISOString().split('T')[0]}.csv"`,
            },
         });
      }

      // Resposta JSON
      return NextResponse.json(
         {
            relatorio: {
               tipoAgrupamento: agruparPor,
               periodo: {
                  dataInicio: dataInicio || null,
                  dataFim: dataFim || null,
                  mes: mesParam || null,
                  ano: anoParam || null,
               },
               filtros: {
                  cliente: codClienteFilter || null,
                  recurso: codRecursoFilter || null,
                  projeto: codProjetoFilter || null,
                  faturado: faturadoFilter || null,
                  validado: validadoFilter || null,
               },
               totalizadores,
               grupos: dadosAgrupados,
            },
         },
         { status: 200 }
      );
   } catch (error) {
      console.error('Erro ao gerar relatório:', error);

      if (error instanceof Error) {
         console.error('Mensagem:', error.message);
         console.error('Stack:', error.stack);
      }

      return NextResponse.json(
         { error: 'Erro ao gerar relatório' },
         { status: 500 }
      );
   }
}
