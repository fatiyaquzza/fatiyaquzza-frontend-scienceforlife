import { useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Users,
  LogOut,
  X,
  ClipboardCheck,
} from "lucide-react";

const menuGroups = [
  {
    label: "Ringkasan",
    items: [{ title: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Konten Pembelajaran",
    items: [
      { title: "Modul", path: "/admin/modules", icon: BookOpen, step: 1 },
      { title: "Submodul", path: "/admin/submodules", icon: Layers, step: 2 },
      { title: "Pretest", path: "/admin/questions?type=pretest", icon: ClipboardCheck, step: 3 },
      { title: "Materi", path: "/admin/materials", icon: FileText, step: 4 },
      { title: "Posttest", path: "/admin/questions?type=postest", icon: HelpCircle, step: 5 },
    ],
  },
  {
    label: "Manajemen",
    items: [{ title: "Pengguna", path: "/admin/users", icon: Users }],
  },
  {
    label: "Tampilan Situs",
    items: [{ title: "Tim Kami", path: "/admin/team", icon: Users }],
  },
];

const AdminSidebar = ({ open = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const closeButtonRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeButtonRef.current?.focus();
    const trapFocus = (event) => {
      if (event.key !== "Tab") return;
      const focusable = [...sidebarRef.current.querySelectorAll("a[href], button:not([disabled])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      ref={sidebarRef}
      aria-label="Navigasi admin"
      className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(20rem,88vw)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out lg:z-40 lg:w-64 lg:translate-x-0 lg:shadow-sm ${
        open ? "visible translate-x-0" : "invisible -translate-x-full lg:visible"
      }`}
    >
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-200 px-5">
        <img src="/logo-512.png" alt="Logo ILMANA" className="h-10 w-10 shrink-0 object-contain" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold leading-tight text-slate-900">
            ILMANA
          </p>
          <p className="text-xs font-medium text-slate-500">Panel Admin</p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Tutup menu admin"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-4">
        {menuGroups.map((group, groupIndex) => (
          <section key={group.label} aria-labelledby={`admin-group-${groupIndex}`}>
            <h2 id={`admin-group-${groupIndex}`} className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {group.label}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const [pathname, search = ""] = item.path.split("?");
                const expectedType = new URLSearchParams(search).get("type");
                const currentType = new URLSearchParams(location.search).get("type") || "pretest";
                const isActive = location.pathname === pathname && (!expectedType || expectedType === currentType);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive ? "bg-primary text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.step ? (
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-primary"}`}>
                        {item.step}
                      </span>
                    ) : (
                      <Icon className="h-5 w-5 shrink-0" />
                    )}
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-4">
        <p className="mb-3 truncate text-sm font-medium text-slate-600">
          {user?.name ? `Hi, ${user.name}` : "Admin"}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
