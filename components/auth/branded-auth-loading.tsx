import Image from "next/image"

export function BrandedAuthLoading({ message = "Memuat..." }: { message?: string }) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="text-center">
        <div className="relative mb-6 inline-flex items-center justify-center">
          <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl" />
          <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-6 ring-4 ring-blue-400/30">
            <Image
              src="/jastipdigw.png"
              alt="JastipdiGW"
              width={80}
              height={80}
              priority
              className="relative z-10 object-contain drop-shadow-lg"
            />
          </div>
        </div>
        <p className="text-blue-200 text-sm">{message}</p>
      </div>
    </div>
  )
}
