import { Link } from "react-router-dom";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d2d22] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold mb-4 hover:text-green-300 transition-colors"
            >
              <Leaf className="w-8 h-8 text-green-400" />
              Science For Life
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Platform pembelajaran sains interaktif untuk kehidupan yang lebih
              bermakna.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+6281234567890"
                  className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  +62 812 3456 7890
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@scienceforlife.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  support@scienceforlife.com
                </a>
              </li>
              <li>
                <span className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Jakarta, Indonesia
                </span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Links</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/#"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/#tentang-kami"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/#program-unggulan"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Program
                </a>
              </li>
              <li>
                <a
                  href="/#kontak"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">
              Tentang Platform
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Science For Life menyediakan modul pembelajaran sains yang
              kontekstual dan berbasis penelitian untuk meningkatkan literasi
              sains generasi muda.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Science For Life. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-gray-500 hover:text-green-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-green-400 transition-colors"
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
