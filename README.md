# ILMANA Frontend

SPA React untuk platform pembelajaran sains interaktif ILMANA (Ilmu Manusia dan Alam).

---

## Tech Stack

| Teknologi | Keterangan |
|---|---|
| **React 18** | Framework UI |
| **Vite 5** | Bundler & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **React Router 6** | Routing |
| **Axios** | HTTP client dengan JWT interceptor |
| **TipTap (ProseMirror)** | Rich text editor (admin) |
| **Lucide React** | Icons |
| **DOMPurify** | Sanitasi HTML |

---

## Prasyarat

- Node.js 18+
- npm
- Backend ILMANA harus berjalan (port 5000)

## Instalasi & Menjalankan

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Konfigurasi environment
# Buat file .env (jika belum ada):
VITE_API_URL=http://localhost:5000/api

# 4. Jalankan dev server (port 3000)
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

### Variabel Environment

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `VITE_API_URL` | Tidak | `http://localhost:5000/api` | Base URL backend API |

> Dev server Vite berjalan di port **3000** dengan proxy `/api` → `http://localhost:5000`. Di production, proxy dikelola oleh Nginx/Apache, bukan Vite.

---

## Struktur Folder

```
frontend/
├── index.html                  # Entry point HTML (lang="id")
├── vite.config.js              # Konfigurasi Vite (port 3000, proxy /api)
├── tailwind.config.js          # Tema kustom (primary: #0F5132)
├── postcss.config.js
├── public/
│   ├── .htaccess               # SPA fallback untuk Apache
│   └── logo.png
└── src/
    ├── main.jsx                # ReactDOM.createRoot
    ├── index.css               # Tailwind directives, TipTap styles, animations
    ├── App.jsx                 # Router + AuthProvider + LineSpacingProvider
    │
    ├── components/             # Komponen shared
    │   ├── Navbar.jsx          # Navbar responsif (auth-aware, sembunyi di admin)
    │   ├── Footer.jsx          # Footer publik (4 kolom)
    │   ├── AdminSidebar.jsx    # Sidebar navigasi admin
    │   ├── ProtectedRoute.jsx  # Guard: redirect ke /login jika belum login
    │   ├── AdminRoute.jsx      # Guard: redirect ke /dashboard jika bukan admin
    │   ├── RichTextEditor.jsx  # TipTap editor (full toolbar)
    │   ├── ChatAI.jsx          # Widget chat AI untuk sub-module
    │   ├── HtmlContent.jsx     # Render HTML dengan DOMPurify
    │   ├── LoadingStates.jsx   # Skeletons (PageLoader, ModuleGridSkeleton, dll)
    │   ├── ScrollToTop.jsx     # Reset scroll on route change
    │   ├── LineSpacingSelect.jsx
    │   └── tiptap/
    │       └── ResizableImage.js  # Ekstensi TipTap: image resize + alignment
    │
    ├── context/
    │   ├── AuthContext.jsx          # State auth global (user, token, login/logout)
    │   └── LineSpacingContext.jsx   # Preferensi spasi baris (localStorage)
    │
    ├── hooks/
    │   └── useInView.js        # IntersectionObserver untuk scroll animations
    │
    ├── pages/                  # Halaman aplikasi
    │   ├── LandingPage.jsx     # Beranda (hero, modul, FAQ, kontak form)
    │   ├── AboutIlmana.jsx     # Visi, misi, tim, alur belajar
    │   ├── ArticleHub.jsx      # Artikel & referensi eksternal
    │   ├── ClassOverview.jsx   # Penjelasan struktur kelas
    │   ├── Login.jsx           # Form login
    │   ├── Register.jsx        # Form registrasi
    │   ├── Dashboard.jsx       # Grid modul dengan filter, sort, search
    │   ├── ModuleDetail.jsx    # Detail modul + sub-modules + progress
    │   ├── Pretest.jsx         # Quiz pretest
    │   ├── Material.jsx        # Konten materi (HTML, video, referensi)
    │   ├── Postest.jsx         # Quiz postest
    │   ├── Result.jsx          # Skor, passing status, AI chat
    │   └── admin/
    │       ├── layout/
    │       │   └── AdminLayout.jsx  # Shell admin: sidebar + Outlet
    │       ├── AdminDashboard.jsx   # Statistik + manajemen feedback
    │       ├── ModuleManagement.jsx
    │       ├── SubModuleManagement.jsx
    │       ├── MaterialManagement.jsx
    │       ├── QuestionManagement.jsx
    │       └── UserManagement.jsx
    │
    └── utils/
        ├── api.js              # Axios instance + interceptor JWT
        └── contentHtml.js      # Sanitasi HTML + asset URL helpers
```

---

## Halaman / Routes

### Publik (tanpa login)

| Path | Halaman | Deskripsi |
|---|---|---|
| `/` | LandingPage | Beranda: hero, modul unggulan, FAQ, form kontak |
| `/tentang-ilmana` | AboutIlmana | Visi, misi, alur belajar, tim |
| `/artikel` | ArticleHub | Artikel & referensi eksternal (WHO, FAO, dll) |
| `/kelas` | ClassOverview | Penjelasan struktur kelas/alur belajar |
| `/login` | Login | Form login dengan redirect berbasis role |
| `/register` | Register | Form registrasi (nama, email, password, pekerjaan, alamat) |

### User (perlu login)

| Path | Halaman | Deskripsi |
|---|---|---|
| `/dashboard` | Dashboard | Grid modul dengan filter kategori, sortir, dan pencarian |
| `/module/:id` | ModuleDetail | Detail modul, daftar sub-module, status progress |
| `/pretest/:id` | Pretest | Quiz pilihan ganda untuk mengukur pemahaman awal |
| `/material/:id` | Material | Konten materi pembelajaran (HTML, video YouTube, PDF, referensi) |
| `/postest/:id` | Postest | Quiz pilihan ganda untuk evaluasi akhir |
| `/result/:id` | Result | Skor postest, status lulus/gagal, AI chat |

### Admin (role admin)

| Path | Halaman | Deskripsi |
|---|---|---|
| `/admin/dashboard` | AdminDashboard | Kartu statistik + tabel manajemen feedback |
| `/admin/modules` | ModuleManagement | CRUD module (dengan upload gambar) |
| `/admin/submodules` | SubModuleManagement | CRUD sub-module |
| `/admin/materials` | MaterialManagement | CRUD materi dengan TipTap rich text editor |
| `/admin/questions` | QuestionManagement | CRUD soal pretest/postest (pilihan ganda) |
| `/admin/users` | UserManagement | Daftar user, edit, hapus, export CSV progress |

---

## Arsitektur

### Routing & Guards

- **BrowserRouter** — wrapping seluruh aplikasi di `App.jsx`
- **ProtectedRoute** — membaca `user` dari `AuthContext`:
  - `loading` → tampilkan skeleton
  - tidak ada `user` → redirect ke `/login`
  - ada `user` → render children
- **AdminRoute** — extends ProtectedRoute, tambahan cek `role === 'admin'`, redirect ke `/dashboard` jika bukan admin

### State Management

- **AuthContext** — state global: `user`, `token`, `login()`, `register()`, `logout()`, `loading`, `isAdmin`
- **LineSpacingContext** — preferensi spasi baris, persist ke `localStorage`
- State data lainnya — `useState` + `useEffect` lokal per halaman (tidak ada global state library)

### API Layer

**File:** `src/utils/api.js`

- Instance Axios dengan `baseURL` dari `VITE_API_URL`
- **Request interceptor:** sisipkan `Authorization: Bearer <token>` dari `localStorage`
- **Response interceptor:** pada response 401, hapus token + redirect ke `/login`

### Alur Auth

```
Register/Login → POST /auth/register atau /auth/login
              → JWT disimpan di localStorage
              → Interceptor Axios sisipkan token
              → Backend verifikasi
```
- **Session recovery:** saat halaman di-reload, `AuthContext` membaca token dari `localStorage` → `GET /auth/me` untuk validasi

### Styling

- **Tailwind CSS** utility-first, mobile-first
- **Tema kustom:**
  - `primary`: `#0F5132` (hijau gelap)
  - `secondary`: `#2ECC71` (hijau terang)
  - `dark`: `#2F3E34`
  - `light`: `#EAF7F1`
  - Font: **Poppins** (Google Fonts)
- **Animasi:** CSS keyframes (fade-in, translate) + `useInView` hook untuk scroll reveal

### Rich Text Editor

TipTap (ProseMirror) di halaman admin dengan fitur:
- Formatting: bold, italic, underline, heading, blockquote
- List: bullet, ordered
- Alignment: left, center, right, justify
- Table: insert, edit
- Image: upload via `/api/upload-image`, resize + alignment
- Subscript / superscript
- Placeholder

---

## Catatan Deploy

- **Proxy API** — dev server Vite sudah handle proxy `/api` → `http://localhost:5000`. Untuk production, gunakan Nginx/Apache reverse proxy.
- **SPA fallback** — file `public/.htaccess` sudah disediakan untuk Apache server.
- **Backend harus berjalan** — frontend tidak bisa berfungsi tanpa backend API.
