import { LucideIcon } from "lucide-react"

interface PriceCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  color: "blue" | "green" | "purple" | "indigo" | "orange" | "emerald"
  className?: string
}

export function PriceCard({
  icon: Icon,
  title,
  value,
  color,
  className = ""
}: PriceCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-600"
  }

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    indigo: "text-indigo-600",
    orange: "text-orange-600",
    emerald: "text-emerald-600"
  }

  const valueColorClasses = {
    blue: "text-blue-700",
    green: "text-green-700",
    purple: "text-purple-700",
    indigo: "text-indigo-700",
    orange: "text-orange-700",
    emerald: "text-emerald-700"
  }

  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${colorClasses[color]} ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        <Icon className={`w-4 h-4 ${iconColorClasses[color]}`} />
        {title}
      </div>
      <div className={`font-semibold text-lg ${valueColorClasses[color]}`}>
        {value}
      </div>
    </div>
  )
}
