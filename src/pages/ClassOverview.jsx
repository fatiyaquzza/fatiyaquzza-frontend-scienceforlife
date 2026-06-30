import { Link } from "react-router-dom";
import { BookOpenCheck, BrainCircuit, ClipboardCheck, PlayCircle } from "lucide-react";

const classSteps = [
  {
    title: "Orientasi dan Pretest",
    body: "Pengguna memulai dengan pretest untuk memetakan pengetahuan awal sebelum masuk ke materi utama.",
    Icon: ClipboardCheck,
  },
  {
    title: "Eksplorasi Materi",
    body: "Materi disajikan dalam format teks, gambar, video, dan dokumen pendukung agar fleksibel di berbagai perangkat.",
    Icon: PlayCircle,
  },
  {
    title: "Evaluasi Postest",
    body: "Postest dipakai untuk mengukur capaian belajar pada setiap sub modul atau materi.",
    Icon: BookOpenCheck,
  },
  {
    title: "Refleksi dengan AI Tutor",
    body: "Pengguna dapat melanjutkan diskusi dan refleksi belajar setelah evaluasi melalui pendamping AI.",
    Icon: BrainCircuit,
  },
];

const ClassOverview = () => {
  return (
    <div className="min-h-screen bg-light pt-20 sm:pt-24 pb-12">
      <section className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white px-6 py-10 shadow-xl shadow-slate-200/60 md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
            Struktur Kelas
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            ILMANA memakai alur belajar yang sederhana, terukur, dan mudah diikuti.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Halaman ini menjelaskan bentuk kelas digital di ILMANA. Saat ini kelas
            diwujudkan melalui rangkaian modul dan sub modul, lalu diperkuat oleh
            materi, evaluasi, dan tindak lanjut belajar.
          </p>
        </div>
      </section>

      <section className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {classSteps.map(({ title, body, Icon }, index) => (
            <article key={title} className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-light text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </div>
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-[#123b2f] px-6 py-8 text-white shadow-xl md:px-10">
          <h2 className="text-2xl font-bold">Masuk ke kelas yang tersedia sekarang</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-green-50/90">
            Implementasi saat ini berpusat pada pembelajaran berbasis modul.
            Penguatan kelas lanjutan seperti artikel, aktivitas tambahan, dan
            referensi terkurasi akan mengikuti struktur ini.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-green-50"
            >
              Buka Dashboard Materi
            </Link>
            <Link
              to="/artikel"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Lihat Arah Artikel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClassOverview;
