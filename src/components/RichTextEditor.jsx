import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { mergeAttributes } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ImagePlus,
} from "lucide-react";
import api from "../utils/api";
import LineSpacingSelect from "./LineSpacingSelect";
import {
  persistContentHtml,
  resolveAssetUrl,
  resolveContentHtml,
} from "../utils/contentHtml";
import ResizableImage from "./tiptap/ResizableImage";
import { useLineSpacing } from "../context/LineSpacingContext";

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

const withCellColors = (Extension, tag) =>
  Extension.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        backgroundColor: {
          default: null,
          parseHTML: (element) => element.style.backgroundColor || null,
        },
        textColor: {
          default: null,
          parseHTML: (element) => element.style.color || null,
        },
      };
    },
    renderHTML({ HTMLAttributes }) {
      const { backgroundColor, textColor, style, ...rest } = HTMLAttributes;
      const styles = [
        style,
        backgroundColor ? `background-color: ${backgroundColor}` : "",
        textColor ? `color: ${textColor}` : "",
      ]
        .filter(Boolean)
        .join("; ");

      return [tag, mergeAttributes(rest, styles ? { style: styles } : {}), 0];
    },
  });

const ColoredTableCell = withCellColors(TableCell, "td");
const ColoredTableHeader = withCellColors(TableHeader, "th");

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
  const { lineSpacing } = useLineSpacing();

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return resolveAssetUrl(res.data.url);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      ColoredTableHeader,
      ColoredTableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: resolveContentHtml(value || ""),
    onUpdate: ({ editor: ed }) => {
      isInternalUpdate.current = true;
      onChange?.(persistContentHtml(ed.getHTML()));
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
    const next = resolveContentHtml(value || "");
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
  const tableCellActive =
    editor.isActive("tableCell") || editor.isActive("tableHeader");
  const cellType = editor.isActive("tableHeader") ? "tableHeader" : "tableCell";
  const cellAttrs = tableCellActive ? editor.getAttributes(cellType) : {};
  const inTable = editor.isActive("table");
  const supportsHeaderRow = typeof editor.commands.toggleHeaderRow === "function";
  const supportsMergeCells = typeof editor.commands.mergeCells === "function";
  const supportsSplitCell = typeof editor.commands.splitCell === "function";
  const setCellColor = (attr, value) => {
    if (!tableCellActive) return;
    editor.chain().focus().updateAttributes(cellType, { [attr]: value }).run();
  };

  return (
    <div className="rich-text-editor border border-gray-300 rounded-lg overflow-visible bg-white">
      <div className="sticky top-20 z-20 border-b border-gray-200 bg-gray-50">
        <div
          className={`flex flex-wrap gap-1 ${compact ? "p-2" : "p-3"}`}
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
          {btn({
            title: "Subscript",
            onClick: () => editor.chain().focus().toggleSubscript().run(),
            active: editor.isActive("subscript"),
            children: (
              <span>
                X<sub className="text-[0.65em] leading-none">2</sub>
              </span>
            ),
          })}
          {btn({
            title: "Superscript",
            onClick: () => editor.chain().focus().toggleSuperscript().run(),
            active: editor.isActive("superscript"),
            children: (
              <span>
                X<sup className="text-[0.65em] leading-none">2</sup>
              </span>
            ),
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
            children: "List",
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
            title: "Sisipkan tabel",
            onClick: () =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run(),
            children: "Tabel",
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
            children: "Undo",
          })}
          {btn({
            title: "Redo",
            onClick: () => editor.chain().focus().redo().run(),
            disabled: !editor.can().redo(),
            children: "Redo",
          })}

          <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

          <LineSpacingSelect compact />
        </div>

        {inTable && (
          <div className="flex flex-wrap items-center gap-2 border-t border-emerald-100 bg-emerald-50 px-3 py-2 text-sm">
            <span className="font-semibold text-primary shrink-0">Tabel:</span>
            {btn({
              title: "Tambah baris atas",
              onClick: () => editor.chain().focus().addRowBefore().run(),
              disabled: !editor.can().addRowBefore(),
              children: "+ Baris Atas",
              className: "text-xs",
            })}
            {btn({
              title: "Tambah baris bawah",
              onClick: () => editor.chain().focus().addRowAfter().run(),
              disabled: !editor.can().addRowAfter(),
              children: "+ Baris Bawah",
              className: "text-xs",
            })}
            {btn({
              title: "Tambah kolom kiri",
              onClick: () => editor.chain().focus().addColumnBefore().run(),
              disabled: !editor.can().addColumnBefore(),
              children: "+ Kolom Kiri",
              className: "text-xs",
            })}
            {btn({
              title: "Tambah kolom kanan",
              onClick: () => editor.chain().focus().addColumnAfter().run(),
              disabled: !editor.can().addColumnAfter(),
              children: "+ Kolom Kanan",
              className: "text-xs",
            })}
            {btn({
              title: "Hapus baris",
              onClick: () => editor.chain().focus().deleteRow().run(),
              disabled: !editor.can().deleteRow(),
              children: "Hapus Baris",
              className: "text-xs",
            })}
            {btn({
              title: "Hapus kolom",
              onClick: () => editor.chain().focus().deleteColumn().run(),
              disabled: !editor.can().deleteColumn(),
              children: "Hapus Kolom",
              className: "text-xs",
            })}
            {supportsHeaderRow &&
              btn({
                title: "Aktif/nonaktif header",
                onClick: () => editor.chain().focus().toggleHeaderRow().run(),
                disabled: !editor.can().toggleHeaderRow(),
                children: "Header",
                className: "text-xs",
              })}
            {supportsMergeCells &&
              btn({
                title: "Gabung sel",
                onClick: () => editor.chain().focus().mergeCells().run(),
                disabled: !editor.can().mergeCells(),
                children: "Gabung Sel",
                className: "text-xs",
              })}
            {supportsSplitCell &&
              btn({
                title: "Pisah sel",
                onClick: () => editor.chain().focus().splitCell().run(),
                disabled: !editor.can().splitCell(),
                children: "Pisah Sel",
                className: "text-xs",
              })}
            {btn({
              title: "Hapus tabel",
              onClick: () => editor.chain().focus().deleteTable().run(),
              disabled: !editor.can().deleteTable(),
              children: "Hapus Tabel",
              className: "text-xs",
            })}
            {tableCellActive && (
              <>
                <span className="h-5 w-px bg-emerald-200" />
                <label className="flex items-center gap-1 text-gray-600">
                  Background
                  <input
                    type="color"
                    value={cellAttrs.backgroundColor || "#ffffff"}
                    onChange={(e) => setCellColor("backgroundColor", e.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border border-gray-300 bg-white"
                  />
                </label>
                <label className="flex items-center gap-1 text-gray-600">
                  Teks
                  <input
                    type="color"
                    value={cellAttrs.textColor || "#111827"}
                    onChange={(e) => setCellColor("textColor", e.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border border-gray-300 bg-white"
                  />
                </label>
              </>
            )}
          </div>
        )}

        {imageActive && (
          <div className="flex flex-wrap items-center gap-2 border-t border-blue-100 bg-blue-50 px-3 py-2 text-sm">
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
      </div>

      <div
        className="overflow-x-auto"
        style={{ minHeight: `${minHeight}px`, lineHeight: lineSpacing }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
