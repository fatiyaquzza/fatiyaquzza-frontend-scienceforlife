import { useEffect, useState } from "react";
import { BookOpen, Users, HelpCircle, Mail, MessageSquare } from "lucide-react";
import api from "../../utils/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalModules: 0,
    totalSubModules: 0,
    totalQuestions: 0,
  });
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, modulesRes] = await Promise.all([
          api.get("/users"),
          api.get("/modules"),
        ]);
        const users = usersRes.data?.users || [];
        const modules = modulesRes.data?.modules || [];
        const totalSubModules = modules.reduce(
          (acc, m) => acc + Number(m.sub_module_count || 0),
          0
        );
        setStats({
          totalUsers: users.length,
          totalModules: modules.length,
          totalSubModules,
          totalQuestions: 0,
        });
        // Optional: hit questions per submodule for total (skip for perf, or add backend stats later)
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    api
      .get("/contact/feedback")
      .then((res) => {
        setFeedback(res.data?.feedback || []);
      })
      .catch(() => {})
      .finally(() => setFeedbackLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-light pb-8 pt-28">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Kelola seluruh modul, materi, soal, dan pengguna dari satu tempat.
          </p>
        </div>

        {/* Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium mb-1">Total Modul</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalModules}
                </h3>
              </div>
              <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium mb-1">Total Sub Modul</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalSubModules}
                </h3>
              </div>
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium mb-1">Total User</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalUsers}
                </h3>
              </div>
              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium mb-1">Pesan Contact Us</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {feedbackLoading ? "..." : feedback.length}
                </h3>
              </div>
              <div className="bg-amber-100 text-amber-600 p-3 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Sistem */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Ringkasan Sistem
          </h2>
          <p className="text-gray-600 text-sm">
            Dashboard ini digunakan untuk memantau dan mengelola seluruh konten
            pembelajaran, pengguna, serta evaluasi sistem Science For Life.
          </p>
        </div>

        {/* Data Contact Us */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">
              Data Pesan Contact Us
            </h2>
          </div>
          <div className="overflow-x-auto">
            {feedbackLoading ? (
              <div className="p-8 text-center text-gray-500">
                Memuat data...
              </div>
            ) : feedback.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Belum ada pesan dari form Contact Us.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                    <th className="px-6 py-3">Nama</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Subjek</th>
                    <th className="px-6 py-3">Pesan</th>
                    <th className="px-6 py-3">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {feedback.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <a
                          href={`mailto:${item.email}`}
                          className="text-primary hover:underline"
                        >
                          {item.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.subject || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                        {item.message}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
