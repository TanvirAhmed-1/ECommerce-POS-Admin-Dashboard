"use client";

import React, { useState } from "react";
import { Sliders, Check, Tag, X, RefreshCw, Trash2, Image as ImageIcon, Plus, Save, Table, Copy, Layers } from "lucide-react";
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
  specifications?: { key: string; value: string }[];
  setSpecifications?: React.Dispatch<React.SetStateAction<{ key: string; value: string }[]>>;
  setActiveVariantImageEditId: (val: string | null) => void;
  slug: string;
  basePrice: number | "";
  baseStock: number | "";
  thumbnail: string;
  imageUrls: string[];
  isSaving: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  setActiveTab: (val: any) => void;
  uploadSingleImage: any;
  showApiError: (err: any, toastId?: string) => void;
}

export default function VariantsTab({
  attributes,
  selectedAttrIds,
  setSelectedAttrIds,
  selectedAttrValues,
  setSelectedAttrValues,
  variants,
  setVariants,
  specifications = [],
  setSpecifications,
  setActiveVariantImageEditId,
  slug,
  basePrice,
  baseStock,
  thumbnail,
  imageUrls,
  isSaving,
  handleSubmit,
  setActiveTab,
  uploadSingleImage,
  showApiError,
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

  const [colorImages, setColorImages] = useState<Record<string, string>>({});

  // Technical Specifications Builder States
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecVal, setNewSpecVal] = useState("");
  const [showBulkSpecsModal, setShowBulkSpecsModal] = useState(false);
  const [bulkSpecsText, setBulkSpecsText] = useState("");

  const handleAddSpecification = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim() || !setSpecifications) return;
    setSpecifications([
      ...specifications,
      { key: newSpecKey.trim(), value: newSpecVal.trim() },
    ]);
    setNewSpecKey("");
    setNewSpecVal("");
  };

  const handleRemoveSpecification = (index: number) => {
    if (!setSpecifications) return;
    setSpecifications(specifications.filter((_, idx) => idx !== index));
  };

  const handleBulkAddSpecifications = () => {
    if (!bulkSpecsText.trim() || !setSpecifications) return;
    const lines = bulkSpecsText.split("\n").map(l => l.trim()).filter(Boolean);
    const parsed: { key: string; value: string }[] = [];

    lines.forEach((line) => {
      // support Key: Value or Key | Value or Key - Value or Key 	 Value
      let key = "";
      let val = "";
      if (line.includes(":")) {
        const parts = line.split(":");
        key = parts[0].trim();
        val = parts.slice(1).join(":").trim();
      } else if (line.includes("|")) {
        const parts = line.split("|");
        key = parts[0].trim();
        val = parts.slice(1).join("|").trim();
      } else if (line.includes("\t")) {
        const parts = line.split("\t");
        key = parts[0].trim();
        val = parts.slice(1).join("\t").trim();
      } else {
        key = "Feature";
        val = line;
      }
      if (key && val) {
        parsed.push({ key: key.replace(/^[-*•✅✔️\s]+/, ""), value: val });
      }
    });

    if (parsed.length > 0) {
      setSpecifications([...specifications, ...parsed]);
      setBulkSpecsText("");
      setShowBulkSpecsModal(false);
      toast.success(`Imported ${parsed.length} specifications!`);
    }
  };

  // Auto-load color images from existing variants when editing
  React.useEffect(() => {
    if (variants.length > 0) {
      const initialColorImages: Record<string, string> = { ...colorImages };
      let changed = false;

      variants.forEach((v) => {
        if (v.attributes && typeof v.attributes === "object") {
          const colorKey = Object.keys(v.attributes).find(
            (k) => k.toLowerCase().includes("color")
          );
          if (colorKey) {
            const colorVal = v.attributes[colorKey];
            if (colorVal && v.images && v.images.length > 0 && !initialColorImages[colorVal]) {
              initialColorImages[colorVal] = v.images[0];
              changed = true;
            }
          }
        }
      });

      if (changed) {
        setColorImages(initialColorImages);
      }
    }
  }, [variants]);

  const handleSetColorImage = (colorVal: string, url: string) => {
    setColorImages((prev) => ({
      ...prev,
      [colorVal]: url,
    }));

    setVariants((prev) =>
      prev.map((v) => {
        if (v.attributes && typeof v.attributes === "object") {
          const colorKey = Object.keys(v.attributes).find(
            (k) => k.toLowerCase().includes("color")
          );
          if (colorKey && v.attributes[colorKey] === colorVal) {
            const otherImages = (v.images || []).filter((img: string) => img !== url);
            return {
              ...v,
              images: url ? [url, ...otherImages] : otherImages,
            };
          }
        }
        return v;
      })
    );
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

      let initialImage = thumbnail || imageUrls[0] || "";
      const colorKey = Object.keys(combo).find(k => k.toLowerCase().includes("color"));
      if (colorKey) {
        const colorVal = combo[colorKey];
        if (colorVal && colorImages[colorVal]) {
          initialImage = colorImages[colorVal];
        }
      }

      return {
        id: `var-${Date.now()}-${idx}`,
        name: variantName,
        attributes: combo,
        sku: variantSku,
        price: basePrice !== "" ? Number(basePrice) : 0,
        stock: baseStock !== "" ? Number(baseStock) : 10,
        images: [initialImage].filter(Boolean),
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
    <div className="glass-card p-5 rounded-2xl border border-border space-y-6 animate-fade-in">

      {/* SECTION 1: TECHNICAL SPECIFICATIONS TABLE BUILDER */}
      <div className="space-y-4 pb-6 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Table size={16} className="text-primary" />
              Technical Specifications Table (Key-Value)
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Build the specifications matrix for the frontend Specifications tab (e.g. Bluetooth, Battery, Use time, Material).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowBulkSpecsModal(true)}
            className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <Copy size={12} /> Bulk Import Specs
          </button>
        </div>

        {/* Row input to add single spec */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder="Specification Name (e.g. Battery capacity)"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="sm:col-span-6">
            <input
              type="text"
              placeholder="Value / Details (e.g. charging case 300mAh; headset 40mAh)"
              value={newSpecVal}
              onChange={(e) => setNewSpecVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSpecification();
                }
              }}
              className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAddSpecification}
              className="w-full h-9 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={14} />
              <span>Add Spec</span>
            </button>
          </div>
        </div>

        {/* Specifications List Table */}
        {specifications.length > 0 && (
          <div className="border border-border rounded-xl overflow-hidden bg-card/60">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold text-[9px] uppercase tracking-wider">
                  <th className="p-2.5 w-1/3">Specification Key</th>
                  <th className="p-2.5">Specification Value</th>
                  <th className="p-2.5 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {specifications.map((spec, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors">
                    <td className="p-2.5 font-bold text-foreground">{spec.key}</td>
                    <td className="p-2.5 text-muted-foreground font-medium">{spec.value}</td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecification(idx)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                        title="Remove row"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: ATTRIBUTES & VARIANTS MATRIX */}
      <div className="space-y-5">
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
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 select-none ${isChecked
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
                                  className={`px-2.5 py-1 text-[11px] rounded-md border font-semibold cursor-pointer transition-all select-none ${isValChecked
                                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                                    : "border-border bg-card text-foreground hover:bg-muted hover:border-zinc-400"
                                    }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>

                          {/* Color Swatch Images Panel */}
                          {attr.name.toLowerCase().includes("color") && selectedVals.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-border/40 space-y-2.5">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-heading">
                                🎨 Color Swatch Images
                              </span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedVals.map((colorVal) => {
                                  const colorImg = colorImages[colorVal] || "";
                                  return (
                                    <div key={colorVal} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card">
                                      <div className="relative w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                        {colorImg ? (
                                          <img src={colorImg} alt={colorVal} className="w-full h-full object-cover" />
                                        ) : (
                                          <span className="text-[8px] text-muted-foreground font-bold">No Image</span>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0 space-y-1.5">
                                        <span className="text-xs font-bold text-foreground block truncate">{colorVal}</span>
                                        <div className="flex gap-2 items-center">
                                          <label className="h-6 px-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded flex items-center justify-center cursor-pointer transition-colors border border-primary/20">
                                            Upload
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  if (file.size > 2 * 1024 * 1024) {
                                                    toast.error("File size exceeds 2MB limit!");
                                                    return;
                                                  }
                                                  const formData = new FormData();
                                                  formData.append("image", file);
                                                  const toastId = toast.loading(`Uploading image for ${colorVal}...`);
                                                  try {
                                                    const res = await uploadSingleImage(formData).unwrap();
                                                    if (res?.success && res?.data?.url) {
                                                      handleSetColorImage(colorVal, res.data.url);
                                                      toast.success(`Image added for ${colorVal}!`, { id: toastId });
                                                    }
                                                  } catch (err: any) {
                                                    showApiError(err, toastId);
                                                  }
                                                }
                                              }}
                                            />
                                          </label>

                                          <input
                                            type="url"
                                            placeholder="Paste URL..."
                                            value={colorImg}
                                            onChange={(e) => handleSetColorImage(colorVal, e.target.value)}
                                            className="flex-1 h-6 px-1.5 rounded border border-border bg-card text-[10px] outline-none focus:border-primary"
                                          />

                                          {colorImg && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setColorImages((prev) => {
                                                  const updated = { ...prev };
                                                  delete updated[colorVal];
                                                  return updated;
                                                });
                                              }}
                                              className="h-6 px-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[10px] font-bold rounded border border-rose-500/20 cursor-pointer"
                                            >
                                              Clear
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
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
                    Set price &amp; stock per variant below.
                  </p>
                </div>

                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold">
                          <th className="p-3 font-bold uppercase text-[9px] tracking-wider font-heading">Variant Combination</th>
                          <th className="p-3 font-bold uppercase text-[9px] tracking-wider w-28 font-heading">Price (৳)</th>
                          <th className="p-3 font-bold uppercase text-[9px] tracking-wider w-28 font-heading">Stock</th>
                          <th className="p-3 font-bold uppercase text-[9px] tracking-wider w-40 font-heading">Images</th>
                          <th className="p-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {variants.map((v) => (
                          <tr key={v.id || v._id} className="hover:bg-muted/15 transition-colors">
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(v.attributes) && v.attributes.map((a: any, aIdx: number) => {
                                  const attrName = a.name || a.attribute?.name || (typeof a.attribute === "string" ? a.attribute : "Trait");
                                  const attrVal = a.value || String(a);
                                  return (
                                    <span
                                      key={aIdx}
                                      className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                                    >
                                      <span className="opacity-70">{attrName}:</span>
                                      {attrVal}
                                    </span>
                                  );
                                })}
                                {!Array.isArray(v.attributes) && v.attributes && typeof v.attributes === "object" && Object.entries(v.attributes).map(([attrName, val]: [string, any]) => (
                                  <span
                                    key={attrName}
                                    className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                                  >
                                    <span className="opacity-70">{attrName}:</span>
                                    {String(val)}
                                  </span>
                                ))}
                                {(!v.attributes ||
                                  (Array.isArray(v.attributes) && v.attributes.length === 0) ||
                                  (!Array.isArray(v.attributes) && typeof v.attributes === "object" && Object.keys(v.attributes).length === 0)) && (
                                  <span className="font-bold text-foreground">{v.name}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => handleUpdateVariantField(v.id || v._id, "price", e.target.value)}
                                className="w-full h-8 px-2 rounded-md border border-border bg-card text-xs font-medium outline-none focus:border-zinc-400"
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
            <p className="text-[10px]">Go to Attributes page to configure traits before generating variant matrix.</p>
          </div>
        )}
      </div>

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

      {/* Bulk Specs Modal */}
      {showBulkSpecsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md p-5 rounded-2xl border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Copy size={13} className="text-primary" />
                Bulk Import Technical Specifications
              </h4>
              <button
                type="button"
                onClick={() => setShowBulkSpecsModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Paste specifications line by line using "Key: Value" or "Key | Value" format.
            </p>

            <textarea
              rows={6}
              placeholder="Bluetooth: 5.4; chip: Jerry AC7003D4&#10;Battery capacity: charging case 300mAh; headset 40mAh&#10;Use time: 7 hours (ANC on 6 hours)&#10;Material: ABS; size:61*51.5*28.5 mm; total weight: 44.8g&#10;Functions: With APP function, supports for hall switch"
              value={bulkSpecsText}
              onChange={(e) => setBulkSpecsText(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-card text-xs font-mono text-foreground outline-none focus:border-primary resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkSpecsModal(false)}
                className="h-8 px-3 text-xs font-bold rounded-lg border border-border hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAddSpecifications}
                className="h-8 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
              >
                Import Specifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
