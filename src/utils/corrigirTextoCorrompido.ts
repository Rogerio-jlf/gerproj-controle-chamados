import iconv from 'iconv-lite';

export function corrigirTextoCorrompido(texto: string): string {
  // Detecta presença de caracteres corrompidos
  const precisaCorrigir =
    texto.includes('Ã') || texto.includes('â') || texto.includes('�');

  if (!precisaCorrigir) return texto;

  try {
    // Converte o texto corrompido para um buffer, simulando leitura binária
    const buffer = Buffer.from(texto, 'binary');

    // Decodifica o buffer como UTF-8 (revertendo o problema)
    return iconv.decode(buffer, 'utf-8');
  } catch {
    return texto;
  }
}
