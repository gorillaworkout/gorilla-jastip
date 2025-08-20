# Firebase Setup & Troubleshooting

## Masalah yang Ditemukan

Error yang terjadi:
```
Error creating period: Error: Gagal membuat periode baru: Missing or insufficient permissions.
```

## Penyebab

Masalah ini disebabkan oleh Firebase Security Rules yang tidak mengizinkan operasi write ke Firestore database.

## Solusi

### 1. Deploy Firebase Security Rules

Firebase Security Rules sudah dibuat di file `firestore.rules` yang mengizinkan user yang terautentikasi untuk melakukan operasi read/write.

Untuk deploy rules:

```bash
# Install Firebase CLI (jika belum)
npm install -g firebase-tools

# Login ke Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

Atau gunakan script yang sudah disediakan:

```bash
node scripts/deploy-firebase.js
```

### 2. Verifikasi Konfigurasi

Pastikan file `.env` berisi konfigurasi Firebase yang benar:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Test Koneksi Firebase

Jalankan script test untuk memverifikasi koneksi:

```bash
node scripts/test-firebase.js
```

### 4. Periksa Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project Anda
3. Buka menu "Firestore Database"
4. Buka tab "Rules"
5. Pastikan rules sudah terdeploy dengan benar

## Firebase Security Rules

Rules yang digunakan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write to periods collection
    match /periods/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read and write to periodItems collection
    match /periodItems/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read and write to users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default rule - deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Troubleshooting

### Jika masih error setelah deploy rules:

1. **Periksa Authentication State**: Pastikan user sudah login dengan benar
2. **Periksa Console Logs**: Lihat apakah ada error lain di browser console
3. **Periksa Network Tab**: Lihat apakah request ke Firebase berhasil
4. **Periksa Firebase Console**: Pastikan rules sudah terdeploy

### Jika Firebase CLI tidak terinstall:

```bash
# Install via npm
npm install -g firebase-tools

# Atau via curl (macOS/Linux)
curl -sL https://firebase.tools | bash
```

### Jika tidak bisa login ke Firebase:

```bash
# Clear cache dan login ulang
firebase logout
firebase login
```

## Struktur Database

Setelah rules terdeploy, struktur database akan seperti ini:

```
periods/
  - {periodId}/
    - name: string
    - startDate: timestamp
    - endDate: timestamp
    - isActive: boolean
    - totalProducts: number
    - totalRevenue: number
    - totalProfit: number
    - averageMargin: number
    - createdBy: string (user ID)
    - createdAt: timestamp
    - updatedAt: timestamp

periodItems/
  - {itemId}/
    - periodId: string
    - customerName: string
    - itemPrice: number
    - exchangeRate: number
    - sellingPrice: number
    - profit: number
    - margin: number
    - createdAt: timestamp
    - updatedAt: timestamp
```

## Catatan Penting

- **Security Rules**: Selalu deploy security rules sebelum menggunakan aplikasi
- **Authentication**: Pastikan user sudah login sebelum melakukan operasi database
- **Environment Variables**: Jangan lupa set environment variables yang diperlukan
- **Firebase CLI**: Gunakan Firebase CLI untuk deploy rules dan konfigurasi
