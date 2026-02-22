import { useEffect, useState } from "react";
import api from "../../utils/api";

const ModuleManagement = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = () => {
    api
      .get("/modules")
      .then((res) => {
        setModules(res.data.modules);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      if (editingModule) {
        await api.put(`/modules/${editingModule.id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/modules", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      fetchModules();
      resetForm();
    } catch (error) {
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (module) => {
    setEditingModule(module);
    setFormData({ name: module.name, description: module.description || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus modul ini?")) return;

    try {
      await api.delete(`/modules/${id}`);
      fetchModules();
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setImageFile(null);
    setEditingModule(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-light pb-8 pt-28 px-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Manajemen Modul</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
          >
            {showForm ? "Batal" : "+ Tambah Modul"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">
              {editingModule ? "Edit Modul" : "Tambah Modul Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Nama Modul
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
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="4"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Gambar Modul
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Memuat...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Nama</th>
                  <th className="px-6 py-3 text-left">Deskripsi</th>
                  <th className="px-6 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module.id} className="border-t">
                    <td className="px-6 py-4">{module.name}</td>
                    <td className="px-6 py-4">{module.description || "-"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(module)}
                        className="text-secondary hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(module.id)}
                        className="text-red-500 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleManagement;
