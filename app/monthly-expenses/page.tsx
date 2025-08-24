"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    TrendingUp,
    Calendar,
    DollarSign,
    PieChart,
    Trash2,
    Edit,
    Eye,
    Filter,
    Search
} from "lucide-react"
import {
    monthlyExpensesService,
    MonthlyExpense,
    EXPENSE_CATEGORIES,
    type ExpenseCategory
} from "@/lib/monthly-expenses-service"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { id } from "date-fns/locale"

function MonthlyExpensesPageContent() {
    // Custom CSS untuk memastikan dropdown muncul dengan benar
    useEffect(() => {
        // Use a timeout to ensure this runs after hydration
        const timer = setTimeout(() => {
            const style = document.createElement('style')
            style.textContent = `
          .select-content-modal {
            z-index: 9999 !important;
            position: fixed !important;
          }
          .select-content-modal [data-radix-popper-content-wrapper] {
            z-index: 9999 !important;
          }
          .select-content-modal [data-radix-select-content] {
            max-height: 300px !important;
            overflow-y: auto !important;
          }
          .select-content-modal [data-radix-select-viewport] {
            max-height: 300px !important;
            overflow-y: auto !important;
          }
          .select-content-modal [data-radix-select-viewport] > div {
            max-height: 300px !important;
            overflow-y: auto !important;
          }
          .select-content-modal {
            max-height: 300px !important;
            overflow-y: auto !important;
          }
          .select-content-modal > div {
            max-height: 300px !important;
            overflow-y: auto !important;
          }
          /* Ensure scrolling works for all select content */
          [data-radix-select-content] {
            max-height: 300px !important;
            overflow-y: auto !important;
          }
          [data-radix-select-viewport] {
            max-height: 300px !important;
            overflow-y: auto !important;
          }
          /* Additional fixes for select dropdowns */
          .select-content-modal [role="listbox"] {
            max-height: 300px !important;
            overflow-y: auto !important;
          }
          .select-content-modal [role="option"] {
            max-height: none !important;
          }
        `
            document.head.appendChild(style)

            return () => {
                document.head.removeChild(style)
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [])
    const [expenses, setExpenses] = useState<MonthlyExpense[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingExpense, setEditingExpense] = useState<MonthlyExpense | null>(null)
    const [deletingExpense, setDeletingExpense] = useState<MonthlyExpense | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        category: "",
        date: "",
        description: ""
    })
    const [categoryStats, setCategoryStats] = useState<{ [key: string]: number }>({})
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [filterData, setFilterData] = useState({
        month: "",
        startDate: "",
        endDate: "",
        category: "all",
        searchQuery: ""
    })

    const [filteredExpenses, setFilteredExpenses] = useState<MonthlyExpense[]>([])
    const [isInitialized, setIsInitialized] = useState(false)
    const { toast } = useToast()
    const modalRef = useRef<HTMLDivElement>(null)

    // Check if any filter is active
    const isFilterActive = () => {
        return !!(
            filterData.month || 
            filterData.startDate || 
            filterData.endDate || 
            (filterData.category && filterData.category !== "") || 
            filterData.searchQuery
        )
    }

    // Get month info from expenses data
    const getMonthInfoFromExpenses = () => {
        if (expenses.length === 0) return null
        
        const dates = expenses.map(expense => expense.date)
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
        
        if (minDate.getMonth() === maxDate.getMonth() && minDate.getFullYear() === maxDate.getFullYear()) {
            return format(minDate, "MMMM yyyy", { locale: id })
        } else {
            return `${format(minDate, "MMM yyyy", { locale: id })} - ${format(maxDate, "MMM yyyy", { locale: id })}`
        }
    }

    // Set initial values after component mount to avoid hydration issues
    useEffect(() => {
        // Use a timeout to ensure this runs after hydration
        const timer = setTimeout(() => {
            const now = new Date()
            setFormData(prev => ({
                ...prev,
                date: format(now, "yyyy-MM-dd")
            }))
            // Don't set month filter initially - let it load all data first
            setFilterData(prev => ({
                ...prev,
                month: "", // Start with no month filter
                startDate: "",
                endDate: "",
                category: "",
                searchQuery: ""
            }))
            setIsInitialized(true)
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    // Load expenses on component mount
    useEffect(() => {
        if (isInitialized && typeof window !== 'undefined') {
            console.log('🔄 Loading expenses...')
            loadExpenses()
        }
    }, [isInitialized])

    // Apply filters when expenses or filter data changes
    useEffect(() => {
        if (expenses.length > 0 && typeof window !== 'undefined') {
            applyFilters()
        }
    }, [expenses, filterData.category, filterData.searchQuery])

    // Load expenses when month or date range changes
    useEffect(() => {
        if ((filterData.month || (filterData.startDate && filterData.endDate)) && typeof window !== 'undefined') {
            loadExpenses()
        }
    }, [filterData.month, filterData.startDate, filterData.endDate])

    const loadExpenses = async () => {
        try {
            console.log('📊 Starting to load expenses...')
            console.log('🔍 Filter data:', filterData)
            setLoading(true)

            let expensesData: MonthlyExpense[]
            let categoryData: { [key: string]: number }
            let total: number

            // Check if we have date range filter
            if (filterData.startDate && filterData.endDate) {
                console.log('📅 Using date range filter')
                const startDate = new Date(filterData.startDate)
                const endDate = new Date(filterData.endDate)
                endDate.setHours(23, 59, 59, 999) // Set to end of day

                expensesData = await monthlyExpensesService.getMonthExpenses(startDate.getFullYear(), startDate.getMonth() + 1)
                // Filter by date range manually
                expensesData = expensesData.filter(expense =>
                    expense.date >= startDate && expense.date <= endDate
                )
                categoryData = await monthlyExpensesService.getExpensesByCategory()
                // Calculate category stats for filtered data
                categoryData = expensesData.reduce((acc, expense) => {
                    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
                    return acc
                }, {} as { [key: string]: number })
                total = expensesData.reduce((sum, expense) => sum + expense.amount, 0)
            } else if (filterData.month) {
                // Use month filter
                console.log('📅 Using month filter:', filterData.month)
                const [year, month] = filterData.month.split('-').map(Number)
                console.log('🔍 Year:', year, 'Month:', month)
                expensesData = await monthlyExpensesService.getMonthExpenses(year, month)
                categoryData = await monthlyExpensesService.getExpensesByCategory()
                total = expensesData.reduce((sum, expense) => sum + expense.amount, 0)
            } else {
                console.log('📅 No filter applied, loading all available data')
                // Load all available data when no filter is applied
                try {
                    // Try to get current month first
                    const now = new Date()
                    const year = now.getFullYear()
                    const month = now.getMonth() + 1
                    console.log('🔍 Trying current month first:', year, month)
                    expensesData = await monthlyExpensesService.getMonthExpenses(year, month)
                    
                    // If no data in current month, try previous month
                    if (expensesData.length === 0) {
                        const prevMonth = month === 1 ? 12 : month - 1
                        const prevYear = month === 1 ? year - 1 : year
                        console.log('🔍 No data in current month, trying previous month:', prevYear, prevMonth)
                        expensesData = await monthlyExpensesService.getMonthExpenses(prevYear, prevMonth)
                    }
                    
                    // If still no data, try to get any available data
                    if (expensesData.length === 0) {
                        console.log('🔍 No data in recent months, trying to get any available data')
                        // Try to get data from the last 6 months
                        for (let i = 1; i <= 6; i++) {
                            const testMonth = month - i <= 0 ? 12 + (month - i) : month - i
                            const testYear = month - i <= 0 ? year - 1 : year
                            console.log('🔍 Trying month:', testYear, testMonth)
                            const testData = await monthlyExpensesService.getMonthExpenses(testYear, testMonth)
                            if (testData.length > 0) {
                                expensesData = testData
                                console.log('✅ Found data in month:', testYear, testMonth)
                                break
                            }
                        }
                    }
                } catch (error) {
                    console.log('⚠️ Error loading specific month, trying fallback')
                    // If all else fails, try to get any data available
                    expensesData = []
                }
                
                categoryData = await monthlyExpensesService.getExpensesByCategory()
                total = expensesData.reduce((sum, expense) => sum + expense.amount, 0)
            }

            console.log('✅ Expenses loaded successfully:', { count: expensesData.length, total, data: expensesData })

            setExpenses(expensesData)
            setFilteredExpenses(expensesData)
            setCategoryStats(categoryData)
            setTotalExpenses(total)
        } catch (error) {
            console.error('❌ Error loading expenses:', error)
            console.error('❌ Error details:', {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace'
            })
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Gagal memuat data",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log('📝 Form submitted:', formData)

        if (!formData.name || !formData.amount || !formData.category || !formData.date) {
            toast({
                title: "Error",
                description: "Semua field wajib diisi",
                variant: "destructive"
            })
            return
        }

        // Validate amount
        const amount = parseRupiahInput(formData.amount)
        if (amount <= 0) {
            toast({
                title: "Error",
                description: "Total pengeluaran harus lebih dari 0",
                variant: "destructive"
            })
            return
        }

        try {
            const expenseData = {
                name: formData.name,
                amount: parseRupiahInput(formData.amount),
                category: formData.category,
                date: new Date(formData.date),
                description: formData.description
            }

            console.log('💾 Saving expense data:', expenseData)

            if (editingExpense) {
                console.log('✏️ Updating existing expense...')
                await monthlyExpensesService.updateExpense(editingExpense.id!, expenseData)
                toast({
                    title: "Sukses",
                    description: "Pengeluaran berhasil diupdate"
                })
            } else {
                console.log('➕ Adding new expense...')
                await monthlyExpensesService.addExpense(expenseData)
                toast({
                    title: "Sukses",
                    description: "Pengeluaran berhasil ditambahkan"
                })
            }

            console.log('✅ Expense saved successfully')

            // Reset form and reload data
            resetForm()
            loadExpenses()
        } catch (error) {
            console.error('❌ Error saving expense:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Gagal menyimpan pengeluaran",
                variant: "destructive"
            })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await monthlyExpensesService.deleteExpense(id)
            toast({
                title: "Sukses",
                description: "Pengeluaran berhasil dihapus"
            })
            loadExpenses()
            setDeletingExpense(null)
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Gagal menghapus pengeluaran",
                variant: "destructive"
            })
        }
    }

    const handleEdit = (expense: MonthlyExpense) => {
        setEditingExpense(expense)
        setFormData({
            name: expense.name,
            amount: formatRupiahInput(expense.amount.toString()),
            category: expense.category,
            date: format(expense.date, "yyyy-MM-dd"),
            description: expense.description || ""
        })
        setShowForm(true)
    }

    const showDeleteConfirmation = (expense: MonthlyExpense) => {
        setDeletingExpense(expense)
    }

    const applyFilters = () => {
        let filtered = [...expenses]

        // Apply category filter
        if (filterData.category && filterData.category !== "") {
            filtered = filtered.filter(expense => expense.category === filterData.category)
        }

        // Apply search query
        if (filterData.searchQuery && filterData.searchQuery.trim() !== "") {
            const query = filterData.searchQuery.toLowerCase().trim()
            filtered = filtered.filter(expense =>
                expense.name.toLowerCase().includes(query) ||
                (expense.description && expense.description.toLowerCase().includes(query))
            )
        }

        setFilteredExpenses(filtered)
    }

    const resetFilters = () => {
        const now = new Date()
        setFilterData({
            month: format(now, "yyyy-MM"),
            startDate: "",
            endDate: "",
            category: "all",
            searchQuery: ""
        })
        setFilteredExpenses(expenses)
    }

    const handleFilterChange = (key: string, value: string) => {
        setFilterData(prev => ({ ...prev, [key]: value }))
    }

    const resetForm = () => {
        const now = new Date()
        setFormData({
            name: "",
            amount: "",
            category: "",
            date: format(now, "yyyy-MM-dd"),
            description: ""
        })
        setEditingExpense(null)
        setShowForm(false)
    }

    // Handle click outside modal
    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            // Check if click is on Select dropdown
            const target = event.target as Element
            if (target.closest('[data-radix-popper-content-wrapper]')) {
                return
            }
            resetForm()
        }
    }

    useEffect(() => {
        if (showForm) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showForm])

    const getCategoryInfo = (categoryId: string): ExpenseCategory | undefined => {
        return EXPENSE_CATEGORIES.find(cat => cat.id === categoryId)
    }

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount)
    }

    // Format input amount to rupiah display
    const formatRupiahInput = (value: string): string => {
        // Remove all non-digit characters
        const numericValue = value.replace(/\D/g, '')

        if (numericValue === '') return ''

        // Convert to number and format
        const number = parseInt(numericValue, 10)
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number)
    }

    // Parse rupiah input back to number
    const parseRupiahInput = (value: string): number => {
        // Remove all non-digit characters
        const numericValue = value.replace(/\D/g, '')
        return numericValue === '' ? 0 : parseInt(numericValue, 10)
    }





    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Pengeluaran Bulanan</h1>
                    <p className="text-muted-foreground">
                        Kelola dan monitor pengeluaran bulanan Anda
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Pengeluaran
                </Button>
            </div>

            {/* Filter Section */}
            {isInitialized && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
                            </div>
                            {/* Show filter status */}
                            {isFilterActive() && (
                                <Badge variant="secondary" className="text-xs">
                                    Filter Aktif
                                </Badge>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
                                {/* Month and Date Range Filter */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="month">Bulan</Label>
                                        <Input
                                            id="month"
                                            type="month"
                                            value={filterData.month}
                                            onChange={(e) => {
                                                handleFilterChange('month', e.target.value)
                                                // Reset date range when month changes
                                                handleFilterChange('startDate', '')
                                                handleFilterChange('endDate', '')
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Tanggal Mulai</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={filterData.startDate}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                            placeholder="Pilih tanggal mulai"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">Tanggal Akhir</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={filterData.endDate}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                            placeholder="Pilih tanggal akhir"
                                        />
                                    </div>
                                </div>

                                {/* Category and Search Filter */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="filterCategory">Kategori</Label>
                                        <Select
                                            value={filterData.category || "all"}
                                            onValueChange={(value) => handleFilterChange('category', value === "all" ? "" : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua kategori" />
                                            </SelectTrigger>
                                            <SelectContent
                                                position="popper"
                                                side="bottom"
                                                align="start"
                                                className="min-w-[200px] max-h-[300px] select-content-modal"
                                                sideOffset={4}
                                                avoidCollisions={true}
                                            >
                                                <SelectItem value="all">Semua kategori</SelectItem>
                                                {EXPENSE_CATEGORIES.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{category.icon}</span>
                                                            <span>{category.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="searchQuery">Cari Pengeluaran</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="searchQuery"
                                                placeholder="Cari nama atau deskripsi..."
                                                value={filterData.searchQuery}
                                                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Filter Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button onClick={loadExpenses} className="gap-2">
                                        <Filter className="h-4 w-4" />
                                        Terapkan Filter
                                    </Button>
                                    <Button variant="outline" onClick={resetFilters}>
                                        Reset Filter
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                </Card>
            )}
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Periode</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                        <p className="text-xs text-muted-foreground">
                            {filterData.startDate && filterData.endDate ? (
                                `${format(new Date(filterData.startDate), "dd MMM", { locale: id })} - ${format(new Date(filterData.endDate), "dd MMM yyyy", { locale: id })}`
                            ) : (
                                format(new Date(filterData.month + "-01"), "MMMM yyyy", { locale: id })
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jumlah Transaksi</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredExpenses.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {filteredExpenses.length === expenses.length ?
                                "Semua transaksi" :
                                `${filteredExpenses.length} dari ${expenses.length} transaksi`
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rata-rata per Transaksi</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {filteredExpenses.length > 0 ? formatCurrency(totalExpenses / filteredExpenses.length) : formatCurrency(0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per transaksi
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Breakdown Kategori</CardTitle>
                    <CardDescription>
                        Distribusi pengeluaran berdasarkan kategori
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {EXPENSE_CATEGORIES.map((category) => {
                            const amount = categoryStats[category.id] || 0
                            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0

                            return (
                                <div key={category.id} className="text-center p-4 rounded-lg border">
                                    <div className="text-2xl mb-2">{category.icon}</div>
                                    <div className="font-medium text-sm">{category.name}</div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {formatCurrency(amount)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {percentage.toFixed(1)}%
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <Card ref={modalRef} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <CardHeader>
                            <CardTitle>
                                {editingExpense ? "Edit Pengeluaran" : "Tambah Pengeluaran Baru"}
                            </CardTitle>
                            <CardDescription>
                                Isi detail pengeluaran Anda
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Pengeluaran</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Contoh: Makan siang"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Total Pengeluaran</Label>
                                        <Input
                                            id="amount"
                                            type="text"
                                            value={formData.amount}
                                            onChange={(e) => {
                                                const formattedValue = formatRupiahInput(e.target.value)
                                                setFormData({ ...formData, amount: formattedValue })
                                            }}
                                            onBlur={(e) => {
                                                // Ensure the value is properly formatted on blur
                                                const formattedValue = formatRupiahInput(e.target.value)
                                                setFormData({ ...formData, amount: formattedValue })
                                            }}
                                            placeholder="Rp 0"
                                            required
                                            className="font-mono"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Masukkan angka tanpa spasi atau karakter khusus
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Kategori</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent
                                                position="popper"
                                                side="bottom"
                                                align="start"
                                                className="z-[70] min-w-[200px] max-h-[300px] select-content-modal"
                                                sideOffset={4}
                                                avoidCollisions={true}
                                            >
                                                {EXPENSE_CATEGORIES.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-2xl">{category.icon}</div>
                                                            <span>{category.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date">Tanggal</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Tambahkan deskripsi pengeluaran..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" className="flex-1">
                                        {editingExpense ? "Update Pengeluaran" : "Tambah Pengeluaran"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingExpense && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-red-600" />
                                Konfirmasi Hapus
                            </CardTitle>
                            <CardDescription>
                                Apakah Anda yakin ingin menghapus pengeluaran ini?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="font-medium">{deletingExpense.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {format(deletingExpense.date, "dd MMMM yyyy", { locale: id })}
                                    </div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {formatCurrency(deletingExpense.amount)}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(deletingExpense.id!)}
                                        className="flex-1"
                                    >
                                        Hapus
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setDeletingExpense(null)}
                                        className="flex-1"
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Expenses List */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengeluaran</CardTitle>
                    <CardDescription>
                        {isFilterActive() ? (
                            <>
                                {filterData.startDate && filterData.endDate ? (
                                    `Pengeluaran dari ${format(new Date(filterData.startDate), "dd MMMM yyyy", { locale: id })} sampai ${format(new Date(filterData.endDate), "dd MMMM yyyy", { locale: id })}`
                                ) : (
                                    `Pengeluaran bulan ${format(new Date(filterData.month + "-01"), "MMMM yyyy", { locale: id })}`
                                )}
                                {filterData.category && (
                                    <span className="text-blue-600 font-medium">
                                        {" "}• Kategori: {getCategoryInfo(filterData.category)?.name}
                                    </span>
                                )}
                                {filterData.searchQuery && (
                                    <span className="text-blue-600 font-medium">
                                        {" "}• Pencarian: "{filterData.searchQuery}"
                                    </span>
                                )}
                                <span className="text-blue-600 font-medium">
                                    {" "}({filteredExpenses.length} dari {expenses.length} transaksi)
                                </span>
                            </>
                        ) : (
                            <>
                                {expenses.length > 0 ? (
                                    <>
                                        {getMonthInfoFromExpenses() && (
                                            <span className="text-muted-foreground">
                                                {getMonthInfoFromExpenses()}
                                            </span>
                                        )}
                                        <span className="text-blue-600 font-medium">
                                            {" "}({expenses.length} transaksi)
                                        </span>
                                    </>
                                ) : (
                                    "Belum ada data pengeluaran"
                                )}
                            </>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Memuat data pengeluaran...</p>
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {expenses.length === 0 ?
                                "Belum ada pengeluaran untuk periode ini" :
                                "Tidak ada pengeluaran yang sesuai dengan filter"
                            }
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredExpenses.map((expense) => {
                                const category = getCategoryInfo(expense.category)
                                return (
                                    <div
                                        key={expense.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl">{category?.icon}</div>
                                            <div>
                                                <div className="font-medium">{expense.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {format(expense.date, "dd MMMM yyyy", { locale: id })}
                                                    {expense.description && ` • ${expense.description}`}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-sm">
                                                {category?.name}
                                            </Badge>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">
                                                    {formatCurrency(expense.amount)}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(expense)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => showDeleteConfirmation(expense)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// Export with client-only wrapper to prevent hydration issues
const MonthlyExpensesPage = dynamic(() => Promise.resolve(MonthlyExpensesPageContent), {
    ssr: false,
    loading: () => (
        <div className="p-6 space-y-6">
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Memuat halaman...</p>
            </div>
        </div>
    )
})

export default MonthlyExpensesPage
