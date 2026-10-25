HEAD
# PanggilKami — Platform Marketplace Jasa Panggilan Lokal
> **Tagline:** “Butuh Bantuan? PanggilKami.”  
> **Wilayah Utama:** Solo Baru HTC, Sukoharjo, Kartasura, Solo Kota, dan sekitarnya.

PanggilKami adalah platform marketplace jasa panggilan profesional yang mempertemukan pelanggan dengan penyedia jasa terpercaya untuk membantu kebutuhan sehari-hari. Dibangun dengan sistem transaksi nyata, autentikasi berbasis role (Customer & Admin), pembayaran dinamis QR GoPay/QRIS real-time, dan manajemen operasional lengkap.

---

## 🌟 Fitur Utama

### 1. Layanan PanggilKami
Platform ini secara spesifik menyediakan 4 kategori layanan utama (tanpa layanan laundry):
1. **Jasa Titip Barang (Mulai Rp25.000)**  
   - Titip beli oleh-oleh khas Solo, makanan khas, perlengkapan kuliah, dan kebutuhan sehari-hari.  
   - **Transparansi Biaya:** Memisahkan secara ketat antara biaya jasa (ongkos titip) dan anggaran pembelian barang.
2. **Antar Barang Apa Saja (Mulai Rp15.000)**  
   - Pengantaran dokumen, barang, makanan, dan barang legal lainnya.  
   - Peringatan tegas mengenai barang yang dilarang oleh hukum.
3. **Antar Jemput Orang (Mulai Rp15.000)**  
   - Layanan transportasi lokal dengan konfirmasi ketersediaan mitra & armada terlebih dahulu.
4. **Bersih-bersih Kamar / WC / Kos (Mulai Rp100.000/jam)**  
   - Pembersihan kamar kos, WC/kamar mandi, atau paket kamar + WC.  
   - **Kalkulator Estimasi Cerdas:** Menghitung durasi dan biaya berdasarkan luas ($m^2$) dan tingkat kekotoran (Ringan, Sedang, Berat) dengan konfigurasi tarif yang dapat diatur via dashboard admin.

---

### 2. Sistem Pembayaran QR GoPay / QRIS Real-Time
- Menggunakan payload resmi QRIS GoPay Merchant:
  - **Nama Merchant:** `panggilkami`
  - **Lokasi:** Hartono Trade Center, Jl. Ir. Soekarno No. A21, Madegondo, Grogol, Sukoharjo
  - **NMID:** `ID1026484632207`
- **Injeksi Nominal Real-Time:** Secara dinamis mengubah status QRIS menjadi dinamis (Point of Initiation `010212`), menginjeksikan Tag `54` dengan nominal rupiah yang persis sesuai pesanan, dan menghitung ulang Checksum CRC-16/CCITT secara otomatis.
- **Konfirmasi Pembayaran:** Pelanggan dapat menekan tombol *"Saya Sudah Membayar"* untuk mengubah status menjadi `Menunggu Verifikasi`, lalu Admin memverifikasi di Dashboard.

---

### 3. Sistem Voucher Promo 100%
- Kode Voucher: **`panggilkami`**
- Memberikan potongan diskon 100% (total bayar menjadi **Rp0**).
- Jika total bayar Rp0, sistem langsung menyelesaikan pemesanan tanpa meminta transfer dana, dan pesanan tercatat valid di database.

---

### 4. Autentikasi & Role-Based Access Control (RBAC)
- **Customer Role:** Registrasi mandiri, login, edit profil, riwayat pesanan, status pembayaran, dan submit ulasan setelah pesanan berstatus *Selesai*.
- **Admin Role:**
  - Akun Default: `admin@gmail.com`
  - Kata Sandi Awal: `123456`
  - Akses Dashboard Admin: `/admin` (dilindungi oleh `ProtectedRoute`).
  - Fitur Admin: Ringkasan Metrik (membedakan omset kotor vs pendapatan bersih jasa), Manajemen Pesanan, Manajemen Layanan & Tarif, Verifikasi Pembayaran, Manajemen Pelanggan, Moderasi Ulasan, dan Pengaturan Website.

---

### 5. Saluran Bantuan Customer Service
- **Nomor WhatsApp Resmi:** `082283883580` (Tautan internasional: `https://wa.me/6282283883580`)
- **Email:** `panggilkamisolo@gmail.com`
- **Alamat:** Solo Baru HTC (Hartono Trade Center, Sukoharjo)
- Tombol WhatsApp pintar tersedia di Navbar, Footer, Detail Layanan, Checkout, dan Halaman Pembayaran dengan pesan otomatis yang menyertakan Kode Pesanan dan Nominal.

---

### 6. Sistem Ulasan Autentik
- Ulasan hanya dapat diberikan oleh pelanggan dengan pesanan yang sudah berstatus **Selesai**.
- Homepage hanya menampilkan maksimal 10 ulasan asli dari database.
- Jika belum ada ulasan, sistem menampilkan **Empty State** yang elegan tanpa merekayasa ulasan palsu.

---

## 🚀 Panduan Menjalankan Secara Lokal

### Prasyarat
- Node.js versi 18 atau 20 LTS
- NPM atau PNPM

### Langkah Instalasi
1. Clone repositori atau buka folder proyek:
   ```bash
   cd panggilkami
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan (Development Server):
   ```bash
   npm run dev
   ```
   Buka browser di: `http://localhost:5173`

4. Uji build produksi:
   ```bash
   npm run build
   ```

---

## 🗄️ Setup Database & Supabase

Proyek ini telah dilengkapi dengan skema PostgreSQL lengkap yang siap di-deploy ke Supabase:
- File skema: `supabase_schema.sql`
- Tabel yang disediakan:
  - `profiles` (Sinkronisasi dengan Supabase Auth via trigger)
  - `services` (Daftar layanan & aturan kalkulasi)
  - `service_areas` (Area jangkauan Solo Baru HTC & sekitarnya)
  - `vouchers` (Voucher promo termasuk kode `panggilkami`)
  - `bookings` (Data pesanan, status pesanan, & status pembayaran)
  - `booking_details` (Detail teknis layanan per pesanan)
  - `payments` (Pencatatan transaksi QRIS, nominal, & bukti pembayaran)
  - `reviews` (Ulasan pelanggan yang terverifikasi)
  - `site_settings` (Pengaturan operasional & kontak CS)

### Cara Mengaktifkan Supabase:
1. Buat project baru di [Supabase Console](https://supabase.com).
2. Salin isi file `supabase_schema.sql` ke dalam **SQL Editor** di Supabase lalu jalankan (Run).
3. Salin URL Project dan Anon Key ke file `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🚢 Panduan Deploy ke GitHub & Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "feat: complete panggilkami marketplace web platform"
git branch -M main
git remote add origin https://github.com/username/panggilkami.git
git push -u origin main
```

### 2. Deploy ke Vercel
1. Buka [Vercel Dashboard](https://vercel.com) dan pilih **Add New Project**.
2. Hubungkan repositori GitHub `panggilkami`.
3. Pengaturan Framework Preset: **Vite**.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Masukkan Environment Variables jika menggunakan Supabase.
7. Klik **Deploy**. File `vercel.json` sudah disediakan untuk memastikan routing SPA tidak menghasilkan error 404 saat di-refresh.

---

## 🔒 Hak Akses & Kredensial Admin Awal
- **URL Admin:** `http://localhost:5173/admin`
- **Email:** `admin@gmail.com`
- **Password:** `123456`
> **Penting:** Segera ganti kata sandi admin melalui menu Pengaturan Admin setelah pertama kali login ke lingkungan produksi.
=======
# panggilkami
Website marketplace jasa untuk membantu orang sibuk mendapatkan bantuan pekerjaan sehari-hari.
>>>>>>> 0ca9dfd5e83afb6515d24d1bf617e54168446c25
