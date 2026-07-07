import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Leaf, LogOut, Menu, UserRound, X } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const primaryLinks = [
    { type: "route", to: "/", label: "Beranda" },
    { type: "route", to: "/tentang-ilmana", label: "Tentang ILMANA" },
    { type: "route", to: "/kelas", label: "Panduan" },
    { type: "route", to: "/artikel", label: "Artikel" },
  ];
  const memberLinks =
    user && !isAdmin
      ? [{ type: "route", to: "/dashboard", label: "Materi" }]
      : [];

  const baseLinkClass =
    "block rounded-lg px-3.5 py-2 font-medium transition-colors md:py-2";
  const routeLinkClass = ({ isActive }) =>
    `${baseLinkClass} ${
      isActive
        ? "bg-green-50 text-primary"
        : "text-gray-700 hover:bg-green-50 hover:text-gray-900"
    }`;
  const closeMenu = () => setMobileOpen(false);
  const renderPrimaryLink = (item) => (
    <NavLink
      key={item.label}
      to={item.to}
      end={item.to === "/"}
      onClick={closeMenu}
      className={routeLinkClass}
    >
      {item.label}
    </NavLink>
  );

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  const logoLink = !user ? "/" : isAdmin ? "/admin/dashboard" : "/dashboard";

  const publicNavLinks = (
    <>
      {primaryLinks.map(renderPrimaryLink)}
    </>
  );

  const navLinks = !user ? (
    <>
      {publicNavLinks}
      <Link
        to="/login"
        onClick={closeMenu}
        className="bg-primary hover:bg-[#0C452A] text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg inline-block text-center mt-2 md:mt-0"
      >
        Login / Daftar
      </Link>
    </>
  ) : (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
      {!isAdmin && (
        <>
          {primaryLinks.map(renderPrimaryLink)}
          {memberLinks.map(renderPrimaryLink)}
        </>
      )}
      <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-sm font-semibold text-primary md:w-auto md:justify-start md:py-1.5">
        <UserRound className="h-4 w-4 shrink-0 text-green-600" />
        <span className="max-w-40 truncate">Hi, {user.name}</span>
      </span>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-red-600 hover:shadow-md active:scale-95 transition-all duration-200 w-full md:w-auto"
      >
        <LogOut className="w-4 h-4" />
        Keluar
      </button>
    </div>
  );

  return (
    <nav className="fixed z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="px-4 py-3 mx-auto sm:px-6 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            to={logoLink}
            className="flex items-center gap-2 text-gray-900 transition-colors hover:text-green-600"
            onClick={() => setMobileOpen(false)}
          >
            <Leaf className="w-6 h-6 text-green-600 shrink-0" strokeWidth={2} />
            <span className="text-lg font-bold sm:text-xl">ILMANA</span>
          </Link>

          {/* Desktop menu */}
          <div className="items-center hidden gap-6 lg:flex lg:gap-8">
            {navLinks}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-gray-700 transition-colors rounded-lg lg:hidden hover:bg-gray-100"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="pt-4 mt-4 space-y-1 border-t border-gray-100 lg:hidden">
            {navLinks}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
