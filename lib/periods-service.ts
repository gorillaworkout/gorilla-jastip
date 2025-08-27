import { db, auth } from "./firebase"
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  where
} from "firebase/firestore"
import { Period, PeriodItem, CreatePeriodData, CreateItemData, UpdatePeriodData, UpdateItemData } from "./types"

const PERIODS_COLLECTION = "periods"
const ITEMS_COLLECTION = "periodItems"

export class PeriodsService {
  // Check if user is authenticated via Firebase
  private static checkAuth() {
    if (!auth?.currentUser) {
      throw new Error("User tidak terautentikasi. Silakan login terlebih dahulu.")
    }
    return auth.currentUser
  }

  // Bulk set a customer's items payment status in a period
  static async setCustomerPaymentStatus(periodId: string, customerName: string, isPaid: boolean): Promise<void> {
    try {
      const currentUser = this.checkAuth()
      if (!db) throw new Error("Firestore database not initialized")

      // Fetch all items for this period
      const q = query(collection(db, ITEMS_COLLECTION), where("periodId", "==", periodId))
      const querySnapshot = await getDocs(q)

      const updates: Promise<any>[] = []
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.customerName === customerName) {
          const docRef = doc(db, ITEMS_COLLECTION, docSnap.id)
          updates.push(updateDoc(docRef, {
            isPaymentReceived: isPaid,
            updatedAt: serverTimestamp(),
            updatedBy: currentUser.uid,
          }))
        }
      })

      await Promise.all(updates)
      await this.updatePeriodStatistics(periodId)
    } catch (error) {
      console.error("Error setting customer payment status:", error)
      throw error
    }
  }

  // Create new period
  static async createPeriod(data: CreatePeriodData): Promise<string> {
    try {
      const currentUser = this.checkAuth()
      
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      const periodData = {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: false,
        totalProducts: 0,
        totalRevenue: 0,
        totalProfit: 0,
        averageMargin: 0,
        items: [],
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, PERIODS_COLLECTION), periodData)
      return docRef.id
    } catch (error) {
      console.error("Error creating period:", error)
      if (error instanceof Error) {
        if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
          throw new Error("Tidak memiliki izin untuk membuat periode. Pastikan Anda sudah login dan memiliki akses yang tepat.")
        }
        throw new Error(`Gagal membuat periode baru: ${error.message}`)
      }
      throw new Error("Gagal membuat periode baru")
    }
  }

  // Get all periods
  static async getPeriods(): Promise<Period[]> {
    try {
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      const q = query(collection(db, PERIODS_COLLECTION), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      
      const periods: Period[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        periods.push({
          id: doc.id,
          name: data.name,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          isActive: data.isActive || false,
          totalProducts: data.totalProducts || 0,
          totalRevenue: data.totalRevenue || 0,
          totalProfit: data.totalProfit || 0,
          averageMargin: data.averageMargin || 0,
          totalUnpaid: data.totalUnpaid || 0,
          items: data.items || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        })
      })
      
      return periods
    } catch (error) {
      console.error("Error getting periods:", error)
      if (error instanceof Error) {
        throw new Error(`Gagal mengambil data periode: ${error.message}`)
      }
      throw new Error("Gagal mengambil data periode")
    }
  }

  // Get single period by ID
  static async getPeriod(id: string): Promise<Period | null> {
    try {
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      const docRef = doc(db, PERIODS_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          name: data.name,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          isActive: data.isActive || false,
          totalProducts: data.totalProducts || 0,
          totalRevenue: data.totalRevenue || 0,
          totalProfit: data.totalProfit || 0,
          averageMargin: data.averageMargin || 0,
          totalUnpaid: data.totalUnpaid || 0,
          items: data.items || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        }
      }
      
      return null
    } catch (error) {
      console.error("Error getting period:", error)
      if (error instanceof Error) {
        throw new Error(`Gagal mengambil data periode: ${error.message}`)
      }
      throw new Error("Gagal mengambil data periode")
    }
  }

  // Update period
  static async updatePeriod(id: string, data: UpdatePeriodData): Promise<void> {
    try {
      const currentUser = this.checkAuth()
      
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      const updateData: any = {
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      }

      if (data.name !== undefined) updateData.name = data.name
      if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
      if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate)
      if (data.isActive !== undefined) updateData.isActive = data.isActive

      const docRef = doc(db, PERIODS_COLLECTION, id)
      await updateDoc(docRef, updateData)
    } catch (error) {
      console.error("Error updating period:", error)
      if (error instanceof Error) {
        if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
          throw new Error("Tidak memiliki izin untuk mengupdate periode. Pastikan Anda sudah login dan memiliki akses yang tepat.")
        }
        throw new Error(`Gagal mengupdate periode: ${error.message}`)
      }
      throw new Error("Gagal mengupdate periode")
    }
  }

  // Delete period
  static async deletePeriod(id: string): Promise<void> {
    try {
      this.checkAuth()
      
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      const docRef = doc(db, PERIODS_COLLECTION, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error("Error deleting period:", error)
      if (error instanceof Error) {
        if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
          throw new Error("Tidak memiliki izin untuk menghapus periode. Pastikan Anda sudah login dan memiliki akses yang tepat.")
        }
        throw new Error(`Gagal menghapus periode: ${error.message}`)
      }
      throw new Error("Gagal menghapus periode")
    }
  }

  // Toggle period active status
  static async togglePeriodActive(id: string, isActive: boolean): Promise<void> {
    try {
      // First, deactivate all other periods if this one is being activated
      if (isActive) {
        const periods = await this.getPeriods()
        const updatePromises = periods
          .filter(p => p.id !== id)
          .map(p => this.updatePeriod(p.id, { isActive: false }))
        
        await Promise.all(updatePromises)
      }

      // Update the target period
      await this.updatePeriod(id, { isActive })
    } catch (error) {
      console.error("Error toggling period active:", error)
      if (error instanceof Error) {
        throw new Error(`Gagal mengubah status periode: ${error.message}`)
      }
      throw new Error("Gagal mengubah status periode")
    }
  }

  // Add item to period
  static async addItem(periodId: string, data: CreateItemData): Promise<string> {
    try {
      const currentUser = this.checkAuth()
      
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      const itemPrice = Number.parseFloat(data.itemPrice) // Harga dalam YEN
      const exchangeRate = Number.parseFloat(data.exchangeRate) // Kurs YEN ke IDR
      const sellingPrice = Number.parseFloat(data.sellingPrice) // Harga jual dalam IDR

      const costInIDR = itemPrice * exchangeRate // Harga beli dalam IDR
      const profit = sellingPrice - costInIDR // Keuntungan
      const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0 // Margin keuntungan

      console.log("Adding item with calculation:", {
        itemPrice,
        exchangeRate,
        sellingPrice,
        costInIDR,
        profit,
        margin
      })

      const itemData = {
        customerName: data.customerName,
        itemName: data.itemName || "Item", // Default item name
        itemPrice,
        exchangeRate,
        sellingPrice,
        profit,
        margin,
        costInIDR,
        isPaymentReceived: Boolean(data.isPaymentReceived) || false,
        periodId,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // Add item to periodItems collection
      const itemRef = await addDoc(collection(db, ITEMS_COLLECTION), itemData)

      console.log(`Item added successfully with ID: ${itemRef.id}`)

      // Update period statistics
      await this.updatePeriodStatistics(periodId)

      return itemRef.id
    } catch (error) {
      console.error("Error adding item:", error)
      if (error instanceof Error) {
        if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
          throw new Error("Tidak memiliki izin untuk menambahkan data customer. Pastikan Anda sudah login dan memiliki akses yang tepat.")
        }
        throw new Error(`Gagal menambahkan data customer: ${error.message}`)
      }
      throw new Error("Gagal menambahkan data customer")
    }
  }

  // Update item
  static async updateItem(itemId: string, data: UpdateItemData): Promise<void> {
    try {
      const currentUser = this.checkAuth()
      
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      const updateData: any = {
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      }

      if (data.customerName !== undefined) updateData.customerName = data.customerName
      if (data.itemName !== undefined) updateData.itemName = data.itemName
      if (data.itemPrice !== undefined) updateData.itemPrice = Number.parseFloat(data.itemPrice)
      if (data.exchangeRate !== undefined) updateData.exchangeRate = Number.parseFloat(data.exchangeRate)
      if (data.sellingPrice !== undefined) updateData.sellingPrice = Number.parseFloat(data.sellingPrice)
      // allow toggling payment status
      if ((data as any).isPaymentReceived !== undefined) updateData.isPaymentReceived = Boolean((data as any).isPaymentReceived)

      // Recalculate profit and margin if price data changed
      if (data.itemPrice !== undefined || data.exchangeRate !== undefined || data.sellingPrice !== undefined) {
        // Get current item data to calculate with existing values
        const itemDoc = await getDoc(doc(db, ITEMS_COLLECTION, itemId))
        if (itemDoc.exists()) {
          const currentData = itemDoc.data()
          
          const itemPrice = data.itemPrice !== undefined ? Number.parseFloat(data.itemPrice) : currentData.itemPrice
          const exchangeRate = data.exchangeRate !== undefined ? Number.parseFloat(data.exchangeRate) : currentData.exchangeRate
          const sellingPrice = data.sellingPrice !== undefined ? Number.parseFloat(data.sellingPrice) : currentData.sellingPrice

          if (itemPrice && exchangeRate && sellingPrice) {
            const costInIDR = itemPrice * exchangeRate
            const profit = sellingPrice - costInIDR
            const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0

            updateData.profit = profit
            updateData.margin = margin
            updateData.costInIDR = costInIDR

            console.log("Recalculated values:", { costInIDR, profit, margin })
          }
        }
      }

      const docRef = doc(db, ITEMS_COLLECTION, itemId)
      await updateDoc(docRef, updateData)

      console.log(`Item ${itemId} updated successfully`)

      // Get periodId from item to update statistics
      const itemDoc = await getDoc(docRef)
      if (itemDoc.exists()) {
        const itemData = itemDoc.data()
        console.log(`Updating statistics for period: ${itemData.periodId}`)
        await this.updatePeriodStatistics(itemData.periodId)
      }
    } catch (error) {
      console.error("Error updating item:", error)
      if (error instanceof Error) {
        if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
          throw new Error("Tidak memiliki izin untuk mengupdate data customer. Pastikan Anda sudah login dan memiliki akses yang tepat.")
        }
        throw new Error(`Gagal mengupdate data customer: ${error.message}`)
      }
      throw new Error("Gagal mengupdate data customer")
    }
  }

  // Delete item
  static async deleteItem(itemId: string): Promise<void> {
    try {
      this.checkAuth()
      
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      // Get periodId before deleting
      const itemDoc = await getDoc(doc(db, ITEMS_COLLECTION, itemId))
      if (itemDoc.exists()) {
        const itemData = itemDoc.data()
        const periodId = itemData.periodId

        console.log(`Deleting item ${itemId} from period ${periodId}`)

        // Delete the item
        const docRef = doc(db, ITEMS_COLLECTION, itemId)
        await deleteDoc(docRef)

        console.log(`Item ${itemId} deleted successfully`)

        // Update period statistics
        await this.updatePeriodStatistics(periodId)
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      if (error instanceof Error) {
        if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
          throw new Error("Tidak memiliki izin untuk menghapus data customer. Pastikan Anda sudah login dan memiliki akses yang tepat.")
        }
        throw new Error(`Gagal menghapus data customer: ${error.message}`)
      }
      throw new Error("Gagal menghapus data customer")
    }
  }

  // Get items for a specific period
  static async getPeriodItems(periodId: string): Promise<PeriodItem[]> {
    try {
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      // Simple query without complex ordering to avoid index requirements
      const q = query(collection(db, ITEMS_COLLECTION))
      const querySnapshot = await getDocs(q)
      
      const items: PeriodItem[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        // Filter by periodId in memory instead of in query
        if (data.periodId === periodId) {
          items.push({
            id: doc.id,
            customerName: data.customerName,
            itemName: data.itemName || "Item",
            itemPrice: data.itemPrice,
            exchangeRate: data.exchangeRate,
            sellingPrice: data.sellingPrice,
            profit: data.profit,
            margin: data.margin,
            costInIDR: data.costInIDR || (data.itemPrice * data.exchangeRate),
            isPaymentReceived: Boolean(data.isPaymentReceived) || false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          })
        }
      })
      
      // Sort by createdAt in memory instead of in query
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      return items
    } catch (error) {
      console.error("Error getting period items:", error)
      if (error instanceof Error) {
        throw new Error(`Gagal mengambil data customer: ${error.message}`)
      }
      throw new Error("Gagal mengambil data customer")
    }
  }

  // Update period statistics (totalProducts, totalRevenue, totalProfit, averageMargin)
  static async updatePeriodStatistics(periodId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error("Firestore database not initialized")
      }
      
      const currentUser = this.checkAuth()
      
      // Get all items for this period
      const q = query(
        collection(db, ITEMS_COLLECTION),
        where("periodId", "==", periodId)
      )
      const querySnapshot = await getDocs(q)

      // Calculate statistics
      let totalProducts = 0
      let totalRevenue = 0
      let totalProfit = 0
      let totalCost = 0
      let totalUnpaid = 0

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        totalProducts++
        totalRevenue += Number(data.sellingPrice) || 0
        totalCost += Number(data.costInIDR) || 0
        // Only count profit for paid items
        if (data.isPaymentReceived) {
          totalProfit += Number(data.profit) || 0
        } else {
          totalUnpaid += Number(data.sellingPrice) || 0
        }
      })

      const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

      // Update period with new statistics
      const docRef = doc(db, PERIODS_COLLECTION, periodId)
      await updateDoc(docRef, {
        totalProducts,
        totalRevenue,
        totalProfit,
        averageMargin,
        totalUnpaid,
        updatedAt: serverTimestamp(),
      })

      console.log(`Successfully updated period ${periodId} statistics`)
    } catch (error) {
      console.error("Error updating period statistics:", error)
      throw error // Re-throw error so caller can handle it
    }
  }

  // Add customer with multiple items
  static async addCustomerWithItems(periodId: string, customerData: any): Promise<string> {
    try {
      const currentUser = this.checkAuth()
      
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      const customerName = customerData.customerName
      const items = customerData.items

      // Add each item individually
      const itemIds = []
      for (const item of items) {
        const itemPrice = Number.parseFloat(item.itemPrice)
        const exchangeRate = Number.parseFloat(item.exchangeRate)
        const sellingPrice = Number.parseFloat(item.sellingPrice)

        const costInIDR = itemPrice * exchangeRate
        const profit = sellingPrice - costInIDR
        const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0

        const itemData = {
          customerName,
          itemName: item.itemName || "",
          itemPrice,
          exchangeRate,
          sellingPrice,
          profit,
          margin,
          costInIDR,
          isPaymentReceived: Boolean(item.isPaymentReceived) || false,
          periodId,
          notes: item.notes || "",
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        // Add item to periodItems collection
        const itemRef = await addDoc(collection(db, ITEMS_COLLECTION), itemData)
        itemIds.push(itemRef.id)
      }

      // Update period statistics
      await this.updatePeriodStatistics(periodId)

      return itemIds[0] // Return first item ID as reference
    } catch (error) {
      console.error("Error adding customer with items:", error)
      if (error instanceof Error) {
        if (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")) {
          throw new Error("Tidak memiliki izin untuk menambahkan data customer. Pastikan Anda sudah login dan memiliki akses yang tepat.")
        }
        throw new Error(`Gagal menambahkan data customer: ${error.message}`)
      }
      throw new Error("Gagal menambahkan data customer")
    }
  }

  // Refresh period statistics manually
  static async refreshPeriodStatistics(periodId: string): Promise<void> {
    try {
      console.log(`Manually refreshing statistics for period: ${periodId}`)
      await this.updatePeriodStatistics(periodId)
    } catch (error) {
      console.error("Error refreshing period statistics:", error)
      throw error
    }
  }

  // Get all periods with refreshed statistics
  static async getPeriodsWithRefreshedStats(): Promise<Period[]> {
    try {
      if (!db) {
        throw new Error("Firestore database not initialized")
      }

      const q = query(collection(db, PERIODS_COLLECTION), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      
      const periods: Period[] = []
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data()
        const periodId = docSnapshot.id
        
        // Refresh statistics for each period
        await this.updatePeriodStatistics(periodId)
        
        // Get fresh data after update
        const freshData = await this.getPeriod(periodId)
        if (freshData) {
          periods.push(freshData)
        }
      }
      
      return periods
    } catch (error) {
      console.error("Error getting periods with refreshed stats:", error)
      if (error instanceof Error) {
        throw new Error(`Gagal mengambil data periode: ${error.message}`)
      }
      throw new Error("Gagal mengambil data periode")
    }
  }
}