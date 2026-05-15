import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ImagePlus,
} from "lucide-react";
import api from "../utils/api";
import { getAssetBaseUrl } from "../utils/contentHtml";
import ResizableImage from "./tiptap/ResizableImage";

const ToolbarButton = ({ onClick, active, disabled, title, children, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`px-2 py-1 text-sm rounded border transition-colors flex items-center justify-center gap-1 ${
      active
        ? "bg-primary text-white border-primary"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
  >
    {children}
  </button>
);

const IMAGE_WIDTH_PRESETS = [
  { label: "25%", value: "25%" },
  { label: "50%", value: "50%" },
  { label: "75%", value: "75%" },
  { label: "100%", value: "100%" },
];

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Tulis konten di sini...",
  minHeight = 200,
  compact = false,
}) => {
  const fileInputRef = useRef(null);
  const isInternalUpdate = useRef(false);
  const [customWidth, setCustomWidth] = useState("");
  const [, forceToolbarUpdate] = useState(0);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const baseUrl = getAssetBaseUrl();
    return `${baseUrl}${res.data.url}`;
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => {
      isInternalUpdate.current = true;
      onChange?.(ed.getHTML());
    },
    onSelectionUpdate: () => forceToolbarUpdate((n) => n + 1),
    editorProps: {
      attributes: {
        class: "rich-text-editor-content focus:outline-none px-4 py-3",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next && !isInternalUpdate.current) {
      editor.commands.setContent(next, false);
    }
    isInternalUpdate.current = false;
  }, [value, editor]);

  useEffect(() => {
    if (!editor?.isActive("image")) {
      setCustomWidth("");
      return;
    }
    const attrs = editor.getAttributes("image");
    setCustomWidth(attrs.width ? String(attrs.width).replace(/px$/, "") : "");
  }, [editor?.state.selection, editor]);

  const handleImageSelect = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      e.target.value = "";

      try {
        const url = await uploadImage(file);
        editor
          .chain()
          .focus()
          .setImage({ src: url, width: "100%", alignment: "left" })
          .run();
      } catch {
        alert("Gagal mengunggah gambar. Pastikan format JPG/PNG/WebP/GIF dan maks. 5MB.");
      }
    },
    [editor]
  );

  const setImageWidth = (width) => {
    if (!editor?.isActive("image")) return;
    editor.chain().focus().updateAttributes("image", { width }).run();
    setCustomWidth(String(width).replace(/%|px/g, ""));
  };

  const setImageAlignment = (alignment) => {
    if (!editor?.isActive("image")) return;
    editor.chain().focus().updateAttributes("image", { alignment }).run();
  };

  const applyCustomWidth = () => {
    if (!editor?.isActive("image") || !customWidth.trim()) return;
    const raw = customWidth.trim();
    const width = /^\d+$/.test(raw) ? `${raw}px` : raw;
    setImageWidth(width);
  };

  if (!editor) return null;

  const btn = (opts) => <ToolbarButton {...opts} />;
  const imageActive = editor.isActive("image");
  const imageAttrs = imageActive ? editor.getAttributes("image") : {};

  return (
    <div className="rich-text-editor border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div
        className={`flex flex-wrap gap-1 ${compact ? "p-2" : "p-3"} bg-gray-50 border-b border-gray-200`}
      >
        {btn({
          title: "Bold",
          onClick: () => editor.chain().focus().toggleBold().run(),
          active: editor.isActive("bold"),
          children: <strong>B</strong>,
        })}
        {btn({
          title: "Italic",
          onClick: () => editor.chain().focus().toggleItalic().run(),
          active: editor.isActive("italic"),
          children: <em>I</em>,
        })}
        {btn({
          title: "Underline",
          onClick: () => editor.chain().focus().toggleUnderline().run(),
          active: editor.isActive("underline"),
          children: <u>U</u>,
        })}

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {btn({
          title: "Heading 1",
          onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          active: editor.isActive("heading", { level: 1 }),
          children: "H1",
        })}
        {btn({
          title: "Heading 2",
          onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          active: editor.isActive("heading", { level: 2 }),
          children: "H2",
        })}
        {btn({
          title: "Heading 3",
          onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          active: editor.isActive("heading", { level: 3 }),
          children: "H3",
        })}

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {btn({
          title: "Bullet list",
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          active: editor.isActive("bulletList"),
          children: "• List",
        })}
        {btn({
          title: "Numbered list",
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          active: editor.isActive("orderedList"),
          children: "1. List",
        })}

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <span className="text-xs font-semibold text-gray-500 self-center px-1">
          Rata:
        </span>
        {btn({
          title: "Rata kiri",
          onClick: () => editor.chain().focus().setTextAlign("left").run(),
          active: editor.isActive({ textAlign: "left" }),
          children: (
            <>
              <AlignLeft size={16} />
              <span className="hidden sm:inline">Kiri</span>
            </>
          ),
        })}
        {btn({
          title: "Rata tengah",
          onClick: () => editor.chain().focus().setTextAlign("center").run(),
          active: editor.isActive({ textAlign: "center" }),
          children: (
            <>
              <AlignCenter size={16} />
              <span className="hidden sm:inline">Tengah</span>
            </>
          ),
        })}
        {btn({
          title: "Rata kanan",
          onClick: () => editor.chain().focus().setTextAlign("right").run(),
          active: editor.isActive({ textAlign: "right" }),
          children: (
            <>
              <AlignRight size={16} />
              <span className="hidden sm:inline">Kanan</span>
            </>
          ),
        })}
        {btn({
          title: "Rata kiri-kanan (justify)",
          onClick: () => editor.chain().focus().setTextAlign("justify").run(),
          active: editor.isActive({ textAlign: "justify" }),
          children: (
            <>
              <AlignJustify size={16} />
              <span className="hidden sm:inline">Rata</span>
            </>
          ),
        })}

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {btn({
          title: "Insert table",
          onClick: () =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
          children: "Table",
        })}
        {btn({
          title: "Add row",
          onClick: () => editor.chain().focus().addRowAfter().run(),
          disabled: !editor.can().addRowAfter(),
          children: "+Row",
        })}
        {btn({
          title: "Delete row",
          onClick: () => editor.chain().focus().deleteRow().run(),
          disabled: !editor.can().deleteRow(),
          children: "-Row",
        })}
        {btn({
          title: "Add column",
          onClick: () => editor.chain().focus().addColumnAfter().run(),
          disabled: !editor.can().addColumnAfter(),
          children: "+Col",
        })}
        {btn({
          title: "Delete column",
          onClick: () => editor.chain().focus().deleteColumn().run(),
          disabled: !editor.can().deleteColumn(),
          children: "-Col",
        })}
        {btn({
          title: "Delete table",
          onClick: () => editor.chain().focus().deleteTable().run(),
          disabled: !editor.can().deleteTable(),
          children: "Del Tbl",
        })}

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {btn({
          title: "Sisipkan gambar",
          onClick: () => fileInputRef.current?.click(),
          children: (
            <>
              <ImagePlus size={16} />
              <span className="hidden sm:inline">Gambar</span>
            </>
          ),
        })}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImageSelect}
        />

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {btn({
          title: "Undo",
          onClick: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().undo(),
          children: "↶",
        })}
        {btn({
          title: "Redo",
          onClick: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().redo(),
          children: "↷",
        })}
      </div>

      {imageActive && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100 text-sm">
          <span className="font-semibold text-primary shrink-0">Gambar:</span>
          <span className="text-gray-600 shrink-0">Ukuran</span>
          {IMAGE_WIDTH_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setImageWidth(preset.value)}
              className={`px-2 py-0.5 rounded border text-xs ${
                imageAttrs.width === preset.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyCustomWidth()}
              placeholder="px atau %"
              className="w-20 px-2 py-0.5 text-xs border border-gray-300 rounded"
            />
            <button
              type="button"
              onClick={applyCustomWidth}
              className="px-2 py-0.5 text-xs bg-secondary text-white rounded hover:opacity-90"
            >
              Terapkan
            </button>
          </div>
          <span className="w-px h-5 bg-gray-300" />
          <span className="text-gray-600 shrink-0">Posisi</span>
          {[
            { label: "Kiri", value: "left", Icon: AlignLeft },
            { label: "Tengah", value: "center", Icon: AlignCenter },
            { label: "Kanan", value: "right", Icon: AlignRight },
          ].map(({ label, value, Icon }) => (
            <button
              key={value}
              type="button"
              title={`Gambar ${label.toLowerCase()}`}
              onClick={() => setImageAlignment(value)}
              className={`p-1 rounded border ${
                (imageAttrs.alignment || "left") === value
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      )}

      <div style={{ minHeight: `${minHeight}px` }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
