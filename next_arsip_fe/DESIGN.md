# UI/UX Specification & Design System: DocArchive Enterprise

Dokumen ini berfungsi sebagai panduan tunggal (Single Source of Truth) untuk standardisasi visual antarmuka sistem. Seluruh komponen visual wajib mengacu pada token kelas dan spesifikasi di bawah ini untuk menghindari ketidakkonsistenan antar-halaman.

## 1. Skema Warna & Token Visual (Stitch Project Standard)

Sistem visual menggunakan palet warna korporat modern berbasis SaaS dengan kontras tinggi namun lembut di mata:

- **Primary Color:** `#4F46E5` (Tailwind `indigo-600`) - Digunakan untuk tombol aksi utama, indikator aktif, dan aksen penting.
- **Secondary Color:** `#1E293B` (Tailwind `slate-800`) - Digunakan untuk teks judul utama, warna teks navigasi utama, dan elemen struktural dominan.
- **Tertiary Color:** `#10B981` (Tailwind `emerald-500`) - Digunakan untuk status sukses (Disetujui/Aktif) dan metrik tren positif.
- **Neutral/Muted Color:** `#64748B` (Tailwind `slate-500`) - Digunakan untuk teks sekunder, sub-judul, border halus, dan ikon non-aktif.
- **App Background:** `#F8FAFC` (Tailwind `slate-50`) - **WAJIB** digunakan pada background aplikasi agar kontainer kartu putih murni dapat terlihat melayang (pop-out).

## 2. Tipografi (Typography Hierarchy)

Font utama untuk seluruh sistem adalah **Inter**. Struktur skala ukuran wajib mengikuti standar berikut:

- **H1 (Page Title / Login Title):** `text-3xl font-extrabold tracking-tight text-slate-900`
- **H2 (Card Section / Sub-Module Title):** `text-xl font-bold tracking-tight text-slate-800`
- **Body Bold / Table Header:** `text-xs font-bold uppercase tracking-widest text-slate-400`
- **Body Text:** `text-sm font-medium text-slate-600`
- **Muted Label / Meta Info:** `text-xs text-slate-400`

## 3. Komponen Elevasi & Bentuk (Shapes & Shadows)

Untuk membuang kesan jadul/kotak-kotak, semua kontainer wajib menggunakan lekukan membulat yang modern dengan kedalaman bayangan yang soft:

- **Main Content Card:** `bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/50`
- **Action Buttons & Form Controls:** `rounded-xl` (Sudut membulat medium untuk input teks, dropdown, dan tombol).
- **Status Pills / Badges:** `rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider`

## 4. Pola Tata Letak Global (Global Layout Layout)

- **Left Sidebar Navigation:** Lebar tetap (`w-72`), posisi terkunci (`fixed left-0`), berlatar belakang putih murni dengan pembatas kanan yang sangat tipis (`border-r border-slate-100`). Navigasi wajib dikelompokkan (Grouped Menu) dengan sub-header kapital kecil berwarna abu-abu.
- **Top Header Bar:** Tinggi tetap (`h-20`), posisi melayang di kanan sidebar (`fixed top-0 right-0 left-72 bg-white/80 backdrop-blur-md`).
- **Main Canvas Window:** Memiliki margin kiri senilai sidebar (`ml-72`), padding atas senilai header bar, dengan padding halaman yang lega (`p-8 md:p-12`).

## 5. Panduan Implementasi PrimeReact (Styling Mapping)

Saat memetakan desain Stitch ini ke komponen asli PrimeReact di frontend, gunakan properti `className` atau arsitektur `pt` (Pass-Through) untuk menimpa class bawaan PrimeReact:

- `<DataTable>` -> Tambahkan `rowHover`, hilangkan border grid vertikal bawaan, beri padding row yang tinggi.
- `<Dialog>` -> Berikan class `rounded-2xl shadow-2xl border-0` pada elemen root-nya.
- `<Button>` -> Untuk primary aksi, pasang kombinasi warna Indigo modern, hindari warna neon/primer solid bawaan tema lama.
