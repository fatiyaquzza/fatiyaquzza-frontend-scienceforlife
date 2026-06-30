import { Link } from "react-router-dom";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const links = [
    { to: "/", label: "Beranda" },
    { to: "/tentang-ilmana", label: "Tentang ILMANA" },
    { to: "/kelas", label: "Kelas" },
    { to: "/artikel", label: "Artikel" },
  ];

  return (
    <footer className="bg-[#0d2d22] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="mb-4 flex items-center gap-2 text-xl font-bold transition-colors hover:text-green-300"
            >
              <Leaf className="h-8 w-8 text-green-400" />
              ILMANA
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Platform pembelajaran sains interaktif untuk kehidupan yang lebih
              bermakna.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Kontak</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+6281234567890"
                  className="flex items-center gap-3 text-gray-400 transition-colors hover:text-green-400"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  +62 812 3456 7890
                </a>
              </li>
              <li>
                <a
                  href="mailto:ilmanainitiative@gmail.com"
                  className="flex items-center gap-3 text-gray-400 transition-colors hover:text-green-400"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  ilmanainitiative@gmail.com
                </a>
              </li>
              <li>
                <span className="flex items-start gap-3 text-gray-400">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  Banda Aceh, Indonesia
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Tautan</h3>
            <ul className="space-y-3">
              {links.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-gray-400 transition-colors hover:text-green-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">
              Tentang Platform
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              ILMANA menyediakan modul pembelajaran sains yang kontekstual,
              terstruktur, dan berbasis penelitian untuk meningkatkan literasi
              sains generasi muda.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-700 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} ILMANA. Hak cipta dilindungi.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-gray-500 transition-colors hover:text-green-400"
            >
              Kebijakan Privasi
            </a>
            <a
              href="#"
              className="text-gray-500 transition-colors hover:text-green-400"
            >
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
