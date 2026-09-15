import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Sliders,
  ShoppingBag,
  Eye,
  Search,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  Lock,
  Unlock,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useGetAllProductsQuery } from "@/redux/features/product/productApi";
import { useGetAllCategoriesQuery } from "@/redux/features/category/categoryApi";

interface SectionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSection: any | null;
  onSave: (payload: any) => Promise<void>;
  isSaving: boolean;
  totalSectionsCount: number;
}

export default function SectionEditorModal({
  isOpen,
  onClose,
  editingSection,
  onSave,
  isSaving,
  totalSectionsCount,
}: SectionEditorModalProps) {
  // Tabs: "general" | "products" | "preview"
  const [activeTab, setActiveTab] = useState<"general" | "products" | "preview">("general");

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [assignedProducts, setAssignedProducts] = useState<any[]>([]);

  // Product Catalog Search & Category Filter
  const [productSearch, setProductSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch catalog products
  const { data: productsRes, isLoading: isCatalogLoading } = useGetAllProductsQuery(
    {
      searchTerm: debouncedSearch,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      limit: 20,
    },
    { skip: !isOpen }
  );

  const { data: categoriesRes } = useGetAllCategoriesQuery({});

  const categories = useMemo(() => {
    return categoriesRes?.data || [];
  }, [categoriesRes]);

  const availableProducts = useMemo(() => {
    const list = productsRes?.data?.data || productsRes?.data || [];
    return Array.isArray(list) ? list : [];
  }, [productsRes]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  // Sync state with editingSection
  useEffect(() => {
    if (isOpen) {
      if (editingSection) {
        setTitle(editingSection.title || "");
        setSlug(editingSection.slug || "");
        setIsSlugManual(true);
        setDescription(editingSection.description || "");
        setDisplayOrder(editingSection.displayOrder ?? 1);
        setIsActive(editingSection.isActive ?? true);
        setAssignedProducts(editingSection.products || []);
      } else {
        setTitle("");
        setSlug("");
        setIsSlugManual(false);
        setDescription("");
        setDisplayOrder(totalSectionsCount + 1);
        setIsActive(true);
        setAssignedProducts([]);
      }
      setActiveTab("general");
      setProductSearch("");
      setSelectedCategory("all");
    }
  }, [isOpen, editingSection, totalSectionsCount]);

  // Auto-generate slug from Title
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

  // Add Product
  const handleAddProduct = (prod: any) => {
    if (assignedProducts.some((p) => p._id === prod._id)) return;
    setAssignedProducts((prev) => [...prev, prod]);
  };

  // Remove Product
  const handleRemoveProduct = (prodId: string) => {
    setAssignedProducts((prev) => prev.filter((p) => p._id !== prodId));
  };

  // Move product up/down in assigned set
  const handleMoveProduct = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= assignedProducts.length) return;

    const newArr = [...assignedProducts];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    setAssignedProducts(newArr);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      displayOrder: Number(displayOrder),
      isActive,
      products: assignedProducts.map((p) => p._id),
    };

    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-5xl rounded-3xl border border-border bg-card/95 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between gap-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-foreground">
                {editingSection ? "Configure Homepage Collection" : "Create New Homepage Section"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Curate featured products, arrange showcase sequence, and set storefront visibility.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-border px-6 bg-card gap-4 overflow-x-auto custom-scrollbar">
          {[
            { key: "general", label: "1. Section Settings", icon: <Sliders size={14} /> },
            {
              key: "products",
              label: `2. Assign Products (${assignedProducts.length})`,
              icon: <ShoppingBag size={14} />,
            },
            { key: "preview", label: "3. Live Preview", icon: <Eye size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 py-3.5 text-xs font-bold transition-all relative cursor-pointer border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary font-black"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background/50">
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === "general" && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Section Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Deals of the Week, Trending Electronics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm font-semibold text-foreground outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                    Route Slug (URL Key)
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
                        ? "bg-card text-foreground focus:border-primary"
                        : "bg-muted/40 text-muted-foreground cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Subtitle / Promo Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Handpicked customer favorites with verified reviews and instant dispatch"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Grid: Display Order & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                    Display Order (# Position)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value) || 1)}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm font-bold text-foreground outline-none focus:border-primary transition-all"
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => setDisplayOrder((prev) => prev + 1)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisplayOrder((prev) => Math.max(1, prev - 1))}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visibility Status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                    Storefront Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full h-11 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {isActive ? <Check size={16} /> : null}
                    <span>{isActive ? "Published (Live on Homepage)" : "Draft (Hidden from Homepage)"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-primary/20"
                >
                  <span>Continue to Assign Products</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGN PRODUCTS */}
          {activeTab === "products" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Product Catalog Search (7 Cols) */}
              <div className="lg:col-span-7 glass-card p-5 rounded-2xl border border-border bg-card/60 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <h4 className="font-heading text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Search size={14} className="text-primary" />
                    Search Catalog Products
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {availableProducts.length} items found
                  </span>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center h-10 flex-1 rounded-xl px-3 gap-2 border border-border bg-background transition-all focus-within:border-primary">
                    <Search className="text-muted-foreground" size={14} />
                    <input
                      type="text"
                      placeholder="Search by product name, SKU..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="flex-1 outline-none text-xs bg-transparent border-none text-foreground placeholder:text-muted-foreground"
                    />
                    {productSearch && (
                      <button
                        type="button"
                        onClick={() => setProductSearch("")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c: any) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Catalog List */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {isCatalogLoading ? (
                    <div className="flex justify-center p-8">
                      <Spinner className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : availableProducts.length > 0 ? (
                    availableProducts.map((prod: any) => {
                      const isAssigned = assignedProducts.some((p) => p._id === prod._id);
                      return (
                        <div
                          key={prod._id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background/80 hover:bg-background hover:border-primary/40 transition-all gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                              <img
                                src={
                                  prod.thumbnail ||
                                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=100"
                                }
                                alt={prod.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as any).src =
                                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=100";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-foreground text-xs truncate max-w-[200px] sm:max-w-[260px]">
                                {prod.name}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-extrabold text-[11px] text-primary">
                                  ${Number(prod.salePrice ?? prod.basePrice ?? 0).toFixed(2)}
                                </span>
                                {prod.basePrice && prod.salePrice && prod.salePrice < prod.basePrice && (
                                  <span className="text-[10px] text-muted-foreground line-through">
                                    ${Number(prod.basePrice).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddProduct(prod)}
                            disabled={isAssigned}
                            className={`h-8 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              isAssigned
                                ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                                : "bg-primary text-white hover:opacity-90 shadow-sm"
                            }`}
                          >
                            {isAssigned ? (
                              <>
                                <Check size={12} />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus size={12} />
                                <span>Add to Set</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                      <p className="text-xs font-bold">No matching products found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Assigned Showcase Set (5 Cols) */}
              <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-border bg-card/60 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <h4 className="font-heading text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-primary" />
                    Selected Sequence ({assignedProducts.length})
                  </h4>
                  {assignedProducts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAssignedProducts([])}
                      className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {assignedProducts.length > 0 ? (
                  <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1 custom-scrollbar">
                    {assignedProducts.map((prod, idx) => (
                      <div
                        key={prod._id}
                        className="flex items-center justify-between p-2 rounded-xl border border-border bg-background gap-2 group/item"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Order Index */}
                          <span className="w-5 text-center text-[10px] font-mono font-bold text-muted-foreground">
                            {idx + 1}.
                          </span>
                          <img
                            src={
                              prod.thumbnail ||
                              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=60"
                            }
                            alt={prod.name}
                            className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border"
                          />
                          <div className="min-w-0">
                            <h6 className="font-bold text-[11px] text-foreground truncate max-w-[120px] sm:max-w-[140px]">
                              {prod.name}
                            </h6>
                            <span className="text-[10px] text-primary font-extrabold">
                              ${Number(prod.salePrice ?? prod.basePrice ?? 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Reorder and Delete controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveProduct(idx, "up")}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === assignedProducts.length - 1}
                              onClick={() => handleMoveProduct(idx, "down")}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(prod._id)}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground space-y-1.5 border border-dashed border-border rounded-xl">
                    <Package size={24} className="mx-auto text-muted-foreground/40" />
                    <p className="text-xs font-bold">No Products Selected</p>
                    <p className="text-[10px]">
                      Search and click "+ Add to Set" on the left to include products in this collection.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE PREVIEW */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-border shadow-md space-y-5">
                <div className="flex justify-between items-end border-b border-border/60 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary tracking-widest block">
                      Live Collection Preview
                    </span>
                    <h3 className="text-xl font-black font-heading text-zinc-900 dark:text-zinc-100">
                      {title || "Untitled Section"}
                    </h3>
                    {description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {assignedProducts.length} Items
                  </span>
                </div>

                {assignedProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {assignedProducts.map((p) => (
                      <div
                        key={p._id}
                        className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 space-y-2"
                      >
                        <div className="w-full h-28 rounded-xl bg-zinc-200 dark:bg-zinc-700/50 overflow-hidden">
                          <img
                            src={
                              p.thumbnail ||
                              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=150"
                            }
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {p.name}
                        </h5>
                        <div className="text-xs font-black text-primary">
                          ${Number(p.salePrice ?? p.basePrice ?? 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                    <p className="text-xs font-bold">No products assigned to preview</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
          >
            Discard
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || !title.trim()}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Spinner className="w-4 h-4 animate-spin" />
                  <span>Saving Collection...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Homepage Section</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
