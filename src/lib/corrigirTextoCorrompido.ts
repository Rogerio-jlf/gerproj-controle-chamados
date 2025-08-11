import iconv from 'iconv-lite';

export function corrigirTextoCorrompido(texto: string): string {
  // Se o texto for nulo ou vazio, retorna o próprio texto
  if (!texto) return texto;

  // Casos específicos conhecidos
  const casosEspecificos: Record<string, string> = {
    'Diverg�ncia�no�estoque': 'Divergência no estoque',
    'Relat�rio�de�vendas': 'Relatório de vendas',
    'Gest�o�de�estoque': 'Gestão de estoque',
    'Requisi��o�de�material': 'Requisição de material',
    'Informa��es�do�cliente': 'Informações do cliente',
    'Atualiza��o�de�cadastro': 'Atualização de cadastro',
    'Manuten��o�preventiva': 'Manutenção preventiva',
    'Solicita��o�de�servi�o': 'Solicitação de serviço',
    'Avalia��o�de�desempenho': 'Avaliação de desempenho',
    'Configura��o�do�sistema': 'Configuração do sistema',
  };

  // Verifica se é um caso específico conhecido
  if (casosEspecificos[texto]) {
    return casosEspecificos[texto];
  }

  // Substituições específicas para padrões comuns
  let textoCorrigido = texto
    .replace(/�ncia/g, 'ência')
    .replace(/�no�/g, ' no ')
    .replace(/�de�/g, ' de ')
    .replace(/��o/g, 'ção')
    .replace(/�o�/g, 'ão ')
    .replace(/�rio�/g, 'ório ')
    .replace(/�do�/g, ' do ')
    .replace(/�da�/g, ' da ')
    .replace(/�em�/g, ' em ')
    .replace(/�para�/g, ' para ')
    .replace(/�com�/g, ' com ')
    .replace(/�es�/g, 'ões')
    .replace(/�/g, 'Ç');

  // Limpa espaços duplos que podem ter sido criados
  textoCorrigido = textoCorrigido.replace(/\s+/g, ' ').trim();

  // Se ainda contém caracteres corrompidos, tenta a abordagem de codificação
  if (textoCorrigido.includes('�')) {
    try {
      // Tenta diferentes codificações
      const codificacoes = ['latin1', 'iso-8859-1', 'windows-1252', 'utf-8'];

      for (const codificacao of codificacoes) {
        try {
          const buffer = Buffer.from(texto, 'binary');
          const tentativa = iconv.decode(buffer, codificacao);

          if (!tentativa.includes('�')) {
            return tentativa;
          }
        } catch (err) {
          continue;
        }
      }

      // Se nenhuma codificação funcionou, retorna o texto com as substituições já feitas
      return textoCorrigido;
    } catch (error) {
      console.error('Erro ao corrigir texto corrompido:', error);
      return textoCorrigido;
    }
  }

  return textoCorrigido;
}
