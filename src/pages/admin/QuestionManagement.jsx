import { useEffect, useState } from "react";
import api from "../../utils/api";
import RichTextEditor from "../../components/RichTextEditor";
import { isEmptyHtml, stripHtml } from "../../utils/contentHtml";
import {
  MAX_QUESTION_OPTIONS,
  defaultQuestionOptions,
  getOptionLabel,
  mapApiOptionsToForm,
  relabelOptions,
} from "../../utils/questionOptions";

const QuestionManagement = () => {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [subModules, setSubModules] = useState([]);
  const [selectedSubModuleId, setSelectedSubModuleId] = useState("");
  const [selectedType, setSelectedType] = useState("pretest");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    sub_module_id: "",
    type: "pretest",
    question_text: "",
    correct_answer: "",
    options: defaultQuestionOptions(),
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/modules").then((res) => {
      setModules(res.data.modules);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedModuleId) {
      api
        .get(`/submodules/module/${selectedModuleId}`)
        .then((res) => setSubModules(res.data.subModules))
        .catch(() => setSubModules([]));
    } else {
      setSubModules([]);
    }
  }, [selectedModuleId]);

  useEffect(() => {
    if (selectedSubModuleId && selectedType) {
      fetchQuestions();
    } else {
      setQuestions([]);
    }
  }, [selectedSubModuleId, selectedType]);

  const fetchQuestions = () => {
    api
      .get(`/questions/submodule/${selectedSubModuleId}/${selectedType}`)
      .then((res) => setQuestions(res.data.questions))
      .catch(() => setQuestions([]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEmptyHtml(formData.question_text)) {
      alert("Pertanyaan tidak boleh kosong");
      return;
    }

    const hasEmptyOption = formData.options.some((opt) => isEmptyHtml(opt.text));
    if (hasEmptyOption) {
      alert("Semua opsi jawaban harus diisi");
      return;
    }

    if (!formData.correct_answer) {
      alert("Pilih kunci jawaban");
      return;
    }

    setSubmitting(true);

    const dataToSend = {
      sub_module_id: formData.sub_module_id,
      type: formData.type,
      question_type: "choice",
      question_text: formData.question_text,
      correct_answer: formData.correct_answer,
      options: relabelOptions(formData.options).map((opt) => ({
        label: opt.label,
        text: opt.text,
      })),
    };

    try {
      if (editingQuestion) {
        await api.put(`/questions/${editingQuestion.id}`, dataToSend);
      } else {
        await api.post("/questions", dataToSend);
      }

      fetchQuestions();
      resetForm();
    } catch (error) {
      const msg = error.response?.data?.message || "Terjadi kesalahan";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    const options = mapApiOptionsToForm(question.options);
    setFormData({
      sub_module_id: question.sub_module_id,
      type: question.type,
      question_text: question.question_text,
      correct_answer: question.correct_answer,
      options,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus soal ini?")) return;

    try {
      await api.delete(`/questions/${id}`);
      fetchQuestions();
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const resetForm = () => {
    setFormData({
      sub_module_id: selectedSubModuleId,
      type: selectedType,
      question_text: "",
      correct_answer: "",
      options: defaultQuestionOptions(),
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const updateOption = (index, text) => {
    const newOptions = [...formData.options];
    newOptions[index].text = text;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length >= MAX_QUESTION_OPTIONS) return;
    const newOptions = relabelOptions([
      ...formData.options,
      { label: getOptionLabel(formData.options.length), text: "" },
    ]);
    setFormData({ ...formData, options: newOptions });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 1) return;

    const removedLabel = formData.options[index].label;
    const newOptions = relabelOptions(
      formData.options.filter((_, i) => i !== index)
    );

    let correct_answer = formData.correct_answer;
    if (correct_answer === removedLabel) {
      correct_answer = "";
    } else {
      const oldIdx = formData.options.findIndex((o) => o.label === correct_answer);
      if (oldIdx > index) {
        correct_answer = getOptionLabel(oldIdx - 1);
      }
    }

    setFormData({ ...formData, options: newOptions, correct_answer });
  };

  return (
    <>
        <h1 className="text-3xl font-bold text-primary mb-8">Manajemen Soal</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Pilih Modul
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => {
                  setSelectedModuleId(e.target.value);
                  setSelectedSubModuleId("");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Pilih Modul --</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Pilih Sub Modul
              </label>
              <select
                value={selectedSubModuleId}
                onChange={(e) => {
                  setSelectedSubModuleId(e.target.value);
                  setFormData({ ...formData, sub_module_id: e.target.value });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                disabled={!selectedModuleId}
              >
                <option value="">-- Pilih Sub Modul --</option>
                {subModules.map((subModule) => (
                  <option key={subModule.id} value={subModule.id}>
                    {subModule.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Tipe Soal
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pretest"
                    checked={selectedType === "pretest"}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setFormData({ ...formData, type: e.target.value });
                    }}
                    className="mr-2"
                  />
                  Pretest
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="postest"
                    checked={selectedType === "postest"}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setFormData({ ...formData, type: e.target.value });
                    }}
                    className="mr-2"
                  />
                  Postest
                </label>
              </div>
            </div>
          </div>

          {selectedSubModuleId && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
            >
              {showForm ? "Batal" : "+ Tambah Soal"}
            </button>
          )}
        </div>

        {showForm && selectedSubModuleId && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">
              {editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Pertanyaan
                </label>
                <RichTextEditor
                  value={formData.question_text}
                  onChange={(html) =>
                    setFormData({ ...formData, question_text: html })
                  }
                  placeholder="Tulis pertanyaan (bisa sertakan gambar, tabel, italic, dll.)"
                />
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="block text-gray-700 font-semibold">
                    Opsi Jawaban ({formData.options.length} opsi)
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    disabled={formData.options.length >= MAX_QUESTION_OPTIONS}
                    className="text-sm bg-secondary text-white px-4 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    + Tambah Opsi
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Minimal 1 opsi. Label otomatis A, B, C, dan seterusnya sesuai urutan.
                </p>
                {formData.options.map((option, index) => (
                  <div
                    key={`option-${index}`}
                    className="mb-4 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">
                        Opsi {option.label}
                      </span>
                      {formData.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Hapus opsi
                        </button>
                      )}
                    </div>
                    <RichTextEditor
                      value={option.text}
                      onChange={(html) => updateOption(index, html)}
                      placeholder={`Opsi ${option.label}`}
                      minHeight={120}
                      compact
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Kunci Jawaban
                </label>
                <select
                  value={formData.correct_answer}
                  onChange={(e) =>
                    setFormData({ ...formData, correct_answer: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">-- Pilih Jawaban --</option>
                  {formData.options.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        )}

        {selectedSubModuleId && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Pertanyaan</th>
                  <th className="px-6 py-3 text-left">Opsi</th>
                  <th className="px-6 py-3 text-left">Tipe</th>
                  <th className="px-6 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id} className="border-t">
                    <td className="px-6 py-4 max-w-xs">
                      {stripHtml(question.question_text, 60)}
                    </td>
                    <td className="px-6 py-4">
                      {question.options?.length || 0} opsi
                    </td>
                    <td className="px-6 py-4">{"Pilihan Ganda"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(question)}
                        className="text-secondary hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="text-red-500 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
};

export default QuestionManagement;
