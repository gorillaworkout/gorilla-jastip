import { Button } from "@/components/ui/button"
import { Calendar, Plus } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  buttonText: string
  onAction: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  buttonText,
  onAction,
  icon = <Calendar className="h-12 w-12 text-gray-400" />
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="bg-white rounded-lg shadow-md border p-8 max-w-md mx-auto">
        <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          {icon}
        </div>
        
        <h3 className="text-xl font-bold mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        
        <Button 
          onClick={onAction} 
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </div>
    </div>
  )
}
