import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const ModuleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [module, setModule] = useState(null);
  const [subModules, setSubModules] = useState([]);
  const [filteredSubModules, setFilteredSubModules] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/modules/${id}`),
      api.get(`/submodules/module/${id}`),
    ])
      .then(([moduleRes, subModulesRes]) => {
        setModule(moduleRes.data.module);
        setSubModules(subModulesRes.data.subModules);
        setFilteredSubModules(subModulesRes.data.subModules);

        // Fetch progress for all sub modules
        if (user) {
          const progressPromises = subModulesRes.data.subModules.map((sm) =>
            api
              .get(`/progress/submodule/${sm.id}`)
              .then((res) => ({ id: sm.id, progress: res.data.progress }))
              .catch(() => ({ id: sm.id, progress: null })),
          );

          Promise.all(progressPromises).then((results) => {
            const map = {};
            results.forEach(({ id, progress }) => {
              map[id] = progress;
            });
            setProgressMap(map);
          });
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, user]);

  // Filter submodules based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSubModules(subModules);
    } else {
      const filtered = subModules.filter(
        (subModule) =>
          subModule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (subModule.description &&
            subModule.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())),
      );
      setFilteredSubModules(filtered);
    }
  }, [searchQuery, subModules]);

  const getStatusBadge = (subModule) => {
    const progress = progressMap[subModule.id];

    if (!progress || !progress.pretest_done) {
      return {
        text: "Belum Dimulai",
        color: "bg-slate-100 text-slate-600 border border-slate-200",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      };
    }

    if (progress.is_passed) {
      return {
        text: "Lulus",
        color: "bg-secondary text-white shadow-lg ",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      };
    }

    if (progress.pretest_done && !progress.postest_done) {
      return {
        text: "Sedang Berjalan",
        color:
          "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-500/30",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
      };
    }

    return {
      text: "Belum Lulus",
      color: "bg-red-500 text-white shadow-lg ",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    };
  };

  const handleSubModuleClick = async (subModuleId) => {
    try {
      const res = await api.get(`/progress/submodule/${subModuleId}`);
      const progress = res.data.progress;

      if (!progress.pretest_done) {
        navigate(`/pretest/${subModuleId}`);
      } else {
        navigate(`/material/${subModuleId}`);
      }
    } catch (error) {
      // If no progress exists, go to pretest
      navigate(`/pretest/${subModuleId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-4 rounded-full animate-spin border-primary"></div>
          <p className="font-medium text-slate-600">Memuat sub modul...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="text-center">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">
            Modul tidak ditemukan
          </h3>
          <p className="mb-6 text-slate-600">
            Modul yang Anda cari tidak tersedia
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 font-medium text-white transition-all duration-200 bg-primary rounded-xl hover:shadow-lg hover:shadow-secondary/20"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 pt-24 bg-light">
      <div className="container px-4 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm">
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
          <span className="font-semibold text-secondary">Sub Modul</span>
        </nav>

        {/* Module Header */}
        <div className="p-8 mb-4 bg-white border shadow-xl rounded-2xl border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900">
                {module.name}
              </h1>
              {module.description && (
                <p className="leading-relaxed text-md text-slate-600 ">
                  {module.description}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="p-3 ml-4 transition-all duration-200 rounded-xl bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-primary"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 mb-4 bg-white border shadow-xl rounded-2xl border-slate-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari sub modul disini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-12 pr-4 text-sm transition-all duration-200 border text-slate-900 placeholder-slate-400 bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-3 text-sm text-slate-600">
              <span className="font-medium">Hasil pencarian:</span>
              <span className="ml-2 font-semibold text-primary">
                {filteredSubModules.length} sub modul ditemukan
              </span>
            </div>
          )}
        </div>

        {/* Sub Modules List */}
        <div className="p-8 bg-white border shadow-xl rounded-2xl border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Daftar Sub Modul
            </h2>
            <span className="px-4 py-2 text-sm font-semibold bg-green-50 text-primary rounded-xl">
              {filteredSubModules.length} dari {subModules.length} sub modul
            </span>
          </div>

          {filteredSubModules.length === 0 ? (
            <div className="py-16 text-center">
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
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                {searchQuery
                  ? "Tidak ada hasil pencarian"
                  : "Belum ada sub modul"}
              </h3>
              <p className="text-slate-600">
                {searchQuery
                  ? "Coba gunakan kata kunci yang berbeda"
                  : "Sub modul belum tersedia untuk modul ini"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubModules.map((subModule, index) => {
                const badge = getStatusBadge(subModule);
                return (
                  <div
                    key={subModule.id}
                    onClick={() => handleSubModuleClick(subModule.id)}
                    className="relative p-6 overflow-hidden transition-all duration-300 border cursor-pointer group rounded-xl border-slate-200 hover:border-primary hover:shadow-xl"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: "fadeInUp 0.5s ease-out forwards",
                      opacity: 0,
                    }}
                  >
                    {/* Background Gradient Effect */}
                    <div className="absolute inset-0 transition-all duration-500 bg-gradient-to-r from-green-50/0 via-green-50/0 to-green-50/0"></div>

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 font-bold text-white shadow-lg bg-primary rounded-xl shadow-secondary/20">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-2 text-xl font-bold transition-colors duration-200 text-slate-900 group-hover:text-primary">
                              {subModule.name}
                            </h3>
                            {subModule.description && (
                              <p className="mb-3 text-sm leading-relaxed text-slate-600">
                                {subModule.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 text-slate-500">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>
                                  Passing Grade:{" "}
                                  <span className="font-semibold text-slate-700">
                                    {subModule.passing_grade}%
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${badge.color} whitespace-nowrap font-semibold text-sm`}
                      >
                        {badge.icon}
                        {badge.text}
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute transition-all duration-300 transform translate-x-2 opacity-0 bottom-6 right-6 text-primary group-hover:opacity-100 group-hover:translate-x-0">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ModuleDetail;
