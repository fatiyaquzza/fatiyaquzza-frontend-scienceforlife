import { Outlet } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-light">
      <AdminSidebar />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <main className="mx-auto w-full max-w-7xl flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
