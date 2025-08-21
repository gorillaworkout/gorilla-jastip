import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  isActive: boolean
  className?: string
}

export function StatusBadge({ isActive, className = "" }: StatusBadgeProps) {
  const getStatusConfig = () => {
    if (isActive) {
      return {
        text: "🟢 Aktif",
        classes: "bg-green-100 text-green-800 border-green-200"
      }
    } else {
      return {
        text: "⚪ Tidak Aktif",
        classes: "bg-gray-100 text-gray-600 border-gray-200"
      }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge 
      variant={isActive ? "default" : "secondary"}
      className={`px-3 py-1 text-sm font-medium rounded-full border ${config.classes} ${className}`}
    >
      {config.text}
    </Badge>
  )
}
