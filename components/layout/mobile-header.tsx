"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface MobileHeaderProps {
  className?: string
  title?: string
}

export function MobileHeader({ className, title }: MobileHeaderProps) {
  return (
    <div className={cn("md:hidden", className)}>
      {title ? (
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
            <div className="font-semibold text-sm sm:text-base ml-12 truncate">{title}</div>
            <div className="w-9" />
          </div>
        </div>
      ) : (
        <div className="h-16" />
      )}
    </div>
  )
}
