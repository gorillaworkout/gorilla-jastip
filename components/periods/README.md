# Komponen Periods

Kumpulan komponen reusable untuk halaman periods dengan design yang rapi dan modern.

## Komponen yang Tersedia

### 1. PeriodCard
Komponen utama untuk menampilkan informasi periode dengan statistik dan data customer.

**Props:**
- `period`: Data periode
- `expandedCustomers`: Set customer yang sedang di-expand
- `onToggleActive`: Callback untuk toggle status aktif
- `onAddCustomer`: Callback untuk tambah customer
- `onDeletePeriod`: Callback untuk hapus periode
- `onEditCustomer`: Callback untuk edit customer
- `onEditItem`: Callback untuk edit item
- `onDeleteItem`: Callback untuk hapus item
- `onToggleCustomerExpanded`: Callback untuk expand/collapse customer
- `formatCurrency`: Function untuk format currency
- `formatDate`: Function untuk format date

### 2. CustomerGroup
Komponen untuk menampilkan grup customer dengan collapsible items.

**Props:**
- `customerKey`: Unique key untuk customer
- `customerName`: Nama customer
- `items`: Array item customer
- `period`: Data periode
- `isExpanded`: Status expand/collapse
- `onToggleExpanded`: Callback untuk toggle expand
- `onEditCustomer`: Callback untuk edit customer
- `onEditItem`: Callback untuk edit item
- `onDeleteItem`: Callback untuk hapus item
- `formatCurrency`: Function untuk format currency

### 3. ItemRow
Komponen untuk menampilkan detail item dengan informasi harga dan profit.

**Props:**
- `item`: Data item
- `index`: Index item
- `onEdit`: Callback untuk edit item
- `onDelete`: Callback untuk hapus item
- `formatCurrency`: Function untuk format currency

### 4. PageHeader
Komponen header halaman dengan title dan action buttons.

**Props:**
- `onCreatePeriod`: Callback untuk buat periode
- `onRefreshStatistics`: Callback untuk refresh statistics
- `loading`: Status loading

### 5. EmptyState
Komponen untuk menampilkan state kosong dengan call-to-action.

**Props:**
- `title`: Judul state kosong
- `description`: Deskripsi state kosong
- `buttonText`: Text tombol action
- `onAction`: Callback untuk action
- `icon`: Icon yang ditampilkan (opsional)

### 6. CreatePeriodModal
Modal untuk membuat periode baru.

**Props:**
- `isOpen`: Status modal open/close
- `onClose`: Callback untuk close modal
- `onSubmit`: Callback untuk submit form
- `loading`: Status loading

### 7. LoadingSpinner
Komponen loading spinner dengan pesan.

**Props:**
- `message`: Pesan loading
- `size`: Ukuran spinner (sm, md, lg)

### 8. StatisticsCard
Komponen card untuk menampilkan statistik dengan icon dan warna.

**Props:**
- `icon`: Icon yang ditampilkan
- `value`: Nilai statistik
- `label`: Label statistik
- `color`: Warna card (blue, green, purple, orange, red)
- `className`: Class tambahan

### 9. StatisticsSection
Komponen section untuk menampilkan grid statistik periode.

**Props:**
- `period`: Data periode
- `formatCurrency`: Function untuk format currency

### 10. ActionButton
Komponen tombol aksi dengan icon dan styling yang konsisten.

**Props:**
- `icon`: Icon yang ditampilkan
- `children`: Text tombol
- `variant`: Variant tombol (default, outline, destructive)
- `size`: Ukuran tombol (sm, md, lg)
- `onClick`: Callback untuk click
- `className`: Class tambahan
- `disabled`: Status disabled

### 11. StatusBadge
Komponen badge untuk status aktif/tidak aktif.

**Props:**
- `isActive`: Status aktif
- `className`: Class tambahan

### 12. PriceCard
Komponen card untuk menampilkan informasi harga dengan warna yang berbeda.

**Props:**
- `icon`: Icon yang ditampilkan
- `title`: Judul card
- `value`: Nilai harga
- `color`: Warna card (blue, green, purple, indigo, orange, emerald)
- `className`: Class tambahan

## Penggunaan

```tsx
import {
  PeriodCard,
  CustomerGroup,
  ItemRow,
  PageHeader,
  EmptyState,
  CreatePeriodModal,
  LoadingSpinner,
  StatisticsCard,
  StatisticsSection,
  ActionButton,
  StatusBadge,
  PriceCard
} from "@/components/periods"

// Gunakan komponen sesuai kebutuhan
```

## Fitur

- **Responsive Design**: Semua komponen responsive untuk mobile dan desktop
- **Consistent Styling**: Menggunakan design system yang konsisten
- **Reusable**: Komponen dapat digunakan di halaman lain
- **TypeScript**: Full TypeScript support dengan interface yang jelas
- **Accessibility**: Mengikuti best practices accessibility
- **Performance**: Optimized dengan proper memoization dan lazy loading

## Styling

Komponen menggunakan:
- Tailwind CSS untuk styling
- CSS Grid dan Flexbox untuk layout
- CSS Variables untuk theming
- Hover effects dan transitions
- Consistent spacing dan typography
- Color system yang terorganisir

## Customization

Semua komponen dapat dikustomisasi melalui:
- Props untuk behavior
- className untuk styling tambahan
- Theme context untuk theming
- CSS variables untuk override
