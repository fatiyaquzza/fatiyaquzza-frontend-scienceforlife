import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : "http://localhost:5000";

const Dashboard = () => {
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [sortBy, setSortBy] = useState("popular");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load modules and categories
    const fetchData = async () => {
      try {
        const modulesRes = await api.get("/modules");
        setModules(modulesRes.data.modules);
        setFilteredModules(modulesRes.data.modules);

        // Try to fetch categories, if endpoint doesn't exist, continue without it
        try {
          const categoriesRes = await api.get("/categories");
          setCategories(categoriesRes.data.categories || []);
        } catch {
          /* categories endpoint optional */
        }

        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    let result = [...modules];

    // Filter by search query
    if (searchQuery.trim() !== "") {
      result = result.filter(
        (module) =>
          module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (module.description &&
            module.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (category !== "all") {
      result = result.filter(
        (module) => module.category_id === parseInt(category)
      );
    }

    // Sort
    if (sortBy === "popular") {
      result.sort(
        (a, b) =>
          (b.popularity || b.sub_module_count || 0) -
          (a.popularity || a.sub_module_count || 0)
      );
    } else if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
      );
    }

    setFilteredModules(result);
  }, [sortBy, category, searchQuery, modules]);

  const handleResetFilters = () => {
    setSortBy("popular");
    setCategory("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen py-8 pt-24 bg-light">
      <div className="container px-4 mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="inline-block mb-3">
            <span className="text-xs font-semibold tracking-widest uppercase text-secondary">
              Modul
            </span>
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-2xl md:text-4xl text-primary">
            Modul Pembelajaran
          </h1>
          <p className="mb-2 text-sm text-gray-600 sm:text-sm md:text-md">
            Pilih modul yang sesuai dengan kebutuhan pembelajaran Anda dan mulai
            perjalanan belajar yang menyenangkan.
          </p>
        </div>

        {/* Search and Filters Section */}
        <div className="p-6 mb-8 bg-white border shadow-xl rounded-2xl backdrop-blur-sm border-slate-100">
          {/* Search Bar */}
          <div className="mb-6">
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
                placeholder="Cari modul pembelajaran..."
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
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Sort By */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 w-full sm:w-auto">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                Urutkan:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sortBy === "popular"
                      ? "bg-primary text-white shadow-lg shadow-secondary/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Populer
                </button>
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sortBy === "newest"
                      ? "bg-primary text-white shadow-lg shadow-secondary/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Terbaru
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sortBy === "name"
                      ? "bg-primary text-white shadow-lg shadow-secondary/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  A-Z
                </button>
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Kategori:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-2 text-sm font-medium transition-all duration-200 border-none rounded-lg cursor-pointer bg-slate-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary hover:bg-slate-200"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reset Button */}
            {(sortBy !== "popular" ||
              category !== "all" ||
              searchQuery !== "") && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 ml-auto text-sm font-medium transition-all duration-200 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
              >
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Filter
              </button>
            )}
          </div>

          {/* Active Filters Info */}
          {(searchQuery || category !== "all") && (
            <div className="pt-4 mt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium">Filter aktif:</span>
                {searchQuery && (
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 rounded-full text-primary">
                    "{searchQuery}"
                  </span>
                )}
                {category !== "all" && (
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 rounded-full text-primary">
                    {categories.find((c) => c.id === parseInt(category))
                      ?.name || "Kategori"}
                  </span>
                )}
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-primary">
                  {filteredModules.length} modul ditemukan
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modules Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-b-4 rounded-full animate-spin border-primary"></div>
              <p className="font-medium text-slate-600">
                Memuat modul pembelajaran...
              </p>
            </div>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="py-20 text-center">
            <div className="max-w-md mx-auto">
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
                Tidak ada modul ditemukan
              </h3>
              <p className="mb-6 text-slate-600">
                {searchQuery
                  ? "Coba ubah kata kunci pencarian atau filter yang digunakan"
                  : "Belum ada modul tersedia saat ini"}
              </p>
              {(searchQuery || category !== "all") && (
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 font-medium text-white transition-all duration-200 bg-primary rounded-xl hover:shadow-lg hover:shadow-secondary/20"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((module, index) => (
              <Link
                key={module.id}
                to={`/module/${module.id}`}
                className="overflow-hidden transition-all duration-300 transform bg-white border shadow-lg group rounded-2xl hover:shadow-2xl border-slate-100 hover:border-primary hover:-translate-y-1 animate-fade-in-up opacity-0"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Module Image */}
                <div className="relative h-48 overflow-hidden bg-green-100">
                  {module.image_url ? (
                    <img
                      src={`${API_BASE}${module.image_url}`}
                      alt={module.name}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <svg
                        className="w-20 h-20 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/50 to-transparent group-hover:opacity-100"></div>
                </div>

                {/* Module Content */}
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold transition-colors duration-200 text-slate-900 group-hover:text-primary line-clamp-2">
                    {module.name}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-slate-600 line-clamp-3">
                    {module.description ||
                      "Eksplorasi materi pembelajaran yang telah dirancang khusus untuk meningkatkan pemahaman Anda."}
                  </p>

                  {/* Module Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                        <svg
                          className="w-4 h-4 text-primary"
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
                      <span className="font-medium">
                        {module.sub_module_count || 0} Sub Modul
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold transition-all duration-200 text-primary group-hover:gap-3">
                      Mulai Belajar
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
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
