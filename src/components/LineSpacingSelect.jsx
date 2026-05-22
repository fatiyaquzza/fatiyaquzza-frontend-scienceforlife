import { LINE_SPACING_OPTIONS, useLineSpacing } from "../context/LineSpacingContext";

const LineSpacingSelect = ({ className = "", compact = false }) => {
  const { lineSpacing, setLineSpacing } = useLineSpacing();

  return (
    <label
      className={`inline-flex items-center gap-2 text-sm text-gray-700 ${className}`.trim()}
      title="Spasi baris teks"
    >
      {!compact && (
        <span className="text-xs font-semibold text-gray-500 shrink-0">Spasi:</span>
      )}
      <select
        value={lineSpacing}
        onChange={(e) => setLineSpacing(e.target.value)}
        className={`border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5"
        }`}
        aria-label="Spasi baris"
      >
        {LINE_SPACING_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LineSpacingSelect;
