# AgroConnect

Marketplace jual beli produk pertanian. Dibangun dengan React + Vite + Tailwind CSS + Firebase (Authentication & Firestore).

## Fitur

- Login dengan akun Google (Firebase Authentication)
- Pemilihan peran saat pertama login: Pembeli atau Penjual
- Akun Pembeli: jelajahi produk, cari & filter kategori, keranjang, checkout (mengurangi stok otomatis)
- Akun Penjual: tambah produk, hapus produk, atur diskon — semua data tersimpan permanen di Firestore
- Data real-time: perubahan produk langsung terlihat oleh semua pengguna

## Cara menjalankan

1. Pastikan Node.js sudah terpasang (minimal versi 18).
2. Buka folder ini di terminal, jalankan:

```bash
npm install
```

3. Jalankan:

```bash
npm run dev
```

4. Buka `http://localhost:5173` di browser.

## Struktur project

```
agroconnect-project/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── firestore.rules     # aturan keamanan Firestore
└── src/
    ├── main.jsx         # entry point
    ├── App.jsx          # komponen utama AgroConnect
    ├── firebase.js       # konfigurasi & inisialisasi Firebase
    └── index.css         # import Tailwind
```

## Setup Firebase (sudah terhubung)

Project ini sudah dikonfigurasi untuk terhubung ke project Firebase Anda melalui `src/firebase.js`. Pastikan di Firebase Console:

1. **Authentication → Sign-in method**: provider **Google** statusnya "Enabled".
2. **Firestore Database**: sudah dibuat (mode test atau dengan rules di bawah).

### Menerapkan Firestore Security Rules (penting sebelum go-live ke publik)

Mode "test mode" Firestore hanya berlaku 30 hari dan mengizinkan siapa saja membaca/menulis data — tidak aman untuk produksi. Untuk menerapkan rules yang lebih aman:

1. Buka Firebase Console → **Firestore Database → Rules**
2. Ganti isi rules dengan isi file `firestore.rules` pada project ini
3. Klik **Publish**

Rules ini memastikan:
- Setiap pengguna hanya bisa mengubah profilnya sendiri
- Hanya penjual pemilik produk yang bisa menambah/menghapus/mengubah produknya
- Pembeli hanya bisa mengubah field `stock` (saat checkout)
- Pesanan hanya bisa dibuat dan dibaca oleh pembeli yang membuatnya

## Struktur data Firestore

- **`users/{uid}`**: `{ name, email, role, storeName }`
- **`products/{productId}`**: `{ name, category, price, unit, stock, discount, seller, sellerUid, desc }`
- **`orders/{orderId}`**: `{ buyerUid, items: [...], createdAt }`

## Build untuk produksi

```bash
npm run build
```

Hasil build ada di folder `dist/`, siap di-hosting (Vercel, Netlify, Firebase Hosting, dll).

### Tambahkan domain ke Firebase Authorized Domains

Setelah deploy (misalnya ke `agroconnect.vercel.app`), tambahkan domain tersebut di:

Firebase Console → Authentication → Settings → **Authorized domains** → Add domain

Tanpa ini, login Google akan gagal di domain production.

## Catatan

- Sistem pembayaran belum terintegrasi — checkout saat ini hanya mencatat pesanan dan mengurangi stok.
- Untuk Indonesia, integrasi Midtrans atau Xendit bisa ditambahkan pada langkah checkout.
