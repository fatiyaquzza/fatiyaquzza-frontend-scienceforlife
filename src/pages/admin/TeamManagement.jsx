import { useEffect, useState } from "react";
import api from "../../utils/api";
import { resolveAssetUrl } from "../../utils/contentHtml";

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

  const remove = async (kind, id) => {
    if (!window.confirm("Hapus data ini?")) return;
    try { await api.delete(`/team/${kind}/${id}`); await load(); }
    catch (error) { setMessage(error.response?.data?.message || "Data gagal dihapus."); }
  };

  return <div className="space-y-8">
    <h1 className="text-3xl font-bold text-primary">Manajemen Tim Kami</h1>
    {message && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-primary">{message}</p>}
    <form onSubmit={saveCategory} className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <input required value={categoryForm.name} onChange={(e) => setCategoryForm({...categoryForm, name:e.target.value})} placeholder="Nama kategori" className="rounded-lg border px-4 py-2" />
        <select value={categoryForm.layout} onChange={(e) => setCategoryForm({...categoryForm, layout:e.target.value})} className="rounded-lg border px-4 py-2"><option value="featured">Unggulan</option><option value="grid">Grid</option></select>
        <input type="number" min="0" value={categoryForm.sort_order} onChange={(e) => setCategoryForm({...categoryForm, sort_order:e.target.value})} className="rounded-lg border px-4 py-2" aria-label="Urutan kategori" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={categoryForm.is_active} onChange={(e) => setCategoryForm({...categoryForm, is_active:e.target.checked})} /> Aktif</label>
      </div>
      <button className="mt-4 rounded-lg bg-primary px-5 py-2 font-semibold text-white">Simpan Kategori</button>
    </form>

    <form onSubmit={saveMember} className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">{editingMember ? "Edit Anggota" : "Tambah Anggota"}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <select required value={memberForm.category_id} onChange={(e) => setMemberForm({...memberForm, category_id:e.target.value})} className="rounded-lg border px-4 py-2"><option value="">Pilih kategori</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input required value={memberForm.name} onChange={(e) => setMemberForm({...memberForm, name:e.target.value})} placeholder="Nama" className="rounded-lg border px-4 py-2" />
        <input required value={memberForm.role} onChange={(e) => setMemberForm({...memberForm, role:e.target.value})} placeholder="Jabatan" className="rounded-lg border px-4 py-2" />
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e)=>setPhoto(e.target.files[0])} className="rounded-lg border px-4 py-2" />
        <textarea value={memberForm.bio} onChange={(e) => setMemberForm({...memberForm, bio:e.target.value})} placeholder="Bio singkat" className="rounded-lg border px-4 py-2 md:col-span-2" />
        <input type="number" min="0" value={memberForm.sort_order} onChange={(e) => setMemberForm({...memberForm, sort_order:e.target.value})} className="rounded-lg border px-4 py-2" aria-label="Urutan anggota" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={memberForm.is_active} onChange={(e) => setMemberForm({...memberForm, is_active:e.target.checked})} /> Aktif</label>
      </div>
      <button className="mt-4 rounded-lg bg-primary px-5 py-2 font-semibold text-white">Simpan Anggota</button>
    </form>

    {categories.map((category) => <section key={category.id} className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{category.name}</h2><p className="text-sm text-slate-500">{category.layout === "featured" ? "Unggulan" : "Grid"} · {category.is_active ? "Aktif" : "Disembunyikan"}</p></div><div className="space-x-3"><button onClick={()=>{setEditingCategory(category.id);setCategoryForm({name:category.name,layout:category.layout,sort_order:category.sort_order,is_active:category.is_active});}} className="text-secondary">Edit</button><button onClick={()=>remove("categories",category.id)} className="text-red-600">Hapus</button></div></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{category.members.map((member)=><article key={member.id} className="flex gap-4 rounded-xl border p-4">{member.image_url ? <img src={resolveAssetUrl(member.image_url)} alt={member.name} className="h-20 w-20 rounded-xl object-cover" /> : <div className="h-20 w-20 rounded-xl bg-emerald-100" />}<div className="min-w-0 flex-1"><h3 className="font-bold">{member.name}</h3><p className="text-sm text-primary">{member.role}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{member.bio}</p><div className="mt-2 space-x-3 text-sm"><button onClick={()=>{setEditingMember(member.id);setMemberForm({category_id:member.category_id,name:member.name,role:member.role,bio:member.bio||"",sort_order:member.sort_order,is_active:member.is_active});}} className="text-secondary">Edit</button><button onClick={()=>remove("members",member.id)} className="text-red-600">Hapus</button></div></div></article>)}</div>
    </section>)}
  </div>;
};

export default TeamManagement;
