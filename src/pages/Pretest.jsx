import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const Pretest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/questions/submodule/${id}/pretest`)
      .then((res) => {
        setQuestions(res.data.questions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: parseInt(questionId),
      user_answer: answer,
    }));

    try {
      await api.post("/questions/submit", {
        sub_module_id: parseInt(id),
        test_type: "pretest",
        answers: answerArray,
      });

      navigate(`/material/${id}`);
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan jawaban");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat soal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-8 pt-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-primary mb-8">Pretest</h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Soal {index + 1}
                </h3>
                <p className="text-gray-700 mb-4">{question.question_text}</p>

                {question.question_type === "choice" ? (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center p-3 border border-gray-200 rounded hover:bg-light cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.option_label}
                          checked={answers[question.id] === option.option_label}
                          onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                          }
                          className="mr-3"
                        />
                        <span>
                          {option.option_label}. {option.option_text}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[question.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="4"
                    placeholder="Tulis jawaban Anda di sini..."
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={submitting || questions.length === 0}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Menyimpan..." : "Submit Jawaban"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Pretest;
