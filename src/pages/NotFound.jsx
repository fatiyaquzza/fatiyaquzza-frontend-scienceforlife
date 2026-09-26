import { Link, useLocation } from "react-router-dom";
import { Home, ArrowLeft, BookOpen, LogIn } from "lucide-react";

// Tanpa route wildcard, React Router merender <main> yang kosong: Navbar dan
// Footer tampil tapi tidak ada konten sama sekali, jadi orang yang salah ketik
// URL mengira situsnya rusak. Halaman ini supaya jawabannya jelas dan ada jalan
// keluar yang berguna, bukan sekadar angka 404.
const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-light px-4 py-20 pt-24">
      <div className="w-full max-w-lg text-center">
        <p className="text-6xl font-black text-primary sm:text-7xl">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          Halaman ini tidak ditemukan
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Alamat yang Anda buka tidak ada di ILMANA. Mungkin ada salah ketik, atau
          tautannya sudah berubah.
        </p>

        <p className="mt-4 inline-block max-w-full break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-slate-500 shadow-sm">
          {pathname}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-opacity-90 sm:w-auto"
          >
            <Home size={18} />
            Ke beranda
          </Link>
          <Link
            to="/kelas"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary px-5 py-2.5 font-semibold text-primary transition hover:bg-white sm:w-auto"
          >
            <BookOpen size={18} />
            Lihat kelas
          </Link>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <LogIn size={16} />
            Sudah punya akun? Masuk
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1 hover:text-primary hover:underline"
            >
              <ArrowLeft size={14} />
              Kembali ke halaman sebelumnya
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
