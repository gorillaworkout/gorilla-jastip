"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Plus, Edit, Trash2, Plane, Calendar, MapPin, Clock, CheckCircle, AlertCircle, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TripsService, type DepartureTrip, type CreateTripData, type UpdateTripData } from "@/lib/trips-service"

const initialFormData: CreateTripData = {
  title: "",
  route: "",
  departureDate: "",
  returnDate: "",
  status: "upcoming",
  description: "",
  orderDeadline: "",
  notes: ""
}

function DeparturesContent() {
  const [trips, setTrips] = useState<DepartureTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<DepartureTrip | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [error, setError] = useState<string | null>(null)

  // Load trips from Firebase on component mount
  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      setLoading(true)
      const tripsData = await TripsService.getAllTrips()
      setTrips(tripsData)
    } catch (error) {
      console.error("Error loading trips:", error)
      setError("Gagal memuat data trip")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTrip = async () => {
    if (!formData.title || !formData.route || !formData.departureDate || !formData.returnDate) {
      setError("Mohon isi semua field yang wajib")
      return
    }

    try {
      setError(null)
      await TripsService.createTrip(formData)
      setIsCreateModalOpen(false)
      setFormData(initialFormData)
      await loadTrips() // Reload trips from Firebase
    } catch (err) {
      console.error("Error creating trip:", err)
      setError("Gagal membuat trip baru")
    }
  }

  const handleEditTrip = async () => {
    if (!editingTrip) return

    if (!formData.title || !formData.route || !formData.departureDate || !formData.returnDate) {
      setError("Mohon isi semua field yang wajib")
      return
    }

    try {
      setError(null)
      const updateData: UpdateTripData = {
        title: formData.title,
        route: formData.route,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        status: formData.status,
        description: formData.description,
        orderDeadline: formData.orderDeadline,
        notes: formData.notes
      }
      
      await TripsService.updateTrip(editingTrip.id!, updateData)
      setIsEditModalOpen(false)
      setEditingTrip(null)
      setFormData(initialFormData)
      await loadTrips() // Reload trips from Firebase
    } catch (err) {
      console.error("Error updating trip:", err)
      setError("Gagal mengupdate trip")
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus trip ini?")) {
      return
    }

    try {
      await TripsService.deleteTrip(tripId)
      await loadTrips() // Reload trips from Firebase
    } catch (err) {
      console.error("Error deleting trip:", err)
      setError("Gagal menghapus trip")
    }
  }

  const openEditModal = (trip: DepartureTrip) => {
    setEditingTrip(trip)
    setFormData({
      title: trip.title,
      route: trip.route,
      departureDate: trip.departureDate,
      returnDate: trip.returnDate,
      status: trip.status,
      description: trip.description,
      orderDeadline: trip.orderDeadline || "",
      notes: trip.notes || ""
    })
    setIsEditModalOpen(true)
  }

  const getStatusInfo = (status: DepartureTrip['status']) => {
    switch (status) {
      case 'upcoming':
        return { label: 'Upcoming', color: 'bg-green-100 text-green-800', icon: Clock }
      case 'completed':
        return { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
      case 'planning':
        return { label: 'Planning', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: X }
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
  }

  const calculateDuration = (departureDate: string, returnDate: string) => {
    if (!departureDate || !returnDate) return "TBD"
    
    const start = new Date(departureDate)
    const end = new Date(returnDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} hari`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD"
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <MobileHeader />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">List Keberangkatan</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Kelola jadwal keberangkatan dan trip Anda</p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Trip
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Trip Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Judul Trip *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Contoh: Jakarta → Tokyo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="route">Rute *</Label>
                      <Input
                        id="route"
                        value={formData.route}
                        onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                        placeholder="Contoh: Indonesia → Japan"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="departureDate">Tanggal Berangkat *</Label>
                      <Input
                        id="departureDate"
                        type="date"
                        value={formData.departureDate}
                        onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="returnDate">Tanggal Pulang *</Label>
                      <Input
                        id="returnDate"
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: DepartureTrip['status']) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi Trip</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Deskripsi singkat tentang trip ini"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="orderDeadline">Deadline Order (Opsional)</Label>
                    <Input
                      id="orderDeadline"
                      type="date"
                      value={formData.orderDeadline}
                      onChange={(e) => setFormData({ ...formData, orderDeadline: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Kapan customer harus order untuk barang yang akan dibawa
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Catatan tambahan atau informasi penting"
                      rows={2}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button onClick={handleCreateTrip} className="flex-1">
                      Tambah Trip
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Trip Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {trips.map((trip) => {
                const statusInfo = getStatusInfo(trip.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <Card key={trip.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg">{trip.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {trip.route}
                          </CardDescription>
                        </div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Berangkat</p>
                          <p className="font-medium">{formatDate(trip.departureDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pulang</p>
                          <p className="font-medium">{formatDate(trip.returnDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Durasi:</span>
                        <span className="font-medium">{calculateDuration(trip.departureDate, trip.returnDate)}</span>
                      </div>

                      {trip.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {trip.description}
                        </p>
                      )}

                      {trip.orderDeadline && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Deadline Order:</span>
                          <span className="font-medium text-orange-600">{formatDate(trip.orderDeadline)}</span>
                        </div>
                      )}

                      {trip.notes && (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          <span className="font-medium">Catatan:</span> {trip.notes}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(trip)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => trip.id && handleDeleteTrip(trip.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {trips.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Belum ada trip</h3>
                <p className="text-muted-foreground mb-4">
                  Mulai dengan menambahkan trip pertama Anda
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Trip Pertama
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Edit Trip Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Judul Trip *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Jakarta → Tokyo"
                />
              </div>
              <div>
                <Label htmlFor="edit-route">Rute *</Label>
                <Input
                  id="edit-route"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="Contoh: Indonesia → Japan"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-departureDate">Tanggal Berangkat *</Label>
                <Input
                  id="edit-departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-returnDate">Tanggal Pulang *</Label>
                <Input
                  id="edit-returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: DepartureTrip['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-description">Deskripsi Trip</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat tentang trip ini"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-orderDeadline">Deadline Order (Opsional)</Label>
              <Input
                id="edit-orderDeadline"
                type="date"
                value={formData.orderDeadline}
                onChange={(e) => setFormData({ ...formData, orderDeadline: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Catatan Tambahan</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan tambahan atau informasi penting"
                rows={2}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={handleEditTrip} className="flex-1">
                Update Trip
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Departures() {
  return (
    <AdminGuard>
      <DeparturesContent />
    </AdminGuard>
  )
}
