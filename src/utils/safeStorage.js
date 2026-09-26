// localStorage bisa melempar exception, bukan hanya mengembalikan null.
// Penyebabnya: mode privat di beberapa browser, iframe lintas origin yang tidak
// punya storage, atau kebijakan storage yang memblokir akses. Exception di sini
// membuat interceptor axios dan provider auth ikut gagal, dan karena keduanya
// berjalan paling awal, seluruh aplikasi jadi layar putih.
//
// Jadi semua akses penyimpanan di frontend wajib lewat helper ini: nilai yang
// tidak bisa dibaca diperlakukan sebagai "tidak ada", dan penulisan yang gagal
// hanya berarti sesi tidak bisa diingat, bukan bahwa aplikasi harus tumbang.

export const readStore = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStore = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    // Kuota penuh atau storage dinonaktifkan: amnesia sesi lebih baik daripada crash.
    return false;
  }
};

export const removeStore = (key) => {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

// JSON rusak tidak ikut dihapus supaya pemanggil tetap bisa membedakan
// "cache tidak terbaca" dari "tidak ada cache", dan bisa memulihkan sesi dari
// server selama tokennya masih valid.
export const readJsonStore = (key) => {
  const raw = readStore(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
