import { useEffect, useRef, useState } from 'react';
import api from '../utils/api';

const ChatAI = ({ subModuleId, subModuleName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: userMessage,
        sub_module_id: subModuleId
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.data.message }
      ]);
    } catch (error) {
      setError('AI tidak merespons dengan baik. Silakan coba lagi beberapa saat lagi.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Maaf, terjadi kesalahan saat menghubungi AI. Coba lagi sebentar lagi.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h3 className="text-xl font-bold text-primary mb-4">
        Chat dengan AI - {subModuleName}
      </h3>

      {error && (
        <div className="mb-3 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div
        ref={containerRef}
        className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-light"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">
            Mulai percakapan dengan AI tentang materi ini!
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-300'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block bg-white border border-gray-300 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-500">AI sedang mengetik...</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan sesuatu tentang materi ini..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Kirim
        </button>
      </form>
    </div>
  );
};

export default ChatAI;
