import { useEffect, useState } from "react";
import api from "../../utils/api";

const MaterialManagement = () => {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [subModules, setSubModules] = useState([]);
  const [selectedSubModuleId, setSelectedSubModuleId] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    sub_module_id: "",
    description: "",
    video_url: "",
  });
  const [fileFile, setFileFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/modules").then((res) => {
      setModules(res.data.modules);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedModuleId) {
      api
        .get(`/submodules/module/${selectedModuleId}`)
        .then((res) => setSubModules(res.data.subModules))
        .catch(() => setSubModules([]));
    } else {
      setSubModules([]);
    }
  }, [selectedModuleId]);

  useEffect(() => {
    if (selectedSubModuleId) {
      fetchMaterials();
    } else {
      setMaterials([]);
    }
  }, [selectedSubModuleId]);

  const fetchMaterials = () => {
    api
      .get(`/materials/submodule/${selectedSubModuleId}`)
      .then((res) => setMaterials(res.data.materials))
      .catch(() => setMaterials([]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("sub_module_id", formData.sub_module_id);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("video_url", formData.video_url);
    if (fileFile) {
      formDataToSend.append("file", fileFile);
    }

    try {
      if (editingMaterial) {
        await api.put(`/materials/${editingMaterial.id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/materials", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      fetchMaterials();
      resetForm();
    } catch (error) {
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      sub_module_id: material.sub_module_id,
      description: material.description || "",
      video_url: material.video_url || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus materi ini?")) return;

    try {
      await api.delete(`/materials/${id}`);
      fetchMaterials();
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const resetForm = () => {
    setFormData({
      sub_module_id: selectedSubModuleId,
      description: "",
      video_url: "",
    });
    setFileFile(null);
    setEditingMaterial(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-light pb-8 pt-28 px-6">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary mb-8">
          Manajemen Materi
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Pilih Modul
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => {
                  setSelectedModuleId(e.target.value);
                  setSelectedSubModuleId("");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              <label className="block text-gray-700 font-semibold mb-2">
                Pilih Sub Modul
              </label>
              <select
                value={selectedSubModuleId}
                onChange={(e) => {
                  setSelectedSubModuleId(e.target.value);
                  setFormData({ ...formData, sub_module_id: e.target.value });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                disabled={!selectedModuleId}
              >
                <option value="">-- Pilih Sub Modul --</option>
                {subModules.map((subModule) => (
                  <option key={subModule.id} value={subModule.id}>
                    {subModule.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedSubModuleId && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
            >
              {showForm ? "Batal" : "+ Tambah Materi"}
            </button>
          )}
        </div>

        {showForm && selectedSubModuleId && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">
              {editingMaterial ? "Edit Materi" : "Tambah Materi Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
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
                  Video URL (YouTube)
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) =>
                    setFormData({ ...formData, video_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  File PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFileFile(e.target.files[0])}
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

        {selectedSubModuleId && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Deskripsi</th>
                  <th className="px-6 py-3 text-left">Video</th>
                  <th className="px-6 py-3 text-left">File</th>
                  <th className="px-6 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id} className="border-t">
                    <td className="px-6 py-4">{material.description || "-"}</td>
                    <td className="px-6 py-4">
                      {material.video_url ? "✓" : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {material.file_url ? "✓" : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(material)}
                        className="text-secondary hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
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

export default MaterialManagement;
