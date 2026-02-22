import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { useEffect, useState } from "react";
import { useInView } from "../hooks/useInView";
import {
  ChevronDown,
  Leaf,
  Brain,
  Cpu,
  FlaskConical,
  Sprout,
  Star,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";

const LandingPage = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState(null);

  useEffect(() => {
    api
      .get("/modules")
      .then((res) => {
        setModules(res.data.modules?.slice(0, 4) || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus(null);
    try {
      await api.post("/contact/feedback", contactForm);
      setContactStatus("success");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setContactStatus("error");
    }
  };

  const faqs = [
    {
      question: "Apa itu Science For Life?",
      answer:
        "Science For Life adalah platform pembelajaran interaktif yang membawa ilmu pengetahuan ke kehidupan sehari-hari. Kami menyediakan materi pembelajaran yang menarik dan mudah dipahami.",
    },
    {
      question: "Bagaimana cara mendaftar?",
      answer:
        "Klik tombol 'Mulai Belajar Sekarang' di halaman utama, lalu isi formulir pendaftaran dengan data diri Anda. Setelah mendaftar, Anda dapat langsung mengakses semua modul pembelajaran.",
    },
    {
      question: "Apakah ada biaya untuk menggunakan platform ini?",
      answer:
        "Kami menawarkan berbagai paket pembelajaran, mulai dari gratis hingga premium. Paket gratis sudah mencakup akses ke beberapa modul dasar.",
    },
    {
      question: "Bagaimana cara menghubungi customer support?",
      answer:
        "Anda dapat menghubungi kami melalui email di support@scienceforlife.com atau melalui form kontak yang tersedia di website kami.",
    },
    {
      question: "Apakah sertifikat tersedia setelah menyelesaikan modul?",
      answer:
        "Ya, Anda akan mendapatkan sertifikat digital setelah menyelesaikan setiap modul pembelajaran dengan nilai yang memenuhi standar.",
    },
    {
      question: "Berapa lama akses modul pembelajaran?",
      answer:
        "Akses ke modul pembelajaran bersifat unlimited selama Anda masih terdaftar sebagai pengguna aktif di platform kami.",
    },
  ];

  const programs = [
    {
      icon: Sprout,
      title: "Dunia Hijau Kehidupan",
      description:
        "Mempelajari lingkungan, ekosistem, dan peran manusia dalam menjaga keberlanjutan bumi.",
    },
    {
      icon: Brain,
      title: "Rahasia Tubuh Kehidupan",
      description:
        "Memahami kerja tubuh manusia, fisiologi sistem tubuh yang bekerja dengan sempurna setiap saat.",
    },
    {
      icon: Cpu,
      title: "Belajar Dibantu AI",
      description:
        "AI Tutor membantu menjawab setiap pertanyaan yang belum dipahami secara personal.",
    },
    {
      icon: FlaskConical,
      title: "Mini dalam Ilmu",
      description:
        "Menyingkap keajaiban bahasa ilmiah: struktur yang harus dipatuhi dengan kritis.",
    },
  ];

  const [aboutRef, aboutInView] = useInView();
  const [programRef, programInView] = useInView();
  const [faqRef, faqInView] = useInView();
  const [teamRef, teamInView] = useInView();
  const [contactRef, contactInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  const teamMembers = [
    {
      name: "Dr. Ahmad Rahman",
      role: "Founder & Lead Educator",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    },
    {
      name: "Siti Nurhaliza, M.Sc",
      role: "Curriculum Developer",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    },
    {
      name: "Budi Santoso",
      role: "Technology Lead",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    },
    {
      name: "Dewi Kusuma",
      role: "Community Manager",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Full Screen */}
      <section
        id="hero"
        className="relative flex flex-col justify-center min-h-screen pt-16 overflow-hidden text-white"
        style={{
          background: `
      radial-gradient(circle at center, rgba(9,57,42,0.9) 0%, rgba(16,97,70,0.6) 40%, rgba(16,97,70,0.3) 100%),
      linear-gradient(135deg, rgba(16,97,70,0.55) 0%, rgba(9,57,42,0.65) 100%),
      url(https://images.unsplash.com/photo-1694230155228-cdde50083573?q=80&w=2070&auto=format&fit=crop)
    `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="relative z-10 flex flex-col justify-center flex-1 w-full max-w-7xl px-4 mx-auto">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Belajar Sains untuk Kehidupan
              <br />
              <span className="text-transparent bg-gradient-to-r from-white to-green-200 bg-clip-text">
                yang Lebih Bermakna
              </span>
            </h1>
            <p className="max-w-4xl mx-auto mb-12 text-lg leading-relaxed md:text-xl text-green-50/95">
              Platform pembelajaran interaktif yang menyingkapkan sains ke dalam
              kehidupan sehari-hari. Belajar dengan cara yang menakjubkan dan
              lebih bermakna.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-10 py-4 text-lg font-semibold text-white transition-all duration-300 bg-green-500 rounded-full hover:bg-green-600 hover:shadow-xl hover:scale-105"
                >
                  Mulai Belajar Sekarang
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-10 py-4 text-lg font-semibold text-white transition-all duration-300 bg-green-500 rounded-full hover:bg-green-600 hover:shadow-xl hover:scale-105"
                  >
                    Mulai Belajar Sekarang
                  </Link>
                  <Link
                    to="/#program-unggulan"
                    className="px-10 py-4 text-lg font-semibold text-white transition-all duration-300 border-2 border-white rounded-full hover:bg-white hover:text-green-700"
                  >
                    Lihat Modul Pembelajaran
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Scroll indicator with bounce effect */}
        <a
          href="/#tentang-kami"
          className="absolute z-10 flex items-center justify-center w-12 h-12 text-white transition-colors border rounded-full bottom-8 left-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 animate-bounce-smooth border-white/30"
          aria-label="Scroll ke bawah"
        >
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* About Section */}
      <section id="tentang-kami" className="py-16 md:py-24 bg-white scroll-mt-20">
        <div ref={aboutRef} className="w-full max-w-7xl px-4 sm:px-6 lg:px-12 mx-auto">
          <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
            <div className={`order-2 lg:order-1 ${aboutInView ? "in-view" : ""} scroll-reveal-left`}>
              <span className="text-sm font-semibold tracking-widest text-green-600 uppercase">
                — Tentang —
              </span>
              <h2 className="mt-2 mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
                Science For Life
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-gray-600">
                Science For Life hadir sebagai jembatan inovatif bagi siswa yang
                ingin memperdalam sains kehidupan, kontekstual, berbasis
                penelitian, dan meningkatkan literasi sains yang sebenarnya
                membuka makna menjaga kehidupan, lingkungan, dan nilai
                kemanusiaan.
              </p>
              <p className="text-lg leading-relaxed text-gray-600">
                Kami menyediakan platform pembelajaran yang interaktif, menarik,
                dan mudah dipahami untuk semua kalangan.
              </p>
              <div className="flex items-center gap-2 mt-8">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Platform terpercaya
                </span>
              </div>
            </div>
            <div className={`order-1 lg:order-2 ${aboutInView ? "in-view" : ""} scroll-reveal-right`}>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="Students Learning"
                  className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto object-cover aspect-[4/3]"
                />
                <div className="absolute px-4 py-2 text-white bg-green-600 rounded-lg shadow-lg -bottom-4 -right-4">
                  <span className="font-bold">100+</span> Pengguna Aktif
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section - Luxurious Green Background */}
      <section
        id="program-unggulan"
        className="py-24 scroll-mt-20"
        style={{
          background:
            "linear-gradient(160deg, #0d4d3a 0%, #0a3d2e 30%, #062d22 100%)",
        }}
      >
        <div ref={programRef} className={`container px-4 mx-auto ${programInView ? "in-view" : ""} scroll-reveal`}>
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold tracking-widest text-green-300 uppercase">
              — Terbukti —
            </span>
            <h2 className="mt-2 mb-4 text-4xl font-bold text-white md:text-5xl">
              PROGRAM UNGGULAN
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-green-100/90">
              Platform pembelajaran sains yang dirancang untuk membuka wawasan
              dan menginspirasi generasi muda. Akses modul berkualitas dengan
              pendekatan kontekstual dan berbasis penelitian.
            </p>
          </div>
          <div className={`grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-2 lg:grid-cols-4 scroll-reveal-stagger ${programInView ? "in-view" : ""}`}>
            {programs.map((program, index) => {
              const IconComponent = program.icon;
              return (
                <div
                  key={index}
                  className="p-8 transition-all duration-300 border-l-4 border-green-400 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/15 group"
                >
                  <div className="flex items-center justify-center mb-6 transition-colors w-14 h-14 rounded-xl bg-green-500/30 group-hover:bg-green-500/50">
                    <IconComponent className="text-green-300 w-7 h-7" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-white">
                    {program.title}
                  </h3>
                  <p className="leading-relaxed text-green-100/80">
                    {program.description}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-white transition-all duration-300 bg-green-500 rounded-full hover:bg-green-600 hover:shadow-xl hover:scale-105"
            >
              <Leaf className="w-5 h-5" />
              Lihat Semua Program
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-24 bg-gradient-to-b from-green-50 to-white scroll-mt-20"
      >
        <div ref={faqRef} className={`container max-w-4xl px-4 mx-auto ${faqInView ? "in-view" : ""} scroll-reveal-scale`}>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-green-700 md:text-5xl">
              FAQs
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-green-400 to-green-600" />
            <p className="mt-4 text-lg text-gray-600">
              Pertanyaan yang sering ditanyakan
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden transition-all duration-300 bg-white border-2 rounded-2xl border-green-50 hover:border-green-200 hover:shadow-lg"
              >
                <button
                  className="flex items-center justify-between w-full p-6 text-left transition-colors duration-300 hover:bg-green-50/50"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <h3 className="pr-4 text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <span
                    className={`text-2xl font-bold text-green-600 transform transition-transform duration-300 flex-shrink-0 ${
                      openFAQ === index ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFAQ === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6">
                    <p className="leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section
        id="tim-kami"
        className="py-24 bg-gradient-to-b from-white to-gray-50 scroll-mt-20"
        style={{
          background:
            "linear-gradient(160deg, #0d4d3a 0%, #0a3d2e 30%, #062d22 100%)",
        }}
      >
        <div ref={teamRef} className={`container px-4 mx-auto ${teamInView ? "in-view" : ""} scroll-reveal`}>
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold tracking-widest text-green-300 uppercase">
              — Tim Kami —
            </span>
            <h2 className="mt-2 mb-4 text-4xl font-bold text-white md:text-5xl">
              Kenali Sosok di Balik Layar
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-green-100/90">
              Inilah tim di balik Science For Life yang berperan dalam
              menghadirkan sains agar lebih dekat dan bermakna dalam kehidupan
              sehari-hari.
            </p>
          </div>
          <div className={`grid max-w-6xl grid-cols-1 gap-8 mx-auto sm:grid-cols-2 lg:grid-cols-4 scroll-reveal-stagger ${teamInView ? "in-view" : ""}`}>
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="overflow-hidden transition-all duration-300 shadow-lg group bg-white/90 rounded-2xl hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="overflow-hidden aspect-square">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="mb-1 text-xl font-bold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-green-600">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="kontak" className="py-24 bg-gray-50 scroll-mt-20">
        <div ref={contactRef} className={`container px-4 mx-auto ${contactInView ? "in-view" : ""} scroll-reveal`}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <span className="text-sm font-semibold tracking-widest text-green-600 uppercase">
                — Hubungi Kami —
              </span>
              <h2 className="mt-2 mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                Contact Us
              </h2>
              <p className="text-lg text-gray-600">
                Punya saran atau masukan? Kami senang mendengar dari Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-1">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Email</h3>
                    <a
                      href="mailto:support@scienceforlife.com"
                      className="text-gray-600 hover:text-green-600"
                    >
                      support@scienceforlife.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      Telepon
                    </h3>
                    <a
                      href="tel:+6281234567890"
                      className="text-gray-600 hover:text-green-600"
                    >
                      +62 812 3456 7890
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Alamat</h3>
                    <p className="text-gray-600">Jakarta, Indonesia</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <form
                  onSubmit={handleContactSubmit}
                  className="p-8 space-y-6 bg-white shadow-xl rounded-2xl"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Nama *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 transition-all border border-gray-200 outline-none rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        placeholder="Nama lengkap Anda"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 transition-all border border-gray-200 outline-none rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        placeholder="email@contoh.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Subjek
                    </label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          subject: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 transition-all border border-gray-200 outline-none rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      placeholder="Subjek pesan (opsional)"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Pesan *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 transition-all border border-gray-200 outline-none resize-none rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      placeholder="Tulis saran atau masukan Anda..."
                    />
                  </div>
                  {contactStatus === "success" && (
                    <div className="p-4 text-green-700 bg-green-50 rounded-xl">
                      Terima kasih! Pesan Anda telah berhasil dikirim.
                    </div>
                  )}
                  {contactStatus === "error" && (
                    <div className="p-4 text-red-700 bg-red-50 rounded-xl">
                      Gagal mengirim pesan. Silakan coba lagi.
                    </div>
                  )}
                  <button
                    type="submit"
                    className="flex items-center justify-center w-full gap-2 px-8 py-4 mx-auto font-semibold text-white transition-all duration-300 bg-primary hover:bg-[#0C452A] md:w-auto  rounded-xl hover:shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                    Kirim Pesan
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Siap Belajar - Organic Green Shape */}
      <section className="py-24 overflow-hidden bg-gray-50">
        <div ref={ctaRef} className={`container px-4 mx-auto ${ctaInView ? "in-view" : ""} scroll-reveal-scale`}>
          <div className="relative mx-auto max-w-7xl">
            {/* Organic blob shape - rounded corners with subtle curves */}
            <div
              className="relative px-8 py-16 overflow-hidden bg-[#2ECC71] md:px-16 md:py-20"
              style={{
                borderRadius: "50px",
                boxShadow:
                  "0 25px 50px -12px rgba(16, 185, 129, 0.25), 0 10px 20px -5px rgba(16, 185, 129, 0.15)",
              }}
            >
              {/* Decorative flowing lines - LEFT side */}
              <div className="absolute -translate-y-1/2 left-8 md:left-16 top-1/2">
                <svg
                  className="w-20 h-24 opacity-25 md:w-24 md:h-28"
                  viewBox="0 0 100 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 30 Q 15 25, 25 30 Q 35 35, 45 30 Q 55 25, 65 30"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M5 50 Q 15 45, 25 50 Q 35 55, 45 50 Q 55 45, 65 50"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M5 70 Q 15 65, 25 70 Q 35 75, 45 70 Q 55 65, 65 70"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M5 90 Q 15 85, 25 90 Q 35 95, 45 90 Q 55 85, 65 90"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Decorative flowing lines - RIGHT side */}
              <div className="absolute -translate-y-1/2 right-8 md:right-16 top-1/2">
                <svg
                  className="w-20 h-24 opacity-25 md:w-24 md:h-28"
                  viewBox="0 0 100 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M95 30 Q 85 25, 75 30 Q 65 35, 55 30 Q 45 25, 35 30"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M95 50 Q 85 45, 75 50 Q 65 55, 55 50 Q 45 45, 35 50"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M95 70 Q 85 65, 75 70 Q 65 75, 55 70 Q 45 65, 35 70"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M95 90 Q 85 85, 75 90 Q 65 95, 55 90 Q 45 85, 35 90"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>

              <div className="relative z-10 text-center text-white">
                <h2 className="px-4 mb-6 text-3xl font-bold md:text-4xl lg:text-5xl md:mb-8">
                  Siap untuk belajar?
                </h2>

                {user ? (
                  <Link
                    to="/dashboard"
                    className="inline-block bg-white/95 text-green-600 px-8 md:px-10 py-3 md:py-3.5 rounded-full font-semibold text-sm md:text-base border-2 border-white/50 hover:bg-white hover:border-white transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Mulai Belajar Sekarang!
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-block bg-white/95 text-green-600 px-8 md:px-10 py-3 md:py-3.5 rounded-full font-semibold text-sm md:text-base border-2 border-white/50 hover:bg-white hover:border-white transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Mulai Belajar Sekarang!
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
