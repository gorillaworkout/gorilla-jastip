# Troubleshooting Authentication Error: "Domain tidak diizinkan"

## Error yang Ditemukan

```
Error: Domain tidak diizinkan. Hubungi administrator.
```

## Penyebab Umum

Error ini terjadi karena beberapa kemungkinan:

1. **Environment Variables tidak terset di Vercel Production**
2. **Domain mismatch antara Firebase dan Environment Variables**
3. **Google Sign-In provider tidak diaktifkan**
4. **Authorized Domains tidak sesuai**

## Langkah Troubleshooting

### 1. Periksa Environment Variables di Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project `gorilla-jastip`
3. Klik tab **Settings**
4. Klik **Environment Variables**
5. Pastikan semua variabel Firebase ada dan terset untuk **Production**:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gorillaworkout-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gorillaworkout-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gorillaworkout-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**⚠️ PENTING**: Pastikan variabel terset untuk environment **Production**, bukan hanya Preview.

### 2. Verifikasi Firebase Console Settings

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project `gorillaworkout-project`
3. Klik **Authentication** di sidebar kiri
4. Klik tab **Sign-in method**
5. Pastikan **Google** provider sudah diaktifkan
6. Klik tab **Settings**
7. Scroll ke **Authorized domains**
8. Pastikan domain berikut ada:
   - `localhost` (untuk development)
   - `gorillaworkout-project.firebaseapp.com`
   - `gorillaworkout-project.web.app`
   - `gorilla-jastip.vercel.app`

### 3. Periksa Konfigurasi Auth Domain

**NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN** harus sama dengan domain yang ada di Firebase Console:

```
✅ BENAR: gorillaworkout-project.firebaseapp.com
❌ SALAH: gorilla-jastip.vercel.app
```

**Catatan**: `gorilla-jastip.vercel.app` adalah domain aplikasi Anda, bukan auth domain Firebase.

### 4. Redeploy Aplikasi

Setelah mengupdate environment variables:

1. Commit perubahan (jika ada)
2. Push ke repository
3. Vercel akan otomatis redeploy
4. Tunggu deploy selesai
5. Test login di domain production

### 5. Clear Browser Cache

1. Buka Developer Tools (F12)
2. Klik kanan pada tombol refresh
3. Pilih "Empty Cache and Hard Reload"
4. Atau gunakan Ctrl+Shift+R (Cmd+Shift+R di Mac)

## Debugging Scripts

### Script 1: Check Local Environment
```bash
node scripts/debug-auth.js
```

### Script 2: Check Production Environment
```bash
node scripts/check-production-auth.js
```

## Verifikasi Konfigurasi

### Firebase Config yang Benar
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "gorillaworkout-project.firebaseapp.com", // ✅ Ini yang benar
  projectId: "gorillaworkout-project",
  storageBucket: "gorillaworkout-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Environment Variables yang Benar
```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gorillaworkout-project.firebaseapp.com
```

## Common Mistakes

1. **Menggunakan domain Vercel sebagai auth domain**
   - ❌ `gorilla-jastip.vercel.app`
   - ✅ `gorillaworkout-project.firebaseapp.com`

2. **Environment variables tidak terset untuk Production**
   - Pastikan variabel terset untuk semua environment

3. **Google Sign-In provider tidak diaktifkan**
   - Aktifkan di Firebase Console > Authentication > Sign-in method

4. **Domain tidak ditambahkan ke Authorized Domains**
   - Tambahkan `gorilla-jastip.vercel.app` ke authorized domains

## Testing

### Test Local
```bash
npm run dev
# Buka http://localhost:3000
# Test login dengan Google
```

### Test Production
1. Deploy ke Vercel
2. Buka `https://gorilla-jastip.vercel.app`
3. Test login dengan Google
4. Periksa browser console untuk error

## Jika Masih Error

1. **Periksa Browser Console** untuk error detail
2. **Periksa Network Tab** untuk request yang gagal
3. **Periksa Firebase Console** untuk log authentication
4. **Gunakan debugging scripts** untuk verifikasi konfigurasi
5. **Clear browser cache dan cookies**
6. **Test di browser incognito/private**

## Support

Jika masih mengalami masalah:

1. Screenshot error dari browser console
2. Screenshot environment variables di Vercel
3. Screenshot authorized domains di Firebase Console
4. Log dari debugging scripts

## Catatan Penting

- **Auth Domain ≠ App Domain**: Auth domain adalah domain Firebase, bukan domain aplikasi Anda
- **Environment Variables**: Harus terset untuk Production environment di Vercel
- **Google Sign-In**: Harus diaktifkan di Firebase Console
- **Authorized Domains**: Domain aplikasi harus ditambahkan ke authorized domains
