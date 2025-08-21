import { LucideIcon } from "lucide-react"

interface StatisticsCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  color: "blue" | "green" | "purple" | "orange" | "red"
  className?: string
}

export function StatisticsCard({
  icon: Icon,
  value,
  label,
  color,
  className = ""
}: StatisticsCardProps) {
  const colorConfig = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      value: "text-blue-700",
      label: "text-blue-600"
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      value: "text-green-700",
      label: "text-green-600"
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "text-purple-600",
      value: "text-purple-700",
      label: "text-purple-600"
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      value: "text-orange-700",
      label: "text-orange-600"
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      value: "text-red-700",
      label: "text-red-600"
    }
  }

  const config = colorConfig[color]

  return (
    <div className={`text-center p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${config.bg} ${config.border} ${className}`}>
      <div className="flex items-center justify-center mb-3">
        <div className={`p-2 ${config.bg} rounded-lg`}>
          <Icon className={`w-6 h-6 ${config.icon}`} />
        </div>
      </div>
      <div className={`text-2xl font-bold mb-2 ${config.value}`}>
        {value}
      </div>
      <div className={`text-sm font-medium ${config.label}`}>
        {label}
      </div>
    </div>
  )
}
