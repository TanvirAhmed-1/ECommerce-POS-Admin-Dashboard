import React from "react";
import { FolderPlus, TagIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface QuickAddModalsProps {
  showCategoryModal: boolean;
  setShowCategoryModal: (val: boolean) => void;
  newCatName: string;
  setNewCatName: (val: string) => void;
  isSavingCategory: boolean;
  handleQuickAddCategory: () => void;
  showBrandModal: boolean;
  setShowBrandModal: (val: boolean) => void;
  newBrandName: string;
  setNewBrandName: (val: string) => void;
  isSavingBrand: boolean;
  handleQuickAddBrand: () => void;
}

export default function QuickAddModals({
  showCategoryModal,
  setShowCategoryModal,
  newCatName,
  setNewCatName,
  isSavingCategory,
  handleQuickAddCategory,
  showBrandModal,
  setShowBrandModal,
  newBrandName,
  setNewBrandName,
  isSavingBrand,
  handleQuickAddBrand,
}: QuickAddModalsProps) {
  return (
    <>
      {/* QUICK ADD CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card w-full max-w-[360px] p-5 rounded-2xl border border-border bg-card shadow-2xl relative animate-scale-in">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FolderPlus size={16} />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground">Add New Category</h4>
                <p className="text-[10px] text-muted-foreground">Create item group catalog tags</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shoes, Wearables"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 h-9 rounded-lg border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickAddCategory}
                  disabled={isSavingCategory}
                  className="flex-1 h-9 bg-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
                >
                  {isSavingCategory && <Spinner className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD BRAND MODAL */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card w-full max-w-[360px] p-5 rounded-2xl border border-border bg-card shadow-2xl relative animate-scale-in">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <TagIcon size={16} />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground">Add New Brand</h4>
                <p className="text-[10px] text-muted-foreground">Register trademark labels</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nike, Adidas"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="flex-1 h-9 rounded-lg border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickAddBrand}
                  disabled={isSavingBrand}
                  className="flex-1 h-9 bg-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
                >
                  {isSavingBrand && <Spinner className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
