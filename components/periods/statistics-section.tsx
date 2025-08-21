import { User, TrendingUp, DollarSign, Percent } from "lucide-react"
import { Period } from "@/lib/types"
import { StatisticsCard } from "./statistics-card"

interface StatisticsSectionProps {
  period: Period
  formatCurrency: (amount: number) => string
}

export function StatisticsSection({ period, formatCurrency }: StatisticsSectionProps) {
  return (
    <div className="p-6 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatisticsCard
          icon={User}
          value={period.totalProducts}
          label="Total Item"
          color="blue"
        />
        <StatisticsCard
          icon={TrendingUp}
          value={formatCurrency(period.totalRevenue)}
          label="Total Revenue"
          color="green"
        />
        <StatisticsCard
          icon={DollarSign}
          value={formatCurrency(period.totalProfit)}
          label="Total Profit"
          color="blue"
        />
        <StatisticsCard
          icon={Percent}
          value={`${period.averageMargin.toFixed(1)}%`}
          label="Rata-rata Margin"
          color="purple"
        />
      </div>
    </div>
  )
}
