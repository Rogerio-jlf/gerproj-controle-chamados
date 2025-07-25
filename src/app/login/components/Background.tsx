import Image from 'next/image';

export default function Background() {
  return (
    <div className="absolute inset-0">
      <Image
        src="/imagem-fundo-login.webp"
        alt="Imagem de fundo da tela de login"
        fill
        priority
        className="object-cover opacity-80"
      />
    </div>
  );
}
