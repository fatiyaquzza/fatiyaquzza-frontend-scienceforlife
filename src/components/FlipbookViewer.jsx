import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { resolveAssetUrl } from "../utils/contentHtml";
import { extractYouTubeId, parseInteractions } from "../utils/materialInteractions";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
const PAGE_RATIO = 1.414;

const BookPage = forwardRef(function BookPage({ pageNumber, interactions, pageWidth, isPortrait, onNavigate }, ref) {
  return <article ref={ref} className="flipbook-page overflow-hidden bg-white">
    <div className="relative h-full w-full overflow-hidden bg-white">
      <Page pageNumber={pageNumber} width={pageWidth} renderAnnotationLayer={false} renderTextLayer={false} loading={<div className="h-full animate-pulse bg-slate-100" />} className="h-full w-full [&_canvas]:!h-full [&_canvas]:!w-full" />
      {isPortrait ? <>
        <button type="button" aria-label="Halaman sebelumnya" onClick={() => onNavigate("previous")} className="absolute bottom-10 left-10 top-10 z-10 w-[calc(50%-2.5rem)] cursor-w-resize bg-transparent" />
        <button type="button" aria-label="Halaman berikutnya" onClick={() => onNavigate("next")} className="absolute bottom-10 right-10 top-10 z-10 w-[calc(50%-2.5rem)] cursor-e-resize bg-transparent" />
      </> : <button type="button" aria-label={pageNumber % 2 === 0 ? "Halaman sebelumnya" : "Halaman berikutnya"} onClick={() => onNavigate(pageNumber % 2 === 0 ? "previous" : "next")} className="absolute inset-10 z-10 cursor-pointer bg-transparent" />}
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
  const restorePageRef = useRef(null);
  const zoomBeforeFullscreenRef = useRef(null);
  const bookStateRef = useRef("read");
  const pendingStageSizeRef = useRef(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 1100, height: 760 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookState, setBookState] = useState("read");
  const [error, setError] = useState("");
  const interactions = useMemo(() => parseInteractions(interactionValue), [interactionValue]);
  const resolvedFileUrl = resolveAssetUrl(fileUrl);
  const isPortrait = stageSize.width < 760;
  const fitWidth = Math.max(isFullscreen ? 120 : 220, Math.floor(Math.min(isPortrait ? stageSize.width : (stageSize.width - 16) / 2, stageSize.height / PAGE_RATIO)));
  const pageWidth = Math.round(fitWidth * (isFullscreen ? 1 : zoom));
  const pageHeight = Math.round(pageWidth * PAGE_RATIO);
  const isAnimating = bookState === "flipping" || bookState === "user_fold";
  const commitStageSize = useCallback((next) => setStageSize((current) => {
    if (Math.abs(current.width - next.width) <= 4 && Math.abs(current.height - next.height) <= 4) return current;
    restorePageRef.current = currentPageRef.current;
    return next;
  }), []);
  const navigate = useCallback((direction) => {
    const pageFlip = pageFlipRef.current || bookRef.current?.pageFlip?.();
    if (!pageFlip || ["flipping", "user_fold"].includes(pageFlip.getState?.())) return;
    pageFlip.turnToPage(currentPageRef.current);
    if (direction === "previous") pageFlip.flipPrev("top");
    else pageFlip.flipNext("top");
  }, []);
  const bookPages = useMemo(() => Array.from({ length: pageCount }, (_, index) => (
    <BookPage
      key={index + 1}
      pageNumber={index + 1}
      pageWidth={pageWidth}
      isPortrait={isPortrait}
      onNavigate={navigate}
      interactions={interactions.filter((item) => Number(item.page) === index + 1)}
    />
  )), [interactions, isPortrait, navigate, pageCount, pageWidth]);

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
      if (!fullscreenActive && zoomBeforeFullscreenRef.current !== null) {
        setZoom(zoomBeforeFullscreenRef.current);
        zoomBeforeFullscreenRef.current = null;
      }
      requestAnimationFrame(measure);
    };
    document.addEventListener("fullscreenchange", fullscreen);
    return () => { observer.disconnect(); document.removeEventListener("fullscreenchange", fullscreen); };
  }, [commitStageSize]);

  const flipPrevious = useCallback(() => navigate("previous"), [navigate]);
  const flipNext = useCallback(() => navigate("next"), [navigate]);
  const handleFlip = useCallback((event) => {
    if (restorePageRef.current !== null) return;
    currentPageRef.current = event.data;
    setCurrentPage(event.data);
  }, []);
  const handleInit = useCallback((event) => {
    pageFlipRef.current = event.object;
    const page = restorePageRef.current;
    if (page === null) return;
    restorePageRef.current = null;
    event.object.turnToPage(page);
    currentPageRef.current = page;
    setCurrentPage(page);
  }, []);
  const handleStateChange = useCallback((event) => {
    bookStateRef.current = event.data;
    setBookState(event.data);
    if (event.data === "read" && pendingStageSizeRef.current) {
      const next = pendingStageSizeRef.current;
      pendingStageSizeRef.current = null;
      requestAnimationFrame(() => commitStageSize(next));
    }
  }, [commitStageSize]);
  const toggleFullscreen = async () => {
    restorePageRef.current = currentPageRef.current;
    if (!isFullscreen) zoomBeforeFullscreenRef.current = zoom;
    return isFullscreen ? document.exitFullscreen?.() : viewerRef.current?.requestFullscreen?.();
  };
  const setActualSize = () => setZoom(clampZoom(520 / fitWidth));
  const clampZoom = (value) => Math.min(1.8, Math.max(0.7, value));

  return <section ref={viewerRef} className={`flipbook-viewer overflow-hidden bg-[#062d22] shadow-2xl shadow-emerald-950/20 ${isFullscreen ? "grid h-[100dvh] grid-rows-[auto_minmax(0,1fr)_auto] rounded-none" : "rounded-[1.75rem]"}`}>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-6">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Buku interaktif</p><h2 className="mt-1 text-lg font-semibold">{title}</h2></div>
      <div className="flex flex-wrap items-center justify-end gap-1">
        <button type="button" disabled={isFullscreen} onClick={() => setZoom(1)} className="rounded-lg px-2 py-2 text-xs font-semibold hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40">Fit</button>
        <button type="button" disabled={isFullscreen} onClick={setActualSize} className="rounded-lg px-2 py-2 text-xs font-semibold hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40">100%</button>
        <button type="button" disabled={isFullscreen} onClick={() => setZoom((value) => clampZoom(value - 0.1))} className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Perkecil halaman"><ZoomOut className="h-5 w-5" /></button>
        <button type="button" disabled={isFullscreen} onClick={() => setZoom((value) => clampZoom(value + 0.1))} className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Perbesar halaman"><ZoomIn className="h-5 w-5" /></button>
        <button type="button" disabled={isFullscreen} onClick={() => setZoom(1)} className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Reset zoom"><RotateCcw className="h-4 w-4" /></button>
        <button type="button" onClick={toggleFullscreen} className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300" aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}>{isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}</button>
        <a href={resolvedFileUrl} download target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300" aria-label="Unduh PDF"><Download className="h-5 w-5" /></a>
      </div>
    </header>
    <div ref={stageRef} className={`${isFullscreen ? "h-full min-h-0 overflow-hidden p-2 sm:p-4" : "flipbook-stage--scrollable h-[min(76vh,54rem)] min-h-[34rem] overflow-auto p-3 sm:p-6"} flipbook-stage relative flex items-center justify-center bg-[radial-gradient(circle_at_50%_10%,#426b60_0%,#163f35_42%,#071f19_100%)]`} onKeyDown={(event) => { if (event.key === "ArrowLeft") { event.preventDefault(); flipPrevious(); } if (event.key === "ArrowRight") { event.preventDefault(); flipNext(); } }} tabIndex={0} aria-label="Pembaca buku PDF. Gunakan panah kiri dan kanan untuk berpindah halaman.">
      <div className="relative flex min-h-full min-w-full items-center justify-center" style={{ width: isPortrait ? pageWidth : pageWidth * 2, height: pageHeight }}>
        <Document file={resolvedFileUrl} onLoadSuccess={({ numPages }) => { setPageCount(numPages); setError(""); }} onLoadError={() => setError("PDF tidak dapat dimuat. Gunakan tombol unduh untuk membukanya langsung.")} loading={<div className="rounded-xl bg-white/10 px-6 py-10 text-center text-white">Menyiapkan buku…</div>}>
          {pageCount > 0 && <HTMLFlipBook key={`${isPortrait}-${pageWidth}-${pageHeight}`} ref={bookRef} width={pageWidth} height={pageHeight} size="fixed" startPage={currentPage} drawShadow maxShadowOpacity={0.5} showCover showPageCorners disableFlipByClick clickEventForward mobileScrollSupport usePortrait={isPortrait} swipeDistance={32} flippingTime={900} onFlip={handleFlip} onInit={handleInit} onChangeState={handleStateChange} className="mx-auto drop-shadow-[0_28px_45px_rgba(0,0,0,.5)]">
            {bookPages}
          </HTMLFlipBook>}
        </Document>
        {isAnimating && <div className="absolute inset-0 z-30 cursor-wait" aria-hidden="true" />}
      </div>
    </div>
    {error && <p className="bg-red-950/50 px-4 py-3 text-sm text-red-100">{error}</p>}
    <footer className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-white sm:px-6">
      <button type="button" onClick={flipPrevious} disabled={currentPage === 0 || isAnimating} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-white/10 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Sebelumnya</button>
      <span className="text-sm tabular-nums text-emerald-100">{!pageCount ? "Halaman 0" : !isPortrait && currentPage > 0 && currentPage < pageCount - 1 ? `Halaman ${currentPage + 1}–${Math.min(currentPage + 2, pageCount)} dari ${pageCount}` : `Halaman ${Math.min(currentPage + 1, pageCount)} dari ${pageCount}`}</span>
      <button type="button" onClick={flipNext} disabled={!pageCount || currentPage >= pageCount - 1 || isAnimating} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-white/10 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40">Berikutnya <ChevronRight className="h-4 w-4" /></button>
    </footer>
  </section>;
};

export default FlipbookViewer;
