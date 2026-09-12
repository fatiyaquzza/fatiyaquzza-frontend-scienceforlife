import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const siteUrl = "https://ilmanainitiative.com";
const defaultDescription = "ILMANA adalah platform pembelajaran sains kontekstual berbasis penelitian yang menghubungkan ilmu manusia dan alam untuk generasi muda.";
const publicPages = {
  "/": { title: "ILMANA – Ilmu Manusia dan Alam", description: defaultDescription },
  "/tentang-ilmana": { title: "Tentang ILMANA – Ilmu Manusia dan Alam", description: "Kenali visi, arah pembelajaran, dan peran ILMANA dalam menghadirkan sains yang kontekstual." },
  "/kelas": { title: "Kelas ILMANA – Panduan Pembelajaran", description: "Pelajari alur kelas ILMANA, dari memilih modul hingga menyelesaikan evaluasi pembelajaran." },
  "/artikel": { title: "Artikel ILMANA – Ilmu Manusia dan Alam", description: "Jelajahi bacaan pendukung dan penguatan dasar akademik dari ILMANA." },
};
const faqs = [["Apa itu ILMANA?", "ILMANA (Ilmu Manusia dan Alam) adalah platform pembelajaran interaktif yang membawa ilmu pengetahuan ke kehidupan sehari-hari. Kami menyediakan materi pembelajaran yang menarik dan mudah dipahami."], ["Bagaimana cara mendaftar?", "Klik tombol 'Mulai Belajar Sekarang' di halaman utama, lalu isi formulir pendaftaran dengan data diri Anda. Setelah mendaftar, Anda dapat langsung mengakses semua modul pembelajaran."], ["Apakah ada biaya untuk menggunakan platform ini?", "Platform ini sepenuhnya gratis dan dapat digunakan tanpa dipungut biaya. Semua pengguna dapat mengakses fitur dan materi pembelajaran yang tersedia."], ["Berapa lama akses modul pembelajaran?", "Akses ke modul pembelajaran bersifat tanpa batas selama Anda masih terdaftar sebagai pengguna aktif di platform kami."]];

const setMeta = (selector, attribute, content) => {
  const value = selector.match(/['\"]([^'\"]+)/)?.[1];
  let element = document.head.querySelector(selector);
  if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, value); document.head.appendChild(element); }
  element.setAttribute("content", content);
};

export default function SeoMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = publicPages[pathname];
    const title = page?.title || "ILMANA – Ilmu Manusia dan Alam";
    const description = page?.description || defaultDescription;
    const url = `${siteUrl}${pathname === "/" ? "/" : pathname}`;
    document.title = title;
    setMeta('meta[name="description"]', "name", description);
    setMeta('meta[name="robots"]', "name", page ? "index,follow" : "noindex,nofollow");
    [["og:type", "website"], ["og:title", title], ["og:description", description], ["og:url", url], ["og:image", `${siteUrl}/logo-512.png`]].forEach(([name, value]) => setMeta(`meta[property="${name}"]`, "property", value));
    [["twitter:card", "summary_large_image"], ["twitter:title", title], ["twitter:description", description], ["twitter:image", `${siteUrl}/logo-512.png`]].forEach(([name, value]) => setMeta(`meta[name="${name}"]`, "name", value));
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = url;
    let schema = document.head.querySelector("#ilmana-structured-data");
    if (!schema) { schema = document.createElement("script"); schema.id = "ilmana-structured-data"; schema.type = "application/ld+json"; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify(page ? [{ "@context": "https://schema.org", "@type": "EducationalOrganization", name: "ILMANA", alternateName: "ILMANA – Ilmu Manusia dan Alam", url: siteUrl, email: "ilmanainitiative@gmail.com", description: defaultDescription }, { "@context": "https://schema.org", "@type": "WebSite", name: "ILMANA", url: siteUrl }, ...(pathname === "/" ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }] : [])] : []);
  }, [pathname]);
  return null;
}
