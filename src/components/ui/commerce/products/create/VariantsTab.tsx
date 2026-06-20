import React from "react";
import { Sliders, Check, Tag, X, RefreshCw, Trash2, Image as ImageIcon, Plus, Save } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "react-hot-toast";

interface VariantsTabProps {
  attributes: any[];
  selectedAttrIds: string[];
  setSelectedAttrIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAttrValues: Record<string, string[]>;
  setSelectedAttrValues: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  variants: any[];
  setVariants: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveVariantImageEditId: (val: string | null) => void;
  slug: string;
  basePrice: number | "";
  baseStock: number | "";
  thumbnail: string;
  imageUrls: string[];
  isSaving: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  setActiveTab: (val: any) => void;
}

export default function VariantsTab({
  attributes,
  selectedAttrIds,
  setSelectedAttrIds,
  selectedAttrValues,
  setSelectedAttrValues,
  variants,
  setVariants,
  setActiveVariantImageEditId,
  slug,
  basePrice,
  baseStock,
  thumbnail,
  imageUrls,
  isSaving,
  handleSubmit,
  setActiveTab,
}: VariantsTabProps) {
  const slugifyString = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  const handleToggleAttribute = (attrId: string) => {
    if (selectedAttrIds.includes(attrId)) {
      setSelectedAttrIds(selectedAttrIds.filter((id) => id !== attrId));
      const newVals = { ...selectedAttrValues };
      delete newVals[attrId];
      setSelectedAttrValues(newVals);
    } else {
      setSelectedAttrIds([...selectedAttrIds, attrId]);
      setSelectedAttrValues({
        ...selectedAttrValues,
        [attrId]: [],
      });
    }
  };

  const handleToggleAttrValue = (attrId: string, value: string) => {
    const currentValues = selectedAttrValues[attrId] || [];
    let updatedValues: string[];

    if (currentValues.includes(value)) {
      updatedValues = currentValues.filter((v) => v !== value);
    } else {
      updatedValues = [...currentValues, value];
    }

    setSelectedAttrValues({
      ...selectedAttrValues,
      [attrId]: updatedValues,
    });
  };

  const handleGenerateVariants = () => {
    const activeAttrs = attributes.filter(
      (attr) => selectedAttrIds.includes(attr._id) && selectedAttrValues[attr._id]?.length > 0
    );

    if (activeAttrs.length === 0) {
      toast.error("Please select at least one attribute and value first.");
      return;
    }

    const generateCombinations = (index: number, current: Record<string, string>): any[] => {
      if (index === activeAttrs.length) {
        return [current];
      }

      const attr = activeAttrs[index];
      const values = selectedAttrValues[attr._id];
      let results: any[] = [];

      values.forEach((val) => {
        results = results.concat(
          generateCombinations(index + 1, {
            ...current,
            [attr.name]: val,
          })
        );
      });

      return results;
    };

    const combinations = generateCombinations(0, {});

    const newVariants = combinations.map((combo, idx) => {
      const nameParts = Object.values(combo) as string[];
      const variantName = nameParts.join(" / ");
      const skuParts = nameParts.map(p => slugifyString(String(p)).toUpperCase());
      const variantSku = `${slug.toUpperCase() || "PROD"}-${skuParts.join("-")}`;

      return {
        id: `var-${Date.now()}-${idx}`,
        name: variantName,
        attributes: combo,
        sku: variantSku,
        price: basePrice !== "" ? Number(basePrice) : 0,
        stock: baseStock !== "" ? Number(baseStock) : 10,
        images: [thumbnail || imageUrls[0] || ""].filter(Boolean),
      };
    });

    setVariants(newVariants);
    toast.success(`Generated ${newVariants.length} product combinations!`);
  };

  const handleUpdateVariantField = (varId: string, field: string, value: any) => {
    setVariants(
      variants.map((v) => {
        if (v.id === varId || v._id === varId) {
          return {
            ...v,
            [field]: ["sku", "image", "images"].includes(field) ? value : Number(value) || 0,
          };
        }
        return v;
      })
    );
  };

  const handleRemoveVariant = (varId: string) => {
    setVariants(variants.filter((v) => v.id !== varId && v._id !== varId));
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-border space-y-5 animate-fade-in">
      <div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Sliders size={16} className="text-primary" />
          Product Attributes & Variants Matrix
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Select attributes and pick/type values to auto-generate all variant combinations.
        </p>
      </div>

      {/* Attributes Selector list */}
      {attributes.length > 0 ? (
        <div className="space-y-5 pt-1">
          {/* Step 1: Select which attributes apply */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[8px] font-black">1</span>
              Select Applicable Traits
            </label>
            <div className="flex flex-wrap gap-2">
              {attributes.map((attr) => {
                const isChecked = selectedAttrIds.includes(attr._id);
                return (
                  <button
                    key={attr._id}
                    type="button"
                    onClick={() => handleToggleAttribute(attr._id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 select-none ${
                      isChecked
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-zinc-400"
                    }`}
                  >
                    {isChecked && <Check size={12} />}
                    <span>{attr.name}</span>
                    {isChecked && (
                      <span className="text-[8px] bg-primary/20 text-primary rounded px-1 py-0.5 font-black">
                        {(selectedAttrValues[attr._id] || []).length} selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: For each selected attribute, pick values */}
          {selectedAttrIds.length > 0 && (
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[8px] font-black">2</span>
                Pick Values for Each Trait
              </label>

              <div className="space-y-3">
                {attributes
                  .filter((attr) => selectedAttrIds.includes(attr._id))
                  .map((attr) => {
                    const selectedVals = selectedAttrValues[attr._id] || [];
                    const predefinedVals: string[] = attr.values || [];

                    return (
                      <div key={attr._id} className="p-3 rounded-xl bg-muted/30 border border-border/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Tag size={11} className="text-primary" />
                            {attr.name}
                            {selectedVals.length > 0 && (
                              <span className="text-[8px] bg-primary text-white rounded-full px-1.5 py-0.5 font-black">
                                {selectedVals.length}
                              </span>
                            )}
                          </span>
                          {selectedVals.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedAttrValues({ ...selectedAttrValues, [attr._id]: [] })}
                              className="text-[9px] text-muted-foreground hover:text-destructive cursor-pointer font-bold transition-colors"
                            >
                              Clear all
                            </button>
                          )}
                        </div>

                        {/* Pre-defined value chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {predefinedVals.map((val: string) => {
                            const isValChecked = selectedVals.includes(val);
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleToggleAttrValue(attr._id, val)}
                                className={`px-2.5 py-1 text-[11px] rounded-md border font-semibold cursor-pointer transition-all select-none ${
                                  isValChecked
                                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                                    : "border-border bg-card text-foreground hover:bg-muted hover:border-zinc-400"
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>

                        {/* Show selected custom values that aren't in predefined list */}
                        {selectedVals.filter(v => !predefinedVals.includes(v)).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider self-center">Custom:</span>
                            {selectedVals.filter(v => !predefinedVals.includes(v)).map((val) => (
                              <span
                                key={val}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                              >
                                {val}
                                <button
                                  type="button"
                                  onClick={() => setSelectedAttrValues({
                                    ...selectedAttrValues,
                                    [attr._id]: selectedVals.filter(sv => sv !== val),
                                  })}
                                  className="hover:text-destructive cursor-pointer"
                                >
                                  <X size={9} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Step 3: Generate Button */}
              <div className="pt-1 flex items-center justify-between border-t border-border/40">
                <div className="text-[11px] text-muted-foreground">
                  {selectedAttrIds.filter(id => (selectedAttrValues[id] || []).length > 0).length > 0 && (() => {
                    const count = selectedAttrIds
                      .filter(id => (selectedAttrValues[id] || []).length > 0)
                      .reduce((acc, id) => acc * (selectedAttrValues[id] || []).length, 1);
                    return <span>Will generate <strong className="text-foreground">{count}</strong> combinations</span>;
                  })()}
                </div>
                <button
                  type="button"
                  onClick={handleGenerateVariants}
                  className="h-9 px-5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm shadow-primary/20"
                >
                  <RefreshCw size={12} /> Generate Variants Matrix
                </button>
              </div>
            </div>
          )}

          {/* Variants List Table */}
          {variants.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border/55">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-black">3</span>
                  Generated Variants ({variants.length})
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Set SKU, price &amp; stock per variant below.
                </p>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold">
                        <th className="p-3 font-bold uppercase text-[9px] tracking-wider font-heading">Variant Combination</th>
                        <th className="p-3 font-bold uppercase text-[9px] tracking-wider w-36 font-heading">SKU Code</th>
                        <th className="p-3 font-bold uppercase text-[9px] tracking-wider w-24 font-heading">Price (৳)</th>
                        <th className="p-3 font-bold uppercase text-[9px] tracking-wider w-24 font-heading">Stock</th>
                        <th className="p-3 font-bold uppercase text-[9px] tracking-wider w-40 font-heading">Images</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {variants.map((v) => (
                        <tr key={v.id || v._id} className="hover:bg-muted/15 transition-colors">
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {v.attributes && typeof v.attributes === "object" && Object.entries(v.attributes).map(([attrName, val]: [string, any]) => (
                                <span
                                  key={attrName}
                                  className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                                >
                                  <span className="opacity-70">{attrName}:</span>
                                  {String(val)}
                                </span>
                              ))}
                              {(!v.attributes || Object.keys(v.attributes).length === 0) && (
                                <span className="font-bold text-foreground">{v.name}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => handleUpdateVariantField(v.id || v._id, "sku", e.target.value)}
                              className="w-full h-8 px-2 rounded-md border border-border bg-card text-xs font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => handleUpdateVariantField(v.id || v._id, "price", e.target.value)}
                              className="w-full h-8 px-2 rounded-md border border-border bg-card text-xs font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => handleUpdateVariantField(v.id || v._id, "stock", e.target.value)}
                              className="w-full h-8 px-2 rounded-md border border-border bg-card text-xs font-medium outline-none"
                            />
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => setActiveVariantImageEditId(v.id || v._id)}
                              className="flex items-center gap-2 p-1.5 rounded-lg border border-border bg-card hover:bg-muted/20 text-xs font-bold text-foreground cursor-pointer transition-all w-full justify-between"
                            >
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                {(v.images && v.images.length > 0) ? (
                                  <div className="flex -space-x-1.5 overflow-hidden">
                                    {v.images.slice(0, 3).map((imgUrl: string, imgIdx: number) => (
                                      <img
                                        key={imgIdx}
                                        src={imgUrl}
                                        alt="variant avatar"
                                        className="inline-block h-5 w-5 rounded-full ring-2 ring-background object-cover"
                                        onError={(e) => {
                                          (e.target as any).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=80";
                                        }}
                                      />
                                    ))}
                                    {v.images.length > 3 && (
                                      <span className="flex items-center justify-center h-5 w-5 rounded-full ring-2 ring-background bg-muted text-[8px] font-black text-muted-foreground">
                                        +{v.images.length - 3}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <ImageIcon size={13} className="text-muted-foreground" />
                                )}
                                <span className="text-[10px] text-muted-foreground ml-1 truncate">
                                  {(v.images && v.images.length > 0) ? `${v.images.length} Image(s)` : "Add Images"}
                                </span>
                              </div>
                              <Plus size={11} className="text-primary shrink-0" />
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(v.id || v._id)}
                              className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                              title="Remove Variant"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center border border-border rounded-xl text-muted-foreground bg-muted/10 space-y-1">
          <Sliders className="mx-auto text-muted/30" size={28} />
          <p className="text-xs font-bold">No attributes found</p>
          <p className="text-[10px]">Go to the Attributes page to create traits (Color, Size, etc.) before setting variants.</p>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className="h-9 px-4 border border-border bg-card text-foreground hover:bg-muted text-xs font-bold rounded-lg cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="h-9 px-5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-50"
        >
          {isSaving ? (
            <Spinner className="w-4 h-4 mr-1 animate-spin text-white" />
          ) : (
            <Save size={14} />
          )}
          <span>{isSaving ? "Saving..." : "Publish Product"}</span>
        </button>
      </div>
    </div>
  );
}
