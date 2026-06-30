import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import HtmlContent from "../components/HtmlContent";
import LineSpacingSelect from "../components/LineSpacingSelect";
import { resolveAssetUrl } from "../utils/contentHtml";

const Material = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [subModule, setSubModule] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/submodules/${id}`),
      api.get(`/materials/submodule/${id}`),
    ])
      .then(([subModuleRes, materialsRes]) => {
        const sub = subModuleRes.data.subModule;
        setSubModule(sub);
        const materials = materialsRes.data.materials;
        if (materials.length > 0) {
          setMaterial(materials[0]);
        }
        if (sub?.module_id) {
          api
            .get(`/modules/${sub.module_id}`)
            .then((res) => setModule(res.data.module))
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const extractVideoId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const moduleId = subModule?.module_id;
  const referenceLinks = (() => {
    try {
      const parsed = JSON.parse(material?.references_json || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item?.title && item?.href) : [];
    } catch {
      return [];
    }
  })();
  const successIndicators = [
    `Memahami konsep inti pada ${subModule?.name || "materi ini"}.`,
    `Mampu mengaitkan materi ${module?.name || "ILMANA"} dengan konteks kehidupan sehari-hari.`,
    `Mencapai nilai minimal ${subModule?.passing_grade || 70}% pada postest.`,
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-4 rounded-full animate-spin border-primary"></div>
          <p className="font-medium text-slate-600">Memuat materi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 pt-20 pb-10 sm:py-8 sm:pt-24 bg-light">
      <div className="container px-3 mx-auto sm:px-4 max-w-7xl">
        {/* Breadcrumb: Modul > Sub Modul > Materi */}
        <nav className="flex flex-wrap items-center gap-2 pb-2 mb-6 -mx-1 overflow-x-auto text-xs md:mb-8 sm:text-sm">
          <button
            onClick={() => navigate("/dashboard")}
            className="font-medium transition-colors text-slate-600 hover:text-primary"
          >
            Modul
          </button>
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <button
            onClick={() => moduleId && navigate(`/module/${moduleId}`)}
            className={`font-medium transition-colors ${
              moduleId
                ? "text-slate-600 hover:text-primary"
                : "text-slate-500 cursor-default"
            }`}
          >
            Sub Modul
          </button>
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="font-semibold text-secondary">Materi</span>
        </nav>

        {/* Materi Header Card */}
        <div className="p-4 mb-4 bg-white border shadow-xl sm:p-8 rounded-2xl border-slate-100">
          <h1 className="text-xl font-bold tracking-tight break-words sm:text-3xl md:text-4xl text-slate-900">
            {subModule?.name || "Materi"}
          </h1>
          {module?.name && (
            <p className="mt-2 text-sm break-words sm:text-base text-slate-600">
              {module.name}
            </p>
          )}
        </div>

        <div className="mb-4 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              Alur Belajar Materi
            </p>
            <div className="mt-4 space-y-3">
              {[
                "Baca tujuan dan fokus materi.",
                "Pelajari penjelasan utama, gambar, video, dan PDF pendukung.",
                "Lanjut ke postest untuk mengukur pemahaman akhir.",
              ].map((item, index) => (
                <div key={item} className="rounded-xl bg-light px-4 py-3 text-sm text-slate-700">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              Indikator Keberhasilan
            </p>
            <div className="mt-4 space-y-3">
              {successIndicators.map((item) => (
                <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {material ? (
          <div className="space-y-4">
            {/* Deskripsi Materi */}
            {material.description && (
              <div className="p-4 bg-white border shadow-xl sm:p-8 rounded-2xl border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl font-bold sm:text-2xl text-slate-900">
                    Deskripsi Materi
                  </h2>
                  <LineSpacingSelect />
                </div>
                <HtmlContent
                  html={material.description}
                  className="text-slate-700"
                />
              </div>
            )}

            {/* Video Pembelajaran */}
            {material.video_url && (
              <div className="p-4 bg-white border shadow-xl sm:p-8 rounded-2xl border-slate-100">
                <h2 className="mb-4 text-xl font-bold sm:text-2xl text-slate-900">
                  Video Pembelajaran
                </h2>
                <div className="overflow-hidden rounded-xl aspect-video">
                  {extractVideoId(material.video_url) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${extractVideoId(
                        material.video_url,
                      )}`}
                      title="Video pembelajaran"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-slate-100">
                      <p className="text-slate-500">
                        URL video tidak valid atau tidak dapat dimuat
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Materi PDF */}
            {material.file_url && (
              <div className="p-4 bg-white border shadow-xl sm:p-8 rounded-2xl border-slate-100">
                <h2 className="mb-4 text-xl font-bold sm:text-2xl text-slate-900">
                  Materi PDF
                </h2>
                {(() => {
                  const href = resolveAssetUrl(material.file_url);

                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center justify-center break-words px-5 py-3 font-semibold text-white transition-all rounded-xl bg-secondary hover:shadow-lg hover:shadow-secondary/30"
                    >
                      Download PDF
                    </a>
                  );
                })()}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[1fr,0.9fr]">
              <div className="p-4 bg-white border shadow-xl sm:p-8 rounded-2xl border-slate-100">
                <h2 className="mb-4 text-xl font-bold sm:text-2xl text-slate-900">
                  Refleksi Belajar
                </h2>
                <div className="space-y-3">
                  {[
                    `Apa konsep paling penting dari ${subModule?.name || "materi ini"}?`,
                    "Bagian mana yang paling dekat dengan pengalaman sehari-hari Anda?",
                    "Apa yang masih perlu diperdalam sebelum lanjut ke postest?",
                  ].map((item) => (
                    <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              {referenceLinks.length > 0 && (
                <div className="p-4 bg-white border shadow-xl sm:p-8 rounded-2xl border-slate-100">
                  <h2 className="mb-4 text-xl font-bold sm:text-2xl text-slate-900">
                    Referensi Awal
                  </h2>
                  <div className="space-y-3">
                    {referenceLinks.map((item, index) => (
                      <a
                        key={`${item.title}-${index}`}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA: Lanjut ke Postest */}
            <div className="p-4 bg-white border shadow-xl sm:p-8 rounded-2xl border-slate-100">
              <button
                onClick={() => navigate(`/postest/${id}`)}
                className="w-full py-3 font-semibold text-white transition-all rounded-xl bg-primary hover:bg-opacity-90 hover:shadow-lg"
              >
                Lanjut ke Postest
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white border shadow-xl sm:p-16 rounded-2xl border-slate-100">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              Materi belum tersedia
            </h3>
            <p className="mb-6 text-slate-600">
              Materi untuk sub modul ini belum diunggah
            </p>
            <button
              onClick={() => moduleId && navigate(`/module/${moduleId}`)}
              className="px-6 py-3 font-medium text-white transition-all rounded-xl bg-primary hover:shadow-lg"
            >
              Kembali ke Sub Modul
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Material;
