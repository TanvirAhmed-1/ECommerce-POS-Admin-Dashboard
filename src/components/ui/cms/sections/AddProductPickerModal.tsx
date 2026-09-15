import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Check,
  Plus,
  ShoppingBag,
  Filter,
  CheckSquare,
  Square,
  Package,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useGetAllProductsQuery } from "@/redux/features/product/productApi";
import { useGetAllCategoriesQuery } from "@/redux/features/category/categoryApi";

interface AddProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: any | null;
  onConfirmAdd: (section: any, selectedProductIds: string[]) => Promise<void>;
  isSaving: boolean;
}

export default function AddProductPickerModal({
  isOpen,
  onClose,
  section,
  onConfirmAdd,
  isSaving,
}: AddProductPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Selected product IDs state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch products and categories
  const { data: productsRes, isLoading: isProductsLoading } = useGetAllProductsQuery(
    {
      searchTerm: debouncedSearch,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      limit: 50,
    },
    { skip: !isOpen }
  );

  const { data: categoriesRes } = useGetAllCategoriesQuery({});

  const categories = useMemo(() => {
    return categoriesRes?.data || [];
  }, [categoriesRes]);

  const allProducts = useMemo(() => {
    const list = productsRes?.data?.data || productsRes?.data || [];
    return Array.isArray(list) ? list : [];
  }, [productsRes]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pre-fill already assigned product IDs
  useEffect(() => {
    if (isOpen && section) {
      const currentIds = (section.products || []).map((p: any) => p._id || p);
      setSelectedIds(currentIds);
      setSearchQuery("");
      setSelectedCategory("all");
    }
  }, [isOpen, section]);

  if (!isOpen || !section) return null;

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = allProducts.map((p: any) => p._id);
    const merged = Array.from(new Set([...selectedIds, ...visibleIds]));
    setSelectedIds(merged);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleSave = async () => {
    await onConfirmAdd(section, selectedIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-4xl rounded-3xl border border-border bg-card/95 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between gap-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-heading text-foreground">
                  Assign Products to Collection
                </h3>
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20 font-bold"
                >
                  {section.title}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Click products to add or remove them from this homepage showcase shelf.
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

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-border bg-background/50 flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex items-center h-10 flex-1 rounded-xl px-3 gap-2 border border-border bg-card transition-all focus-within:border-primary">
            <Search className="text-muted-foreground" size={15} />
            <input
              type="text"
              placeholder="Search products by name, SKU, price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-xs bg-transparent border-none text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Quick Select Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllVisible}
              className="h-10 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer whitespace-nowrap"
            >
              Select All
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="h-10 px-3 rounded-xl border border-border bg-card hover:bg-rose-500/10 text-xs font-bold text-rose-500 transition-all cursor-pointer whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-background/30">
          {isProductsLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Spinner className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-muted-foreground">Loading products...</p>
            </div>
          ) : allProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {allProducts.map((prod: any) => {
                const isSelected = selectedIds.includes(prod._id);

                return (
                  <div
                    key={prod._id}
                    onClick={() => toggleSelect(prod._id)}
                    className={`rounded-2xl border p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between relative group select-none ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                        : "border-border bg-card hover:border-primary/40 hover:bg-card/80 shadow-sm"
                    }`}
                  >
                    {/* Top Checkbox / Indicator */}
                    <div className="absolute top-2 right-2 z-10">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow"
                            : "bg-background/80 text-muted-foreground border border-border"
                        }`}
                      >
                        <Check size={13} className={isSelected ? "opacity-100" : "opacity-0"} />
                      </div>
                    </div>

                    {/* Image */}
                    <div className="w-full h-32 rounded-xl bg-muted/60 overflow-hidden mb-2.5 relative border border-border/40">
                      <img
                        src={
                          prod.thumbnail ||
                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200"
                        }
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as any).src =
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200";
                        }}
                      />
                    </div>

                    {/* Title & Price */}
                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-foreground line-clamp-2 leading-tight">
                        {prod.name}
                      </h5>
                      <div className="text-xs font-black text-primary font-heading">
                        ${Number(prod.salePrice ?? prod.basePrice ?? 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground space-y-2 border border-dashed border-border rounded-2xl">
              <Package size={32} className="mx-auto text-muted-foreground/30" />
              <p className="text-xs font-bold text-foreground">No Products Found</p>
              <p className="text-[10px] text-muted-foreground">Try a different search term or category filter.</p>
            </div>
          )}
        </div>

        {/* Footer / Confirmation Bar */}
        <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              {selectedIds.length} Products Chosen
            </span>
            <span className="text-[11px] text-muted-foreground">
              for "{section.title}"
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Spinner className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Shelf...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Selection ({selectedIds.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
