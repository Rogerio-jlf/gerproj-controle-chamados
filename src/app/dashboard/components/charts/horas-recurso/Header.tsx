import { Users2 } from 'lucide-react';

export default function Header() {
  return (
    <>
      {/* Header - ok */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-6">
            <div className="group relative">
              <div className="relative flex h-13 w-13 items-center justify-center rounded-lg bg-gradient-to-br from-purple-700 via-blue-700 to-pink-700">
                <Users2 className="h-6 w-6 text-white" />
              </div>
            </div>

            <div>
              <h2 className="bg-gradient-to-r from-blue-700 to-pink-700 bg-clip-text text-3xl font-bold text-transparent">
                Horas por Recurso
              </h2>
              <p className="text-sm font-semibold text-gray-600 italic">
                Distribuição de horas executadas por recurso
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
