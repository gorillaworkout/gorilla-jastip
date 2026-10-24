import { db, auth } from "./firebase"
import { collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, doc, query, where, serverTimestamp } from "firebase/firestore"
import type { Expense, CreateExpenseData, UpdateExpenseData } from "./types"

const EXPENSES_COLLECTION = "expenses"

function parsePositiveNumber(value: unknown, label: string) {
  const num = typeof value === "number" ? value : Number.parseFloat(String(value))
  if (!Number.isFinite(num) || num <= 0) throw new Error(`${label} harus angka lebih dari 0.`)
  return num
}

export class ExpensesService {
  private static checkAuth() {
    if (!auth?.currentUser) {
      throw new Error("User tidak terautentikasi. Silakan login terlebih dahulu.")
    }
    return auth.currentUser
  }

  // Hanya pemilik dokumen yang boleh mengubah/menghapusnya.
  private static async checkOwner(id: string, currentUserId: string) {
    if (!db) throw new Error("Firestore database not initialized")
    const snap = await getDoc(doc(db, EXPENSES_COLLECTION, id))
    if (!snap.exists()) throw new Error("Pengeluaran tidak ditemukan.")
    const owner = (snap.data() as any).createdBy
    if (owner && owner !== currentUserId) throw new Error("Hanya pemilik yang boleh mengubah pengeluaran ini.")
  }

  static async addExpense(data: CreateExpenseData): Promise<string> {
    const currentUser = this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")
    if (!data.periodId) throw new Error("Periode wajib diisi.")
    if (!data.itemName?.trim()) throw new Error("Nama item wajib diisi.")
    if (!data.category?.trim()) throw new Error("Kategori wajib diisi.")

    const expensePrice = parsePositiveNumber(data.expensePrice, "Harga pengeluaran")
    const exchangeRate = parsePositiveNumber(data.exchangeRate, "Kurs")
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
    const currentUser = this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")
    await this.checkOwner(id, currentUser.uid)

    const expenseRef = doc(db, EXPENSES_COLLECTION, id)
    const existing = await getDoc(expenseRef)
    if (!existing.exists()) throw new Error("Pengeluaran tidak ditemukan")
    const updateData: any = { updatedAt: serverTimestamp() }
    if (data.date !== undefined) updateData.date = new Date(data.date)
    if (data.itemName !== undefined) {
      if (!data.itemName.trim()) throw new Error("Nama item wajib diisi.")
      updateData.itemName = data.itemName
    }
    if (data.expensePrice !== undefined) updateData.expensePrice = parsePositiveNumber(data.expensePrice, "Harga pengeluaran")
    if (data.exchangeRate !== undefined) updateData.exchangeRate = parsePositiveNumber(data.exchangeRate, "Kurs")
    if (data.category !== undefined) {
      if (!data.category.trim()) throw new Error("Kategori wajib diisi.")
      updateData.category = data.category
    }
    if (data.notes !== undefined) updateData.notes = data.notes

    if (data.expensePrice !== undefined || data.exchangeRate !== undefined) {
      const price = updateData.expensePrice ?? existing.data().expensePrice
      const rate = updateData.exchangeRate ?? existing.data().exchangeRate
      updateData.totalInIDR = price * rate
    }

    await updateDoc(expenseRef, updateData)
  }

  static async deleteExpense(id: string): Promise<void> {
    const currentUser = this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")
    await this.checkOwner(id, currentUser.uid)
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
