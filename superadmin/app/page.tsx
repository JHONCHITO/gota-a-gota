import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161b22] rounded-xl p-8 border border-[#30363d]">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Gota a Gota
        </h1>
        <p className="text-[#8b949e] text-center mb-8">
          Selecciona el panel al que quieres acceder
        </p>
        
        <div className="flex flex-col gap-4">
          <Link
            href="/super-admin/login"
            className="w-full py-3 px-4 bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium rounded-lg text-center transition-colors"
          >
            Super Admin
          </Link>
          
          <Link
            href="/oficina/login"
            className="w-full py-3 px-4 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium rounded-lg text-center transition-colors"
          >
            Panel de Oficina
          </Link>
        </div>
      </div>
    </div>
  )
}
