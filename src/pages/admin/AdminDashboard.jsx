import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Layers,
  Mail,
  MessageSquare,
  RotateCcw,
  Trash2,
  Users,
} from "lucide-react";
import api from "../../utils/api";

const StatValueSkeleton = () => (
  <div className="mt-2 h-9 w-16 animate-pulse rounded-lg bg-gray-200" />
);

const FeedbackTableSkeleton = () => (
  <table className="w-full">
    <thead>
      <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
        <th className="px-6 py-3">Nama</th>
        <th className="px-6 py-3">Email</th>
        <th className="px-6 py-3">Subjek</th>
        <th className="px-6 py-3">Pesan</th>
        <th className="px-6 py-3">Status</th>
        <th className="px-6 py-3">Tanggal</th>
        <th className="px-6 py-3">Kelola</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {[1, 2, 3, 4].map((row) => (
        <tr key={row}>
          <td className="px-6 py-4">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-24 animate-pulse rounded-lg bg-gray-200" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          </td>
          <td className="px-6 py-4">
            <div className="flex min-w-max items-center gap-2">
              <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

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
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackActionId, setFeedbackActionId] = useState(null);

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
    setFeedbackError("");
    api
      .get("/contact/feedback")
      .then((res) => {
        setFeedback(res.data?.feedback || []);
      })
      .catch((error) => {
        setFeedback([]);
        setFeedbackError(
          error.response?.data?.message || "Gagal memuat data pesan kontak."
        );
      })
      .finally(() => setFeedbackLoading(false));
  }, []);

  const handleUpdateFeedbackStatus = async (item) => {
    const nextStatus = item.status === "done" ? "open" : "done";
    setFeedbackActionId(item.id);

    try {
      const res = await api.patch(`/contact/feedback/${item.id}/status`, {
        status: nextStatus,
      });
      const updatedFeedback = res.data?.feedback;

      if (updatedFeedback) {
        setFeedback((currentFeedback) =>
          currentFeedback.map((feedbackItem) =>
            feedbackItem.id === item.id ? updatedFeedback : feedbackItem
          )
        );
      }
    } catch (error) {
      alert("Gagal memperbarui status pesan.");
    } finally {
      setFeedbackActionId(null);
    }
  };

  const handleDeleteFeedback = async (item) => {
    if (!window.confirm("Yakin ingin menghapus pesan kontak ini?")) return;

    setFeedbackActionId(item.id);

    try {
      await api.delete(`/contact/feedback/${item.id}`);
      setFeedback((currentFeedback) =>
        currentFeedback.filter((feedbackItem) => feedbackItem.id !== item.id)
      );
    } catch (error) {
      alert("Gagal menghapus pesan.");
    } finally {
      setFeedbackActionId(null);
    }
  };

  return (
    <>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Admin
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
                {loading ? (
                  <StatValueSkeleton />
                ) : (
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stats.totalModules}
                  </h3>
                )}
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
                {loading ? (
                  <StatValueSkeleton />
                ) : (
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stats.totalSubModules}
                  </h3>
                )}
              </div>
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium mb-1">Total Pengguna</p>
                {loading ? (
                  <StatValueSkeleton />
                ) : (
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </h3>
                )}
              </div>
              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium mb-1">Pesan Kontak</p>
                {feedbackLoading ? (
                  <StatValueSkeleton />
                ) : (
                  <h3 className="text-3xl font-bold text-gray-900">
                    {feedback.length}
                  </h3>
                )}
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
            pembelajaran, pengguna, serta evaluasi sistem ILMANA (Ilmu Manusia
            dan Alam).
          </p>
        </div>

        {/* Data Kontak */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">
              Data Pesan Kontak
            </h2>
          </div>
          <div className="overflow-x-auto">
            {feedbackLoading ? (
              <FeedbackTableSkeleton />
            ) : feedbackError ? (
              <div className="p-8 text-center text-red-600">
                {feedbackError}
              </div>
            ) : feedback.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Belum ada pesan dari formulir kontak.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                    <th className="px-6 py-3">Nama</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Subjek</th>
                    <th className="px-6 py-3">Pesan</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {feedback.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50/50 ${
                        item.status === "done" ? "bg-green-50/30" : ""
                      }`}
                    >
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
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${
                            item.status === "done"
                              ? "bg-green-100 text-primary"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.status === "done" ? "Selesai" : "Belum selesai"}
                        </span>
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
                      <td className="px-6 py-4">
                        <div className="flex min-w-max items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateFeedbackStatus(item)}
                            disabled={feedbackActionId === item.id}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                              item.status === "done"
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-primary text-white hover:bg-[#0C452A]"
                            }`}
                          >
                            {item.status === "done" ? (
                              <>
                                <RotateCcw className="h-3.5 w-3.5" />
                                Buka lagi
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Tandai selesai
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFeedback(item)}
                            disabled={feedbackActionId === item.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
    </>
  );
};

export default AdminDashboard;
