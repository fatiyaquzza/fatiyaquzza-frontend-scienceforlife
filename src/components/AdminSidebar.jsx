import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Users,
  Leaf,
  LogOut,
} from "lucide-react";

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { title: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Modul", path: "/admin/modules", icon: BookOpen },
    { title: "Sub Modul", path: "/admin/submodules", icon: Layers },
    { title: "Materi", path: "/admin/materials", icon: FileText },
    { title: "Soal", path: "/admin/questions", icon: HelpCircle },
    { title: "Pengguna", path: "/admin/users", icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-200 px-5">
        <Leaf className="h-7 w-7 shrink-0 text-green-600" strokeWidth={2} />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold leading-tight text-slate-900">
            ILMANA
          </p>
          <p className="text-xs font-medium text-slate-500">Panel Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
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
