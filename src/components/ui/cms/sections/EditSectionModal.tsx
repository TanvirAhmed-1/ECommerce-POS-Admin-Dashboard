import React, { useState, useEffect } from "react";
import {
  X,
  Sliders,
  Check,
  Lock,
  Unlock,
  Layers,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: any | null;
  onSave: (payload: any) => Promise<void>;
  isSaving: boolean;
  totalSectionsCount: number;
}

export default function EditSectionModal({
  isOpen,
  onClose,
  section,
  onSave,
  isSaving,
  totalSectionsCount,
}: EditSectionModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (section) {
        setTitle(section.title || "");
        setSlug(section.slug || "");
        setIsSlugManual(true);
        setDescription(section.description || "");
        setDisplayOrder(section.displayOrder ?? 1);
        setIsActive(section.isActive ?? true);
      } else {
        setTitle("");
        setSlug("");
        setIsSlugManual(false);
        setDescription("");
        setDisplayOrder(totalSectionsCount + 1);
        setIsActive(true);
      }
    }
  }, [isOpen, section, totalSectionsCount]);

  // Auto-generate slug from Title if not manual
  useEffect(() => {
    if (!isSlugManual && title) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generated);
    }
  }, [title, isSlugManual]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      displayOrder: Number(displayOrder),
      isActive,
      products: section ? (section.products || []).map((p: any) => p._id || p) : [],
    };

    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-lg rounded-3xl border border-border bg-card/95 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-foreground">
                {section ? "Edit Section Settings" : "Create New Homepage Section"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Set collection name, URL route key, display order, and status.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Section Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flash Deals, Best Sellers, Top Deals of the Week"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-semibold text-foreground outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                Route Slug
              </label>
              <button
                type="button"
                onClick={() => setIsSlugManual(!isSlugManual)}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isSlugManual ? <Unlock size={11} /> : <Lock size={11} />}
                <span>{isSlugManual ? "Lock to Title" : "Edit Manually"}</span>
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                /sections/
              </span>
              <input
                type="text"
                disabled={!isSlugManual}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={`w-full h-11 pl-22 pr-4 rounded-xl border border-border text-xs font-mono font-semibold outline-none transition-all ${
                  isSlugManual
                    ? "bg-background text-foreground focus:border-primary"
                    : "bg-muted/40 text-muted-foreground cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Subtitle Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Discover handpicked top discount offers available for 24 hours only"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Display Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Order */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                Position / Order (#)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value) || 1)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-bold text-foreground outline-none focus:border-primary transition-all"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setDisplayOrder((prev) => prev + 1)}
                    className="p-1 rounded bg-muted hover:bg-muted/80 text-foreground"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayOrder((prev) => Math.max(1, prev - 1))}
                    className="p-1 rounded bg-muted hover:bg-muted/80 text-foreground"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Visibility Status */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                Visibility Status
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full h-11 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isActive ? <Check size={16} /> : null}
                <span>{isActive ? "Published Live" : "Draft (Hidden)"}</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Spinner className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>{section ? "Save Changes" : "Create Section"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
