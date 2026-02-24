import { Link } from "react-router-dom";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d2d22] text-white">
      <div className="px-4 sm:px-6 py-12 sm:py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 mb-4 text-xl font-bold transition-colors hover:text-green-300"
            >
              <Leaf className="w-8 h-8 text-green-400" />
              Science For Life
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Platform pembelajaran sains interaktif untuk kehidupan yang lebih
              bermakna.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+6281234567890"
                  className="flex items-center gap-3 text-gray-400 transition-colors hover:text-green-400"
                >
                  <Phone className="flex-shrink-0 w-4 h-4" />
                  +62 812 3456 7890
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@scienceforlife.com"
                  className="flex items-center gap-3 text-gray-400 transition-colors hover:text-green-400"
                >
                  <Mail className="flex-shrink-0 w-4 h-4" />
                  support@scienceforlife.com
                </a>
              </li>
              <li>
                <span className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Banda Aceh, Indonesia
                </span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Links</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/#"
                  className="text-gray-400 transition-colors hover:text-green-400"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/#tentang-kami"
                  className="text-gray-400 transition-colors hover:text-green-400"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/#program-unggulan"
                  className="text-gray-400 transition-colors hover:text-green-400"
                >
                  Program
                </a>
              </li>
              <li>
                <a
                  href="/#kontak"
                  className="text-gray-400 transition-colors hover:text-green-400"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">
              Tentang Platform
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Science For Life menyediakan modul pembelajaran sains yang
              kontekstual dan berbasis penelitian untuk meningkatkan literasi
              sains generasi muda.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 mt-12 border-t border-gray-700 md:flex-row">
          <p className="text-sm text-gray-500">
            © {currentYear} Science For Life. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-gray-500 transition-colors hover:text-green-400"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-500 transition-colors hover:text-green-400"
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
