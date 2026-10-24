import { db, auth } from "./firebase"
import { collection, addDoc, updateDoc, deleteDoc, getDocs, getDoc, doc, query, where, serverTimestamp } from "firebase/firestore"
import type { Income, CreateIncomeData, UpdateIncomeData } from "./types"

const INCOMES_COLLECTION = "incomes"

export class IncomesService {
  private static checkAuth() {
    if (!auth?.currentUser) throw new Error("User tidak terautentikasi. Silakan login.")
    return auth.currentUser
  }

  private static async checkOwner(id: string, currentUserId: string) {
    if (!db) throw new Error("Firestore database not initialized")
    const snap = await getDoc(doc(db, INCOMES_COLLECTION, id))
    if (!snap.exists()) throw new Error("Pemasukan tidak ditemukan.")
    const owner = (snap.data() as any).createdBy
    if (owner && owner !== currentUserId) throw new Error("Hanya pemilik yang boleh mengubah pemasukan ini.")
  }

  static async addIncome(data: CreateIncomeData): Promise<string> {
    const currentUser = this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")
    if (!data.periodId) throw new Error("Periode wajib diisi.")
    if (!data.customerName?.trim()) throw new Error("Nama customer wajib diisi.")
    const incomeAmount = typeof data.incomeAmount === "number" ? data.incomeAmount : Number.parseFloat(String(data.incomeAmount))
    if (!Number.isFinite(incomeAmount) || incomeAmount <= 0) throw new Error("Nominal pemasukan harus angka lebih dari 0.")

    const payload = {
      periodId: data.periodId,
      date: new Date(data.date),
      customerName: data.customerName,
      incomeAmount,
      notes: data.notes || "",
      createdBy: currentUser.uid,
      createdByName: currentUser.displayName || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const ref = await addDoc(collection(db, INCOMES_COLLECTION), payload)
    return ref.id
  }

  static async updateIncome(id: string, data: UpdateIncomeData): Promise<void> {
    const currentUser = this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")
    await this.checkOwner(id, currentUser.uid)

    const updateData: any = { updatedAt: serverTimestamp() }
    if (data.date !== undefined) updateData.date = new Date(data.date)
    if (data.customerName !== undefined) {
      if (!data.customerName.trim()) throw new Error("Nama customer wajib diisi.")
      updateData.customerName = data.customerName
    }
    if (data.incomeAmount !== undefined) {
      const incomeAmount = typeof data.incomeAmount === "number" ? data.incomeAmount : Number.parseFloat(String(data.incomeAmount))
      if (!Number.isFinite(incomeAmount) || incomeAmount <= 0) throw new Error("Nominal pemasukan harus angka lebih dari 0.")
      updateData.incomeAmount = incomeAmount
    }
    if (data.notes !== undefined) updateData.notes = data.notes

    await updateDoc(doc(db, INCOMES_COLLECTION, id), updateData)
  }

  static async deleteIncome(id: string): Promise<void> {
    const currentUser = this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")
    await this.checkOwner(id, currentUser.uid)
    await deleteDoc(doc(db, INCOMES_COLLECTION, id))
  }

  static async getIncomesByPeriod(periodId: string): Promise<Income[]> {
    if (!db) throw new Error("Firestore database not initialized")

    const q = query(collection(db, INCOMES_COLLECTION), where("periodId", "==", periodId))
    const snapshot = await getDocs(q)
    const items: Income[] = []
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any
      items.push({
        id: docSnap.id,
        periodId: data.periodId,
        date: data.date?.toDate() || new Date(),
        customerName: data.customerName,
        incomeAmount: data.incomeAmount,
        notes: data.notes || "",
        createdBy: data.createdBy,
        createdByName: data.createdByName || "",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      })
    })
    items.sort((a, b) => b.date.getTime() - a.date.getTime())
    return items
  }
}
