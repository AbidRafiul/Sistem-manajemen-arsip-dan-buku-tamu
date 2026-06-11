# UI/UX Design System: Sistem Manajemen Arsip & Buku Tamu

## 1. Design Philosophy
Aplikasi ini ditujukan untuk instansi pemerintahan/korporat berskala enterprise. Desain harus memancarkan kesan **Premium, Modern, Clean, Profesional, dan Trustworthy**. Hindari elemen visual yang terlalu *playful* atau kekanak-kanakan. Fokus pada *Readability* (keterbacaan data) dan *Usability* (kemudahan navigasi).

## 2. Tech Stack & UI Library
- **Framework:** Next.js (App Router)
- **UI Component Library:** PrimeReact (Wajib menggunakan komponen asli PrimeReact seperti DataTable, Dialog, Card, InputText, Dropdown, Button).
- **CSS Utility:** TailwindCSS (untuk tata letak/layouting, margin, padding, dan warna custom yang tidak di-*cover* oleh PrimeReact).
- **Iconography:** PrimeIcons (`pi pi-*`).

## 3. Color Palette & Theming (PrimeReact Lara/Sakai Template Base)
- **Primary Color:** Blue (Terapkan *trust* dan *stability*). Gunakan utility `bg-blue-600` untuk tombol aksi utama, hover `bg-blue-700`.
- **Surface & Background:**
  - Background Utama (Dashboard): `bg-slate-50` atau `#f8fafc` (Memberikan kesan luas dan bersih).
  - Surface Card/Panel: `bg-white` dengan efek shadow yang lembut (`shadow-sm` atau `shadow-md`).
- **Text Colors:**
  - Heading & Primary Text: `text-slate-800`
  - Secondary/Muted Text: `text-slate-500`
- **Semantic Colors (Status):**
  - Success (Disetujui/Aktif): Green (`text-emerald-600`, `bg-emerald-100`)
  - Warning (Menunggu/Pending): Orange/Yellow (`text-amber-600`, `bg-amber-100`)
  - Danger (Ditolak/Retensi): Red (`text-rose-600`, `bg-rose-100`)

## 4. Typography
- **Font Family:** Inter atau Roboto (Bawaan tema modern PrimeReact).
- Terapkan hierarki visual yang jelas:
  - Page Title: `text-2xl font-bold text-slate-800 mb-4`
  - Card Title: `text-xl font-semibold text-slate-800 mb-3`
  - Body Text: `text-sm` atau `text-base` untuk keterbacaan data tabel.

## 5. Layouting & Shape (Bentuk)
- **Border Radius:** Gunakan sudut yang membulat secara elegan, tidak terlalu tajam dan tidak terlalu bulat ekstrim. Standar radius: `rounded-xl` atau `rounded-lg` pada Card dan Dialog.
- **Spacing:** Gunakan spacing yang bernapas (*breathable*). `p-6` untuk padding Card, `gap-4` untuk jarak antar elemen form.

## 6. PrimeReact Component Standards
- **DataTable:** Wajib menggunakan *striped rows*, *hover effects*, dan *paginator*. Header tabel harus memiliki *background* yang sedikit kontras (misal `bg-slate-50`).
- **Form Elements:** Input field harus menggunakan style "Outlined" (bukan filled), dipadukan dengan label melayang (FloatLabel) atau label sejajar yang bersih.
- **Buttons:** Tombol utama menggunakan style `p-button-primary`, tombol sekunder menggunakan `p-button-outlined` atau `p-button-text`. Tombol *icon* wajib di-*rounded* penuh untuk aksi di dalam tabel.

## 7. Component Architecture Pattern (SESUAI README)
- **`page.tsx`**: WAJIB memegang state Formik, API calls, dan *loading states*. Tidak boleh ada elemen UI mentah di sini. Murni memanggil `<TableDisplay />` dan `<FormDisplay />`.
- **`components/display/*`**: Hanya menerima Props. Tidak ada API call di dalam komponen ini. Murni visual PrimeReact.