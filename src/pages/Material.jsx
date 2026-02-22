import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const Material = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [subModule, setSubModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/submodules/${id}`),
      api.get(`/materials/submodule/${id}`),
    ])
      .then(([subModuleRes, materialsRes]) => {
        setSubModule(subModuleRes.data.subModule);
        const materials = materialsRes.data.materials;
        if (materials.length > 0) {
          setMaterial(materials[0]); // Get first material
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat materi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="text-secondary hover:underline mb-4"
        >
          ← Kembali
        </button>

        <h1 className="text-3xl font-bold text-primary mb-8">
          {subModule?.name || "Materi"}
        </h1>

        {material ? (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            {material.description && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-3">
                  Deskripsi Materi
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {material.description}
                </p>
              </div>
            )}

            {material.video_url && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-3">
                  Video Pembelajaran
                </h2>
                <div className="aspect-video">
                  {extractVideoId(material.video_url) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${extractVideoId(
                        material.video_url
                      )}`}
                      title="Video pembelajaran"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  ) : (
                    <div className="bg-gray-200 rounded-lg p-8 text-center">
                      <p className="text-gray-500">
                        URL video tidak valid atau tidak dapat dimuat
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {material.file_url && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-3">
                  Materi PDF
                </h2>
                <a
                  href={`http://localhost:5000${material.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-secondary text-white px-6 py-3 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  <span className="mr-2">📄</span>
                  Download PDF
                </a>
              </div>
            )}

            <div className="pt-6 border-t">
              <button
                onClick={() => navigate(`/postest/${id}`)}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Lanjut ke Postest
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-500">Materi belum tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Material;
