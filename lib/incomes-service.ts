import { db, auth } from "./firebase"
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where, serverTimestamp } from "firebase/firestore"
import type { Income, CreateIncomeData, UpdateIncomeData } from "./types"

const INCOMES_COLLECTION = "incomes"

export class IncomesService {
  private static checkAuth() {
    if (!auth?.currentUser) throw new Error("User tidak terautentikasi. Silakan login.")
    return auth.currentUser
  }

  static async addIncome(data: CreateIncomeData): Promise<string> {
    const currentUser = this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")

    const incomeAmount = Number.parseFloat(data.incomeAmount)

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
    this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")

    const updateData: any = { updatedAt: serverTimestamp() }
    if (data.date !== undefined) updateData.date = new Date(data.date)
    if (data.customerName !== undefined) updateData.customerName = data.customerName
    if (data.incomeAmount !== undefined) updateData.incomeAmount = Number.parseFloat(data.incomeAmount)
    if (data.notes !== undefined) updateData.notes = data.notes

    await updateDoc(doc(db, INCOMES_COLLECTION, id), updateData)
  }

  static async deleteIncome(id: string): Promise<void> {
    this.checkAuth()
    if (!db) throw new Error("Firestore database not initialized")
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


