# ILMANA

Platform pembelajaran sains berbasis React + Express + MySQL.

## Struktur project

- `Y:\PROJECT\ilmana\frontend` - aplikasi frontend Vite/React
- `Y:\PROJECT\ilmana\backend` - Express API, upload handler, dan admin data

## Menjalankan lokal

### Backend

1. Siapkan `.env` di folder backend:
   - `PORT`
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
   - `GEMINI_API_KEY` bila fitur AI dipakai
2. Install dependency:
   - `cd Y:\PROJECT\ilmana\backend`
   - `npm install`
3. Jalankan server:
   - `npm run dev`

### Frontend

1. Siapkan `.env` frontend bila base URL API memakai variabel.
2. Install dependency:
   - `cd Y:\PROJECT\ilmana\frontend`
   - `npm install`
3. Jalankan:
   - `npm run dev`

## Halaman backend

- Status backend: `/`
- Dokumentasi API: `/docs`
- Health JSON: `/api/health`

## Catatan deploy production

Sebelum deploy backend terbaru, jalankan migrasi ini di database production:

```sql
ALTER TABLE materials
ADD COLUMN references_json JSON NULL AFTER file_url;
```

Tanpa kolom `references_json`, fitur referensi materi akan gagal saat create/update materi.

## Uploads

Folder yang harus tetap ada di server backend:

- `backend/uploads/modules`
- `backend/uploads/materials`
- `backend/uploads/images`

Bug gambar lama yang file fisiknya sudah hilang di VPS tidak bisa dipulihkan dari kode. File lama tetap perlu dipindahkan lagi ke folder `uploads` yang benar atau diunggah ulang.
