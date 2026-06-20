"use client";

import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetHomeSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} from "@/redux/features/section/sectionApi";
import { useGetAllProductsQuery } from "@/redux/features/product/productApi";
import Loader from "@/components/shared/Loader";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Sliders,
  Search,
  Check,
  X,
  Layers,
  ArrowUpDown,
  ShoppingBag,
  Info,
  ChevronRight,
  Eye,
  Package,
} from "lucide-react";

export default function CMSectionsPage() {
  // Fetch all home sections for admin (passing admin: true to get inactive ones as well)
  const { data: sectionsRes, isLoading, refetch } = useGetHomeSectionsQuery({ admin: "true" });
  const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
  const [updateSection, { isLoading: isUpdating }] = useUpdateSectionMutation();
  const [deleteSection, { isLoading: isDeleting }] = useDeleteSectionMutation();

  const sections = useMemo(() => sectionsRes?.data || [], [sectionsRes]);

  // Mode: "list" | "editor"
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");

  // Editor states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [assignedProducts, setAssignedProducts] = useState<any[]>([]);

  // Search queries
  const [sectionSearch, setSectionSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");

  // Debounce product search to optimize backend queries
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProductSearch(productSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [productSearch]);

  // Query products based on debounced search
  const { data: productsRes, isLoading: isProductsLoading } = useGetAllProductsQuery(
    {
      searchTerm: debouncedProductSearch,
      limit: 10,
    },
    { skip: viewMode !== "editor" }
  );

  const availableProducts = useMemo(() => {
    // Backend products format wrapper check
    const list = productsRes?.data?.data || productsRes?.data || [];
    return Array.isArray(list) ? list : [];
  }, [productsRes]);

  // Generate slug dynamically from Title
  useEffect(() => {
    if (!editingId) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generated);
    }
  }, [title, editingId]);

  // Reset editor state
  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setDisplayOrder(sections.length + 1);
    setIsActive(true);
    setAssignedProducts([]);
    setViewMode("editor");
  };

  // Edit section loader
  const handleOpenEdit = (section: any) => {
    setEditingId(section._id);
    setTitle(section.title);
    setSlug(section.slug);
    setDescription(section.description || "");
    setDisplayOrder(section.displayOrder || 0);
    setIsActive(section.isActive);
    
    // Safely assign populated products
    const products = section.products || [];
    setAssignedProducts(products);
    setViewMode("editor");
  };

  // Assign product to list
  const handleAddProduct = (prod: any) => {
    if (assignedProducts.some((p) => p._id === prod._id)) {
      toast.error("Product is already assigned to this section!");
      return;
    }
    setAssignedProducts((prev) => [...prev, prod]);
  };

  // Remove product from list
  const handleRemoveProduct = (prodId: string) => {
    setAssignedProducts((prev) => prev.filter((p) => p._id !== prodId));
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a section title.");
      return;
    }

    const payload = {
      title,
      slug,
      description,
      displayOrder: Number(displayOrder),
      isActive,
      products: assignedProducts.map((p) => p._id),
    };

    const loadingToast = toast.loading(editingId ? "Updating section..." : "Creating section...");
    try {
      if (editingId) {
        await updateSection({ id: editingId, data: payload }).unwrap();
        toast.success("Homepage Section updated successfully!", { id: loadingToast });
      } else {
        await createSection(payload).unwrap();
        toast.success("Homepage Section created successfully!", { id: loadingToast });
      }
      refetch();
      setViewMode("list");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to save section.", { id: loadingToast });
    }
  };

  // Delete section
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the "${name}" section?`)) return;

    const loadingToast = toast.loading("Deleting section...");
    try {
      await deleteSection(id).unwrap();
      toast.success("Section deleted successfully!", { id: loadingToast });
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete section.", { id: loadingToast });
    }
  };

  // Filtered sections to search in list view
  const filteredSections = useMemo(() => {
    return sections.filter((sec: any) =>
      sec.title?.toLowerCase().includes(sectionSearch.toLowerCase()) ||
      sec.slug?.toLowerCase().includes(sectionSearch.toLowerCase())
    );
  }, [sections, sectionSearch]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] w-full items-center justify-center">
          <Loader size={50} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6 text-foreground">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Web CMS</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Homepage Sections</span>
            </div>
            <h2 className="text-2xl font-black font-heading tracking-tight flex items-center gap-2">
              <Layers className="text-primary" size={24} />
              Homepage Collections & Deals
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl">
              Dynamically control homepage carousels and lists like "Best Deals", "Recommended", and campaigns. Set display ordering and assign products.
            </p>
          </div>

          {viewMode === "list" && (
            <button
              onClick={handleOpenCreate}
              className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-md hover:shadow-primary/20 shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              Create Custom Section
            </button>
          )}
        </div>

        {viewMode === "list" ? (
          /* LIST WORKSPACE */
          <div className="space-y-4">
            
            {/* Search toolbar */}
            <div className="flex items-center h-10 w-full max-w-md rounded-lg px-3 gap-2 border border-border bg-card transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
              <Search className="text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search collection titles or slugs..."
                value={sectionSearch}
                onChange={(e) => setSectionSearch(e.target.value)}
                className="flex-1 outline-none text-xs bg-transparent border-none font-medium placeholder:text-muted-foreground text-foreground"
              />
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSections.length > 0 ? (
                filteredSections.map((sec: any) => {
                  const productCount = sec.products?.length || 0;
                  return (
                    <div
                      key={sec._id}
                      className="glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between hover:shadow-md transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                              {sec.title}
                            </h4>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              Slug: {sec.slug}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground font-bold">
                              Order: {sec.displayOrder || 0}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                                sec.isActive
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10"
                                  : "bg-zinc-500/10 text-muted-foreground border-border"
                              }`}
                            >
                              {sec.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </div>
                        </div>

                        {sec.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {sec.description}
                          </p>
                        )}

                        {/* Populated Product Cards preview */}
                        <div className="pt-2">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                            Assigned Products ({productCount})
                          </label>
                          
                          {productCount > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {sec.products.slice(0, 4).map((p: any) => (
                                <div
                                  key={p._id}
                                  className="flex items-center gap-1.5 bg-muted/30 border border-border/50 rounded-lg p-1.5 text-[10px] font-medium max-w-[180px]"
                                >
                                  <img
                                    src={p.thumbnail || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=60"}
                                    alt={p.name}
                                    className="w-5 h-5 rounded object-cover shrink-0"
                                  />
                                  <span className="truncate text-foreground font-semibold">{p.name}</span>
                                </div>
                              ))}
                              {productCount > 4 && (
                                <div className="bg-primary/5 border border-primary/10 rounded-lg px-2 py-1.5 text-[9px] font-bold text-primary flex items-center justify-center">
                                  + {productCount - 4} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                              <Info size={12} />
                              No products assigned yet. Edit this section to assign products.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(sec)}
                          className="h-8 px-3 rounded-lg border border-border bg-card text-foreground hover:bg-muted text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 size={12} />
                          <span>Edit Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sec._id, sec.title)}
                          className="h-8 px-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/10 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="lg:col-span-2 p-12 text-center text-muted-foreground space-y-2 border border-border border-dashed rounded-2xl bg-card">
                  <Sliders className="mx-auto text-muted/30" size={36} />
                  <p className="text-xs font-bold">No Collections Found</p>
                  <p className="text-[10px]">Create homepage collection lists to display campaigns and categorized deals.</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* SPLIT EDITOR & PRODUCT SET ASSIGNER */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side: Section Configuration Fields (5 Cols) */}
            <form onSubmit={handleSave} className="lg:col-span-5 space-y-4">
              <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
                
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="font-heading text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={14} className="text-primary" />
                    Collection Configuration
                  </h3>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                  >
                    Cancel
                  </button>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Section Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Deal, Popular Products"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-muted/20 text-xs focus:ring-1 focus:ring-primary outline-none"
                    required
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Route Slug (URL Key)</label>
                  <input
                    type="text"
                    value={slug}
                    disabled
                    className="w-full h-10 px-3 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground font-mono outline-none cursor-not-allowed"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subtitle Description</label>
                  <textarea
                    placeholder="e.g. Handpicked top items of the week at absolute lowest rates"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-20 p-3 rounded-lg border border-border bg-muted/20 text-xs focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Display Order */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Display Order</label>
                    <input
                      type="number"
                      placeholder="e.g. 1"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-muted/20 text-xs focus:ring-1 focus:ring-primary outline-none font-bold"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Visibility Status</label>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`w-full h-10 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-zinc-500/10 text-muted-foreground border-border"
                      }`}
                    >
                      {isActive ? <Check size={14} /> : null}
                      <span>{isActive ? "Show on storefront" : "Hide section"}</span>
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className="h-10 px-4 rounded-lg border border-border bg-card text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-md hover:shadow-primary/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Save Collection</span>
                  </button>
                </div>

              </div>
            </form>

            {/* Right side: Dynamic Product Assigner (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Product assignment list */}
              <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4 shadow-sm min-h-[300px]">
                <h3 className="font-heading text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-3">
                  <ShoppingBag size={14} className="text-primary" />
                  Assigned Products Set ({assignedProducts.length})
                </h3>

                {assignedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {assignedProducts.map((prod) => (
                      <div
                        key={prod._id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border bg-muted/10 hover:bg-muted/20 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prod.thumbnail || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=100"}
                            alt={prod.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-border"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <h5 className="font-bold text-foreground text-xs truncate max-w-[160px]">{prod.name}</h5>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-primary font-bold">
                                ${prod.salePrice ?? prod.basePrice ?? "0"}
                              </span>
                              {prod.basePrice && prod.salePrice && prod.salePrice < prod.basePrice && (
                                <span className="text-[9px] text-muted-foreground line-through">
                                  ${prod.basePrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(prod._id)}
                          className="p-1 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded transition-colors cursor-pointer"
                          title="Remove product"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground space-y-1.5 border border-dashed border-border rounded-xl">
                    <Package size={28} className="mx-auto text-muted/30" />
                    <p className="text-xs font-bold">No Products Assigned</p>
                    <p className="text-[9px]">Use the panel below to search and assign products to this campaign collection.</p>
                  </div>
                )}
              </div>

              {/* Product Search & Selector */}
              <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
                <h3 className="font-heading text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-3">
                  <Search size={14} className="text-primary" />
                  Search & Assign Products
                </h3>

                <div className="flex items-center h-10 w-full rounded-lg px-3 gap-2 border border-border bg-muted/20 focus-within:border-zinc-400 dark:focus-within:border-zinc-700 transition-all">
                  <Search className="text-muted-foreground" size={14} />
                  <input
                    type="text"
                    placeholder="Type to search product catalog..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="flex-1 outline-none text-xs bg-transparent border-none text-foreground placeholder:text-muted-foreground"
                  />
                  {productSearch && (
                    <button type="button" onClick={() => setProductSearch("")} className="text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {isProductsLoading ? (
                    <div className="flex justify-center p-6">
                      <Loader size={24} />
                    </div>
                  ) : availableProducts.length > 0 ? (
                    availableProducts.map((prod: any) => {
                      const isAssigned = assignedProducts.some((p) => p._id === prod._id);
                      return (
                        <div
                          key={prod._id}
                          className="flex items-center justify-between p-2 rounded-xl border border-border/30 bg-muted/5 hover:bg-muted/10 transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={prod.thumbnail || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=100"}
                              alt={prod.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border/50"
                            />
                            <div className="min-w-0">
                              <h6 className="font-semibold text-foreground text-[11px] truncate max-w-[200px]">{prod.name}</h6>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                  ${prod.salePrice ?? prod.basePrice ?? "0"}
                                </span>
                                {prod.basePrice && prod.salePrice && prod.salePrice < prod.basePrice && (
                                  <span className="text-[9px] text-muted-foreground/60 line-through">
                                    ${prod.basePrice}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleAddProduct(prod)}
                            disabled={isAssigned}
                            className={`h-7 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isAssigned
                                ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                                : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                            }`}
                          >
                            {isAssigned ? (
                              <>
                                <Check size={10} />
                                <span>Assigned</span>
                              </>
                            ) : (
                              <>
                                <Plus size={10} />
                                <span>Add to Set</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center p-4 text-[10px] text-muted-foreground italic">
                      No matching products found. Try typing a different search term.
                    </p>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
