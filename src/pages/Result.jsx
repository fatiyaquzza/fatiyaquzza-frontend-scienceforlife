import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import ChatAI from "../components/ChatAI";

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [subModule, setSubModule] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const score = location.state?.score ?? 0;
  const correctCount = location.state?.correctCount ?? 0;
  const totalQuestions = location.state?.totalQuestions ?? 0;
  const details = location.state?.details ?? [];

  useEffect(() => {
    Promise.all([
      api.get(`/submodules/${id}`),
      api.get(`/progress/submodule/${id}`),
    ])
      .then(([subModuleRes, progressRes]) => {
        setSubModule(subModuleRes.data.subModule);
        setProgress(progressRes.data.progress);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat hasil...</p>
      </div>
    );
  }

  const isPassed =
    progress?.is_passed || score >= (subModule?.passing_grade || 70);

  return (
    <div className="min-h-screen bg-light py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-primary mb-8">Hasil Postest</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Status kelulusan */}
          {isPassed ? (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-secondary mb-4">
                Selamat! Anda Lulus
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Anda telah menyelesaikan materi dengan baik
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-3xl font-bold text-primary mb-4">
                Belum Lulus
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Jangan menyerah! Coba lagi untuk meningkatkan pemahaman Anda
              </p>
            </>
          )}

          {/* Ringkasan nilai */}
          <div className="bg-light rounded-lg p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{score}%</p>
                <p className="text-sm text-gray-600">Nilai</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {correctCount}/{totalQuestions}
                </p>
                <p className="text-sm text-gray-600">Benar</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {subModule?.passing_grade || 70}%
                </p>
                <p className="text-sm text-gray-600">Passing Grade</p>
              </div>
            </div>
          </div>

          {/* Review detail soal & jawaban */}
          {details.length > 0 && (
            <div className="mt-8 text-left">
              <h2 className="text-2xl font-bold text-primary mb-4">
                Review Soal dan Jawaban
              </h2>
              <div className="space-y-6">
                {details.map((item, idx) => {
                  const isCorrect = item.is_correct;
                  return (
                    <div
                      key={item.question_id || idx}
                      className="bg-light rounded-lg p-5 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-primary">
                          Soal {idx + 1}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            isCorrect
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isCorrect ? "Benar" : "Salah"}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-4">{item.question_text}</p>

                      <div className="space-y-2">
                        {item.options?.map((opt) => {
                          const isUserAnswer =
                            item.user_answer &&
                            item.user_answer.toUpperCase() ===
                              opt.option_label.toUpperCase();

                          return (
                            <div
                              key={opt.option_label}
                              className={`flex items-center px-4 py-2 rounded border ${
                                isUserAnswer
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <span className="text-gray-800">
                                <span className="font-semibold mr-1">
                                  {opt.option_label}.
                                </span>
                                {opt.option_text}
                              </span>

                              {isUserAnswer && (
                                <span className="ml-auto text-blue-600 text-xs font-semibold">
                                  Jawaban Anda
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat AI selalu tampil di bawah hasil postest */}
          <div className="mt-10">
            <ChatAI
              subModuleId={parseInt(id)}
              subModuleName={subModule?.name}
            />
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-secondary hover:underline"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
