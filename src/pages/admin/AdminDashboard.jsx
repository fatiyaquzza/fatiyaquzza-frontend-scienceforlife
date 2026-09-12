import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, CircleDashed, ClipboardCheck, Eye, FileText, Layers, Mail, RotateCcw, Trash2, Users, X } from "lucide-react";
import AdminPageHeader from "../../components/AdminPageHeader";
import api from "../../utils/api";

const steps = [
  ["Modul", "Buat wadah utama pembelajaran.", "/admin/modules", BookOpen],
  ["Submodul", "Tambahkan unit belajar dan nilai kelulusan.", "/admin/submodules", Layers],
  ["Pretest", "Wajib minimal 1 soal agar siswa dapat memulai.", "/admin/questions?type=pretest", ClipboardCheck],
  ["Materi", "Isi materi atau unggah PDF flipbook.", "/admin/materials", FileText],
  ["Posttest", "Wajib minimal 1 soal untuk menyelesaikan alur.", "/admin/questions?type=postest", CheckCircle2],
];

const StatCard = ({ label, value, loading, icon: Icon, tone }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-center justify-between gap-4">
      <div><p className="text-sm font-medium text-slate-500">{label}</p>{loading ? <div className="mt-2 h-9 w-16 animate-pulse rounded-lg bg-slate-200" /> : <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>}</div>
      <span className={`rounded-xl p-3 ${tone}`}><Icon className="h-6 w-6" /></span>
    </div>
  </div>
);

const ReadinessBadge = ({ done, label }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${done ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}{label}
  </span>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalModules: 0, totalSubModules: 0, totalQuestions: 0 });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readinessError, setReadinessError] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackActionId, setFeedbackActionId] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const feedbackDialogRef = useRef(null);
  const closeDialogRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [usersRes, modulesRes] = await Promise.all([api.get("/users"), api.get("/modules")]);
        const users = usersRes.data?.users || [];
        const modules = modulesRes.data?.modules || [];
        const groups = await Promise.all(modules.map(async (module) => ({ module, subModules: (await api.get(`/submodules/module/${module.id}`)).data?.subModules || [] })));
        if (!active) return;
        const nextRows = groups.flatMap(({ module, subModules }) => subModules.length
          ? subModules.map((subModule) => ({ ...subModule, module_id: module.id, module_name: module.name }))
          : [{ id: `empty-${module.id}`, module_id: module.id, module_name: module.name, empty: true }]);
        const realRows = nextRows.filter((row) => !row.empty);
        setRows(nextRows);
        setStats({
          totalUsers: users.length,
          totalModules: modules.length,
          totalSubModules: realRows.length,
          totalQuestions: realRows.reduce((sum, row) => sum + Number(row.pretest_count || 0) + Number(row.postest_count || 0), 0),
        });
      } catch (error) {
        if (active) setReadinessError(error.response?.data?.message || "Status kesiapan belum dapat dimuat.");
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedFeedback) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleDialogKey = (event) => {
      if (event.key === "Escape") {
        setSelectedFeedback(null);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = feedbackDialogRef.current?.querySelectorAll("a[href], button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleDialogKey);
    closeDialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDialogKey);
    };
  }, [selectedFeedback]);

  useEffect(() => {
    api.get("/contact/feedback")
      .then((response) => setFeedback(response.data?.feedback || []))
      .catch((error) => setFeedbackError(error.response?.data?.message || "Gagal memuat data pesan kontak."))
      .finally(() => setFeedbackLoading(false));
  }, []);

  const readyCount = useMemo(() => rows.filter((row) => !row.empty && Number(row.pretest_count) && Number(row.material_count) && Number(row.postest_count)).length, [rows]);
  const nextAction = (row) => {
    const context = `module=${row.module_id}&submodule=${row.id}`;
    if (!Number(row.pretest_count)) return ["Tambah pretest", `/admin/questions?type=pretest&${context}`, "Siswa belum bisa membuka materi."];
    if (!Number(row.material_count)) return ["Tambah materi", `/admin/materials?${context}`, "Pretest siap, tetapi materi belum tersedia."];
    if (!Number(row.postest_count)) return ["Tambah posttest", `/admin/questions?type=postest&${context}`, "Siswa belum bisa menyelesaikan pembelajaran."];
    return ["Kelola materi", `/admin/materials?${context}`, "Alur siswa sudah lengkap."];
  };

  const updateFeedback = async (item) => {
    setFeedbackActionId(item.id);
    try {
      const response = await api.patch(`/contact/feedback/${item.id}/status`, { status: item.status === "done" ? "open" : "done" });
      setFeedback((current) => current.map((entry) => entry.id === item.id ? response.data.feedback : entry));
    } catch { alert("Gagal memperbarui status pesan."); }
    finally { setFeedbackActionId(null); }
  };
  const deleteFeedback = async (item) => {
    if (!window.confirm(`Hapus pesan dari ${item.name}? Tindakan ini tidak dapat dibatalkan.`)) return;
    setFeedbackActionId(item.id);
    try { await api.delete(`/contact/feedback/${item.id}`); setFeedback((current) => current.filter((entry) => entry.id !== item.id)); }
    catch { alert("Gagal menghapus pesan."); }
    finally { setFeedbackActionId(null); }
  };
  const FeedbackActions = ({ item }) => <div className="flex flex-wrap gap-2">
    <button type="button" onClick={() => setSelectedFeedback(item)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"><Eye className="h-3.5 w-3.5" />Lihat detail</button>
    <button type="button" onClick={() => updateFeedback(item)} disabled={feedbackActionId === item.id} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50">{item.status === "done" ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}{item.status === "done" ? "Buka lagi" : "Tandai selesai"}</button>
    <button type="button" onClick={() => deleteFeedback(item)} disabled={feedbackActionId === item.id} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />Hapus</button>
  </div>;

  return <>
    <AdminPageHeader title="Dashboard Admin" description="Pantau kesiapan kelas dan ikuti urutan pengisian agar siswa dapat belajar tanpa terhambat." section="Ringkasan" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Modul" value={stats.totalModules} loading={loading} icon={BookOpen} tone="bg-green-100 text-green-700" />
      <StatCard label="Total Submodul" value={stats.totalSubModules} loading={loading} icon={Layers} tone="bg-emerald-100 text-emerald-700" />
      <StatCard label="Total Soal" value={stats.totalQuestions} loading={loading} icon={ClipboardCheck} tone="bg-blue-100 text-blue-700" />
      <StatCard label="Total Pengguna" value={stats.totalUsers} loading={loading} icon={Users} tone="bg-violet-100 text-violet-700" />
    </div>

    <section className="mt-8 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Urutan menyiapkan kelas</p><h2 className="mt-1 text-xl font-bold text-slate-950">Lengkapi lima langkah berikut</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Admin tetap boleh mengisi secara paralel. Namun siswa baru memperoleh alur lengkap jika pretest, materi, dan posttest tersedia.</p></div>{!loading && <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">{readyCount} submodul siap</span>}</div>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{steps.map(([title, detail, to], index) => <li key={title}><Link to={to} className="group flex h-full gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-400 hover:bg-emerald-50/50"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{index + 1}</span><span><strong className="block text-sm text-slate-900 group-hover:text-primary">{title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span></span></Link></li>)}</ol>
    </section>

    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4 sm:p-6"><h2 className="text-lg font-bold text-slate-950">Kesiapan submodul</h2><p className="mt-1 text-sm text-slate-600">Minimal satu pretest, satu materi, dan satu posttest diperlukan untuk status siap.</p></div>
      {loading ? <div className="p-6 text-sm text-slate-500">Memeriksa kesiapan konten…</div> : readinessError ? <div className="m-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{readinessError}</div> : rows.length === 0 ? <div className="p-8 text-center"><p className="font-semibold text-slate-800">Belum ada modul.</p><Link to="/admin/modules" className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Buat modul pertama</Link></div> : <div className="divide-y divide-slate-100">{rows.map((row) => {
        if (row.empty) return <div key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{row.module_name}</p><p className="mt-1 font-semibold text-slate-800">Belum memiliki submodul</p></div><Link to={`/admin/submodules?module=${row.module_id}`} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Tambah submodul</Link></div>;
        const [label, to, note] = nextAction(row); const ready = Number(row.pretest_count) && Number(row.material_count) && Number(row.postest_count);
        return <article key={row.id} className="p-4 sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{row.module_name}</p><h3 className="mt-1 break-words font-bold text-slate-900">{row.name}</h3><p className={`mt-2 text-sm ${ready ? "text-emerald-700" : "text-amber-700"}`}>{note}</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="flex flex-wrap gap-2"><ReadinessBadge done={Number(row.pretest_count) > 0} label={`Pretest ${row.pretest_count || 0}`} /><ReadinessBadge done={Number(row.material_count) > 0} label={`Materi ${row.material_count || 0}`} /><ReadinessBadge done={Number(row.postest_count) > 0} label={`Posttest ${row.postest_count || 0}`} /></div><Link to={to} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{label}</Link></div></div></article>;
      })}</div>}
    </section>

    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 p-4 sm:p-6"><Mail className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold text-slate-950">Pesan Kontak</h2>{!feedbackLoading && <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{feedback.length}</span>}</div>
      {feedbackLoading ? <div className="p-6 text-sm text-slate-500">Memuat pesan…</div> : feedbackError ? <div className="m-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{feedbackError}</div> : feedback.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">Belum ada pesan dari formulir kontak.</div> : <>
        <div className="divide-y divide-slate-100 md:hidden">{feedback.map((item) => <article key={item.id} className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-bold text-slate-900">{item.name}</h3><a href={`mailto:${item.email}`} className="break-all text-sm text-primary">{item.email}</a></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "done" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{item.status === "done" ? "Selesai" : "Belum selesai"}</span></div><div><p className="text-sm font-semibold text-slate-800">{item.subject || "Tanpa subjek"}</p><p className="mt-1 line-clamp-2 break-words text-sm leading-6 text-slate-600">{item.message}</p></div><FeedbackActions item={item} /></article>)}</div>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px]"><thead><tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">Pengirim</th><th className="px-5 py-3">Pesan</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Kelola</th></tr></thead><tbody className="divide-y divide-slate-100">{feedback.map((item) => <tr key={item.id}><td className="px-5 py-4"><p className="font-semibold text-slate-900">{item.name}</p><a href={`mailto:${item.email}`} className="text-sm text-primary">{item.email}</a></td><td className="max-w-sm px-5 py-4"><p className="font-medium text-slate-800">{item.subject || "Tanpa subjek"}</p><p className="mt-1 truncate text-sm text-slate-500">{item.message}</p></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "done" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{item.status === "done" ? "Selesai" : "Belum selesai"}</span></td><td className="px-5 py-4 text-sm text-slate-500">{item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}</td><td className="px-5 py-4"><FeedbackActions item={item} /></td></tr>)}</tbody></table></div>
      </>}
    </section>
    {selectedFeedback && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedFeedback(null); }}>
      <section ref={feedbackDialogRef} role="dialog" aria-modal="true" aria-labelledby="feedback-dialog-title" className="flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-4 sm:p-6"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Pesan kontak</p><h2 id="feedback-dialog-title" className="mt-1 break-words text-xl font-bold text-slate-950">{selectedFeedback.subject || "Tanpa subjek"}</h2></div><button ref={closeDialogRef} type="button" onClick={() => setSelectedFeedback(null)} aria-label="Tutup detail pesan" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"><X className="h-5 w-5" /></button></header>
        <div className="overflow-y-auto p-4 sm:p-6"><div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pengirim</p><p className="mt-1 font-semibold text-slate-900">{selectedFeedback.name}</p><a href={`mailto:${selectedFeedback.email}`} className="break-all text-sm text-primary hover:underline">{selectedFeedback.email}</a></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Diterima</p><p className="mt-1 text-sm font-medium text-slate-700">{selectedFeedback.created_at ? new Date(selectedFeedback.created_at).toLocaleString("id-ID") : "-"}</p></div></div><p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{selectedFeedback.message}</p></div>
        <footer className="border-t border-slate-100 p-4 sm:p-6"><button type="button" onClick={() => setSelectedFeedback(null)} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0C452A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:w-auto">Tutup</button></footer>
      </section>
    </div>}
  </>;
};

export default AdminDashboard;
