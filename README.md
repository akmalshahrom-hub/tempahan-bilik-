# Sistem Tempahan Bilik Mesyuarat (Meeting Room Booking System)

Sistem Pengurusan & Tempahan Bilik Mesyuarat Dalaman Organisasi Malaysia yang moden, responsif dan berprestasi tinggi. Dibina berasaskan React 19, TypeScript, Vite, dan Tailwind CSS.

---

## Ciri-Ciri Utama (Key Features)

1. **Papan Pemuka Interaktif (Modern Dashboard)**:
   - Kad ringkasan pintar: Jumlah Bilik, Bilik Tersedia Hari Ini, Tempahan Hari Ini, Sedang Digunakan, Mesyuarat Akan Datang.
   - Garis masa jadual harian (Today's Timeline) dengan penunjuk status visual (*Tersedia*, *Ditempah*, *Sedang Berlangsung*, *Selesai*, *Dibatalkan*).
   - Pandangan pantas ketersediaan bilik langsung.

2. **Pengesanan Konflik Jadual Pintar (Smart Conflict Detection)**:
   - Algoritma sifar pertindihan masa:
     $$\text{existingStart} < \text{newEnd} \quad \text{AND} \quad \text{existingEnd} > \text{newStart}$$
   - Pengesahan kapasiti peserta mengikut had maksimum bilik secara masa-nyata.
   - Pratonton ringkasan sebelum pengesahan muktamad dan paparan mesej ralat dalam Bahasa Melayu.

3. **Penjanaan ID Tempahan Unik**:
   - Format piawai korporat berurutan: `MRB-2026-0001`, `MRB-2026-0002`.

4. **Kalendar Pelbagai Paparan (Interactive Calendar)**:
   - Paparan Harian (*Day View*), Mingguan (*Week View*), dan Bulanan (*Month View*).
   - Blok warna mengikut bilik dengan modal maklumat terperinci.
   - Tapisan mengikut bilik dan jabatan penganjur.

5. **Pengurusan Bilik Mesyuarat (Room Management)**:
   - Paparan kad bilik lengkap dengan kapasiti, gambar berkualiti tinggi, senarai kelengkapan (Projektor, TV, *Video Conference*, Papan Putih, dll.), dan status.
   - Kawalan pentadbir: Tambah, kemaskini, padam dan tetapan mod penyelenggaraan (*maintenance mode*).

6. **Pengurusan Tempahan Saya (My Bookings)**:
   - Pembahagian kategori: *Semua*, *Hari Ini*, *Akan Datang*, *Terdahulu*, dan *Dibatalkan*.
   - Muat turun fail iCalendar (`.ics`) untuk integrasi ke Google Calendar / Outlook / Apple Calendar.
   - Cetakan Surat Pengesahan Rasmi dengan kepala surat korporat dan tandatangan.
   - Pembatalan dengan pengesahan selamat.

7. **Laporan & Analisis Penggunaan (Analytics & Reports)**:
   - Kadar penggunaan bilik mesyuarat (*utilization rate*).
   - Carta statistik bilik paling kerap diguna dan taburan mengikut jabatan serta jenis mesyuarat.
   - Eksport senarai tempahan ke fail CSV berformat Excel (UTF-8 BOM).
   - Susun atur cetakan dokumen laporan.

8. **Akses Dwi-Peranan (Role-Based Access Control)**:
   - **Administrator**: Akses penuh mengurus bilik, kelulusan/pembatalan tempahan, dan pengurusan akaun pengguna.
   - **Staff**: Pengurusan tempahan kendiri dan semakan jadual.
   - Penukar peranan demo segera (*1-click demo switcher*).

---

## Struktur Projek (Project Structure)

```
├── .env.example                     # Contoh pembolehubah persekitaran (Environment variables)
├── index.html                       # Titik masuk HTML dengan metadata dan tipografi
├── metadata.json                    # Metadata aplikasi AI Studio
├── package.json                     # Pakej kebergantungan & skrip build
├── README.md                        # Dokumentasi sistem
├── src/
│   ├── App.tsx                      # Komponen induk aplikasi & penghalaan navigasi
│   ├── index.css                    # Gaya Tailwind CSS & susun atur cetakan (@media print)
│   ├── main.tsx                     # Titik permulaan React DOM
│   ├── context/
│   │   └── AuthContext.tsx          # Konteks pengesahan pengguna & dwibahasa (MS/EN)
│   ├── types/
│   │   └── index.ts                 # Definisi jenis data TypeScript (User, Room, Booking)
│   ├── services/
│   │   ├── storageService.ts        # Lapisan storan persisten localStorage & pengesanan konflik
│   │   └── firebaseConfig.ts        # Penyesuai & konfigurasi integrasi Firebase / Firestore
│   ├── utils/
│   │   ├── calendarExport.ts        # Penjana fail .ics kalendar
│   │   ├── csvExport.ts             # Eksport fail CSV untuk laporan
│   │   └── formatters.ts            # Pembformat tarikh & waktu Bahasa Melayu
│   └── components/
│       ├── common/                  # Komponen guna semula (Header, Sidebar, Modal, Badge)
│       ├── dashboard/               # Papan pemuka & garis masa harian
│       ├── rooms/                   # Senarai & pengurusan bilik mesyuarat
│       ├── booking/                 # Borang tempahan, modal butiran & resit cetakan
│       ├── calendar/                # Kalendar harian, mingguan & bulanan
│       ├── my-bookings/             # Senarai tempahan staf & tindakan
│       ├── admin/                   # Panel pentadbiran (Bilik, Tempahan, Pengguna)
│       ├── reports/                 # Laporan & carta penggunaan
│       └── auth/                    # Modal log masuk demo (Admin & Staff)
```

---

## Panduan Menjalankan Aplikasi Secara Lokal (Local Development)

### 1. Keperluan Sistem
- Node.js versi 18 atau ke atas
- Pengurus pakej `npm`

### 2. Pemasangan Kebergantungan
```bash
npm install
```

### 3. Menjalankan Pelayan Pembangunan
```bash
npm run dev
```
Buka pelayar web anda di `http://localhost:3000`.

### 4. Membina untuk Pengeluaran (Production Build)
```bash
npm run build
```
Fail yang telah dioptimumkan akan disimpan di dalam direktori `dist/`.

---

## Akaun Demo Bawaan (Predefined Demo Accounts)

Untuk tujuan demonstrasi dan semakan:

| Peranan | Nama Pegawai | Alamat Emel | Jabatan |
|---|---|---|---|
| **Administrator** | Ahmad Faiz bin Mansor | `admin@meetingroom.local` | Jabatan Pentadbiran & Sumber Manusia |
| **Staff** | Siti Nur Aisyah binti Rahman | `staff@meetingroom.local` | Jabatan Perancangan Bandar dan Desa |
| **Staff** | Mohd Safwan bin Ismail | `safwan@meetingroom.local` | Jabatan Kejuruteraan |
| **Staff** | Nurul Huda binti Abdullah | `huda@meetingroom.local` | Bahagian Pengurusan Teknologi Maklumat |

*Nota: Anda boleh menukar akaun atau peranan serta-merta menggunakan penukar pantas di bahagian penjuru atas kanan navigasi.*

---

## Integrasi Firebase / Firestore (Connecting to Firebase)

Aplikasi ini direka bentuk secara modular menggunakan lapisan servis storan (`storageService.ts` dan `firebaseConfig.ts`).

Untuk menghubungkan pangkalan data Firebase Firestore secara langsung:

1. Cipta projek baharu di [Firebase Console](https://console.firebase.google.com).
2. Aktifkan **Cloud Firestore** dan **Firebase Authentication**.
3. Cipta fail `.env` (berdasarkan `.env.example`) dan masukkan kunci konfigurasi Firebase anda:
   ```env
   VITE_USE_FIREBASE=true
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=nama-projek.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=nama-projek
   VITE_FIREBASE_STORAGE_BUCKET=nama-projek.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
   ```
4. Pasang SDK Firebase rasmi:
   ```bash
   npm install firebase
   ```
5. Struktur koleksi Firestore yang disyorkan:
   - `rooms`: Menyimpan dokumen setiap bilik mesyuarat.
   - `bookings`: Menyimpan rekod tempahan dengan indeks pada `roomId`, `date`, dan `status`.
   - `users`: Menyimpan maklumat peranan pengguna.

---

## Cara Menolak Projek ke GitHub (Pushing to GitHub)

1. Mulakan repositori Git lokal:
   ```bash
   git init
   ```
2. Tambah semua fail ke staging:
   ```bash
   git add .
   ```
3. Lakukan komit pertama:
   ```bash
   git commit -m "feat: Initial commit for Sistem Tempahan Bilik Mesyuarat Malaysia"
   ```
4. Cipta repositori baharu di akaun [GitHub](https://github.com/new).
5. Sambungkan repositori remote dan tolak kod:
   ```bash
   git branch -M main
   git remote add origin https://github.com/USERNAME/meeting-room-booking-system.git
   git push -u origin main
   ```

---

## Cara Melancarkan Aplikasi (Deployment)

### Melancarkan ke Vercel:
1. Pasang alat CLI Vercel atau pautkan repositori GitHub anda di papan pemuka [Vercel](https://vercel.com).
2. Jalankan arahan:
   ```bash
   npx vercel
   ```

### Melancarkan ke Cloud Run / Docker:
Bina fail statik menggunakan `npm run build` dan sajikan melalui pelayan web seperti Express, NGINX, atau Firebase Hosting.

---

## Lesen
Hak Cipta Terpelihara © 2026. Sesuai untuk kegunaan agensi awam, syarikat swasta dan institusi di Malaysia.
