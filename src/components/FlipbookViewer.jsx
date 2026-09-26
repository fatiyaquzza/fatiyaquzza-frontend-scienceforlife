import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, Minimize2, Volume2, VolumeX, ZoomIn, ZoomOut } from "lucide-react";
import { resolveAssetUrl } from "../utils/contentHtml";
import { extractYouTubeId, parseInteractions } from "../utils/materialInteractions";
import { usePageTurnSound } from "../hooks/usePageTurnSound";

pdfjs.GlobalWorkerOptions.workerSrc = `${new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)}?v=20260912`;

const FALLBACK_PAGE_RATIO = 1.414;
const POINTS_TO_CSS_PIXELS = 4 / 3;
const PORTRAIT_BREAKPOINT = 760;
const PAGE_GAP = 16;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.25;
const SUPERSAMPLE = 1.5;
const RENDER_WIDTH_CAP = 1100;
const RENDER_WIDTH_FLOOR = 420;
const FLIPPING_TIME = 700;
// Strip per-halaman hanya masuk akal untuk dokumen pendek. Di atas batas ini
// Nolnya jadi terlalu rapat untuk diklik, jadi pakai bar progres biasa.
const PAGE_STRIP_MAX = 30;
const FLIP_CORNER_INSET = 4;
const FLIP_DIRECTION_FORWARD = 0;
// Elemen yang harus tetap bisa diklik meski sedang zoom. Dipakai bersama oleh
// fokus panggung, gesture pan, dan blocker lipatan supaya ketigaya memakai
// definisi "interaktif" yang sama dan tidak saling berbeda pendapat.
const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, iframe, video, audio, [data-interactive='true']";
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const trackedPointers = (map) => [...map.values()];

const BookPage = forwardRef(function BookPage({ pageNumber, interactions, renderWidth, isPortrait, onNavigate }, ref) {
  return <article ref={ref} className="flipbook-page overflow-hidden bg-white">
    <div className="relative h-full w-full overflow-hidden bg-white">
      <Page pageNumber={pageNumber} width={renderWidth} renderAnnotationLayer={false} renderTextLayer={false} loading={<div className="h-full animate-pulse bg-slate-100" />} className="h-full w-full [&_canvas]:!h-full [&_canvas]:!w-full" />
      {/* Hot zone sentuh: area tengah halaman, dibiarkan kosong di bagian atas
          supaya sudut lipatan page-flip tetap bisa diambil dengan drag. Kalau
          hot zone menutupi sudut, mousedown mendarat di <button> dan
          checkTarget() miliknya menolak, sehingga drag sudut tidak pernah jalan.
          aria-hidden + tabIndex -1 karena tombol footer sudah menyediakan nama
          yang sama untuk pembaca layar; ini hanya pintasan tetikus/sentuh. */}
      {isPortrait ? <>
        <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => onNavigate("previous")} className="absolute bottom-8 left-8 top-16 z-10 w-[calc(50%-2rem)] cursor-w-resize bg-transparent" />
        <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => onNavigate("next")} className="absolute bottom-8 right-8 top-16 z-10 w-[calc(50%-2rem)] cursor-e-resize bg-transparent" />
      </> : <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => onNavigate(pageNumber % 2 === 0 ? "previous" : "next")} className="absolute inset-x-10 bottom-8 top-16 z-10 cursor-pointer bg-transparent" />}
      <div className="absolute inset-0">{interactions.map((item) => {
        const style = { left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%`, height: `${item.height}%` };
        if (item.type === "image") return <img key={item.id} src={resolveAssetUrl(item.url)} alt={item.label || "Ilustrasi interaktif"} className="absolute object-contain drop-shadow-md" style={style} />;
        if (item.type === "youtube") {
          const videoId = extractYouTubeId(item.url);
          return videoId ? <div key={item.id} className="absolute z-20 overflow-hidden rounded-md bg-black shadow-lg" style={style} data-interactive="true" onMouseDown={(event) => event.stopPropagation()} onMouseUp={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()} onTouchStart={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}><iframe src={`https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1`} title={item.label || "Video pembelajaran"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen className="h-full w-full border-0" /></div> : null;
        }
        return <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" data-interactive="true" className="absolute z-20 flex items-center justify-center gap-1 rounded-md border-2 border-emerald-500/70 bg-emerald-50/90 px-2 text-center text-xs font-semibold text-primary shadow-sm backdrop-blur-sm hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" style={style} onMouseDown={(event) => event.stopPropagation()} onMouseUp={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()} onTouchStart={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}><ExternalLink className="h-3.5 w-3.5 shrink-0" /><span className="line-clamp-2">{item.label || "Buka tautan"}</span></a>;
      })}</div>
    </div>
  </article>;
});

const FlipbookViewer = ({ fileUrl, interactions: interactionValue = [], title = "Materi PDF" }) => {
  const bookRef = useRef(null);
  const pageFlipRef = useRef(null);
  const viewerRef = useRef(null);
  const stageRef = useRef(null);
  const currentPageRef = useRef(0);
  const pageCountRef = useRef(0);
  const restorePageRef = useRef(null);
  const bookStateRef = useRef("read");
  const pendingStageSizeRef = useRef(null);
  const pendingScrollRef = useRef(null);
  const zoomRef = useRef(1);
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);

  const { enabled: soundEnabled, toggle: toggleSound, play: playSound } = usePageTurnSound();

  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 1100, height: 760 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookState, setBookState] = useState("read");
  const [error, setError] = useState("");
  const [pageRatio, setPageRatio] = useState(FALLBACK_PAGE_RATIO);
  const [actualPageWidth, setActualPageWidth] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ from: 0, to: 0 });
  const [isPanning, setIsPanning] = useState(false);
  // Tombol navigasi harus tetap nonaktif sampai PageFlip benar-benar menempel.
  // `pageCount` terisi saat pdf.js selesai membaca dokumen, sedangkan instance
  // PageFlip baru siap beberapa frame kemudian. Di celah itu tombol sudah
  // enabled, tapi navigate() bail out karena getLivePageFlip() null sehingga
  // klik pertama ditelan tanpa efek. Celahnya cuma beberapa ratus milidetik,
  // tapi tetap terasa seperti tombol rusak.
  const [bookReady, setBookReady] = useState(false);

  const interactions = useMemo(() => parseInteractions(interactionValue), [interactionValue]);
  const resolvedFileUrl = resolveAssetUrl(fileUrl);
  const isPortrait = stageSize.width < PORTRAIT_BREAKPOINT;
  const stagePad = stageSize.width < 640 ? 12 : 24;
  const availableWidth = Math.max(0, stageSize.width - stagePad * 2);
  const availableHeight = Math.max(0, stageSize.height - stagePad * 2);
  // Batas tinggi harus menang atas lantai lebar minimum. Di panggung sangat
  // pendek (HP lanskap, jendela 320px) lantai MIN_BOOK_WIDTH memaksa buku
  // lebih tinggi dari panggung sehingga halamannya terpotong dan tidak bisa
  // dibaca. Buku yang kecil tapi utuh jauh lebih baik daripada buku besar
  // yang kepotong.
  const fitWidth = Math.max(0, Math.floor(Math.min(
    isPortrait ? availableWidth : (availableWidth - PAGE_GAP) / 2,
    availableHeight / pageRatio
  )));
  const bookWidth = fitWidth;
  const bookHeight = Math.round(bookWidth * pageRatio);
  const bookSpanWidth = isPortrait ? bookWidth : bookWidth * 2;
  const renderWidth = Math.round(clamp(bookWidth * SUPERSAMPLE, RENDER_WIDTH_FLOOR, RENDER_WIDTH_CAP));
  const panWidth = Math.round(bookSpanWidth * zoom);
  const panHeight = Math.round(bookHeight * zoom);
  const isZoomed = zoom > 1.005;
  const actualScale = actualPageWidth > 0 ? actualPageWidth / bookWidth : 1;
  const zoomPercent = Math.round(zoom * 100);
  const isAnimating = bookState === "flipping" || bookState === "user_fold";
  const canZoomOut = zoom > MIN_ZOOM + 0.005;
  const canZoomIn = zoom < MAX_ZOOM - 0.005;

  pageCountRef.current = pageCount;

  const setZoomValue = useCallback((value) => {
    const next = clamp(value, MIN_ZOOM, MAX_ZOOM);
    zoomRef.current = next;
    setZoom(next);
  }, []);

  const commitStageSize = useCallback((next) => setStageSize((current) => {
    if (Math.abs(current.width - next.width) <= 4 && Math.abs(current.height - next.height) <= 4) return current;
    restorePageRef.current = currentPageRef.current;
    return next;
  }), []);

  const getLivePageFlip = useCallback(() => {
    const attached = bookRef.current?.pageFlip?.() ?? null;
    if (attached) return attached;
    const cached = pageFlipRef.current;
    return cached?.getUI?.()?.getDistElement?.()?.isConnected ? cached : null;
  }, []);

  const syncVisibleRange = useCallback(() => {
    const pageFlip = getLivePageFlip();
    const count = pageCountRef.current;
    if (!pageFlip || !count) return;
    const index = typeof pageFlip.getCurrentPageIndex === "function" ? pageFlip.getCurrentPageIndex() : currentPageRef.current;
    const landscape = typeof pageFlip.getOrientation === "function" ? pageFlip.getOrientation() === "landscape" : !isPortrait;
    const from = clamp(Math.round(index), 0, count - 1);
    const to = landscape && from > 0 && from < count - 1 ? from + 1 : from;
    const next = { from: from + 1, to: to + 1 };
    setVisibleRange(next);
  }, [getLivePageFlip, isPortrait]);

  const navigate = useCallback((direction) => {
    const pageFlip = getLivePageFlip();
    if (!pageFlip) return;
    if (["flipping", "user_fold"].includes(pageFlip.getState?.())) return;

    const collection = pageFlip.getPageCollection?.();
    const rect = pageFlip.getBoundsRect?.();
    const controller = pageFlip.getFlipController?.();
    if (!collection || !rect || !controller) return;

    const spread = collection.getSpread?.() ?? [];
    const spreadIndex = collection.getCurrentSpreadIndex?.() ?? 0;
    const target = direction === "previous" ? spreadIndex - 1 : spreadIndex + 1;
    if (target < 0 || target >= spread.length) return;

    // flipNext/flipPrev punya guard `disableFlipByClick && !isPointOnCorners`
    // yang menolak flip bila titik tidak berada di sudut halaman. flipNext
    // mengirim titik sudut kanan sehingga selalu lolos, tapi flipPrev selalu
    // mengirim {x: 10} hardcoded di tepi kiri elemen buku. Elemen buku selalu
    // selebar 2*pageWidth, bahkan di portrait, jadi di portrait separuh kiri
    // kosong dan titik itu jatuh di tengah -> flipPrev batal tanpa error.
    // Kirim titik sudut yang dihitung relatif terhadap rect yang sedang aktif.
    controller.flip(direction === "previous"
      ? { x: rect.left + FLIP_CORNER_INSET, y: rect.top + FLIP_CORNER_INSET }
      : { x: rect.left + rect.width - FLIP_CORNER_INSET, y: rect.top + FLIP_CORNER_INSET });
  }, [getLivePageFlip]);

  // Lompat ke halaman tertentu (1-based, sesuai angka yang dilihat pengguna).
  // Di landscape satu spread berisi 2 halaman, jadi target dipetakan lewat
  // spread index agar "buka halaman 7" benar-benar menampilkan 7, bukan
  // spread asal. Spread bertetangga tetap dianimasikan, sisanya lompat
  // seketika karena putar berkali-kali akan terasa lambat.
  const goToPage = useCallback((pageNumber) => {
    const pageFlip = getLivePageFlip();
    if (!pageFlip) return;
    const count = pageCountRef.current;
    if (!count) return;
    if (["flipping", "user_fold"].includes(pageFlip.getState?.())) return;
    const target = clamp(Math.round(pageNumber) - 1, 0, count - 1);
    const current = pageFlip.getCurrentPageIndex?.() ?? currentPageRef.current;
    if (target === current) return;

    const collection = pageFlip.getPageCollection?.();
    const spread = collection?.getSpread?.() ?? [];
    const spreadIndex = collection?.getCurrentSpreadIndex?.() ?? 0;
    const anchor = (index) => spread[index]?.[0];
    const forward = anchor(spreadIndex + 1);
    const backward = anchor(spreadIndex - 1);

    restorePageRef.current = null;
    if (target === forward) { navigate("next"); return; }
    if (target === backward) { navigate("previous"); return; }

    // turnToPage memetakan index ke spread yang memuatnya, jadi aman di
    // landscape. Coleksi tetap di-follow supaya indikator ikut sinkron.
    pageFlip.turnToPage(target);
    currentPageRef.current = target;
    setCurrentPage(target);
    syncVisibleRange();
    playSound(target > current ? "next" : "previous");
  }, [getLivePageFlip, navigate, playSound, syncVisibleRange]);

  const bookPages = useMemo(() => Array.from({ length: pageCount }, (_, index) => (
    <BookPage
      key={index + 1}
      pageNumber={index + 1}
      renderWidth={renderWidth}
      isPortrait={isPortrait}
      onNavigate={navigate}
      interactions={interactions.filter((item) => Number(item.page) === index + 1)}
    />
  )), [interactions, isPortrait, navigate, pageCount, renderWidth]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const measure = () => {
      const style = window.getComputedStyle(stage);
      const bounds = stage.getBoundingClientRect();
      const horizontalBorder = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
      const scrollbarGutter = Math.max(0, bounds.width - horizontalBorder - stage.clientWidth);
      const horizontalInset = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + horizontalBorder + scrollbarGutter;
      const verticalInset = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const next = {
        width: Math.max(0, bounds.width - horizontalInset),
        height: Math.max(0, bounds.height - verticalInset)
      };
      if (["fold_corner", "user_fold", "flipping"].includes(bookStateRef.current)) pendingStageSizeRef.current = next;
      else commitStageSize(next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    measure();
    const fullscreen = () => {
      const fullscreenActive = document.fullscreenElement === viewerRef.current;
      setIsFullscreen(fullscreenActive);
      requestAnimationFrame(measure);
    };
    document.addEventListener("fullscreenchange", fullscreen);
    return () => { observer.disconnect(); document.removeEventListener("fullscreenchange", fullscreen); };
  }, [commitStageSize]);

  const applyZoom = useCallback((nextZoom, anchorPoint) => {
    const previous = zoomRef.current;
    const value = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    if (!Number.isFinite(value) || Math.abs(value - previous) < 0.001) return;
    const stage = stageRef.current;
    if (stage && anchorPoint && previous > 0) {
      const bounds = stage.getBoundingClientRect();
      const offsetX = anchorPoint.x - bounds.left - stage.clientLeft;
      const offsetY = anchorPoint.y - bounds.top - stage.clientTop;
      const ratio = value / previous;
      pendingScrollRef.current = {
        left: stagePad + (stage.scrollLeft + offsetX - stagePad) * ratio - offsetX,
        top: stagePad + (stage.scrollTop + offsetY - stagePad) * ratio - offsetY
      };
    }
    setZoomValue(value);
  }, [setZoomValue, stagePad]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const pending = pendingScrollRef.current;
    pendingScrollRef.current = null;
    const maxLeft = Math.max(0, stage.scrollWidth - stage.clientWidth);
    const maxTop = Math.max(0, stage.scrollHeight - stage.clientHeight);
    const left = pending ? pending.left : stage.scrollLeft;
    const top = pending ? pending.top : stage.scrollTop;
    stage.scrollLeft = clamp(left, 0, maxLeft);
    stage.scrollTop = clamp(top, 0, maxTop);
  }, [zoom, panWidth, panHeight]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const onWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      const delta = clamp(event.deltaY * unit, -120, 120);
      applyZoom(zoomRef.current * Math.exp(-delta * 0.0022), { x: event.clientX, y: event.clientY });
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [applyZoom]);

  const stageCenter = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const bounds = stage.getBoundingClientRect();
    return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
  }, []);

  const zoomIn = useCallback(() => applyZoom(zoomRef.current * ZOOM_STEP, stageCenter()), [applyZoom, stageCenter]);
  const zoomOut = useCallback(() => applyZoom(zoomRef.current / ZOOM_STEP, stageCenter()), [applyZoom, stageCenter]);
  const fitToStage = useCallback(() => applyZoom(1, stageCenter()), [applyZoom, stageCenter]);
  const showActualSize = useCallback(() => applyZoom(actualScale, stageCenter()), [applyZoom, actualScale, stageCenter]);

  // Panggung tidak pernah dapat fokus dari klik, padahal aria-label-nya
  // menjanjikan panah kiri/kanan. Tanpa ini, pengguna harus Tab 13x hanya
  // untuk memakai pintasan yang sudah dijanjikan di label itu. Fokus diambil
  // kembali setiap kali area buku diklik, kecuali yang diklik memang kontrol
  // interaktif (tautan, tombol, iframe) supaya tidak mencuri fokus dari sana.
  const handleStageActivate = useCallback((event) => {
    const target = event.target;
    if (target && typeof target.closest === "function" && target.closest(INTERACTIVE_SELECTOR)) return;
    stageRef.current?.focus({ preventScroll: true });
  }, []);

  const handleStageKeyDown = useCallback((event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); navigate("previous"); return; }
    if (event.key === "ArrowRight") { event.preventDefault(); navigate("next"); return; }
    if (event.key === "Home") { event.preventDefault(); goToPage(1); return; }
    if (event.key === "End") { event.preventDefault(); goToPage(pageCount); return; }
    if (event.key === "+" || event.key === "=") { event.preventDefault(); if (pageCount) zoomIn(); return; }
    if (event.key === "-" || event.key === "_") { event.preventDefault(); if (pageCount) zoomOut(); return; }
    if (event.key === "0") { event.preventDefault(); if (pageCount) fitToStage(); }
  }, [fitToStage, goToPage, navigate, pageCount, zoomIn, zoomOut]);

  // Pan attaches to the stage itself, not to a full-size overlay. An overlay
  // always swallows clicks, and the interactive elements inside the PDF
  // (YouTube video, external links) become permanently unclickable the moment
  // the reader is zoomed. With pointer-events-none the overlay is now only a
  // cursor hint, and the stage receives the events directly.
  const handlePanPointerDown = useCallback((event) => {
    if (!isZoomed) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Pointer capture on the stage would keep delivering moves to the stage and
    // starve the iframe underneath, so a gesture that starts on a video or a
    // link is left alone entirely.
    const stack = typeof document.elementsFromPoint === "function"
      ? document.elementsFromPoint(event.clientX, event.clientY)
      : [];
    const onInteractive = stack.some((el) => typeof el.closest === "function" && el.closest(INTERACTIVE_SELECTOR));
    if (onInteractive) return;
    const stage = stageRef.current;
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 1) {
      setIsPanning(true);
      gestureRef.current = { mode: "pan", x: event.clientX, y: event.clientY, left: stage?.scrollLeft ?? 0, top: stage?.scrollTop ?? 0 };
      return;
    }
    if (pointersRef.current.size === 2) {
      const [first, second] = trackedPointers(pointersRef.current);
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      gestureRef.current = { mode: "pinch", distance: distance || 1, zoom: zoomRef.current };
    }
  }, [isZoomed]);

  const handlePanPointerMove = useCallback((event) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    const stage = stageRef.current;
    event.stopPropagation();
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const gesture = gestureRef.current;
    if (!gesture || !stage) return;
    if (gesture.mode === "pan" && pointersRef.current.size === 1) {
      stage.scrollLeft = gesture.left - (event.clientX - gesture.x);
      stage.scrollTop = gesture.top - (event.clientY - gesture.y);
      return;
    }
    if (gesture.mode === "pinch" && pointersRef.current.size === 2) {
      const [first, second] = trackedPointers(pointersRef.current);
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      applyZoom(gesture.zoom * (distance / gesture.distance), { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });
    }
  }, [applyZoom]);

  const handlePanPointerEnd = useCallback((event) => {
    pointersRef.current.delete(event.pointerId);
    const stage = stageRef.current;
    if (pointersRef.current.size === 1) {
      const [only] = trackedPointers(pointersRef.current);
      gestureRef.current = { mode: "pan", x: only.x, y: only.y, left: stage?.scrollLeft ?? 0, top: stage?.scrollTop ?? 0 };
      return;
    }
    gestureRef.current = null;
    if (pointersRef.current.size === 0) setIsPanning(false);
  }, []);

  // page-flip listens for mousedown/touchstart on distElement, and pointerdown
  // fires before mousedown, so stopping propagation from the pan handler is not
  // enough to keep a zoomed drag from folding the page as well. This capture
  // listener sits on the stage, an ancestor of distElement, so it runs first.
  // Corner drag stays available at zoom 1 and is only sacrificed while zoomed,
  // where the whole viewport is already showing a magnified page and panning is
  // what the gesture is expected to do. Taps on interactive content opt out.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !isZoomed) return undefined;
    const block = (event) => {
      const stack = typeof document.elementsFromPoint === "function"
        ? document.elementsFromPoint(event.clientX, event.clientY)
        : [];
      const onInteractive = stack.some((el) => typeof el.closest === "function" && el.closest(INTERACTIVE_SELECTOR));
      if (onInteractive) return;
      event.stopPropagation();
      event.preventDefault();
    };
    stage.addEventListener("mousedown", block, true);
    stage.addEventListener("touchstart", block, true);
    return () => {
      stage.removeEventListener("mousedown", block, true);
      stage.removeEventListener("touchstart", block, true);
    };
  }, [isZoomed]);

  const handleFlip = useCallback((event) => {
    // `event.data` adalah acuan: halaman yang benar-benar sedang tampil, jadi
    // selalu ikut disinkronkan. Dulu flip pertama sesudah resize atau fullscreen
    // dilewati begitu saja untuk "membuang sisa restore", padahal `restorePageRef`
    // hanya benar-benar habis kalau flipbook di-remount (onInit). Kalau ukuran
    // panggung berubah tanpa mengubah bookWidth atau isPortrait, remount tidak
    // terjadi, ref tertinggal, dan flip pengguna berikutnya ikut tertelan ->
    // indikator beku satu halaman padahal halamannya sudah berganti. Di HP
    // address bar yang muncul/hilang hampir selalu memicu resize seperti itu.
    // Jalur restore di handleInit sudah menyetel state-nya sendiri, jadi
    // menyinkronkan ulang di sini hanya idempoten.
    restorePageRef.current = null;
    currentPageRef.current = event.data;
    setCurrentPage(event.data);
    syncVisibleRange();
  }, [syncVisibleRange]);

  const handleInit = useCallback((event) => {
    pageFlipRef.current = event.object;
    setBookReady(true);
    const page = restorePageRef.current;
    if (page !== null) {
      restorePageRef.current = null;
      event.object.turnToPage(page);
      currentPageRef.current = page;
      setCurrentPage(page);
    }
    syncVisibleRange();
  }, [syncVisibleRange]);

  const handleStateChange = useCallback((event) => {
    bookStateRef.current = event.data;
    setBookState(event.data);
    if (event.data === "flipping") {
      const pageFlip = getLivePageFlip();
      const direction = pageFlip?.getFlipController?.()?.getCalculation?.()?.getDirection?.();
      if (direction === 0 || direction === 1) playSound(direction === FLIP_DIRECTION_FORWARD ? "next" : "previous");
      return;
    }
    if (event.data === "read" && pendingStageSizeRef.current) {
      const next = pendingStageSizeRef.current;
      pendingStageSizeRef.current = null;
      requestAnimationFrame(() => commitStageSize(next));
    }
  }, [commitStageSize, getLivePageFlip, playSound]);

  const handleDocumentSuccess = useCallback((pdf) => {
    setPageCount(pdf.numPages);
    setError("");
    pdf.getPage(1)
      .then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        if (!(viewport.width > 0) || !(viewport.height > 0)) return;
        setPageRatio(viewport.height / viewport.width);
        setActualPageWidth(Math.round(viewport.width * POINTS_TO_CSS_PIXELS));
      })
      .catch(() => undefined);
  }, []);

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await document.exitFullscreen?.();
      return;
    }
    // Jangan tandai restore sebelum permintaannya benar-benar jalan. Di iOS
    // Safari requestFullscreen tidak ada untuk elemen biasa, dan di beberapa
    // browser permintaannya ditolak; menandai restore di sini membuat ref
    // tertinggal karena tidak ada remount yang mengonsumsinya.
    if (!viewerRef.current?.requestFullscreen) return;
    try {
      await viewerRef.current.requestFullscreen();
    } catch {
      return;
    }
    restorePageRef.current = currentPageRef.current;
  };

  // Pengaman: kalau `onInit` somehow tidak pernah sampai, tombol tidak boleh
  // terkunci selamanya. Setelah 4 detik kontrol dibuka kembali, jadi kondisi
  // paling buruk kembali ke perilaku lama (klik pertama mungkin ditelan),
  // bukan kontrol yang tidak bisa dipakai.
  useEffect(() => {
    if (bookReady || pageCount === 0) return undefined;
    const timer = setTimeout(() => setBookReady(true), 4000);
    return () => clearTimeout(timer);
  }, [bookReady, pageCount]);

  // Jaga-jaga: bila animasi terputus (resize/remount di tengah flip) page-flip
  // kadang tidak pernah kembali ke state "read". Tanpa ini semua kontrol
  // disabled selamanya karena isAnimating tidak pernah false.
  useEffect(() => {
    if (!isAnimating) return undefined;
    const timer = setTimeout(() => {
      bookStateRef.current = "read";
      setBookState("read");
      if (pendingStageSizeRef.current) {
        const next = pendingStageSizeRef.current;
        pendingStageSizeRef.current = null;
        commitStageSize(next);
      }
    }, FLIPPING_TIME * 3);
    return () => clearTimeout(timer);
  }, [isAnimating, commitStageSize]);

  useEffect(() => () => {
    pointersRef.current.clear();
    gestureRef.current = null;
  }, []);

  const indicator = !pageCount
    ? "Halaman 0"
    : visibleRange.to > visibleRange.from
      ? `Halaman ${visibleRange.from}\u2013${visibleRange.to} dari ${pageCount}`
      : `Halaman ${Math.max(1, visibleRange.from)} dari ${pageCount}`;
  const progress = pageCount ? clamp((visibleRange.to / pageCount) * 100, 0, 100) : 0;
  const iconButton = "flipbook-tool inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/85 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";
  const chipButton = "flipbook-tool inline-flex h-9 min-w-[3.25rem] shrink-0 items-center justify-center rounded-lg px-2 text-xs font-semibold tabular-nums text-emerald-100 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-35";

  return <section ref={viewerRef} className={`flipbook-viewer overflow-hidden bg-[#062d22] shadow-2xl shadow-emerald-950/20 ${isFullscreen ? "grid h-[100dvh] grid-rows-[auto_minmax(0,1fr)_auto]" : "flex max-h-[100dvh] flex-col rounded-[1.75rem]"}`}>
    <header className="flex flex-col gap-3 border-b border-white/10 px-3 py-3 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-emerald-200">Buku interaktif</p>
        <h2 className="mt-1 truncate text-base font-semibold sm:text-lg" title={title}>{title}</h2>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <div className="flex items-center gap-0.5 rounded-xl bg-white/5 p-1">
          <button type="button" onClick={zoomOut} disabled={!pageCount || !canZoomOut} className={iconButton} data-tip="Perkecil (Ctrl + scroll)" aria-label="Perkecil tampilan"><ZoomOut className="h-5 w-5" /></button>
          <button type="button" onClick={fitToStage} disabled={!pageCount} className={chipButton} data-tip="Klik untuk paskan buku ke layar" aria-label={`Zoom ${zoomPercent} persen, klik untuk paskan ke layar`}>{zoomPercent}%</button>
          <button type="button" onClick={zoomIn} disabled={!pageCount || !canZoomIn} className={iconButton} data-tip="Perbesar (Ctrl + scroll)" aria-label="Perbesar tampilan"><ZoomIn className="h-5 w-5" /></button>
          <span className="mx-0.5 h-5 w-px shrink-0 bg-white/15" aria-hidden="true" />
          <button type="button" onClick={fitToStage} disabled={!pageCount || !isZoomed} className="flipbook-tool inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-2.5 text-xs font-semibold text-white/90 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent" data-tip="Paskan buku ke layar" aria-label="Paskan buku ke layar">Fit</button>
          <button type="button" onClick={showActualSize} disabled={!pageCount || Math.abs(zoom - actualScale) < 0.005} className="flipbook-tool inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-2.5 text-xs font-semibold text-white/90 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent" data-tip="Ukuran asli halaman PDF (1:1)" aria-label="Tampilkan ukuran asli halaman">100%</button>
        </div>
        <div className="flex items-center gap-0.5 rounded-xl bg-white/5 p-1">
          <button type="button" onClick={toggleSound} className={iconButton} data-tip={soundEnabled ? "Matikan suara halaman" : "Aktifkan suara halaman"} aria-label={soundEnabled ? "Matikan suara halaman" : "Aktifkan suara halaman"} aria-pressed={soundEnabled}>{soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</button>
          <button type="button" onClick={toggleFullscreen} className={iconButton} data-tip={isFullscreen ? "Keluar layar penuh" : "Layar penuh"} aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}>{isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}</button>
        </div>
      </div>
    </header>
    {/* Panggung punya tinggi ideal lalu boleh menyusut (shrink) di dalam
        wrapper flex yang dibatasi max-h 100dvh. Dengan begitu tinggi krome
        yang tidak konstan ikut dihitung tanpa magic number: header membungkus
        jadi 126-178px tergantung lebar, footer 99px, dan keduanya dijumlahkan
        otomatis oleh flex. Sebelumnya panggung selalu 78dvh sehingga di HP
        320x568 seluruh footer terdorong keluar layar dan tombol navigasi
        tidak bisa disentuh tanpa menggulir halaman. */}
    <div ref={stageRef} role="region" aria-label="Pembaca buku PDF. Gunakan panah kiri dan kanan untuk berpindah halaman, Home dan End untuk lompat ke awal atau akhir, Ctrl plus scroll untuk memperbesar, seret untuk menggeser saat diperbesar." onClick={handleStageActivate} className={`flipbook-stage flex overflow-auto bg-[radial-gradient(circle_at_50%_10%,#426b60_0%,#163f35_42%,#071f19_100%)] ${isFullscreen ? "h-full min-h-0" : "h-[min(78dvh,52rem)] min-h-[8.5rem] shrink"}`} onKeyDown={handleStageKeyDown} onPointerDown={handlePanPointerDown} onPointerMove={handlePanPointerMove} onPointerUp={handlePanPointerEnd} onPointerCancel={handlePanPointerEnd} tabIndex={0}>
      <div className="relative shrink-0" style={{ width: panWidth + stagePad * 2, height: panHeight + stagePad * 2 }}>
        <div className="absolute left-1/2 top-1/2" style={{ width: bookSpanWidth, height: bookHeight, transform: `translate(-50%, -50%) scale(${zoom})` }}>
          <Document file={resolvedFileUrl} className="flex h-full w-full items-center justify-center" onLoadSuccess={handleDocumentSuccess} onLoadError={() => setError("PDF tidak dapat dimuat. Coba muat ulang halaman atau periksa koneksi internet.")} loading={<div className="rounded-xl bg-white/10 px-6 py-10 text-center text-sm text-white">Menyiapkan buku\u2026</div>}>
            {pageCount > 0 && <HTMLFlipBook key={`${isPortrait}-${bookWidth}-${bookHeight}`} ref={bookRef} width={bookWidth} height={bookHeight} size="fixed" startPage={currentPage} drawShadow maxShadowOpacity={0.5} showCover showPageCorners disableFlipByClick clickEventForward mobileScrollSupport usePortrait={isPortrait} swipeDistance={32} flippingTime={FLIPPING_TIME} onFlip={handleFlip} onInit={handleInit} onChangeState={handleStateChange} className="shrink-0 drop-shadow-[0_28px_45px_rgba(0,0,0,.5)]">
              {bookPages}
            </HTMLFlipBook>}
          </Document>
        </div>
        {isZoomed && <div
          className={`pointer-events-none absolute inset-0 z-30 select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
          aria-hidden="true"
        />}
      </div>
    </div>
    {error && <p role="alert" className="border-t border-red-400/20 bg-red-950/60 px-4 py-2.5 text-center text-sm text-red-100">{error}</p>}
    <footer className="border-t border-white/10 px-3 py-3 text-white sm:px-6">
      {pageCount > 0 && (pageCount <= PAGE_STRIP_MAX ? <div className="mb-1 flex items-center gap-1 py-2.5" role="group" aria-label="Pilih halaman">
        {Array.from({ length: pageCount }, (_, index) => {
          const number = index + 1;
          const isActive = number >= visibleRange.from && number <= visibleRange.to;
          const isPast = number < visibleRange.from;
          return <button
            key={number}
            type="button"
            onClick={() => goToPage(number)}
            disabled={isAnimating || !bookReady}
            aria-current={isActive ? "true" : undefined}
            aria-label={`Buka halaman ${number}`}
            title={`Halaman ${number}`}
            /* Bar visualnya tetap 6px, tapi area sentuhnya dkembang lewat
               pseudo-element dan padding baris sehingga tinggi target jadi
               26px (ambang minimum WCAG 2.2 AA) tanpa menutupi tombol
               navigasi di bawahnya. Lebarnya tidak bisa 24px di HP 320px
               karena 30 segmen hanya muat sekitar 9px masing-masing; target
               utama tetap tombol 44px, hot zone, dan drag sudut. */
            className={`relative h-1.5 min-w-[0.375rem] flex-1 rounded-full transition-colors duration-200 after:absolute after:-inset-y-2.5 after:inset-x-0 after:content-[''] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-wait ${isActive ? "bg-emerald-300" : isPast ? "bg-emerald-500/45 hover:bg-emerald-400/70" : "bg-white/15 hover:bg-white/35"}`} />;
        })}
      </div> : <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div className="h-full rounded-full bg-emerald-400 transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>)}
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => navigate("previous")} disabled={!pageCount || !bookReady || currentPage <= 0 || isAnimating} className="flipbook-tool flipbook-tool--up inline-flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-white/10 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent" data-tip="Halaman sebelumnya (panah kiri)" aria-label="Ke halaman sebelumnya"><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Sebelumnya</span></button>
        <span className="min-w-0 truncate text-center text-xs tabular-nums text-emerald-100 sm:text-sm" aria-live="polite">{indicator}</span>
        <button type="button" onClick={() => navigate("next")} disabled={!pageCount || !bookReady || currentPage >= pageCount - 1 || isAnimating} className="flipbook-tool flipbook-tool--up inline-flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-white/10 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent" data-tip="Halaman berikutnya (panah kanan)" aria-label="Ke halaman berikutnya"><span className="hidden sm:inline">Berikutnya</span><ChevronRight className="h-4 w-4" /></button>
      </div>
    </footer>
  </section>;
};

export default FlipbookViewer;
