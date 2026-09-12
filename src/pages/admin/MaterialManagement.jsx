import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import RichTextEditor from "../../components/RichTextEditor";
import { stripHtml } from "../../utils/contentHtml";
import { AdminTableSkeleton } from "../../components/LoadingStates";
import FlipbookEditor from "../../components/FlipbookEditor";
import { resolveAssetUrl } from "../../utils/contentHtml";
import { parseInteractions } from "../../utils/materialInteractions";
import AdminPageHeader from "../../components/AdminPageHeader";

const emptyReference = () => ({ title: "", href: "" });

const MaterialManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(searchParams.get("module") || "");
  const [subModules, setSubModules] = useState([]);
  const [selectedSubModuleId, setSelectedSubModuleId] = useState(searchParams.get("submodule") || "");
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
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
  const [interactions, setInteractions] = useState([]);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formError, setFormError] = useState("");

  const selectedModule = modules.find((item) => String(item.id) === String(selectedModuleId));
  const selectedSubModule = subModules.find((item) => String(item.id) === String(selectedSubModuleId));
  const isFlipbook = selectedModule?.material_layout !== "legacy";

  const updateContext = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    setSearchParams(next);
  };

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
      setMaterialsLoading(false);
    }
  }, [selectedSubModuleId]);

  const fetchMaterials = () => {
    setMaterialsLoading(true);
    api
      .get(`/materials/submodule/${selectedSubModuleId}`)
      .then((res) => setMaterials(res.data.materials))
      .catch(() => setMaterials([]))
      .finally(() => setMaterialsLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingMaterial && materials.length > 0) {
      alert("Sub modul ini sudah memiliki materi. Hapus materi yang ada terlebih dahulu jika ingin menambahkan yang baru.");
      return;
    }

    if (isFlipbook && !fileFile && !editingMaterial?.file_url) {
      setFormError("PDF wajib dipilih untuk materi flipbook.");
      return;
    }
    setSubmitting(true);
    setFormError("");

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
    formDataToSend.append("interactions", JSON.stringify(isFlipbook ? interactions : []));
    formDataToSend.append("pdf_page_count", String(isFlipbook ? pdfPageCount : 0));
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
      setFormError(error.response?.data?.message || "Terjadi kesalahan saat menyimpan materi.");
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
    setInteractions(parseInteractions(material.interactions_json));
    setPdfPageCount(Number(material.pdf_page_count || 0));
    setPreviewUrl(material.file_url ? resolveAssetUrl(material.file_url) : "");
    setFormError("");
    setShowForm(true);
  };

  const handleDelete = async (material) => {
    if (!window.confirm(`Hapus materi untuk “${selectedSubModule?.name || "submodul ini"}”? File dan pengaturannya tidak dapat dipulihkan dari panel admin.`)) return;

    try {
      await api.delete(`/materials/${material.id}`);
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
    setInteractions([]);
    setPdfPageCount(0);
    setPreviewUrl("");
    setFormError("");
    setEditingMaterial(null);
    setShowForm(false);
  };

  const hasExistingMaterial = materials.length > 0;

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
        <AdminPageHeader title="Materi" section="Konten Pembelajaran · Langkah 4" description="Pilih submodul lalu siapkan materi. Pastikan pretest tersedia agar siswa dapat mencapai halaman materi." />

        <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
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
                  updateContext({ module: e.target.value, submodule: "" });
                  setShowForm(false);
                  setEditingMaterial(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Pilih Sub Modul
              </label>
              <select
                value={selectedSubModuleId}
                onChange={(e) => {
                  setSelectedSubModuleId(e.target.value);
                  updateContext({ submodule: e.target.value });
                  setFormData({ ...formData, sub_module_id: e.target.value });
                  setShowForm(false);
                  setEditingMaterial(null);
                  setFileFile(null);
                  setInteractions([]);
                  setPdfPageCount(0);
                  setPreviewUrl("");
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

          {selectedSubModuleId && Number(selectedSubModule?.pretest_count || 0) === 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-bold">Pretest belum tersedia</p>
              <p className="mt-1 leading-6">Materi tetap dapat disiapkan, tetapi siswa belum bisa membukanya sebelum minimal satu soal pretest dibuat.</p>
              <Link to={`/admin/questions?type=pretest&module=${selectedModuleId}&submodule=${selectedSubModuleId}`} className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-amber-900 px-4 py-2 font-semibold text-white">Tambah pretest</Link>
            </div>
          )}

          {selectedSubModuleId && materialsLoading && (
            <div className="mt-4 h-10 w-36 animate-pulse rounded-lg bg-gray-200">
              <span className="sr-only">Memuat materi...</span>
            </div>
          )}

          {selectedSubModuleId && !materialsLoading && !hasExistingMaterial && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-4 min-h-11 w-full rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-opacity-90 sm:w-auto"
            >
              {showForm ? "Batal" : "+ Tambah Materi"}
            </button>
          )}

          {selectedSubModuleId && !materialsLoading && hasExistingMaterial && !editingMaterial && (
            <p className="mt-4 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-primary">
              Sub modul ini sudah memiliki materi. Hapus materi yang ada terlebih dahulu jika ingin menambahkan materi baru.
            </p>
          )}
        </div>

        {showForm && selectedSubModuleId && (
          <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              {editingMaterial ? "Edit Materi" : "Tambah Materi Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              {!isFlipbook && <div className="mb-4">
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
              </div>}
              {!isFlipbook && <div className="mb-4">
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
              </div>}
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  File PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                      setFormError("Ukuran PDF maksimal 10 MB.");
                      e.target.value = "";
                      return;
                    }
                    setFileFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                    setPdfPageCount(0);
                    setFormError("");
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              {isFlipbook && previewUrl && (
                <div className="mb-6">
                  <FlipbookEditor file={previewUrl} interactions={interactions} onChange={setInteractions} onPageCountChange={setPdfPageCount} />
                </div>
              )}
              {!isFlipbook && <div className="mb-6">
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
              </div>}
              {formError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</p>}
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

        {selectedSubModuleId && materialsLoading ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <AdminTableSkeleton
              columns={["Deskripsi", "Video", "File", "Referensi", "Aksi"]}
              rowCount={3}
            />
          </div>
        ) : selectedSubModuleId ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {materials.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">Belum ada materi untuk submodul ini. Gunakan tombol “Tambah Materi”.</div> : <>
            <div className="divide-y divide-slate-100 md:hidden">{materials.map((material) => <article key={material.id} className="space-y-3 p-4"><div><h2 className="font-bold text-slate-900">Materi {selectedSubModule?.name}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{material.description ? stripHtml(material.description, 120) : material.file_url ? "Materi PDF flipbook" : "Tanpa deskripsi"}</p></div><div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600"><span className="rounded-full bg-slate-100 px-2.5 py-1">PDF: {material.file_url ? "Ada" : "Tidak"}</span><span className="rounded-full bg-slate-100 px-2.5 py-1">Video: {material.video_url ? "Ada" : "Tidak"}</span></div><div className="flex gap-2"><button onClick={() => handleEdit(material)} className="min-h-10 flex-1 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-primary">Edit</button><button onClick={() => handleDelete(material)} className="min-h-10 flex-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Hapus</button></div></article>)}</div>
            <div className="hidden overflow-x-auto md:block"><table className="w-full">
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
                        onClick={() => handleDelete(material)}
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
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-semibold text-slate-800">Pilih modul dan submodul untuk mengelola materi.</p>{modules.length === 0 && <Link to="/admin/modules" className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Buat modul dahulu</Link>}</div>
        )}
    </>
  );
};

export default MaterialManagement;
