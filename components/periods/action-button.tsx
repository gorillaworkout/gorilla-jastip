import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface ActionButtonProps {
  icon: LucideIcon
  children: React.ReactNode
  variant?: "default" | "outline" | "destructive"
  size?: "sm" | "lg"
  onClick: () => void
  className?: string
  disabled?: boolean
}

export function ActionButton({
  icon: Icon,
  children,
  variant = "outline",
  size = "sm",
  onClick,
  className = "",
  disabled = false
}: ActionButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "default":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
      case "outline":
        return "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
      case "destructive":
        return "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
      default:
        return "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-9 px-3 text-sm"
      case "lg":
        return "h-11 px-5 text-base"
      default:
        return "h-10 px-4 text-sm"
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 transition-all duration-200 rounded-lg border ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </Button>
  )
}
