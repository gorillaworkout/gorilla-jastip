import { db, auth } from './firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc,
  Timestamp,
  Firestore
} from 'firebase/firestore'

export interface MonthlyExpense {
  id?: string
  name: string
  amount: number
  category: string
  date: Date
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface ExpenseCategory {
  id: string
  name: string
  color: string
  icon: string
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'kos', name: 'Kos', color: '#3B82F6', icon: '🏠' },
  { id: 'jajan', name: 'Jajan', color: '#10B981', icon: '🍔' },
  { id: 'coffeeshop', name: 'Coffee Shop', color: '#8B5CF6', icon: '☕' },
  { id: 'makan', name: 'Makan', color: '#10B981', icon: '🍔' },
  { id: 'utang', name: 'Utang', color: '#EF4444', icon: '💳' },
  { id: 'transport', name: 'Transport', color: '#F59E0B', icon: '🚗' },
  { id: 'shopping', name: 'Shopping', color: '#EC4899', icon: '🛍️' },
  { id: 'entertainment', name: 'Entertainment', color: '#06B6D4', icon: '🎬' },
  { id: 'health', name: 'Health', color: '#84CC16', icon: '💊' },
  { id: 'education', name: 'Education', color: '#6366F1', icon: '📚' },
  { id: 'other', name: 'Lainnya', color: '#6B7280', icon: '📌' },
]

export class MonthlyExpensesService {
  private collectionName = 'monthly-expenses'

  // Check if Firebase is available
  private checkFirebase(): Firestore {
    if (!db) {
      throw new Error('Firebase tidak tersedia. Pastikan konfigurasi Firebase sudah benar.')
    }
    
    return db
  }

  // Add new expense
  async addExpense(expense: Omit<MonthlyExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const firestoreDb = this.checkFirebase()
      if (!auth?.currentUser) throw new Error('User tidak terautentikasi. Silakan login.')
      if (!expense.name?.trim()) throw new Error('Nama pengeluaran wajib diisi.')
      if (!Number.isFinite(expense.amount) || expense.amount <= 0) throw new Error('Nominal harus angka lebih dari 0.')
      if (!EXPENSE_CATEGORIES.some((c) => c.id === expense.category)) throw new Error('Kategori tidak valid.')
      if (!(expense.date instanceof Date) || Number.isNaN(expense.date.getTime())) throw new Error('Tanggal tidak valid.')
      
      const docRef = await addDoc(collection(firestoreDb, this.collectionName), {
        ...expense,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error('Error adding expense:', error)
      if (error instanceof Error) {
        throw new Error(`Gagal menambahkan pengeluaran: ${error.message}`)
      }
      throw new Error('Gagal menambahkan pengeluaran')
    }
  }

  // Get expenses for current month
  async getCurrentMonthExpenses(): Promise<MonthlyExpense[]> {
    try {
      const firestoreDb = this.checkFirebase()
      
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

      const q = query(
        collection(firestoreDb, this.collectionName),
        where('date', '>=', startOfMonth),
        where('date', '<=', endOfMonth),
        orderBy('date', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as MonthlyExpense[]
    } catch (error) {
      console.error('Error getting current month expenses:', error)
      if (error instanceof Error) {
        throw new Error(`Gagal mengambil data pengeluaran bulan ini: ${error.message}`)
      }
      throw new Error('Gagal mengambil data pengeluaran bulan ini')
    }
  }

  // Get expenses for specific month
  async getMonthExpenses(year: number, month: number): Promise<MonthlyExpense[]> {
    try {
      const firestoreDb = this.checkFirebase()
      
      const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0)
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

      const q = query(
        collection(firestoreDb, this.collectionName),
        where('date', '>=', startOfMonth),
        where('date', '<=', endOfMonth),
        orderBy('date', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as MonthlyExpense[]
    } catch (error) {
      console.error('Error getting month expenses:', error)
      if (error instanceof Error) {
        throw new Error(`Gagal mengambil data pengeluaran: ${error.message}`)
      }
      throw new Error('Gagal mengambil data pengeluaran')
    }
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<MonthlyExpense[]> {
    const firestoreDb = this.checkFirebase()
    const q = query(
      collection(firestoreDb, this.collectionName),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
      date: item.data().date.toDate(),
      createdAt: item.data().createdAt.toDate(),
      updatedAt: item.data().updatedAt.toDate(),
    })) as MonthlyExpense[]
  }

  // Update expense
  async updateExpense(id: string, updates: Partial<MonthlyExpense>): Promise<void> {
    try {
      const firestoreDb = this.checkFirebase()
      if (!auth?.currentUser) throw new Error('User tidak terautentikasi. Silakan login.')
      // Jangan biarkan createdAt/id ditimpa lewat updates.
      const { id: _id, createdAt: _createdAt, ...safeUpdates } = updates
      if (safeUpdates.amount !== undefined && (!Number.isFinite(safeUpdates.amount) || safeUpdates.amount <= 0)) throw new Error('Nominal harus angka lebih dari 0.')
      if (safeUpdates.category !== undefined && !EXPENSE_CATEGORIES.some((c) => c.id === safeUpdates.category)) throw new Error('Kategori tidak valid.')
      
      const docRef = doc(firestoreDb, this.collectionName, id)
      await updateDoc(docRef, {
        ...safeUpdates,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error updating expense:', error)
      if (error instanceof Error) {
        throw new Error(`Gagal mengupdate pengeluaran: ${error.message}`)
      }
      throw new Error('Gagal mengupdate pengeluaran')
    }
  }

  // Delete expense
  async deleteExpense(id: string): Promise<void> {
    try {
      const firestoreDb = this.checkFirebase()
      if (!auth?.currentUser) throw new Error('User tidak terautentikasi. Silakan login.')
      
      const docRef = doc(firestoreDb, this.collectionName, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting expense:', error)
      if (error instanceof Error) {
        throw new Error(`Gagal menghapus pengeluaran: ${error.message}`)
      }
      throw new Error('Gagal menghapus pengeluaran')
    }
  }

  // Get expenses by category. Bila tahun/bulan diisi, statistik mengikuti
  // bulan tersebut (sebelumnya selalu bulan berjalan walau halaman
  // menampilkan bulan lain).
  async getExpensesByCategory(year?: number, month?: number): Promise<{ [key: string]: number }> {
    try {
      const expenses = year !== undefined && month !== undefined
        ? await this.getMonthExpenses(year, month)
        : await this.getCurrentMonthExpenses()
      const categoryTotals: { [key: string]: number } = {}
      
      expenses.forEach(expense => {
        if (categoryTotals[expense.category]) {
          categoryTotals[expense.category] += expense.amount
        } else {
          categoryTotals[expense.category] = expense.amount
        }
      })
      
      return categoryTotals
    } catch (error) {
      console.error('Error getting category stats:', error)
      if (error instanceof Error) {
        throw new Error(`Gagal mengambil statistik kategori: ${error.message}`)
      }
      throw new Error('Gagal mengambil statistik kategori')
    }
  }

  // Get total expenses for current month
  async getTotalCurrentMonthExpenses(): Promise<number> {
    try {
      const firestoreDb = this.checkFirebase()
      
      const expenses = await this.getCurrentMonthExpenses()
      return expenses.reduce((total, expense) => total + expense.amount, 0)
    } catch (error) {
      console.error('Error getting total expenses:', error)
      if (error instanceof Error) {
        throw new Error(`Gagal menghitung total pengeluaran: ${error.message}`)
      }
      throw new Error('Gagal menghitung total pengeluaran')
    }
  }
}

export const monthlyExpensesService = new MonthlyExpensesService()
