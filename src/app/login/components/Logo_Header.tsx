import Image from 'next/image';

export default function LogoHeader() {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-30 blur-lg"></div>
      <div className="relative inline-block rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur-sm">
        <Image
          src="/logo-solutii.png"
          alt="Logo Solutii"
          width={80}
          height={80}
          className="mx-auto rounded-full"
          priority
        />
      </div>
    </div>
  );
}
