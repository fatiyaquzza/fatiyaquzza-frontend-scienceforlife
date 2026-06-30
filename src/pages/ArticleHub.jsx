import { Link } from "react-router-dom";
import { BookMarked, FileText, Microscope, Sparkles } from "lucide-react";

const articleThemes = [
  {
    title: "Sains dalam Kehidupan Sehari-hari",
    body: "Artikel kontekstual yang menjelaskan fenomena ilmiah dengan contoh dekat dengan pengguna.",
    Icon: Sparkles,
  },
  {
    title: "Bacaan Berbasis Riset",
    body: "Ringkasan sumber, konsep, dan temuan yang memperkuat materi utama di platform.",
    Icon: Microscope,
  },
  {
    title: "Panduan Belajar Mandiri",
    body: "Artikel pendamping untuk membantu pengguna menyiapkan diri sebelum dan sesudah evaluasi.",
    Icon: BookMarked,
  },
];

const referenceLinks = [
  {
    title: "WHO",
    body: "Rujukan awal untuk topik kesehatan, diet, dan literasi sains kehidupan.",
    href: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
  },
  {
    title: "FAO",
    body: "Rujukan dasar untuk keamanan pangan, aditif, dan konteks sains pangan.",
    href: "https://www.fao.org/food-safety/scientific-advice/jecfa/en/",
  },
  {
    title: "UNESCO",
    body: "Acuan umum untuk sains, pendidikan, dan penguatan arah platform belajar digital.",
    href: "https://www.unesco.org/en/science-technology-innovation/science-education",
  },
  {
    title: "BPOM",
    body: "Sumber resmi Indonesia untuk pengawasan obat, pangan, dan kosmetik.",
    href: "https://www.pom.go.id/",
  },
];

const ArticleHub = () => {
  return (
    <div className="min-h-screen bg-light pt-20 sm:pt-24 pb-12">
      <section className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white px-6 py-10 shadow-xl shadow-slate-200/60 md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
            Artikel ILMANA
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Ruang bacaan pendukung untuk memperkuat dasar akademik materi.
          </h1>
          <p className="mt-4 w-full text-justify text-sm leading-7 text-slate-600 sm:text-base">
            Halaman ini menyiapkan struktur artikel, referensi bacaan, dan konten
            pendukung agar klaim berbasis penelitian lebih terlihat. Kelas artikel
            penuh belum diisi, tetapi arah kurasinya sudah ditetapkan.
          </p>
        </div>
      </section>

      <section className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {articleThemes.map(({ title, body, Icon }) => (
            <article key={title} className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60">
              <Icon className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-3 text-justify text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white px-6 py-8 shadow-lg shadow-slate-200/60 md:px-10">
          <h2 className="text-2xl font-bold text-slate-900">Referensi Awal</h2>
          <p className="mt-3 max-w-3xl text-justify text-sm leading-7 text-slate-600">
            Sambil konten artikel per materi dilengkapi, halaman ini menampung rujukan
            resmi yang bisa dipakai sebagai dasar akademik awal.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {referenceLinks.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 transition hover:border-primary hover:bg-white"
              >
                <p className="text-lg font-bold text-slate-900">{item.title}</p>
                <p className="mt-2 text-justify text-sm leading-6 text-slate-600">{item.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-[#0d4d3a] px-6 py-8 text-white shadow-xl md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-100">
                Tahap Pengembangan
              </div>
              <h2 className="mt-4 text-2xl font-bold">
                Artikel akan dipakai sebagai penguat materi, sumber data, dan bacaan lanjutan.
              </h2>
              <p className="mt-3 text-justify text-sm leading-7 text-green-50/90">
                Untuk saat ini, pengguna diarahkan belajar lewat modul utama sambil
                struktur artikel disiapkan agar konsisten dengan tema manusia, alam,
                dan sains.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-green-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Buka Materi
              </Link>
              <Link
                to="/tentang-ilmana"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Tentang ILMANA
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticleHub;
