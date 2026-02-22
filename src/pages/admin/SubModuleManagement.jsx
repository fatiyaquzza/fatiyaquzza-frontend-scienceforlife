import { useEffect, useState } from "react";
import api from "../../utils/api";

const SubModuleManagement = () => {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [subModules, setSubModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubModule, setEditingSubModule] = useState(null);
  const [formData, setFormData] = useState({
    module_id: "",
    name: "",
    description: "",
    passing_grade: 70,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/modules").then((res) => {
      setModules(res.data.modules);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedModuleId) {
      fetchSubModules();
    } else {
      setSubModules([]);
    }
  }, [selectedModuleId]);

  const fetchSubModules = () => {
    api
      .get(`/submodules/module/${selectedModuleId}`)
      .then((res) => setSubModules(res.data.subModules))
      .catch(() => setSubModules([]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingSubModule) {
        await api.put(`/submodules/${editingSubModule.id}`, formData);
      } else {
        await api.post("/submodules", formData);
      }

      fetchSubModules();
      resetForm();
    } catch (error) {
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (subModule) => {
    setEditingSubModule(subModule);
    setFormData({
      module_id: subModule.module_id,
      name: subModule.name,
      description: subModule.description || "",
      passing_grade: subModule.passing_grade,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus sub modul ini?")) return;

    try {
      await api.delete(`/submodules/${id}`);
      fetchSubModules();
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const resetForm = () => {
    setFormData({
      module_id: selectedModuleId,
      name: "",
      description: "",
      passing_grade: 70,
    });
    setEditingSubModule(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-light pb-8 pt-28 px-6">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary mb-8">
          Manajemen Sub Modul
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <label className="block text-gray-700 font-semibold mb-2">
            Pilih Modul
          </label>
          <select
            value={selectedModuleId}
            onChange={(e) => {
              setSelectedModuleId(e.target.value);
              setFormData({ ...formData, module_id: e.target.value });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
          >
            <option value="">-- Pilih Modul --</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.name}
              </option>
            ))}
          </select>

          {selectedModuleId && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
            >
              {showForm ? "Batal" : "+ Tambah Sub Modul"}
            </button>
          )}
        </div>

        {showForm && selectedModuleId && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">
              {editingSubModule ? "Edit Sub Modul" : "Tambah Sub Modul Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Nama Sub Modul
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
                  Passing Grade (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passing_grade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passing_grade: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
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

        {selectedModuleId && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Nama</th>
                  <th className="px-6 py-3 text-left">Passing Grade</th>
                  <th className="px-6 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {subModules.map((subModule) => (
                  <tr key={subModule.id} className="border-t">
                    <td className="px-6 py-4">{subModule.name}</td>
                    <td className="px-6 py-4">{subModule.passing_grade}%</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(subModule)}
                        className="text-secondary hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subModule.id)}
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

export default SubModuleManagement;
