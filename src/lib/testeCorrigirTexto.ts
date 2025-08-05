import { corrigirTextoCorrompido } from './corrigirTextoCorrompido';

// Textos de exemplo com caracteres corrompidos
const textosCorrompidos = [
  'Diverg�ncia�no�estoque',
  'Relat�rio�de�vendas',
  'Gest�o�de�estoque',
  'Requisi��o�de�material',
  'Informa��es�do�cliente',
  'Atualiza��o�de�cadastro',
  'Manuten��o�preventiva',
  'Solicita��o�de�servi�o',
  'Avalia��o�de�desempenho',
  'Configura��o�do�sistema',
  // Casos não mapeados diretamente
  'Relat�rio�mensal�de�vendas',
  'Controle�de�qualidade�do�produto',
  'Verifica��o�de�estoque�em�andamento'
];

// Testa a função com cada texto corrompido
console.log('Testando correção de textos corrompidos:');
textosCorrompidos.forEach(texto => {
  const corrigido = corrigirTextoCorrompido(texto);
  console.log(`Original: "${texto}"`);
  console.log(`Corrigido: "${corrigido}"`);
  console.log('---');
});