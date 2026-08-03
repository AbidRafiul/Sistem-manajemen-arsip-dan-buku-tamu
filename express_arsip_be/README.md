# Backend Environment & Architecture Guide

Dokumen ini menjelaskan **standar wajib** untuk konfigurasi environment backend, arsitektur routing, aturan middleware, keamanan key, serta konvensi database. Seluruh tim **WAJIB** mengikuti dokumen ini untuk menjaga konsistensi, keamanan, dan maintainability aplikasi.

---

## 1. Environment Variables (Backend)

Semua environment variable di bawah **WAJIB diisi**.

### 1.1 Application Configuration

```env
APP_DEBUG=true

APP_PORT=8000
APP_SERVER=http://127.0.0.1
ORIGIN1=http://localhost:3000
```

**Penjelasan:**

| Variable     | Deskripsi                                             |
| ------------ | ----------------------------------------------------- |
| `APP_DEBUG`  | Mode debug aplikasi (`true` hanya untuk development). |
| `APP_PORT`   | Port server backend.                                  |
| `APP_SERVER` | Base URL backend.                                     |
| `ORIGIN1`    | Origin frontend yang diizinkan (CORS).                |

---

## 2. Database Configuration

```env
DB_DBMS=mysql2
DB_HOST=127.0.0.1
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=
DB_PORT=3306
```

### 2.1 Aturan Wajib Database

- Wajib **Timestamp** : CreatedAt, UpdatedAt
- Jika menggunakan **MySQL**, collation **WAJIB**:

```sql
utf8mb4_unicode_ci
```

- **Konvensi penamaan:**
  - Nama table: `snake_case`
  - Nama field/column: `PascalCase`

**Contoh:**

```text
user_profiles
UserName
CreatedAt
UpdatedAt
```

> Pelanggaran standar penamaan akan menyebabkan penolakan code review.

---

## 3. Security & Encryption Key

```env
USER_KEY=random
USER_PAS_KEY=random
USER_SECRET=random
```

### Aturan Keamanan

- Semua key **HARUS random**
- **TIDAK BOLEH hardcoded** di source code
- **HARUS berbeda** untuk setiap environment (dev, staging, prod)
- Key disimpan **hanya** di environment variable

---

## 4. Routing Architecture

### 4.1 Versioned Controller (WAJIB)

Semua routing backend **HARUS menggunakan versioning**.

**Contoh:**

```text
v1/
v2/
```

---

### 4.2 One File = One Endpoint (WAJIB)

Setiap endpoint **HARUS berada dalam satu file sendiri**.

**Contoh struktur:**

```text
v1/
 ├─ auth/
 │   └─ login.js
 │
 ├─ setup/
 │   └─ users/
 │       ├─ user_create.js
 │       ├─ user_update.js
 │       └─ user_delete.js
```

> Dilarang menggabungkan banyak endpoint dalam satu file.

---

### 4.3 Modul Routing (Index per Modul)

Setiap modul **WAJIB** memiliki `index.js` sebagai router utama.

**Contoh: `setup/index.js`**

```js
import express from "express";
const router = express.Router();

import user from "./user_login/user_data.js";
import userCreate from "./user_login/user_create.js";
import userUpdate from "./user_login/user_update.js";
import userDelete from "./user_login/user_delete.js";

import navBase from "./navigation/mst_navigation_data.js";
import navUser from "./navigation/user_navigation_data.js";
import navUserEdit from "./navigation/user_navigation_data_edit.js";
import navUserInsert from "./navigation/user_navigation_insert.js";

// user
router.use("/user-login/user-data", user);
router.use("/user-login/user-create", userCreate);
router.use("/user-login/user-update", userUpdate);
router.use("/user-login/user-delete", userDelete);

// navigation
router.use("/nav/base-data", navBase);
router.use("/nav/user-data", navUser);
router.use("/nav/user-data-edit", navUserEdit);
router.use("/nav/user-data-insert", navUserInsert);

export default router;
```

---

## 5. Main Version Router

File ini berfungsi sebagai **router utama** untuk seluruh modul di dalam satu versi API.

**Contoh: `v1/index.js`**

```js
import express from "express";
const router = express.Router();

import AccessToken from "./auth/token_get.js";
import Login from "./auth/login.js";
import Setup from "./setup/index.js";
import Function from "./components/index.js";

import {
  contextMiddleware,
  validateAccessToken,
  validateSignature,
} from "../../middleware/validate_header.js";

// Auth
router.use("/auth/token", AccessToken);
router.use("/auth/login", [validateAccessToken], Login);

// Setup module
router.use(
  "/setup",
  [validateAccessToken, validateSignature, contextMiddleware],
  Setup,
);

// Function module
router.use(
  "/function",
  [validateAccessToken, validateSignature, contextMiddleware],
  Function,
);

export default router;
```

---

## 6. Middleware Policy (WAJIB)

### 6.1 Middleware Utama

Terdapat **3 middleware inti**:

- `validateAccessToken`
- `validateSignature`
- `contextMiddleware`

### 6.2 Aturan Penggunaan

- **SEMUA route WAJIB** menggunakan ketiga middleware di atas
- **KECUALI** rute-rute berikut (Pengecualian Resmi):
  - `/auth/login`
  - `/auth/token`
  - `/auth/reset-password` (Hanya wajib `validateAccessToken`)
  - `/verifikasi-dokumen` (Tanpa middleware karena ranah publik)

### 6.3 Fungsi Middleware

| Middleware            | Fungsi                         |
| --------------------- | ------------------------------ |
| `validateAccessToken` | Validasi token akses           |
| `validateSignature`   | Validasi signature request     |
| `contextMiddleware`   | Inject context user & aplikasi |

---

## 7. Best Practices (WAJIB DIPATUHI)

- Satu file = satu endpoint
- Semua route harus versioned
- Semua route non-auth **WAJIB** memakai middleware
- Field database `PascalCase`
- Table database `snake_case`
- MySQL collation `utf8mb4_unicode_ci`

---

## 8. Standard Penamaan Variable & Function (WAJIB)

Standar ini **WAJIB digunakan di seluruh backend** untuk menjaga konsistensi, keterbacaan, dan kemudahan debugging.

---

### 8.1 Variable dari FE / Payload

- **Nama variable dari request body / payload HARUS sama persis dengan field di database**
- Format penamaan: **PascalCase**

**Contoh:**

```js
// Payload dari FE
{
  nama_lengkap: "John Doe",
  Username: "johnd",
  Telp: "08123456789",
  Status: "active"
}
```

```js
// Database field
nama_lengkap;
Username;
Telp;
Status;
```

> Dilarang mengubah payload menjadi `camelCase` atau `snake_case`.

---

### 8.2 Standard Prefix Variable Lokal

Setiap variable **WAJIB menggunakan prefix sesuai tipe data**:

| Tipe Data     | Prefix | Contoh                         |
| ------------- | ------ | ------------------------------ |
| Object        | `o`    | `oPayload`, `oData`, `oResult` |
| Array         | `va`   | `vaUsers`, `vaData`            |
| Number        | `n`    | `nTotal`, `nIndex`             |
| String / Char | `c`    | `cUniqueId`, `cRole`           |
| Boolean       | `b`    | `bIsValid`, `bExists`          |
| Date / Time   | `d`    | `dNow`, `dExpired`             |

**Contoh penggunaan benar:**

```js
const oPayload = req.body;
const cUsername = oPayload.Username;
const bIsActive = oPayload.Status === "active";
```

---

### 8.3 Function Standard

- Semua function **WAJIB**:
  - Menggunakan **camelCase**
  - Menggunakan **arrow function**

**Contoh benar:**

```js
const createUser = async (req, res) => {
  // logic
};
```

**Contoh salah:**

```js
function Create_User() {}
function createuser() {}
```

---

### 8.4 Penamaan Router & Endpoint

- File endpoint: `snake_case.js`
- Nama function internal: `camelCase`

**Contoh:**

```text
user_create.js
```

```js
const createUser = async () => {};
```

---

### 8.5 Logging & Error Handling

- Variable log mengikuti standar prefix
- Payload log **TIDAK BOLEH dimodifikasi**

**Contoh:**

```js
Logging(error, {
  file: "user_create.js",
  func: "createUser",
  request: oPayload,
  response: oResult,
  user: cUsername,
});
```

---

> Usahakan mengikuti contoh function dan file yang sudah ada pada standart.

---

## 9. Setup & First Run (WAJIB)

Panduan ini menjelaskan langkah **setup awal backend** dari kondisi fresh clone.

---

### 9.1 Install Dependency

Jalankan perintah berikut di root project:

```bash
npm install
```

---

### 9.2 Setup Database Essential

1. Pastikan database sudah dibuat sesuai `.env`
2. Jalankan file SQL essential:

```sql
essential.sql
```

> File ini berisi struktur dasar table yang **WAJIB ada** sebelum backend dijalankan.

---

### 9.3 Seed Data Superadmin

Setelah database siap, jalankan seed awal:

```bash
npx knex seed:run --specific=superadmin.js
```

Seed ini akan:

- Membuat user **superadmin**
- Mengisi data credential awal
- Menyiapkan akses awal ke sistem

---

### 9.4 Menjalankan Aplikasi

#### Development Mode (Debug)

```bash
npm run dev
```

- Mengaktifkan **debug mode**
- Digunakan untuk local development

#### Production Mode

```bash
node server.js
```

- Digunakan untuk server production
- Pastikan `APP_DEBUG=false`

---

> **Jangan pernah menjalankan `npm run dev` di production**

---
