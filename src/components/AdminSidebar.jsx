import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Users,
} from "lucide-react";

const AdminSidebar = () => {
  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Modul",
      path: "/admin/modules",
      icon: BookOpen,
    },
    {
      title: "Sub Modul",
      path: "/admin/submodules",
      icon: Layers,
    },
    {
      title: "Materi",
      path: "/admin/materials",
      icon: FileText,
    },
    {
      title: "Soal",
      path: "/admin/questions",
      icon: HelpCircle,
    },
    {
      title: "User",
      path: "/admin/users",
      icon: Users,
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-md p-6 pt-24">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-medium ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
