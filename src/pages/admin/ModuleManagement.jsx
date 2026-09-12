import { useEffect, useState } from "react";
import api from "../../utils/api";
import { AdminTableSkeleton } from "../../components/LoadingStates";
import RichTextEditor from "../../components/RichTextEditor";
import { stripHtml } from "../../utils/contentHtml";
import AdminPageHeader from "../../components/AdminPageHeader";

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

  const handleDelete = async (module) => {
    if (!window.confirm(`Hapus modul “${module.name}”? Data terkait dapat ikut terdampak dan tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      await api.delete(`/modules/${module.id}`);
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

  const openCreateForm = () => {
    setFormData({ name: "", description: "" });
    setImageFile(null);
    setEditingModule(null);
    setShowForm(true);
  };

  return (
    <>
        <AdminPageHeader
          title="Modul"
          section="Konten Pembelajaran · Langkah 1"
          description="Buat wadah utama pembelajaran. Setelah modul tersedia, lanjutkan dengan menambahkan submodul."
          action={<button
            onClick={showForm ? resetForm : openCreateForm}
            className="min-h-11 w-full rounded-xl bg-primary px-5 py-2.5 font-semibold text-white hover:bg-opacity-90 sm:w-auto"
          >
            {showForm ? "Batal" : "+ Tambah Modul"}
          </button>}
        />

        {showForm && (
          <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
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
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) =>
                    setFormData({ ...formData, description: html })
                  }
                  placeholder="Tulis deskripsi modul (paragraf, gambar, tabel, italic, dll.)"
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
                className="min-h-11 w-full rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 sm:w-auto"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <AdminTableSkeleton columns={["Nama", "Deskripsi", "Aksi"]} />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {modules.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">Belum ada modul. Gunakan tombol “Tambah Modul” untuk memulai.</div>
            ) : <>
            <div className="divide-y divide-slate-100 md:hidden">
              {modules.map((module) => (
                <article key={module.id} className="space-y-3 p-4">
                  <div><h2 className="font-bold text-slate-900">{module.name}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{module.description ? stripHtml(module.description, 130) : "Belum ada deskripsi."}</p></div>
                  <p className="text-xs font-semibold text-slate-500">{module.sub_module_count || 0} submodul</p>
                  <div className="flex gap-2"><button onClick={() => handleEdit(module)} className="min-h-10 flex-1 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-primary">Edit</button><button onClick={() => handleDelete(module)} className="min-h-10 flex-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Hapus</button></div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block"><table className="w-full">
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
                    <td className="px-6 py-4 max-w-xs">
                      {module.description
                        ? stripHtml(module.description, 80)
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(module)}
                        className="text-secondary hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(module)}
                        className="text-red-500 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div></>}
          </div>
        )}
    </>
  );
};

export default ModuleManagement;
