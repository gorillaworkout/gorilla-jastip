import { db, auth } from "./firebase"
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where, serverTimestamp } from "firebase/firestore"
import type { Expense, CreateExpenseData, UpdateExpenseData } from "./types"

const EXPENSES_COLLECTION = "expenses"

export class ExpensesService {
  private static checkAuth() {
    if (!auth?.currentUser) {
      throw new Error("User tidak terautentikasi. Silakan login terlebih dahulu.")
    }
    return auth.currentUser
  }

  static async addExpense(data: CreateExpenseData): Promise<string> {
    const currentUser = this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")

    const expensePrice = Number.parseFloat(data.expensePrice)
    const exchangeRate = Number.parseFloat(data.exchangeRate)
    const totalInIDR = expensePrice * exchangeRate

    const payload = {
      periodId: data.periodId,
      date: new Date(data.date),
      itemName: data.itemName,
      expensePrice,
      exchangeRate,
      totalInIDR,
      category: data.category,
      notes: data.notes || "",
      createdBy: currentUser.uid,
      createdByName: currentUser.displayName || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const ref = await addDoc(collection(db, EXPENSES_COLLECTION), payload)
    return ref.id
  }

  static async updateExpense(id: string, data: UpdateExpenseData): Promise<void> {
    this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")

    const updateData: any = { updatedAt: serverTimestamp() }
    if (data.date !== undefined) updateData.date = new Date(data.date)
    if (data.itemName !== undefined) updateData.itemName = data.itemName
    if (data.expensePrice !== undefined) updateData.expensePrice = Number.parseFloat(data.expensePrice)
    if (data.exchangeRate !== undefined) updateData.exchangeRate = Number.parseFloat(data.exchangeRate)
    if (data.category !== undefined) updateData.category = data.category
    if (data.notes !== undefined) updateData.notes = data.notes

    // Recalculate totalInIDR if price or rate changed
    if (data.expensePrice !== undefined || data.exchangeRate !== undefined) {
      const price = updateData.expensePrice
      const rate = updateData.exchangeRate
      if (typeof price === "number" && typeof rate === "number") {
        updateData.totalInIDR = price * rate
      }
    }

    await updateDoc(doc(db, EXPENSES_COLLECTION, id), updateData)
  }

  static async deleteExpense(id: string): Promise<void> {
    this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")
    await deleteDoc(doc(db, EXPENSES_COLLECTION, id))
  }

  static async getExpensesByPeriod(periodId: string): Promise<Expense[]> {
    if (!db) throw new Error("Firestore database not initialized")

    // Hindari kebutuhan composite index: gunakan filter equality saja lalu sort di client
    const q = query(collection(db, EXPENSES_COLLECTION), where("periodId", "==", periodId))
    const snapshot = await getDocs(q)
    const items: Expense[] = []
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any
      items.push({
        id: docSnap.id,
        periodId: data.periodId,
        date: data.date?.toDate() || new Date(),
        itemName: data.itemName,
        expensePrice: data.expensePrice,
        exchangeRate: data.exchangeRate,
        totalInIDR: data.totalInIDR ?? (data.expensePrice * data.exchangeRate),
        category: data.category,
        notes: data.notes || "",
        createdBy: data.createdBy,
        createdByName: data.createdByName || "",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      })
    })
    // Urutkan di client berdasarkan tanggal terbaru
    items.sort((a, b) => b.date.getTime() - a.date.getTime())
    return items
  }

  static async getTotalExpensesByPeriod(periodId: string): Promise<number> {
    const items = await this.getExpensesByPeriod(periodId)
    return items.reduce((sum, e) => sum + e.totalInIDR, 0)
  }
}
