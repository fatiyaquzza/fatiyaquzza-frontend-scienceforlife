import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Leaf, LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  const logoLink = !user ? "/" : isAdmin ? "/admin/dashboard" : "/dashboard";

  const navLinks = !user ? (
    <>
      <a
        href="/#"
        onClick={() => setMobileOpen(false)}
        className="font-medium text-gray-700 transition-colors hover:text-green-600 block py-2 md:py-0"
      >
        Beranda
      </a>
      <a
        href="/#tentang-kami"
        onClick={() => setMobileOpen(false)}
        className="font-medium text-gray-700 transition-colors hover:text-green-600 block py-2 md:py-0"
      >
        Tentang Kami
      </a>
      <a
        href="/#program-unggulan"
        onClick={() => setMobileOpen(false)}
        className="font-medium text-gray-700 transition-colors hover:text-green-600 block py-2 md:py-0"
      >
        Modul
      </a>
      <a
        href="/#kontak"
        onClick={() => setMobileOpen(false)}
        className="font-medium text-gray-700 transition-colors hover:text-green-600 block py-2 md:py-0"
      >
        Kontak
      </a>
      <Link
        to="/login"
        onClick={() => setMobileOpen(false)}
        className="bg-primary hover:bg-[#0C452A] text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg inline-block text-center mt-2 md:mt-0"
      >
        Mulai Belajar
      </Link>
    </>
  ) : (
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
      {!isAdmin && (
        <Link
          to="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="font-medium text-gray-700 hover:text-green-600 py-2 md:py-0"
        >
          Dashboard
        </Link>
      )}
      <span className="font-medium text-gray-600 py-2 md:py-0">
        Hi, {user.name}
      </span>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-red-600 hover:shadow-md active:scale-95 transition-all duration-200 w-full md:w-auto"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );

  return (
    <nav className="fixed z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="px-4 py-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            to={logoLink}
            className="flex items-center gap-2 text-gray-900 transition-colors hover:text-green-600"
            onClick={() => setMobileOpen(false)}
          >
            <Leaf className="w-6 h-6 text-green-600 shrink-0" strokeWidth={2} />
            <span className="text-lg font-bold sm:text-xl">Science For Life</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100 space-y-1">
            {navLinks}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
