function recodificarTextoCorrompido(texto: string): string {
  try {
    const buffer = new TextEncoder().encode(texto);
    const decodificado = new TextDecoder('latin1').decode(buffer);
    return decodificado;
  } catch {
    return texto;
  }
}
