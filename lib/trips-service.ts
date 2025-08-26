import { db } from "./firebase"
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  where,
  limit
} from "firebase/firestore"

export interface DepartureTrip {
  id?: string
  title: string
  route: string
  departureDate: string
  returnDate: string
  status: 'upcoming' | 'completed' | 'planning' | 'cancelled'
  description: string
  orderDeadline?: string
  notes?: string
  createdAt?: any
  updatedAt?: any
}

export interface CreateTripData {
  title: string
  route: string
  departureDate: string
  returnDate: string
  status: 'upcoming' | 'completed' | 'planning' | 'cancelled'
  description: string
  orderDeadline?: string
  notes?: string
}

export interface UpdateTripData {
  title?: string
  route?: string
  departureDate?: string
  returnDate?: string
  status?: 'upcoming' | 'completed' | 'planning' | 'cancelled'
  description?: string
  orderDeadline?: string
  notes?: string
}

const COLLECTION_NAME = "departure_trips"

export class TripsService {
  /**
   * Get all trips ordered by creation date (newest first)
   */
  static async getAllTrips(): Promise<DepartureTrip[]> {
    if (!db) throw new Error("Firestore not initialized")
    
    try {
      const tripsRef = collection(db, COLLECTION_NAME)
      const q = query(tripsRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DepartureTrip[]
    } catch (error) {
      console.error("Error getting trips:", error)
      throw new Error("Gagal mengambil data trip")
    }
  }

  /**
   * Get trips by status
   */
  static async getTripsByStatus(status: DepartureTrip['status']): Promise<DepartureTrip[]> {
    if (!db) throw new Error("Firestore not initialized")
    
    try {
      const tripsRef = collection(db, COLLECTION_NAME)
      const q = query(
        tripsRef, 
        where("status", "==", status),
        orderBy("createdAt", "desc")
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DepartureTrip[]
    } catch (error) {
      console.error("Error getting trips by status:", error)
      throw new Error("Gagal mengambil data trip berdasarkan status")
    }
  }

  /**
   * Get upcoming trips (for home page display)
   */
  static async getUpcomingTrips(): Promise<DepartureTrip[]> {
    if (!db) throw new Error("Firestore not initialized")
    
    try {
      const tripsRef = collection(db, COLLECTION_NAME)
      const q = query(
        tripsRef, 
        where("status", "in", ["upcoming", "planning"]),
        orderBy("departureDate", "asc")
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DepartureTrip[]
    } catch (error) {
      console.error("Error getting upcoming trips:", error)
      throw new Error("Gagal mengambil data trip yang akan datang")
    }
  }

  /**
   * Get a single trip by ID
   */
  static async getTripById(tripId: string): Promise<DepartureTrip | null> {
    if (!db) throw new Error("Firestore not initialized")
    
    try {
      const tripRef = doc(db, COLLECTION_NAME, tripId)
      const tripSnap = await getDoc(tripRef)
      
      if (tripSnap.exists()) {
        return {
          id: tripSnap.id,
          ...tripSnap.data()
        } as DepartureTrip
      }
      
      return null
    } catch (error) {
      console.error("Error getting trip:", error)
      throw new Error("Gagal mengambil data trip")
    }
  }

  /**
   * Create a new trip
   */
  static async createTrip(tripData: CreateTripData): Promise<string> {
    if (!db) throw new Error("Firestore not initialized")
    
    try {
      const tripsRef = collection(db, COLLECTION_NAME)
      const docRef = await addDoc(tripsRef, {
        ...tripData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return docRef.id
    } catch (error) {
      console.error("Error creating trip:", error)
      throw new Error("Gagal membuat trip baru")
    }
  }

  /**
   * Update an existing trip
   */
  static async updateTrip(tripId: string, updateData: UpdateTripData): Promise<void> {
    if (!db) throw new Error("Firestore not initialized")
    
    try {
      const tripRef = doc(db, COLLECTION_NAME, tripId)
      await updateDoc(tripRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error("Error updating trip:", error)
      throw new Error("Gagal mengupdate trip")
    }
  }

  /**
   * Delete a trip
   */
  static async deleteTrip(tripId: string): Promise<void> {
    if (!db) throw new Error("Firestore not initialized")
    
    try {
      const tripRef = doc(db, COLLECTION_NAME, tripId)
      await deleteDoc(tripRef)
    } catch (error) {
      console.error("Error deleting trip:", error)
      throw new Error("Gagal menghapus trip")
    }
  }

  /**
   * Update trip status
   */
  static async updateTripStatus(tripId: string, status: DepartureTrip['status']): Promise<void> {
    if (!db) throw new Error("Firestore not initialized")
    
    try {
      const tripRef = doc(db, COLLECTION_NAME, tripId)
      await updateDoc(tripRef, {
        status,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error("Error updating trip status:", error)
      throw new Error("Gagal mengupdate status trip")
    }
  }

  /**
   * Get trips for home page (limited to 3 upcoming/planning trips)
   */
  static async getHomePageTrips(): Promise<DepartureTrip[]> {
    if (!db) throw new Error("Firestore not initialized")
    
    try {
      const tripsRef = collection(db, COLLECTION_NAME)
      
      // Try to get upcoming trips first (most relevant for home page)
      let q = query(
        tripsRef, 
        where("status", "==", "upcoming"),
        orderBy("createdAt", "desc"),
        limit(3)
      )
      
      let querySnapshot = await getDocs(q)
      let trips = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DepartureTrip[]
      
      // If we don't have 3 upcoming trips, get some planning trips
      if (trips.length < 3) {
        const remainingLimit = 3 - trips.length
        q = query(
          tripsRef, 
          where("status", "==", "planning"),
          orderBy("createdAt", "desc"),
          limit(remainingLimit)
        )
        
        querySnapshot = await getDocs(q)
        const planningTrips = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DepartureTrip[]
        
        trips = [...trips, ...planningTrips]
      }
      
      // If we still don't have 3 trips, get some completed trips
      if (trips.length < 3) {
        const remainingLimit = 3 - trips.length
        q = query(
          tripsRef, 
          where("status", "==", "completed"),
          orderBy("createdAt", "desc"),
          limit(remainingLimit)
        )
        
        querySnapshot = await getDocs(q)
        const completedTrips = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DepartureTrip[]
        
        trips = [...trips, ...completedTrips]
      }
      
      return trips
    } catch (error) {
      console.error("Error getting home page trips:", error)
      // Return empty array instead of throwing error for home page
      return []
    }
  }
}
