# Frontend Environment & Project Convention Guide

Dokumen ini menjelaskan **konfigurasi environment frontend (.env)**, standar keamanan key, serta **konvensi struktur project Next.js (App Router)** yang **WAJIB diikuti** oleh seluruh tim.

Dokumen ini dibuat berdasarkan **struktur project aktual** yang digunakan saat ini.

---

## 1. Environment Variables (Frontend)

Semua environment variable di bawah **WAJIB diisi**, **TIDAK BOLEH kosong**, dan **HARUS menggunakan nilai random yang kuat** untuk key/secret.

---

## 2. Authentication & Security

```env
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000/

NEXTAUTH_SECRET=random
TOKEN_SECRET=random

USER_KEY=random
USER_PAS_KEY=random
USER_SECRET=random
```

### Penjelasan

| Variable          | Fungsi                                                |
| ----------------- | ----------------------------------------------------- |
| `NEXTAUTH_SECRET` | Digunakan oleh NextAuth untuk signing session & token |
| `TOKEN_SECRET`    | Digunakan untuk enkripsi dan validasi token aplikasi  |
| `USER_KEY`        | Key tambahan untuk proses keamanan user               |
| `USER_PAS_KEY`    | Key untuk proteksi password / payload                 |
| `USER_SECRET`     | Secret utama untuk enkripsi data sensitif             |

### Aturan Keamanan (WAJIB)

* ❌ Tidak boleh hardcoded di source code
* ✅ Harus random & kuat
* ✅ Harus berbeda untuk setiap environment:

  * development
  * staging
  * production

---

## 3. API & Networking

```env
API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_URL_API=http://localhost:8000/api/v1

ALLOWED_ORIGIN=http://127.0.0.1:3000
```

### Penjelasan

| Variable              | Fungsi                                         |
| --------------------- | ---------------------------------------------- |
| `API_URL`             | Endpoint backend utama (server-side)           |
| `NEXT_PUBLIC_URL_API` | Endpoint API yang dapat diakses di client-side |
| `ALLOWED_ORIGIN`      | Origin yang diizinkan untuk CORS               |

---

## 4. API Interceptor Path

```env
NEXT_PUBLIC_API_DIR_PATH=/api/interceptor
NEXT_PUBLIC_API_DIR_FORMDATA_PATH=/api/interceptor_formdata
NEXT_PUBLIC_API_DIR_DOWNLOAD_PATH=/api/interceptor_download
```

### Digunakan untuk

* Interceptor request standar
* Upload `FormData`
* Download file

> Semua request API **WAJIB** melalui interceptor ini.

---

## 5. Public Asset

```env
PUBLIC_ASSET_ORG=http://127.0.0.1:8000
```

Digunakan untuk mengakses **asset publik dari backend** seperti:

* Gambar
* File download
* Dokumen publik

---

## 6. Project Structure Convention (WAJIB)

Frontend menggunakan **Next.js App Router**.

---

## 6.1 Routing & Page Naming

### Aturan

* Semua routing page **WAJIB menggunakan underscore (_)**
* Huruf **lowercase semua**

### Contoh Benar

```text
user_profile
reset_password
order_detail
```

### Contoh Salah (DILARANG)

```text
user-profile
UserProfile
```

---

## 6.2 Struktur Project Aktual

Struktur berikut adalah **standar yang digunakan saat ini dan WAJIB dipertahankan**:

```text
app/
 ├─ (full-page)/
 │
 ├─ (main)/
 │   ├─ assets/
 │   ├─ dashboard/
 │   ├─ setup/
 │   │   ├─ config/
 │   │   └─ users/
 │   │       ├─ components/
 │   │       │   └─ display/
 │   │       │       ├─ form.tsx
 │   │       │       ├─ menuDisplay.tsx
 │   │       │       ├─ navbar.tsx
 │   │       │       ├─ print.tsx
 │   │       │       └─ table.tsx
 │   │       ├─ endpoints.ts
 │   │       ├─ interfaces.ts
 │   │       ├─ page.tsx
 │   │       └─ layout.tsx
 │
 ├─ api/
 ├─ components/
 ├─ favicon.ico
 ├─ layout.tsx
 └─ not-found.tsx
```

---

## 6.3 Penjelasan Folder Penting

### `(main)`

* Layout utama aplikasi
* Halaman yang membutuhkan autentikasi

### `(full-page)`

* Halaman full screen
* Contoh: login, error page, landing page

### `setup/users`

* Modul user management
* Semua logic UI user berada di dalam folder ini

### `components/display`

* Komponen tampilan (UI only)
* ❌ Tidak boleh berisi logic API langsung

### `endpoints.ts`

* Berisi definisi endpoint API
* Digunakan ulang oleh service / hook

### `interfaces.ts`

* Interface khusus modul
* Untuk global interface gunakan `/types`

---

## 7. Global Types & Interface

Untuk interface atau type yang digunakan lintas modul:

```text
/types
```

### Aturan

* Tidak boleh mendefinisikan ulang interface yang sama
* Wajib import dari `/types`
* Menjaga konsistensi struktur data FE ↔ BE

---

## 8. Best Practices (WAJIB)

* ✅ Semua routing pakai underscore `_`
* ✅ Struktur folder konsisten per modul
* ✅ Komponen UI dipisah dari logic
* ✅ Endpoint & interface terpisah
* ✅ Tidak ada hardcoded secret

---

## 9. Alur Arsitektur Page & Display Component (WAJIB)

Section ini menjelaskan **alur kerja standar Frontend** yang **WAJIB digunakan di seluruh modul**.

---

## 9.1 Peran `page.tsx` (Parent Controller)

`page.tsx` **BERPERAN SEBAGAI CONTROLLER / PARENT**, bukan sekadar UI.

### Tanggung Jawab `page.tsx`

* Menyimpan **state global modul**
* Mengelola **session (NextAuth)**
* Inisialisasi & konfigurasi **Formik**
* Menyediakan **fungsi global** (API call, handler)
* Mengatur alur data ke komponen display

### Contoh State Global

```ts
const [state, setState] = useState<State>({
  load: false,
  data: [],
  add: false,
  edit: false,
  delete: false,
  selectedUsers: [],
  searchVal: '',
  filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
  session: null,
  submittedData: null,
  imgPrev: null,
});
```

---

## 9.2 Data Fetching & Logic di `page.tsx`

Semua logic berikut **WAJIB berada di `page.tsx`**:

* API request (`getData`, dll)
* Loading state
* Session binding

### Contoh Fungsi Global

```ts
const getData = async (apiEndpoint: string) => {
  setState(p => ({ ...p, load: true }));
  try {
    const res = await postData(apiEndpoint, { /* payload */ });
    formik.setValues(res.data.data || {});
  } catch (error: any) {
    showError(toast, error?.message);
  } finally {
    setState(p => ({ ...p, load: false }));
  }
};
```

---

## 9.3 Peran `components/display/*` (UI)

Folder `components/display` **HANYA BERISI KOMPONEN UI**.

### Props Wajib Diterima Display

```ts
<Form
  formik={formik}
  state={state}
  setState={setState}
  toast={toast}
  getData={getData}
/>
```

---

## 9.4 Alur Data (Flow)

```text
page.tsx
 ├─ state / setState
 ├─ session (NextAuth)
 ├─ formik
 ├─ getData / submit handler
 │
 ▼
components/display/*
 ├─ Form
 ├─ Table
 ├─ Navbar
 └─ Print
```

### Prinsip Utama

> **Logic naik ke atas (page.tsx)**
> **UI turun ke bawah (display)**

---
