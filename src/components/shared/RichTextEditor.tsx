"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Eye,
  FileCode,
  Undo2,
  Redo2,
  RemoveFormatting,
  Palette,
  Minus,
  X,
  FileText,
} from "lucide-react";

export interface TemplateOption {
  label: string;
  icon?: string;
  templateHtml: string;
}

export interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  sublabel?: string;
  badge?: string;
  placeholder?: string;
  minHeight?: string;
  icon?: React.ReactNode;
  templates?: TemplateOption[];
  showTemplates?: boolean;
}

const COLOR_PALETTE = [
  { name: "Default", color: "inherit" },
  { name: "Primary Green", color: "#003820" },
  { name: "Emerald", color: "#10b981" },
  { name: "Blue", color: "#2563eb" },
  { name: "Purple", color: "#7c3aed" },
  { name: "Amber", color: "#d97706" },
  { name: "Rose", color: "#e11d48" },
  { name: "Dark Slate", color: "#334155" },
];

const DEFAULT_TEMPLATES: TemplateOption[] = [
  {
    label: "⭐ Key Highlights Card",
    templateHtml: `
      <div class="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-2">Key Highlights</h3>
        <ul class="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          <li>✅ <strong>Premium Build:</strong> Engineered with high durability and sleek finish.</li>
          <li>✅ <strong>Superior Performance:</strong> High responsiveness and efficiency.</li>
          <li>✅ <strong>Ergonomic Design:</strong> Crafted for effortless everyday usage.</li>
        </ul>
      </div>
    `,
  },
  {
    label: "💡 Highlight Callout Box",
    templateHtml: `
      <div class="my-4 p-4 rounded-xl border-l-4 border-primary bg-primary/5 text-slate-800 dark:text-slate-200 text-xs">
        <p class="font-bold text-sm text-primary mb-1">💡 Important Note</p>
        <p>Follow manufacturer guidelines for optimal performance and long service life.</p>
      </div>
    `,
  },
  {
    label: "✔️ Checkmark Feature List",
    templateHtml: `
      <div class="my-3 space-y-1.5 text-xs">
        <p class="font-bold text-slate-900 dark:text-white">Product Advantages:</p>
        <p>✔️ 100% Genuine & Brand New</p>
        <p>✔️ QC Tested & Certified</p>
        <p>✔️ Fast Nationwide Delivery</p>
      </div>
    `,
  },
  {
    label: "📊 Technical Specs Table",
    templateHtml: `
      <table class="w-full my-4 border-collapse border border-slate-200 dark:border-slate-800 text-xs">
        <thead>
          <tr class="bg-slate-100 dark:bg-slate-800/80">
            <th class="border border-slate-200 dark:border-slate-800 p-2.5 text-left font-bold text-slate-800 dark:text-slate-200">Specification</th>
            <th class="border border-slate-200 dark:border-slate-800 p-2.5 text-left font-bold text-slate-800 dark:text-slate-200">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 font-medium">Model / Version</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100">Standard Edition</td>
          </tr>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 font-medium">Material</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100">Premium Grade Composite</td>
          </tr>
        </tbody>
      </table>
    `,
  },
  {
    label: "🛡️ Warranty & Service Policy",
    templateHtml: `
      <div class="my-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-2">
        <h4 class="font-bold text-emerald-700 dark:text-emerald-400 text-sm">🛡️ Warranty Coverage: 1 Year Official Replacement</h4>
        <p class="text-slate-700 dark:text-slate-300">Enjoy 7 Days replacement guarantee for manufacturer defects. Keep original packaging and invoice intact for hassle-free claim.</p>
      </div>
    `,
  },
  {
    label: "📦 What's in the Box",
    templateHtml: `
      <div class="my-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">📦 Package Contents:</h4>
        <ul class="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <li>1x Main Product Unit</li>
          <li>1x Standard Accessories Kit</li>
          <li>1x Official User Guide & Warranty Certificate</li>
        </ul>
      </div>
    `,
  },
];

export default function RichTextEditor({
  value,
  onChange,
  label,
  sublabel,
  badge = "HTML Formatted",
  placeholder = "Write content here...",
  minHeight = "240px",
  icon,
  templates = DEFAULT_TEMPLATES,
  showTemplates = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorTab, setEditorTab] = useState<"visual" | "code" | "preview">("visual");
  const [rawHtml, setRawHtml] = useState(value || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const isUpdatingFromProps = useRef(false);

  // Sync value from props to editor
  useEffect(() => {
    if (editorRef.current && editorTab === "visual") {
      if (editorRef.current.innerHTML !== (value || "")) {
        isUpdatingFromProps.current = true;
        editorRef.current.innerHTML = value || "";
        isUpdatingFromProps.current = false;
      }
    }
    setRawHtml(value || "");
  }, [value, editorTab]);

  const handleEditorInput = useCallback(() => {
    if (isUpdatingFromProps.current) return;
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setRawHtml(html);
      onChange(html);
    }
  }, [onChange]);

  const exec = (command: string, val: string | undefined = undefined) => {
    if (editorTab !== "visual") return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleEditorInput();
  };

  const handleFormatBlock = (tag: string) => {
    exec("formatBlock", tag);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    const url =
      linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
        ? linkUrl
        : `https://${linkUrl}`;

    if (linkText.trim()) {
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-semibold">${linkText}</a>`;
      exec("insertHTML", linkHtml);
    } else {
      exec("createLink", url);
    }

    setLinkUrl("");
    setLinkText("");
    setShowLinkModal(false);
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    const imgHtml = `<figure class="my-4 text-center"><img src="${imageUrl}" alt="${imageAlt || "Product image"}" class="max-w-full h-auto rounded-xl mx-auto shadow-sm border border-slate-200 dark:border-slate-800" />${imageAlt ? `<figcaption class="text-xs text-muted-foreground mt-1.5 italic">${imageAlt}</figcaption>` : ""}</figure>`;
    exec("insertHTML", imgHtml);
    setImageUrl("");
    setImageAlt("");
    setShowImageModal(false);
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table class="w-full my-4 border-collapse border border-slate-200 dark:border-slate-800 text-xs">
        <thead>
          <tr class="bg-slate-100 dark:bg-slate-800/80">
            <th class="border border-slate-200 dark:border-slate-800 p-2.5 text-left font-bold text-slate-800 dark:text-slate-200">Specification</th>
            <th class="border border-slate-200 dark:border-slate-800 p-2.5 text-left font-bold text-slate-800 dark:text-slate-200">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 font-medium">Parameter / Feature</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100">Standard Value</td>
          </tr>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 font-medium">Specification 2</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100">Value 2</td>
          </tr>
        </tbody>
      </table>
    `;
    exec("insertHTML", tableHtml);
  };

  const handleSelectTemplate = (templateHtml: string) => {
    exec("insertHTML", templateHtml);
    setShowTemplateMenu(false);
  };

  return (
    <div className="space-y-2">
      {/* Header Info */}
      {(label || sublabel || badge) && (
        <div className="flex items-center justify-between gap-2">
          <div>
            {label && (
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                {icon || <FileText size={14} className="text-primary" />}
                <span>{label}</span>
              </label>
            )}
            {sublabel && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
            )}
          </div>
          {badge && (
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 shrink-0 select-none">
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Editor Container */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        {/* Mode Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-border/80 bg-muted/30 px-3 py-2 gap-2">
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setEditorTab("visual")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                editorTab === "visual"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles size={12} className={editorTab === "visual" ? "text-primary" : ""} />
              <span>Visual Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorTab("code")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                editorTab === "code"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCode size={12} className={editorTab === "code" ? "text-primary" : ""} />
              <span>HTML Code</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorTab("preview")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                editorTab === "preview"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye size={12} className={editorTab === "preview" ? "text-primary" : ""} />
              <span>Live Preview</span>
            </button>
          </div>

          {/* Preset Templates */}
          {showTemplates && templates.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                className="h-7 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold flex items-center gap-1 border border-primary/20 cursor-pointer transition-colors"
              >
                <Sparkles size={11} />
                <span>Insert Template</span>
              </button>

              {showTemplateMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-60 p-1.5 bg-card border border-border rounded-xl shadow-xl z-30 space-y-1 animate-fade-in max-h-72 overflow-y-auto custom-scrollbar">
                  {templates.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.templateHtml)}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>{tpl.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Formatting Toolbar for Visual Mode */}
        {editorTab === "visual" && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/20 border-b border-border/60">
            {/* History */}
            <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-0.5">
              <button
                type="button"
                onClick={() => exec("undo")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => exec("redo")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={13} />
              </button>
            </div>

            {/* Block Elements */}
            <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-0.5">
              <button
                type="button"
                onClick={() => handleFormatBlock("<p>")}
                className="px-2 py-1 rounded text-[11px] font-semibold hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="Paragraph"
              >
                P
              </button>
              <button
                type="button"
                onClick={() => handleFormatBlock("<h2>")}
                className="px-2 py-1 rounded text-[11px] font-bold hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => handleFormatBlock("<h3>")}
                className="px-2 py-1 rounded text-[11px] font-bold hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="Heading 3"
              >
                H3
              </button>
            </div>

            {/* Inline Styles */}
            <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-0.5">
              <button
                type="button"
                onClick={() => exec("bold")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => exec("italic")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => exec("underline")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Underline (Ctrl+U)"
              >
                <Underline size={13} />
              </button>
              <button
                type="button"
                onClick={() => exec("strikeThrough")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Strikethrough"
              >
                <Strikethrough size={13} />
              </button>
            </div>

            {/* Lists & Quotes */}
            <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-0.5">
              <button
                type="button"
                onClick={() => exec("insertUnorderedList")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Bullet List"
              >
                <List size={13} />
              </button>
              <button
                type="button"
                onClick={() => exec("insertOrderedList")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Numbered List"
              >
                <ListOrdered size={13} />
              </button>
              <button
                type="button"
                onClick={() => handleFormatBlock("<blockquote>")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Blockquote"
              >
                <Quote size={13} />
              </button>
              <button
                type="button"
                onClick={() => exec("insertHorizontalRule")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Divider Line"
              >
                <Minus size={13} />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-0.5">
              <button
                type="button"
                onClick={() => exec("justifyLeft")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Align Left"
              >
                <AlignLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => exec("justifyCenter")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Align Center"
              >
                <AlignCenter size={13} />
              </button>
              <button
                type="button"
                onClick={() => exec("justifyRight")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Align Right"
              >
                <AlignRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => exec("justifyFull")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Justify"
              >
                <AlignJustify size={13} />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-0.5 relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Text Color"
              >
                <Palette size={13} />
              </button>

              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-card border border-border rounded-xl shadow-xl z-30 grid grid-cols-4 gap-1.5 w-36 animate-fade-in">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        exec("foreColor", c.color);
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded-full border border-border cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                      style={{
                        backgroundColor: c.color === "inherit" ? "#94a3b8" : c.color,
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Embed Inserts */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Insert Web Link"
              >
                <LinkIcon size={13} />
              </button>
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Embed Image"
              >
                <ImageIcon size={13} />
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Insert Table"
              >
                <TableIcon size={13} />
              </button>
              <button
                type="button"
                onClick={() => exec("removeFormat")}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Clear Formatting"
              >
                <RemoveFormatting size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Content Editing Surface */}
        <div className="relative">
          {editorTab === "visual" && (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onBlur={handleEditorInput}
              style={{ minHeight }}
              data-placeholder={placeholder}
              className="p-4 text-xs font-normal leading-relaxed text-foreground outline-none focus:ring-0 overflow-y-auto custom-scrollbar prose dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none"
            />
          )}

          {editorTab === "code" && (
            <textarea
              value={rawHtml}
              onChange={(e) => {
                setRawHtml(e.target.value);
                onChange(e.target.value);
              }}
              style={{ minHeight }}
              placeholder="<div>Write custom HTML markup here...</div>"
              className="w-full p-4 font-mono text-xs text-foreground bg-zinc-950/90 dark:bg-black/90 text-emerald-400 outline-none resize-y border-0 focus:ring-0 leading-relaxed"
            />
          )}

          {editorTab === "preview" && (
            <div
              style={{ minHeight }}
              className="p-5 text-xs text-foreground leading-relaxed overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30"
            >
              {rawHtml ? (
                <div
                  className="prose dark:prose-invert max-w-none text-xs"
                  dangerouslySetInnerHTML={{ __html: rawHtml }}
                />
              ) : (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No content to preview yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Link Inserter Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card w-full max-w-sm p-4 rounded-xl border border-border shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon size={12} className="text-primary" />
                Insert Web Link
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Link URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Link Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Click here to view"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="h-7 px-3 text-xs font-bold rounded-lg border border-border hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="h-7 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Inserter Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card w-full max-w-sm p-4 rounded-xl border border-border shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon size={12} className="text-primary" />
                Embed Image into Editor
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Image URL *
                </label>
                <input
                  type="url"
                  placeholder="https://res.cloudinary.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Caption / Alt text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Product Dimensions Diagram"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="h-7 px-3 text-xs font-bold rounded-lg border border-border hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="h-7 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
