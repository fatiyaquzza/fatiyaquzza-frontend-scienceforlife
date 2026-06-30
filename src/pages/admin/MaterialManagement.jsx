import { useEffect, useState } from "react";
import api from "../../utils/api";
import RichTextEditor from "../../components/RichTextEditor";
import { stripHtml } from "../../utils/contentHtml";

const emptyReference = () => ({ title: "", href: "" });

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
    reference_links: [emptyReference()],
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
    formDataToSend.append(
      "reference_links",
      JSON.stringify(
        formData.reference_links.filter((item) => item.title.trim() && item.href.trim())
      )
    );
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
    let referenceLinks = [emptyReference()];
    try {
      const parsed = JSON.parse(material.references_json || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        referenceLinks = parsed.map((item) => ({
          title: item.title || "",
          href: item.href || "",
        }));
      }
    } catch {}

    setEditingMaterial(material);
    setFormData({
      sub_module_id: material.sub_module_id,
      description: material.description || "",
      video_url: material.video_url || "",
      reference_links: referenceLinks,
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
      reference_links: [emptyReference()],
    });
    setFileFile(null);
    setEditingMaterial(null);
    setShowForm(false);
  };

  const updateReference = (index, key, value) => {
    const next = [...formData.reference_links];
    next[index] = { ...next[index], [key]: value };
    setFormData({ ...formData, reference_links: next });
  };

  const addReference = () => {
    setFormData({
      ...formData,
      reference_links: [...formData.reference_links, emptyReference()],
    });
  };

  const removeReference = (index) => {
    const next = formData.reference_links.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      reference_links: next.length > 0 ? next : [emptyReference()],
    });
  };

  return (
    <>
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
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) =>
                    setFormData({ ...formData, description: html })
                  }
                  placeholder="Tulis deskripsi materi (paragraf, gambar, tabel, italic, dll.)"
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
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-gray-700 font-semibold">
                    Referensi Awal
                  </label>
                  <button
                    type="button"
                    onClick={addReference}
                    className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                  >
                    + Tambah Referensi
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.reference_links.map((item, index) => (
                    <div
                      key={`reference-${index}`}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-700">
                          Referensi {index + 1}
                        </p>
                        {formData.reference_links.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeReference(index)}
                            className="text-sm font-medium text-red-500 hover:underline"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            updateReference(index, "title", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-2"
                          placeholder="Judul referensi"
                        />
                        <input
                          type="url"
                          value={item.href}
                          onChange={(e) =>
                            updateReference(index, "href", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-2"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
                  <th className="px-6 py-3 text-left">Referensi</th>
                  <th className="px-6 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id} className="border-t">
                    <td className="px-6 py-4 max-w-xs">
                      {material.description
                        ? stripHtml(material.description, 60)
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {material.video_url ? "Ya" : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {material.file_url ? "Ya" : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        try {
                          const parsed = JSON.parse(material.references_json || "[]");
                          return Array.isArray(parsed) && parsed.length > 0
                            ? `${parsed.length} item`
                            : "-";
                        } catch {
                          return "-";
                        }
                      })()}
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
    </>
  );
};

export default MaterialManagement;
