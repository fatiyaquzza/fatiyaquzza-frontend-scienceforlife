import { useEffect, useState } from "react";
import api from "../../utils/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
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
  }, []);

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

  return (
    <div className="min-h-screen bg-light pb-8 pt-28 px-6">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary mb-8">Manajemen User</h1>

        {showForm && editingUser && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">Edit User</h2>
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
                  <option value="user">User</option>
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
              <table className="min-w-[1400px] w-full border-collapse">
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
                      Rata-rata Pretest
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Rata-rata Post Test
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
                        {user.avg_pretest_score != null
                          ? `${Math.round(user.avg_pretest_score)}%`
                          : "-"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.avg_posttest_score != null
                          ? `${Math.round(user.avg_posttest_score)}%`
                          : "-"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-green-600 hover:underline mr-4 font-medium"
                        >
                          Edit
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
      </div>
    </div>
  );
};

export default UserManagement;
