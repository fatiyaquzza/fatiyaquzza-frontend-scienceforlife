import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import { AdminTableSkeleton } from "../../components/LoadingStates";
import AdminPageHeader from "../../components/AdminPageHeader";

const SubModuleManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(searchParams.get("module") || "");
  const [subModules, setSubModules] = useState([]);
  const [subModulesLoading, setSubModulesLoading] = useState(false);
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
      setSubModulesLoading(false);
    }
  }, [selectedModuleId]);

  const fetchSubModules = () => {
    setSubModulesLoading(true);
    api
      .get(`/submodules/module/${selectedModuleId}`)
      .then((res) => setSubModules(res.data.subModules))
      .catch(() => setSubModules([]))
      .finally(() => setSubModulesLoading(false));
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

  const handleDelete = async (subModule) => {
    if (!window.confirm(`Hapus submodul “${subModule.name}”? Materi, soal, dan progress terkait dapat terdampak.`)) return;

    try {
      await api.delete(`/submodules/${subModule.id}`);
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
    <>
        <AdminPageHeader title="Submodul" section="Konten Pembelajaran · Langkah 2" description="Pilih modul, lalu buat unit belajar. Setelahnya, lengkapi pretest sebelum siswa dapat membuka materi." />

        <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Pilih Modul
          </label>
          <select
            value={selectedModuleId}
            onChange={(e) => {
              setSelectedModuleId(e.target.value);
              setSearchParams(e.target.value ? { module: e.target.value } : {});
              setFormData({ ...formData, module_id: e.target.value });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
          >
              <option value="">-- Pilih Modul --</option>
            {loading ? (
              <option value="" disabled>
                Memuat modul...
              </option>
            ) : modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.name}
              </option>
            ))}
          </select>

          {selectedModuleId && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="min-h-11 w-full rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-opacity-90 sm:w-auto"
            >
              {showForm ? "Batal" : "+ Tambah Sub Modul"}
            </button>
          )}
        </div>

        {showForm && selectedModuleId && (
          <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
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
                  Nilai Kelulusan (%)
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
                className="min-h-11 w-full rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 sm:w-auto"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        )}

        {selectedModuleId && subModulesLoading ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <AdminTableSkeleton columns={["Nama", "Nilai Kelulusan", "Aksi"]} />
          </div>
        ) : selectedModuleId ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {subModules.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">Modul ini belum memiliki submodul. Gunakan tombol “Tambah Submodul”.</div> : <>
            <div className="divide-y divide-slate-100 md:hidden">{subModules.map((subModule) => <article key={subModule.id} className="space-y-3 p-4"><div><h2 className="font-bold text-slate-900">{subModule.name}</h2><p className="mt-1 text-sm text-slate-600">Nilai kelulusan {subModule.passing_grade}%</p></div><div className="flex gap-2"><button onClick={() => handleEdit(subModule)} className="min-h-10 flex-1 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-primary">Edit</button><button onClick={() => handleDelete(subModule)} className="min-h-10 flex-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Hapus</button></div></article>)}</div>
            <div className="hidden overflow-x-auto md:block"><table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Nama</th>
                  <th className="px-6 py-3 text-left">Nilai Kelulusan</th>
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
                        onClick={() => handleDelete(subModule)}
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
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-semibold text-slate-800">Pilih modul untuk melihat submodul.</p>{modules.length === 0 && <Link to="/admin/modules" className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Buat modul dahulu</Link>}</div>
        )}
    </>
  );
};

export default SubModuleManagement;
