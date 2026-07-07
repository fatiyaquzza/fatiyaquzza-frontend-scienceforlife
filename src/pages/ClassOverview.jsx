import { Link } from "react-router-dom";
import {
  BookOpenCheck,
  BrainCircuit,
  ClipboardCheck,
  HelpCircle,
  LayoutDashboard,
  MessageCircle,
  PlayCircle,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const guideSteps = [
  {
    title: "Daftar atau login",
    body: "Buat akun dengan nama, pekerjaan, alamat, email, dan password. Jika sudah punya akun, langsung masuk melalui halaman login.",
    Icon: UserPlus,
  },
  {
    title: "Buka dashboard materi",
    body: "Setelah masuk, pilih modul pembelajaran yang ingin dipelajari. Gunakan pencarian jika modul sudah banyak.",
    Icon: LayoutDashboard,
  },
  {
    title: "Kerjakan pretest",
    body: "Pretest membantu memetakan pemahaman awal sebelum membaca materi utama pada sub modul.",
    Icon: ClipboardCheck,
  },
  {
    title: "Pelajari materi",
    body: "Baca penjelasan, lihat gambar atau tabel, tonton video, buka PDF, dan gunakan referensi pendukung bila tersedia.",
    Icon: PlayCircle,
  },
  {
    title: "Selesaikan postest",
    body: "Postest dipakai untuk mengukur capaian belajar. Hasilnya akan dibandingkan dengan nilai kelulusan sub modul.",
    Icon: BookOpenCheck,
  },
  {
    title: "Gunakan AI Tutor",
    body: "Jika masih ada bagian yang belum dipahami, gunakan AI Tutor pada halaman hasil untuk bertanya kembali tentang materi.",
    Icon: BrainCircuit,
  },
];

const helpItems = [
  "Jika belum bisa masuk, pastikan email dan password sudah benar.",
  "Jika materi belum tampil, kembali ke daftar sub modul lalu buka ulang materi.",
  "Jika nilai belum sesuai, baca ulang materi dan kerjakan evaluasi berikutnya dengan teliti.",
  "Jika ada kendala teknis, kirim pesan melalui form kontak di beranda.",
];

const ClassOverview = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-light pt-20 sm:pt-24 pb-12">
      <section className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white px-6 py-10 shadow-xl shadow-slate-200/60 md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
            Panduan Penggunaan
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Cara menggunakan ILMANA dari awal sampai selesai.
          </h1>
          <p className="mt-4 max-w-4xl text-left text-sm leading-7 text-slate-600 sm:text-justify sm:text-base">
            Halaman ini disiapkan agar pengguna baru dapat memahami alur sistem
            tanpa perlu menebak. Ikuti langkahnya berurutan: masuk akun, pilih
            modul, kerjakan pretest, pelajari materi, kerjakan postest, lalu
            gunakan hasil belajar sebagai bahan refleksi.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0C452A]"
            >
              {user ? "Buka Dashboard" : "Daftar Sekarang"}
            </Link>
            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-green-50"
              >
                Saya Sudah Punya Akun
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {guideSteps.map(({ title, body, Icon }, index) => (
            <article
              key={title}
              className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-light text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </div>
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-3 text-left text-sm leading-7 text-slate-600 sm:text-justify">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1fr,0.85fr]">
          <div className="rounded-[2rem] bg-[#123b2f] px-6 py-8 text-white shadow-xl md:px-10">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-7 w-7 text-green-200" />
              <h2 className="text-2xl font-bold">Jika bingung saat memakai sistem</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {helpItems.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm leading-7 text-green-50"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white px-6 py-8 shadow-xl shadow-slate-200/60 md:px-10">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-7 w-7 text-primary" />
              <h2 className="text-2xl font-bold text-slate-900">Butuh bantuan?</h2>
            </div>
            <p className="mt-4 text-left text-sm leading-7 text-slate-600 sm:text-justify">
              Gunakan form kontak di beranda untuk mengirim kendala, masukan,
              atau pertanyaan. Jelaskan halaman yang sedang dibuka dan masalah
              yang terjadi agar tim dapat membantu dengan lebih cepat.
            </p>
            <a
              href="/#kontak"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClassOverview;
