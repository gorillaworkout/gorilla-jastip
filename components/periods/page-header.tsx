import { Button } from "@/components/ui/button"
import { RefreshCw, Plus, Calendar } from "lucide-react"

interface PageHeaderProps {
  onCreatePeriod: () => void
  onRefreshStatistics: () => void
  loading: boolean
}

export function PageHeader({
  onCreatePeriod,
  onRefreshStatistics,
  loading
}: PageHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg flex-shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Periode Jastip</h1>
            <p className="text-gray-600 text-xs sm:text-sm">Kelola periode dan data customer jastip</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={onRefreshStatistics}
            disabled={loading}
            className="border-orange-300 text-orange-600 hover:bg-orange-50 mobile-button"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs sm:text-sm">Refresh Statistics</span>
          </Button>
          
          <Button 
            onClick={onCreatePeriod}
            className="bg-blue-500 hover:bg-blue-600 mobile-button"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Buat Periode Baru</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
