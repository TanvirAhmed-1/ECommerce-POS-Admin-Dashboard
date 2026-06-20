import React from "react";
import { Settings, Eye, FolderTree, Plus, Tag, Award, Flame, ShieldCheck, Activity } from "lucide-react";

interface ListingDetailsSidebarProps {
  visibility: "published" | "hidden" | "out_of_stock";
  setVisibility: (val: any) => void;
  category: string;
  setCategory: (val: string) => void;
  subcategory: string;
  setSubcategory: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  parentCategories: any[];
  subcategories: any[];
  brands: any[];
  isActive: boolean;
  setIsActive: (val: boolean) => void;
  isFeatured: boolean;
  setIsFeatured: (val: boolean) => void;
  isTrending: boolean;
  setIsTrending: (val: boolean) => void;
  isBestSeller: boolean;
  setIsBestSeller: (val: boolean) => void;
  isNewArrival: boolean;
  setIsNewArrival: (val: boolean) => void;
  setShowCategoryModal: (val: boolean) => void;
  setShowBrandModal: (val: boolean) => void;
}

export default function ListingDetailsSidebar({
  visibility,
  setVisibility,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  brand,
  setBrand,
  parentCategories,
  subcategories,
  brands,
  isActive,
  setIsActive,
  isFeatured,
  setIsFeatured,
  isTrending,
  setIsTrending,
  isBestSeller,
  setIsBestSeller,
  isNewArrival,
  setIsNewArrival,
  setShowCategoryModal,
  setShowBrandModal,
}: ListingDetailsSidebarProps) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-border space-y-5 sticky top-20">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <Settings size={16} className="text-primary" />
        Listing Details
      </h3>

      {/* Visibility Status Select */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Eye size={12} /> Visibility Status
        </label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as any)}
          className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 cursor-pointer"
        >
          <option value="published">Published (Visible online)</option>
          <option value="hidden">Hidden (Draft/Archive)</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Category Select with Quick-Add */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <FolderTree size={12} /> Category *
          </label>
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
          >
            <Plus size={10} /> Quick Add
          </button>
        </div>
        <select
          value={category}
          required
          onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory(""); // Reset subcategory when parent category changes
          }}
          className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 cursor-pointer"
        >
          <option value="">Select Category...</option>
          {parentCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Select */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <FolderTree size={12} /> Subcategory (Optional)
        </label>
        <select
          value={subcategory}
          disabled={!category || subcategories.length === 0}
          onChange={(e) => setSubcategory(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 cursor-pointer disabled:opacity-50"
        >
          <option value="">
            {category ? (subcategories.length === 0 ? "No Subcategories available" : "Select Subcategory...") : "Select parent Category first"}
          </option>
          {subcategories.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Select with Quick-Add */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Tag size={12} /> Brand (Optional)
          </label>
          <button
            type="button"
            onClick={() => setShowBrandModal(true)}
            className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
          >
            <Plus size={10} /> Quick Add
          </button>
        </div>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 cursor-pointer"
        >
          <option value="">Select Brand...</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Active Status and Badge Checkboxes */}
      <div className="pt-2 border-t border-border/60 space-y-3">
        <label className="flex items-center gap-2.5 p-2 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none opacity-90">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-border text-primary cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-foreground">Active Status</span>
            <span className="text-[8px] text-muted-foreground">Visible on site listings</span>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-border text-primary"
            />
            <span className="text-[9px] font-bold text-foreground flex items-center gap-0.5"><Award size={10} /> Featured</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none">
            <input
              type="checkbox"
              checked={isTrending}
              onChange={(e) => setIsTrending(e.target.checked)}
              className="rounded border-border text-primary"
            />
            <span className="text-[9px] font-bold text-foreground flex items-center gap-0.5"><Flame size={10} /> Trending</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
              className="rounded border-border text-primary"
            />
            <span className="text-[9px] font-bold text-foreground flex items-center gap-0.5"><ShieldCheck size={10} /> Best Seller</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="rounded border-border text-primary"
            />
            <span className="text-[9px] font-bold text-foreground flex items-center gap-0.5"><Activity size={10} /> New Arrival</span>
          </label>
        </div>
      </div>
    </div>
  );
}
