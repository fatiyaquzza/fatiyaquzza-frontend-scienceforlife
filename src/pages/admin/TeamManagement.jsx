import { useEffect, useState } from "react";
import api from "../../utils/api";
import { resolveAssetUrl } from "../../utils/contentHtml";
import AdminPageHeader from "../../components/AdminPageHeader";

const emptyCategory = { name: "", layout: "grid", sort_order: 0, is_active: true };
const emptyMember = { category_id: "", name: "", role: "", bio: "", sort_order: 0, is_active: true };

const TeamManagement = () => {
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [memberForm, setMemberForm] = useState(emptyMember);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");

  const load = () => api.get("/team/admin?all=1").then((res) => setCategories(res.data.categories));
  useEffect(() => { load().catch(() => setMessage("Data tim belum dapat dimuat. Pastikan migrasi sudah dijalankan.")); }, []);

  const saveCategory = async (event) => {
    event.preventDefault();
    try {
      if (editingCategory) await api.put(`/team/categories/${editingCategory}`, categoryForm);
      else await api.post("/team/categories", categoryForm);
      setCategoryForm(emptyCategory); setEditingCategory(null); setMessage("Kategori tersimpan."); await load();
    } catch (error) { setMessage(error.response?.data?.message || "Kategori gagal disimpan."); }
  };

  const saveMember = async (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(memberForm).forEach(([key, value]) => data.append(key, value));
    if (photo) data.append("photo", photo);
    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (editingMember) await api.put(`/team/members/${editingMember}`, data, config);
      else await api.post("/team/members", data, config);
      setMemberForm(emptyMember); setEditingMember(null); setPhoto(null); setMessage("Anggota tim tersimpan."); await load();
    } catch (error) { setMessage(error.response?.data?.message || "Anggota gagal disimpan."); }
  };

  const remove = async (kind, item) => {
    if (!window.confirm(`Hapus ${kind === "categories" ? "kategori" : "anggota"} “${item.name}”? Tindakan ini tidak dapat dibatalkan.`)) return;
    try { await api.delete(`/team/${kind}/${item.id}`); await load(); }
    catch (error) { setMessage(error.response?.data?.message || "Data gagal dihapus."); }
  };

  return <div className="space-y-8">
    <AdminPageHeader title="Tim Kami" section="Tampilan Situs" description="Kelola kategori, urutan, foto, dan profil yang tampil pada landing page ILMANA." />
    {message && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-primary">{message}</p>}
    <form onSubmit={saveCategory} className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-xl font-bold">{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <input required value={categoryForm.name} onChange={(e) => setCategoryForm({...categoryForm, name:e.target.value})} placeholder="Nama kategori" className="rounded-lg border px-4 py-2" />
        <select value={categoryForm.layout} onChange={(e) => setCategoryForm({...categoryForm, layout:e.target.value})} className="rounded-lg border px-4 py-2"><option value="featured">Unggulan</option><option value="grid">Grid</option></select>
        <input type="number" min="0" value={categoryForm.sort_order} onChange={(e) => setCategoryForm({...categoryForm, sort_order:e.target.value})} className="rounded-lg border px-4 py-2" aria-label="Urutan kategori" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={categoryForm.is_active} onChange={(e) => setCategoryForm({...categoryForm, is_active:e.target.checked})} /> Aktif</label>
      </div>
      <button className="mt-4 min-h-11 w-full rounded-lg bg-primary px-5 py-2 font-semibold text-white sm:w-auto">Simpan Kategori</button>
    </form>

    <form onSubmit={saveMember} className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-xl font-bold">{editingMember ? "Edit Anggota" : "Tambah Anggota"}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <select required value={memberForm.category_id} onChange={(e) => setMemberForm({...memberForm, category_id:e.target.value})} className="rounded-lg border px-4 py-2"><option value="">Pilih kategori</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input required value={memberForm.name} onChange={(e) => setMemberForm({...memberForm, name:e.target.value})} placeholder="Nama" className="rounded-lg border px-4 py-2" />
        <input required value={memberForm.role} onChange={(e) => setMemberForm({...memberForm, role:e.target.value})} placeholder="Jabatan" className="rounded-lg border px-4 py-2" />
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e)=>setPhoto(e.target.files[0])} className="min-w-0 max-w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea value={memberForm.bio} onChange={(e) => setMemberForm({...memberForm, bio:e.target.value})} placeholder="Bio singkat" className="rounded-lg border px-4 py-2 md:col-span-2" />
        <input type="number" min="0" value={memberForm.sort_order} onChange={(e) => setMemberForm({...memberForm, sort_order:e.target.value})} className="rounded-lg border px-4 py-2" aria-label="Urutan anggota" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={memberForm.is_active} onChange={(e) => setMemberForm({...memberForm, is_active:e.target.checked})} /> Aktif</label>
      </div>
      <button className="mt-4 min-h-11 w-full rounded-lg bg-primary px-5 py-2 font-semibold text-white sm:w-auto">Simpan Anggota</button>
    </form>

    {categories.map((category) => <section key={category.id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="break-words text-xl font-bold">{category.name}</h2><p className="text-sm text-slate-500">{category.layout === "featured" ? "Unggulan" : "Grid"} · {category.is_active ? "Aktif" : "Disembunyikan"}</p></div><div className="flex gap-2"><button onClick={()=>{setEditingCategory(category.id);setCategoryForm({name:category.name,layout:category.layout,sort_order:category.sort_order,is_active:category.is_active});}} className="min-h-10 flex-1 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-secondary">Edit</button><button onClick={()=>remove("categories",category)} className="min-h-10 flex-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Hapus</button></div></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{category.members.map((member)=><article key={member.id} className="flex min-w-0 gap-3 rounded-xl border p-3 sm:gap-4 sm:p-4">{member.image_url ? <img src={resolveAssetUrl(member.image_url)} alt={member.name} className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20" /> : <div className="h-16 w-16 shrink-0 rounded-xl bg-emerald-100 sm:h-20 sm:w-20" />}<div className="min-w-0 flex-1"><h3 className="break-words font-bold">{member.name}</h3><p className="break-words text-sm text-primary">{member.role}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{member.bio}</p><div className="mt-2 flex gap-3 text-sm"><button onClick={()=>{setEditingMember(member.id);setMemberForm({category_id:member.category_id,name:member.name,role:member.role,bio:member.bio||"",sort_order:member.sort_order,is_active:member.is_active});}} className="font-semibold text-secondary">Edit</button><button onClick={()=>remove("members",member)} className="font-semibold text-red-600">Hapus</button></div></div></article>)}</div>
    </section>)}
  </div>;
};

export default TeamManagement;
