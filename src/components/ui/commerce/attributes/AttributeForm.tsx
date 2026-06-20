import React, { useState, useEffect } from "react";
import { useCreateAttributeMutation, useUpdateAttributeMutation } from "@/redux/features/attribute/attributeApi";
import { Sliders, Plus, Save, PlusCircle, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "react-hot-toast";

interface AttributeFormProps {
  formMode: "create" | "update";
  activeAttribute: any | null;
  attributes: any[];
  updateLocalAttrs: (newAttrs: any[]) => void;
  isServerConnected: boolean;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export default function AttributeForm({
  formMode,
  activeAttribute,
  attributes,
  updateLocalAttrs,
  isServerConnected,
  onSaveSuccess,
  onCancel,
}: AttributeFormProps) {
  const [createAttribute, { isLoading: isCreating }] = useCreateAttributeMutation();
  const [updateAttribute, { isLoading: isUpdating }] = useUpdateAttributeMutation();

  const isSaving = isCreating || isUpdating;

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const [newValueInput, setNewValueInput] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Slugify helper
  const slugifyString = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  useEffect(() => {
    if (formMode === "update" && activeAttribute) {
      setName(activeAttribute.name || "");
      setSlug(activeAttribute.slug || "");
      setValues(activeAttribute.values || []);
      setIsActive(activeAttribute.isActive !== undefined ? activeAttribute.isActive : true);
      setIsSlugManuallyEdited(true);
    } else {
      setName("");
      setSlug("");
      setValues([]);
      setNewValueInput("");
      setIsActive(true);
      setIsSlugManuallyEdited(false);
    }
  }, [activeAttribute, formMode]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) {
      setSlug(slugifyString(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/\s+/g, "-"));
  };

  const handleAddValue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newValueInput.trim();
    if (!trimmed) return;

    if (values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" already exists as a value.`);
      return;
    }

    setValues([...values, trimmed]);
    setNewValueInput("");
  };

  const handleRemoveValue = (indexToRemove: number) => {
    setValues(values.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Attribute name is required!");
      return;
    }

    if (values.length === 0) {
      toast.error("Please add at least one attribute value!");
      return;
    }

    const toastId = toast.loading(
      formMode === "update" ? "Updating attribute..." : "Creating attribute..."
    );

    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugifyString(name),
      values,
      isActive,
    };

    try {
      if (isServerConnected) {
        // Connected to server
        if (formMode === "create") {
          await createAttribute(payload).unwrap();
          toast.success(`Successfully created attribute "${name}"!`, { id: toastId });
        } else if (formMode === "update" && activeAttribute) {
          await updateAttribute({ id: activeAttribute._id, data: payload }).unwrap();
          toast.success(`Successfully updated attribute "${name}"!`, { id: toastId });
        }
      } else {
        // Persist to LocalStorage fallback
        if (formMode === "create") {
          const newAttr = {
            _id: `attr-${Date.now()}`,
            ...payload,
          };
          const updated = [...attributes, newAttr];
          updateLocalAttrs(updated);
          toast.success(`Successfully created attribute "${name}"!`, { id: toastId });
        } else if (formMode === "update" && activeAttribute) {
          const updated = attributes.map((item) =>
            item._id === activeAttribute._id ? { ...item, ...payload } : item
          );
          updateLocalAttrs(updated);
          toast.success(`Successfully updated attribute "${name}"!`, { id: toastId });
        }
      }
      onSaveSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "An unexpected error occurred while saving.",
        { id: toastId }
      );
    }
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-border sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Sliders size={16} />
        </div>
        <div>
          <h4 className="font-heading text-base font-bold text-foreground capitalize">
            {formMode === "create" ? "Create Attribute" : "Update Attribute"}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formMode === "create" ? "Establish a new variant characteristic" : "Modify settings and values for attribute"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Attribute Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Attribute Name
          </label>
          <input
            type="text"
            required
            disabled={isSaving}
            placeholder="e.g. Color, Size, Material"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>

        {/* Attribute Slug */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Slug Identifier
            </label>
            <span className="text-[9px] text-muted-foreground font-bold">
              {isSlugManuallyEdited ? "Custom" : "Auto-Generated"}
            </span>
          </div>
          <input
            type="text"
            required
            disabled={isSaving}
            placeholder="e.g. color, size, material"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>

        {/* Values Configuration */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Attribute Values
          </label>
          
          {/* Enter new value input */}
          <div className="flex gap-2">
            <input
              type="text"
              disabled={isSaving}
              placeholder="Add value (e.g. Red, XL) and press add"
              value={newValueInput}
              onChange={(e) => setNewValueInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddValue();
                }
              }}
              className="flex-1 h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => handleAddValue()}
              disabled={isSaving}
              className="h-10 px-3 border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Added Values Badges Container */}
          <div className="border border-border bg-card/50 rounded-xl p-3 min-h-[80px] space-y-2">
            {values.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {values.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/25"
                  >
                    <span>{v}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(idx)}
                      className="text-primary hover:text-rose-500 cursor-pointer"
                      title={`Remove ${v}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center py-4 text-center">
                <PlusCircle className="text-muted/40 mb-1" size={20} />
                <span className="text-[10px] text-muted-foreground font-semibold">No values added yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Checkbox */}
        <div className="pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none opacity-90">
            <input
              type="checkbox"
              disabled={isSaving}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-border text-primary focus:ring-0 cursor-pointer disabled:opacity-50"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-foreground">Active Status</span>
              <span className="text-[9px] text-muted-foreground">Enable this attribute for product variant building</span>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-border/40">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 h-10 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Spinner className="w-4 h-4 mr-1 animate-spin text-white" />
            ) : (
              <Save size={14} className="shrink-0" />
            )}
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                {formMode === "create" ? "Save Attribute" : "Update Attribute"}
              </>
            )}
          </button>
          {formMode !== "create" && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onCancel}
              className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted/50 text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
