"use client"

import { cn } from "@/lib/utils"


interface MobileHeaderProps {
  className?: string
  title?: string
}

export function MobileHeader({ className, title }: MobileHeaderProps) {
  return (
    <div className={cn("sticky top-0 z-20 h-14 border-b bg-background/95 backdrop-blur md:hidden", className)}>
      <div className="mx-auto flex h-full max-w-7xl items-center px-4">
        <h1 className="min-w-0 truncate pl-12 text-base font-semibold">{title}</h1>
      </div>
    </div>
  )
}
