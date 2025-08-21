export interface JastipItem {
  id: string
  name: string
  originalPrice: number
  exchangeRate: number
  sellingPrice: number
  profit: number
  profitMargin: number
  period: string
  category?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Period {
  id: string
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
  totalProducts: number
  totalRevenue: number
  totalProfit: number
  averageMargin: number
  items: PeriodItem[]
  createdAt: Date
  updatedAt: Date
}

export interface PeriodItem {
  id: string
  customerName: string
  itemName: string // Nama barang
  itemPrice: number // Harga dalam YEN
  exchangeRate: number // Kurs YEN ke IDR
  sellingPrice: number // Harga jual dalam IDR
  profit: number // Keuntungan (harga jual - harga beli)
  margin: number // Margin keuntungan
  costInIDR: number // Harga beli dalam IDR (itemPrice * exchangeRate)
  createdAt: Date
  updatedAt: Date
}

// New interface for customer with multiple items
export interface Customer {
  id: string
  customerName: string
  periodId: string
  items: CustomerItem[]
  totalItems: number
  totalRevenue: number
  totalProfit: number
  averageMargin: number
  createdAt: Date
  updatedAt: Date
}

export interface CustomerItem {
  id: string
  itemName: string // Nama barang
  itemPrice: number // Harga dalam YEN
  exchangeRate: number // Kurs YEN ke IDR
  sellingPrice: number // Harga jual dalam IDR
  profit: number // Keuntungan (harga jual - harga beli)
  margin: number // Margin keuntungan
  costInIDR: number // Harga beli dalam IDR (itemPrice * exchangeRate)
  notes?: string // Catatan tambahan
  createdAt: Date
  updatedAt: Date
}

export interface CreatePeriodData {
  name: string
  startDate: string
  endDate: string
}

export interface CreateItemData {
  customerName: string
  itemName?: string // Nama barang (opsional untuk backward compatibility)
  itemPrice: string // Harga dalam YEN
  exchangeRate: string // Kurs YEN ke IDR
  sellingPrice: string // Harga jual dalam IDR
}

// New interface for creating customer with multiple items
export interface CreateCustomerData {
  customerName: string
  items: CreateCustomerItemData[]
}

export interface CreateCustomerItemData {
  itemName: string
  itemPrice: string // Harga dalam YEN
  exchangeRate: string // Kurs YEN ke IDR
  sellingPrice: string // Harga jual dalam IDR
  notes?: string
}

// Tambahan tipe untuk fitur Pengeluaran
export type ExpenseCategory =
  | "Transport"
  | "Makan"
  | "Jajan"
  | "Belanja"
  | "Wisata"
  | "Lainnya"

export interface Expense {
  id: string
  periodId: string
  date: Date
  itemName: string
  expensePrice: number // Pengeluaran dalam YEN
  exchangeRate: number // Kurs YEN → IDR
  totalInIDR: number // expensePrice * exchangeRate
  category: ExpenseCategory
  notes?: string
  createdBy?: string
  createdByName?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateExpenseData {
  periodId: string
  date: string // yyyy-MM-dd
  itemName: string
  expensePrice: string // YEN
  exchangeRate: string // kurs
  category: ExpenseCategory
  notes?: string
}

export interface UpdatePeriodData {
  name?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
  totalProducts?: number
  totalRevenue?: number
  totalProfit?: number
  averageMargin?: number
}

export interface UpdateItemData {
  customerName?: string
  itemName?: string // Nama barang
  itemPrice?: string // Harga dalam YEN
  exchangeRate?: string // Kurs YEN ke IDR
  sellingPrice?: string // Harga jual dalam IDR
}

export interface UpdateCustomerData {
  customerName?: string
}

export interface UpdateCustomerItemData {
  itemName?: string
  itemPrice?: string // Harga dalam YEN
  exchangeRate?: string // Kurs YEN ke IDR
  sellingPrice?: string // Harga jual dalam IDR
  notes?: string
}

export interface UpdateExpenseData {
  date?: string
  itemName?: string
  expensePrice?: string
  exchangeRate?: string
  category?: ExpenseCategory
  notes?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  createdAt: Date
}
