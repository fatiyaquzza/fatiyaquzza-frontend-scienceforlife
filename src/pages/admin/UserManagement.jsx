import { useEffect, useState } from "react";
import api from "../../utils/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [subModules, setSubModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedSubModuleId, setSelectedSubModuleId] = useState("");
  const [progressUser, setProgressUser] = useState(null);
  const [progressRows, setProgressRows] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    job: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    api.get("/modules").then((res) => setModules(res.data.modules || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedModuleId) {
      setSubModules([]);
      setSelectedSubModuleId("");
      return;
    }

    api
      .get(`/submodules/module/${selectedModuleId}`)
      .then((res) => setSubModules(res.data.subModules || []))
      .catch(() => setSubModules([]));
  }, [selectedModuleId]);

  const fetchUsers = () => {
    api
      .get("/users")
      .then((res) => {
        setUsers(res.data.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const dataToSend = { ...formData };
    if (!dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      await api.put(`/users/${editingUser.id}`, dataToSend);
      fetchUsers();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      job: user.job || "",
      address: user.address || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleShowProgress = async (user) => {
    if (progressUser?.id === user.id) {
      setProgressUser(null);
      setProgressRows([]);
      return;
    }

    setProgressUser(user);
    setProgressLoading(true);
    try {
      const res = await api.get(`/progress/user/${user.id}`);
      setProgressRows(res.data.progress || []);
    } catch {
      setProgressRows([]);
    } finally {
      setProgressLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "user",
      password: "",
      job: "",
      address: "",
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleExport = async () => {
    if (!selectedSubModuleId) return;
    setExporting(true);
    try {
      const res = await api.get(`/users/export-progress?subModuleId=${selectedSubModuleId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `progress-submodule-${selectedSubModuleId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.response?.data?.message || "Gagal export data");
    } finally {
      setExporting(false);
    }
  };

  const progressSummary = {
    total: progressRows.length,
    pretestDone: progressRows.filter((row) => row.pretest_done).length,
    postestDone: progressRows.filter((row) => row.postest_done).length,
    passed: progressRows.filter((row) => row.is_passed).length,
  };

  const progressByModule = progressRows.reduce((acc, row) => {
    if (!acc[row.module_name]) acc[row.module_name] = [];
    acc[row.module_name].push(row);
    return acc;
  }, {});

  return (
    <>
        <h1 className="text-3xl font-bold text-primary mb-8">
          Manajemen Pengguna
        </h1>

        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-primary">Export Data Pretest dan Postest</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Pilih Modul
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="">-- Pilih Modul --</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Pilih Materi / Sub Modul
              </label>
              <select
                value={selectedSubModuleId}
                onChange={(e) => setSelectedSubModuleId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                disabled={!selectedModuleId}
              >
                <option value="">-- Pilih Materi --</option>
                {subModules.map((subModule) => (
                  <option key={subModule.id} value={subModule.id}>
                    {subModule.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleExport}
                disabled={!selectedSubModuleId || exporting}
                className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting ? "Mengunduh..." : "Export CSV"}
              </button>
            </div>
          </div>
        </div>

        {showForm && editingUser && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">
              Edit Pengguna
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="user">Pengguna</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Pekerjaan
                </label>
                <input
                  type="text"
                  value={formData.job}
                  onChange={(e) =>
                    setFormData({ ...formData, job: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Password Baru (kosongkan jika tidak ingin mengubah)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Memuat...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-[1100px] w-full border-collapse">
                <thead className="bg-primary text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Pekerjaan
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Alamat
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.job || "-"}
                      </td>

                      <td className="px-6 py-4 max-w-sm">
                        <div className="truncate" title={user.address || "-"}>
                          {user.address || "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.total_progress || 0} sub modul
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleShowProgress(user)}
                          className="text-primary hover:underline mr-4 font-medium"
                        >
                          Nilai
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-green-600 hover:underline mr-4 font-medium"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 hover:underline font-medium"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {progressUser && (
          <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-primary">
                  Nilai {progressUser.name}
                </h2>
                <p className="text-sm text-gray-500">
                  Pretest dan postest per materi/sub modul
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProgressUser(null);
                  setProgressRows([]);
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>

            {progressLoading ? (
              <p className="p-6 text-gray-500">Memuat nilai...</p>
            ) : progressRows.length === 0 ? (
              <p className="p-6 text-gray-500">Belum ada progress.</p>
            ) : (
              <div className="space-y-6 p-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Total materi", value: progressSummary.total },
                    { label: "Pretest selesai", value: progressSummary.pretestDone },
                    { label: "Postest selesai", value: progressSummary.postestDone },
                    { label: "Lulus", value: progressSummary.passed },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-slate-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {Object.entries(progressByModule).map(([moduleName, rows]) => (
                    <div key={moduleName} className="rounded-2xl border border-slate-200">
                      <div className="border-b border-slate-200 px-4 py-3">
                        <h3 className="font-bold text-slate-900">{moduleName}</h3>
                      </div>
                      <div className="grid gap-3 p-4">
                        {rows.map((row) => (
                          <div
                            key={row.sub_module_id}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {row.sub_module_name}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  Nilai per materi
                                </p>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-sm font-medium ${
                                  row.is_passed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {row.is_passed ? "Lulus" : "Belum lulus"}
                              </span>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-lg bg-slate-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Pretest
                                </p>
                                <p className="mt-2 text-lg font-bold text-slate-900">
                                  {row.pretest_done ? `${row.pretest_score}%` : "-"}
                                </p>
                              </div>
                              <div className="rounded-lg bg-slate-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Postest
                                </p>
                                <p className="mt-2 text-lg font-bold text-slate-900">
                                  {row.postest_done ? `${row.postest_score}%` : "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
    </>
  );
};

export default UserManagement;
