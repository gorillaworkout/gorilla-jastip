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
    <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Periode Jastip</h1>
            <p className="text-gray-600">Kelola periode dan data customer jastip</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={onRefreshStatistics}
            disabled={loading}
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Statistics
          </Button>
          
          <Button 
            onClick={onCreatePeriod}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Periode Baru
          </Button>
        </div>
      </div>
    </div>
  )
}
