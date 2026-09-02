import type { ReactNode } from "react"
import { PublicHeader } from "./public-header"

export function PublicLegalPage({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <PublicHeader />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
          {children}
        </div>
      </article>
    </main>
  )
}
