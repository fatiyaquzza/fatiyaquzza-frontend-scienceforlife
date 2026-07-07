import { Link } from "react-router-dom";
import { BookOpenCheck, Compass, Leaf, Microscope, Users } from "lucide-react";

const pillars = [
  {
    title: "Visi",
    body: "Menjadikan sains lebih dekat, kontekstual, dan bermakna bagi kehidupan manusia dan alam.",
    Icon: Compass,
  },
  {
    title: "Misi",
    body: "Menyediakan pembelajaran digital yang menghubungkan konsep ilmiah, pengalaman sehari-hari, dan evaluasi belajar yang terukur.",
    Icon: Leaf,
  },
  {
    title: "Dasar Pengembangan",
    body: "ILMANA dibangun sebagai ruang belajar berbasis riset yang menekankan literasi sains, relevansi konteks, dan struktur belajar yang jelas.",
    Icon: Microscope,
  },
];

const audiences = [
  "Peserta didik yang membutuhkan materi sains yang lebih kontekstual.",
  "Guru atau fasilitator yang ingin memakai alur pretest, materi, dan postest.",
  "Pengguna umum yang ingin memahami hubungan manusia, alam, dan sains.",
];

const learningFlow = [
  "Mulai dari pretest untuk memetakan pemahaman awal.",
  "Pelajari materi utama dalam format teks, visual, video, dan dokumen pendukung.",
  "Lanjut ke postest untuk mengukur capaian belajar.",
  "Gunakan hasil evaluasi dan AI tutor sebagai ruang refleksi lanjutan.",
];

const contextVisuals = [
  {
    title: "Eksperimen dan pengamatan",
    body: "Visual kontekstual membantu pengguna menghubungkan konsep ilmiah dengan situasi nyata.",
    image: "/images/about-community.jpg",
  },
  {
    title: "Manusia, alam, dan kesehatan",
    body: "Tema ILMANA diarahkan agar sains terasa dekat dengan tubuh, lingkungan, dan kebiasaan sehari-hari.",
    image: "/images/about-learning.jpg",
  },
];

const AboutIlmana = () => {
  return (
    <div className="min-h-screen bg-light pt-20 sm:pt-24 pb-12">
      <section className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-[#0d4d3a] text-white shadow-2xl">
          <div className="grid gap-10 px-6 py-10 md:grid-cols-[1.2fr,0.8fr] md:px-10 md:py-14">
            <div>
              <p className="mb-3 text-sm font-semibold tracking-[0.2em] uppercase text-green-200">
                Tentang ILMANA
              </p>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
                Platform pembelajaran sains kontekstual yang dirancang untuk alur belajar yang utuh.
              </h1>
              <p className="mt-5 max-w-2xl text-justify text-base leading-7 text-green-50/90 sm:text-lg">
                ILMANA menempatkan sains sebagai pengalaman belajar yang terhubung
                dengan kehidupan, lingkungan, dan nilai kemanusiaan. Platform ini
                memadukan materi, evaluasi, dan refleksi agar proses belajar lebih
                terarah.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                <Users className="mb-3 h-7 w-7 text-green-200" />
                <p className="text-sm font-semibold uppercase tracking-wide text-green-200">
                  Target Pengguna
                </p>
                <p className="mt-2 text-justify text-sm leading-6 text-green-50/90">
                  Peserta didik, guru, dan pembelajar umum yang membutuhkan materi sains yang relevan dengan kehidupan sehari-hari.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                <BookOpenCheck className="mb-3 h-7 w-7 text-green-200" />
                <p className="text-sm font-semibold uppercase tracking-wide text-green-200">
                  Posisi Platform
                </p>
                <p className="mt-2 text-justify text-sm leading-6 text-green-50/90">
                  ILMANA diarahkan sebagai platform belajar digital bergaya MOOC dengan alur pembelajaran, evaluasi, dan pendampingan belajar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {pillars.map(({ title, body, Icon }) => (
            <article key={title} className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60">
              <Icon className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-3 text-justify text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60">
            <h2 className="text-2xl font-bold text-slate-900">Siapa yang Dilayani</h2>
            <div className="mt-5 space-y-3">
              {audiences.map((item) => (
                <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-justify text-sm leading-6 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60">
            <h2 className="text-2xl font-bold text-slate-900">Alur Belajar ILMANA</h2>
            <div className="mt-5 space-y-3">
              {learningFlow.map((item, index) => (
                <div key={item} className="flex gap-4 rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-justify text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {contextVisuals.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-slate-200/60"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
                <p className="mt-3 text-justify text-sm leading-7 text-slate-600">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white px-6 py-8 shadow-lg shadow-slate-200/60 md:px-10">
          <h2 className="text-2xl font-bold text-slate-900">Arah Pengembangan Konten</h2>
          <p className="mt-4 w-full text-justify text-sm leading-7 text-slate-600">
            Setiap materi ILMANA diarahkan memiliki pengantar, tujuan belajar,
            konten utama, multimedia pendukung, evaluasi, dan refleksi. Revisi
            berikutnya akan memperkuat referensi ilmiah, artikel pendukung, dan
            pengalaman kelas digital berbasis modul.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0c452a]"
            >
              Lihat Materi
            </Link>
            <Link
              to="/kelas"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Lihat Panduan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutIlmana;
