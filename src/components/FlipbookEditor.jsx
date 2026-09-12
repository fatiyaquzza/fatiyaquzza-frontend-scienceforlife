import { useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import { ArrowDownToLine, ArrowUpToLine, Copy, Eye, GripHorizontal, ImagePlus, Link2, Minus, MousePointer2, Plus, RotateCcw, Trash2, Youtube } from "lucide-react";
import api from "../utils/api";
import { clamp, extractYouTubeId } from "../utils/materialInteractions";
import { resolveAssetUrl } from "../utils/contentHtml";

pdfjs.GlobalWorkerOptions.workerSrc = `${new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)}?v=20260912`;

const getDomain = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "URL belum valid"; }
};

const makeInteraction = (type, page, index, url = "") => ({
  id: `interaction-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type, page, x: 8 + (index % 5) * 4, y: 8 + (index % 5) * 4,
  width: type === "youtube" ? 46 : 28,
  height: type === "youtube" ? 26 : type === "image" ? 20 : 13,
  url,
  label: type === "youtube" ? "Video pembelajaran" : type === "link" ? "Buka tautan" : "Ilustrasi",
});

const roundGeometry = (value) => Math.round(value * 10) / 10;
const parseDecimal = (value) => Number(String(value).replace(",", "."));

const FlipbookEditor = ({ file, interactions, onChange, onPageCountChange }) => {
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("edit");
  const [draft, setDraft] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const draftRef = useRef(null);

  const displayed = useMemo(() => interactions.map((item) => item.id === draft?.id ? draft : item), [interactions, draft]);
  const pageInteractions = displayed.filter((item) => Number(item.page) === page);
  const selected = displayed.find((item) => item.id === selectedId);
  const commit = (id, patch) => onChange((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));

  const addInteraction = (type, url = "") => {
    const next = makeInteraction(type, page, interactions.length, url);
    onChange((current) => [...current, next]);
    setSelectedId(next.id);
    setMode("edit");
  };

  const beginTransform = (event, item, action) => {
    if (mode !== "edit") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const rect = canvasRef.current.getBoundingClientRect();
    setSelectedId(item.id);
    setDraft({ ...item });
    draftRef.current = { ...item };
    dragRef.current = { pointerId: event.pointerId, action, id: item.id, startX: event.clientX, startY: event.clientY, rect, initial: { x: item.x, y: item.y, width: item.width, height: item.height } };
  };

  const transform = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    const dx = ((event.clientX - drag.startX) / drag.rect.width) * 100;
    const dy = ((event.clientY - drag.startY) / drag.rect.height) * 100;
    const next = { ...drag.initial };
    if (drag.action === "move") {
      next.x = clamp(drag.initial.x + dx, 0, 100 - drag.initial.width);
      next.y = clamp(drag.initial.y + dy, 0, 100 - drag.initial.height);
    } else {
      if (drag.action.includes("e")) next.width = clamp(drag.initial.width + dx, 4, 100 - drag.initial.x);
      if (drag.action.includes("s")) next.height = clamp(drag.initial.height + dy, 4, 100 - drag.initial.y);
      if (drag.action.includes("w")) { next.x = clamp(drag.initial.x + dx, 0, drag.initial.x + drag.initial.width - 4); next.width = drag.initial.width + drag.initial.x - next.x; }
      if (drag.action.includes("n")) { next.y = clamp(drag.initial.y + dy, 0, drag.initial.y + drag.initial.height - 4); next.height = drag.initial.height + drag.initial.y - next.y; }
    }
    setDraft((current) => {
      const updated = current ? { ...current, ...next } : current;
      draftRef.current = updated;
      return updated;
    });
  };

  const endTransform = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const finalDraft = draftRef.current;
    if (finalDraft) commit(drag.id, { x: roundGeometry(finalDraft.x), y: roundGeometry(finalDraft.y), width: roundGeometry(finalDraft.width), height: roundGeometry(finalDraft.height) });
    dragRef.current = null;
    draftRef.current = null;
    setDraft(null);
  };

  const handleKeyDown = (event, item) => {
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!direction || mode !== "edit") return;
    event.preventDefault();
    const step = event.shiftKey ? 2 : 0.5;
    commit(item.id, { x: clamp(item.x + direction[0] * step, 0, 100 - item.width), y: clamp(item.y + direction[1] * step, 0, 100 - item.height) });
  };

  const uploadImage = async (event) => {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;
    if (image.size > 5 * 1024 * 1024) return setError("Ukuran gambar maksimal 5 MB.");
    setUploadingImage(true); setError("");
    try {
      const payload = new FormData(); payload.append("image", image);
      const response = await api.post("/upload-image", payload, { headers: { "Content-Type": "multipart/form-data" } });
      addInteraction("image", response.data.url);
    } catch (uploadError) { setError(uploadError.response?.data?.message || "Gambar tidak dapat diunggah."); }
    finally { setUploadingImage(false); }
  };

  const renderContent = (item) => {
    if (item.type === "image") return <img src={resolveAssetUrl(item.url)} alt={item.label || "Preview gambar"} draggable="false" className="h-full w-full select-none object-contain" />;
    if (item.type === "youtube") {
      const videoId = extractYouTubeId(item.url);
      return videoId ? <iframe src={`https://www.youtube.com/embed/${videoId}?rel=0`} title={item.label || "Video YouTube"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen className={`h-full w-full border-0 ${mode === "edit" ? "pointer-events-none" : "pointer-events-auto"}`} /> : <div className="flex h-full items-center justify-center bg-red-50 px-3 text-center text-xs font-semibold text-red-700">Masukkan URL YouTube yang valid</div>;
    }
    const card = <div className="flex h-full items-center gap-2 bg-emerald-50 px-3 text-left text-primary"><Link2 className="h-4 w-4 shrink-0" /><span className="min-w-0"><strong className="block truncate text-xs">{item.label || "Buka tautan"}</strong><small className="block truncate text-[10px] text-emerald-700">{getDomain(item.url)}</small></span></div>;
    return mode === "preview" && /^https:\/\//i.test(item.url || "") ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="block h-full w-full">{card}</a> : card;
  };

  const updateGeometry = (key, rawValue) => {
    if (!selected) return;
    const value = parseDecimal(rawValue);
    if (!Number.isFinite(value)) return;
    const maxima = { x: 100 - selected.width, y: 100 - selected.height, width: 100 - selected.x, height: 100 - selected.y };
    commit(selected.id, { [key]: roundGeometry(clamp(value, key === "x" || key === "y" ? 0 : 4, maxima[key])) });
  };
  const changeGeometry = (key, delta) => updateGeometry(key, Number(selected?.[key] || 0) + delta);
  const resetGeometry = (kind) => {
    if (!selected) return;
    if (kind === "position") return commit(selected.id, { x: 10, y: 10 });
    commit(selected.id, { width: selected.type === "youtube" ? 46 : 28, height: selected.type === "youtube" ? 26 : selected.type === "image" ? 20 : 13 });
  };
  const duplicate = () => {
    if (!selected) return;
    const copy = { ...selected, id: `interaction-${Date.now()}-copy`, x: clamp(selected.x + 4, 0, 100 - selected.width), y: clamp(selected.y + 4, 0, 100 - selected.height) };
    onChange((current) => [...current, copy]); setSelectedId(copy.id);
  };
  const moveLayer = (toFront) => {
    if (!selected) return;
    onChange((current) => {
      const index = current.findIndex((item) => item.id === selected.id);
      const target = toFront ? current.length - 1 : 0;
      if (index < 0 || index === target) return current;
      const next = [...current]; const [item] = next.splice(index, 1); next.splice(target, 0, item); return next;
    });
  };
  const handles = { nw: "-left-2 -top-2 cursor-nw-resize", ne: "-right-2 -top-2 cursor-ne-resize", sw: "-bottom-2 -left-2 cursor-sw-resize", se: "-bottom-2 -right-2 cursor-se-resize" };

  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#edf2ef]">
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex rounded-lg bg-slate-100 p-1">
        <button type="button" onClick={() => setMode("edit")} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${mode === "edit" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}><MousePointer2 className="h-4 w-4" /> Edit</button>
        <button type="button" onClick={() => { setMode("preview"); setSelectedId(null); }} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${mode === "preview" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}><Eye className="h-4 w-4" /> Preview</button>
      </div>
      <p className="text-sm text-slate-500">{mode === "edit" ? "Pilih elemen, lalu geser atau tarik titik sudutnya." : "Video dan tautan sudah aktif untuk diuji."}</p>
      <div className="ml-auto flex items-center gap-2 text-sm"><label htmlFor="editor-page" className="font-medium text-slate-600">Halaman</label><input id="editor-page" type="number" min="1" max={pageCount || 1} value={page} onChange={(event) => setPage(clamp(Number(event.target.value) || 1, 1, pageCount || 1))} className="w-20 rounded-lg border border-slate-300 px-2 py-1.5" /><span className="text-slate-500">/ {pageCount}</span></div>
    </div>
    {error && <p className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="grid min-h-[46rem] xl:grid-cols-[13rem_minmax(0,1fr)_19rem]">
      <aside className="border-b border-slate-200 bg-white p-4 xl:border-b-0 xl:border-r">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Interaksi</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
          <button type="button" onClick={() => addInteraction("link", "https://")} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50"><Link2 className="h-5 w-5 text-emerald-700" /> Tautan</button>
          <button type="button" onClick={() => addInteraction("youtube", "https://www.youtube.com/watch?v=")} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-red-400 hover:bg-red-50"><Youtube className="h-5 w-5 text-red-600" /> YouTube</button>
          <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50 disabled:opacity-50"><ImagePlus className="h-5 w-5" /> {uploadingImage ? "Mengunggah…" : "Gambar"}</button>
        </div>
        <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={uploadImage} className="hidden" />
        <p className="mt-5 text-xs leading-5 text-slate-500">Elemen baru muncul sedikit bergeser agar tidak bertumpuk. Semua posisi tersimpan relatif terhadap halaman.</p>
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Elemen halaman {page}</p>
          <div className="mt-2 space-y-1">
            {pageInteractions.map((item, index) => <button key={item.id} type="button" onClick={() => { setMode("edit"); setSelectedId(item.id); }} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-medium ${selectedId === item.id ? "bg-emerald-100 text-emerald-900" : "text-slate-600 hover:bg-slate-50"}`}><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-[10px]">{index + 1}</span><span className="truncate">{item.label || item.type}</span></button>)}
            {!pageInteractions.length && <p className="py-2 text-xs text-slate-400">Belum ada elemen.</p>}
          </div>
        </div>
      </aside>
      <main className="flex items-start justify-center overflow-auto bg-[radial-gradient(circle_at_top,#365f54,#163e34_52%,#0b2c24)] p-4 sm:p-7">
        <Document file={file} onLoadSuccess={({ numPages }) => { setPageCount(numPages); onPageCountChange(numPages); setPage((value) => Math.min(value, numPages)); setError(""); }} onLoadError={() => setError("PDF tidak dapat dibaca. Pastikan file tidak rusak atau terkunci.")} loading={<div className="py-24 text-center text-white">Menyiapkan preview PDF…</div>}>
          <div ref={canvasRef} data-editor-page onPointerMove={transform} onPointerUp={endTransform} onPointerCancel={endTransform} className="relative mx-auto aspect-[1/1.414] w-[min(44rem,76vw)] touch-none overflow-hidden bg-white shadow-[0_30px_90px_rgba(0,0,0,.45)]">
            <Page pageNumber={page} width={704} renderAnnotationLayer={false} renderTextLayer className="h-full w-full [&_canvas]:!h-full [&_canvas]:!w-full" />
            <div className="absolute inset-0">{pageInteractions.map((item) => <div key={item.id} onPointerDown={(event) => beginTransform(event, item, "move")} onKeyDown={(event) => handleKeyDown(event, item)} onClick={(event) => { event.stopPropagation(); if (mode === "edit") setSelectedId(item.id); }} role={mode === "edit" ? "button" : undefined} tabIndex={mode === "edit" ? 0 : -1} aria-label={`Edit ${item.label || item.type}`} className={`absolute touch-none overflow-visible border-2 ${mode === "edit" ? "cursor-move select-none" : "border-transparent"} ${selectedId === item.id && mode === "edit" ? "border-amber-400 ring-2 ring-amber-200/80" : mode === "edit" ? "border-emerald-500/70" : ""} bg-white/80`} style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%`, height: `${item.height}%` }}>
              <div className="h-full w-full overflow-hidden">{renderContent(item)}</div>
              {mode === "edit" && selectedId === item.id && <div onPointerDown={(event) => beginTransform(event, item, "move")} className="absolute inset-x-0 top-0 z-10 flex h-7 cursor-grab items-center justify-center gap-1 bg-amber-400/95 px-2 text-[10px] font-bold text-amber-950 active:cursor-grabbing"><GripHorizontal className="h-3.5 w-3.5" /> Geser · tarik sudut untuk ukuran</div>}
              {mode === "edit" && selectedId === item.id && Object.entries(handles).map(([handle, classes]) => <button key={handle} type="button" onPointerDown={(event) => beginTransform(event, item, handle)} aria-label={`Ubah ukuran ${handle}`} className={`absolute z-10 h-5 w-5 rounded-full border-2 border-white bg-amber-400 shadow-md ${classes}`} />)}
            </div>)}</div>
          </div>
        </Document>
      </main>
      <aside className="border-t border-slate-200 bg-white p-4 xl:border-l xl:border-t-0">
        <h3 className="font-semibold text-slate-900">Properti elemen</h3>
        {selected ? <div className="mt-4 space-y-4">
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">{selected.type}</p>
          <label className="block text-sm font-medium text-slate-700">Label<input value={selected.label || ""} onChange={(event) => commit(selected.id, { label: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          {selected.type !== "image" && <label className="block text-sm font-medium text-slate-700">URL {selected.type === "youtube" ? "YouTube" : "HTTPS"}<input type="url" value={selected.url || ""} onChange={(event) => commit(selected.id, { url: event.target.value })} className={`mt-1 w-full rounded-lg border px-3 py-2 ${selected.url && (selected.type === "youtube" ? !extractYouTubeId(selected.url) : !/^https:\/\//i.test(selected.url)) ? "border-red-400 bg-red-50" : "border-slate-300"}`} /></label>}
          <div className="space-y-3">{[["Horizontal", "x"], ["Vertikal", "y"], ["Lebar", "width"], ["Tinggi", "height"]].map(([label, key]) => {
            const min = key === "x" || key === "y" ? 0 : 4;
            const max = key === "x" ? 100 - selected.width : key === "y" ? 100 - selected.height : key === "width" ? 100 - selected.x : 100 - selected.y;
            return <div key={key}><div className="mb-1 flex items-center justify-between"><label htmlFor={`geometry-${key}`} className="text-xs font-semibold text-slate-600">{label}</label><span className="text-[10px] text-slate-400">persen halaman</span></div><input id={`geometry-${key}`} type="range" min={min} max={max} step="0.1" value={roundGeometry(selected[key])} onChange={(event) => updateGeometry(key, event.target.value)} className="w-full accent-emerald-700" /><div className="mt-1 grid grid-cols-[2.25rem_1fr_2.25rem] gap-1"><button type="button" onClick={() => changeGeometry(key, -0.5)} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label={`Kurangi ${label}`}><Minus className="mx-auto h-3.5 w-3.5" /></button><input type="text" inputMode="decimal" value={String(roundGeometry(selected[key])).replace(".", ",")} onChange={(event) => updateGeometry(key, event.target.value)} className="w-full rounded-md border border-slate-300 px-2 text-center text-sm tabular-nums" aria-label={`${label} persen`} /><button type="button" onClick={() => changeGeometry(key, 0.5)} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label={`Tambah ${label}`}><Plus className="mx-auto h-3.5 w-3.5" /></button></div></div>;
          })}</div>
          <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => resetGeometry("position")} className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" /> Reset posisi</button><button type="button" onClick={() => resetGeometry("size")} className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" /> Reset ukuran</button></div>
          <label className="block text-sm font-medium text-slate-700">Halaman<input type="number" min="1" max={pageCount || 1} value={selected.page} onChange={(event) => { const nextPage = clamp(Number(event.target.value) || 1, 1, pageCount || 1); commit(selected.id, { page: nextPage }); setPage(nextPage); }} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={duplicate} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Copy className="h-4 w-4" /> Duplikat</button>
            <button type="button" onClick={() => moveLayer(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ArrowUpToLine className="h-4 w-4" /> Ke depan</button>
            <button type="button" onClick={() => moveLayer(false)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ArrowDownToLine className="h-4 w-4" /> Ke belakang</button>
            <button type="button" onClick={() => { onChange((current) => current.filter((item) => item.id !== selected.id)); setSelectedId(null); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-2 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Hapus</button>
          </div>
        </div> : <p className="mt-3 text-sm leading-6 text-slate-500">Pilih elemen pada halaman untuk mengatur posisi, ukuran, urutan, dan isinya.</p>}
        <div className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">{interactions.length} elemen pada seluruh PDF.</div>
      </aside>
    </div>
  </div>;
};

export default FlipbookEditor;
