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
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore"
import { Jastiper, CreateJastiperData, UpdateJastiperData } from "./types"

const COLLECTION_NAME = "jastipers"

export class JastiperService {
  // Get all verified jastipers
  static async getVerifiedJastipers(): Promise<Jastiper[]> {
    if (!db) throw new Error("Firebase not initialized")
    
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("isVerified", "==", true)
      )
      
      const querySnapshot = await getDocs(q)
      const jastipers: Jastiper[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        jastipers.push({
          id: doc.id,
          name: data.name,
          imageUrl: data.imageUrl,
          facebookLink: data.facebookLink,
          phoneNumber: data.phoneNumber,
          isVerified: data.isVerified,
          description: data.description,
          rating: data.rating,
          totalOrders: data.totalOrders,
          completedOrders: data.completedOrders,
          verifiedByFacebookLink: data.verifiedByFacebookLink,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        })
      })
      
      return jastipers
    } catch (error) {
      console.error("Error getting verified jastipers:", error)
      throw error
    }
  }

  // Get all jastipers (admin only)
  static async getAllJastipers(): Promise<Jastiper[]> {
    if (!db) throw new Error("Firebase not initialized")
    
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc")
      )
      
      const querySnapshot = await getDocs(q)
      const jastipers: Jastiper[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        jastipers.push({
          id: doc.id,
          name: data.name,
          imageUrl: data.imageUrl,
          facebookLink: data.facebookLink,
          phoneNumber: data.phoneNumber,
          isVerified: data.isVerified,
          description: data.description,
          rating: data.rating,
          totalOrders: data.totalOrders,
          completedOrders: data.completedOrders,
          verifiedByFacebookLink: data.verifiedByFacebookLink,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        })
      })
      
      return jastipers
    } catch (error) {
      console.error("Error getting all jastipers:", error)
      throw error
    }
  }

  // Get jastiper by ID
  static async getJastiperById(id: string): Promise<Jastiper | null> {
    if (!db) throw new Error("Firebase not initialized")
    
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          name: data.name,
          imageUrl: data.imageUrl,
          facebookLink: data.facebookLink,
          phoneNumber: data.phoneNumber,
          isVerified: data.isVerified,
          description: data.description,
          rating: data.rating,
          totalOrders: data.totalOrders,
          completedOrders: data.completedOrders,
          verifiedByFacebookLink: data.verifiedByFacebookLink,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        }
      }
      
      return null
    } catch (error) {
      console.error("Error getting jastiper:", error)
      throw error
    }
  }

  // Create new jastiper
  static async createJastiper(data: CreateJastiperData): Promise<string> {
    if (!db) throw new Error("Firebase not initialized")
    
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        isVerified: false,
        rating: 0,
        totalOrders: 0,
        completedOrders: data.completedOrders || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      return docRef.id
    } catch (error) {
      console.error("Error creating jastiper:", error)
      throw error
    }
  }

  // Update jastiper
  static async updateJastiper(id: string, data: UpdateJastiperData): Promise<void> {
    if (!db) throw new Error("Firebase not initialized")
    
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating jastiper:", error)
      throw error
    }
  }

  // Delete jastiper
  static async deleteJastiper(id: string): Promise<void> {
    if (!db) throw new Error("Firebase not initialized")
    
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error("Error deleting jastiper:", error)
      throw error
    }
  }

  // Verify jastiper (admin only)
  static async verifyJastiper(id: string): Promise<void> {
    if (!db) throw new Error("Firebase not initialized")
    
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        isVerified: true,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error verifying jastiper:", error)
      throw error
    }
  }

  // Unverify jastiper (admin only)
  static async unverifyJastiper(id: string): Promise<void> {
    if (!db) throw new Error("Firebase not initialized")
    
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        isVerified: false,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error unverifying jastiper:", error)
      throw error
    }
  }
}
