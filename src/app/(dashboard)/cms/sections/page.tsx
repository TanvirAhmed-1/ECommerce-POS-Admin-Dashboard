"use client";

import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetHomeSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} from "@/redux/features/section/sectionApi";
import Loader from "@/components/shared/Loader";
import { toast, Toaster } from "react-hot-toast";
import {
  Plus,
  Search,
  Layers,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown,
  ShoppingBag,
  Package,
} from "lucide-react";
import VisualSectionShelf from "@/components/ui/cms/sections/VisualSectionShelf";
import AddProductPickerModal from "@/components/ui/cms/sections/AddProductPickerModal";
import EditSectionModal from "@/components/ui/cms/sections/EditSectionModal";
import StorefrontPreviewModal from "@/components/ui/cms/sections/StorefrontPreviewModal";

const fallbackSections = [
  {
    _id: "mock-sec-1",
    title: "🔥 Flash Sale Deals",
    slug: "flash-sale",
    description: "Limited time offers with verified discounts up to 50% off",
    displayOrder: 1,
    isActive: true,
    products: [
      {
        _id: "mock-p1",
        name: "Wireless Noise Cancelling Headphones",
        thumbnail:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300",
        salePrice: 199,
        basePrice: 299,
      },
      {
        _id: "mock-p2",
        name: "Pro Performance Running Shoes",
        thumbnail:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300",
        salePrice: 129,
        basePrice: 160,
      },
      {
        _id: "mock-p3",
        name: "Minimalist Smart Watch Series 8",
        thumbnail:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300",
        salePrice: 249,
        basePrice: 320,
      },
    ],
  },
  {
    _id: "mock-sec-2",
    title: "⭐ Recommended For You",
    slug: "recommended",
    description: "Trending customer favorites and best-reviewed lifestyle products",
    displayOrder: 2,
    isActive: true,
    products: [
      {
        _id: "mock-p4",
        name: "Vintage Polarized Sunglasses",
        thumbnail:
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=300",
        salePrice: 79,
        basePrice: 99,
      },
      {
        _id: "mock-p5",
        name: "Premium Leather Everyday Bag",
        thumbnail:
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=300",
        salePrice: 159,
        basePrice: 199,
      },
    ],
  },
];

export default function CMSectionsPage() {
  // Fetch home sections for admin
  const {
    data: sectionsRes,
    isLoading,
    refetch,
    isFetching,
  } = useGetHomeSectionsQuery({ admin: "true" });

  const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
  const [updateSection, { isLoading: isUpdating }] = useUpdateSectionMutation();
  const [deleteSection, { isLoading: isDeleting }] = useDeleteSectionMutation();

  const isSaving = isCreating || isUpdating || isDeleting;

  const [localSections, setLocalSections] = useState<any[]>([]);

  // Load localStorage fallback if any
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zenith_cms_sections");
      if (saved) {
        try {
          setLocalSections(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const sections = useMemo(() => {
    if (sectionsRes?.data && Array.isArray(sectionsRes.data) && sectionsRes.data.length > 0) {
      return [...sectionsRes.data].sort(
        (a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      );
    }
    if (localSections.length > 0) {
      return [...localSections].sort(
        (a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      );
    }
    return fallbackSections;
  }, [sectionsRes, localSections]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modals state
  const [addProductsModalOpen, setAddProductsModalOpen] = useState(false);
  const [targetSectionForProducts, setTargetSectionForProducts] = useState<any | null>(null);

  const [editSectionModalOpen, setEditSectionModalOpen] = useState(false);
  const [targetSectionForEdit, setTargetSectionForEdit] = useState<any | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewSection, setPreviewSection] = useState<any | null>(null);

  // Filtered Sections
  const filteredSections = useMemo(() => {
    return sections.filter((s: any) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.title?.toLowerCase().includes(q) ||
        s.slug?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.products?.some((p: any) => p.name?.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = s.isActive === true;
      if (statusFilter === "inactive") matchesStatus = s.isActive === false;

      return matchesSearch && matchesStatus;
    });
  }, [sections, searchQuery, statusFilter]);

  // Stats
  const activeCount = useMemo(() => {
    return sections.filter((s) => s.isActive).length;
  }, [sections]);

  const totalAssignedProducts = useMemo(() => {
    return sections.reduce((sum, s) => sum + (s.products?.length || 0), 0);
  }, [sections]);

  // Actions
  const handleOpenCreateSection = () => {
    setTargetSectionForEdit(null);
    setEditSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec: any) => {
    setTargetSectionForEdit(sec);
    setEditSectionModalOpen(true);
  };

  const handleOpenAddProducts = (sec: any) => {
    setTargetSectionForProducts(sec);
    setAddProductsModalOpen(true);
  };

  const handleOpenPreview = (sec: any) => {
    setPreviewSection(sec);
    setPreviewModalOpen(true);
  };

  // Save Section Settings (Create / Update)
  const handleSaveSectionSettings = async (payload: any) => {
    const toastId = toast.loading(
      targetSectionForEdit ? "Updating section..." : "Creating section..."
    );

    const isMongoId = targetSectionForEdit
      ? /^[0-9a-fA-F]{24}$/.test(targetSectionForEdit._id)
      : false;

    try {
      if (targetSectionForEdit?._id && isMongoId) {
        await updateSection({ id: targetSectionForEdit._id, data: payload }).unwrap();
        toast.success("Section updated successfully!", { id: toastId });
        refetch();
      } else if (!targetSectionForEdit && sectionsRes?.data) {
        await createSection(payload).unwrap();
        toast.success("Section created successfully!", { id: toastId });
        refetch();
      } else {
        // Local fallback
        let updated: any[] = [];
        if (targetSectionForEdit) {
          updated = sections.map((s) =>
            s._id === targetSectionForEdit._id ? { ...s, ...payload } : s
          );
        } else {
          const newSec = {
            _id: `sec-${Date.now()}`,
            ...payload,
          };
          updated = [...sections, newSec];
        }
        setLocalSections(updated);
        localStorage.setItem("zenith_cms_sections", JSON.stringify(updated));
        toast.success("Section saved locally!", { id: toastId });
      }

      setEditSectionModalOpen(false);
      setTargetSectionForEdit(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to save section.", {
        id: toastId,
      });
    }
  };

  // Save Product Selection from Picker Modal
  const handleConfirmAddProducts = async (sec: any, productIds: string[]) => {
    const toastId = toast.loading(`Updating products in "${sec.title}"...`);
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(sec._id);

    try {
      if (isMongoId) {
        await updateSection({
          id: sec._id,
          data: {
            ...sec,
            products: productIds,
          },
        }).unwrap();
        toast.success(`Updated products in "${sec.title}"!`, { id: toastId });
        refetch();
      } else {
        const updated = sections.map((s) => {
          if (s._id === sec._id) {
            return {
              ...s,
              products: productIds.map((id) => {
                // If it's an object in previous state, preserve it, or pass id
                const existing = s.products?.find((p: any) => (p._id || p) === id);
                return existing || { _id: id, name: "Selected Product", salePrice: 99 };
              }),
            };
          }
          return s;
        });
        setLocalSections(updated);
        localStorage.setItem("zenith_cms_sections", JSON.stringify(updated));
        toast.success("Products updated!", { id: toastId });
      }

      setAddProductsModalOpen(false);
      setTargetSectionForProducts(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to assign products.", { id: toastId });
    }
  };

  // Quick Remove single product from shelf
  const handleRemoveProductFromShelf = async (sec: any, prodId: string) => {
    const currentProducts = sec.products || [];
    const remainingIds = currentProducts
      .filter((p: any) => (p._id || p) !== prodId)
      .map((p: any) => p._id || p);

    await handleConfirmAddProducts(sec, remainingIds);
  };

  // Reorder single product inside shelf (Left / Right)
  const handleReorderProductInShelf = async (
    sec: any,
    prodIndex: number,
    direction: "left" | "right"
  ) => {
    const targetIdx = direction === "left" ? prodIndex - 1 : prodIndex + 1;
    const currentProducts = [...(sec.products || [])];
    if (targetIdx < 0 || targetIdx >= currentProducts.length) return;

    const temp = currentProducts[prodIndex];
    currentProducts[prodIndex] = currentProducts[targetIdx];
    currentProducts[targetIdx] = temp;

    const updatedIds = currentProducts.map((p: any) => p._id || p);
    await handleConfirmAddProducts(sec, updatedIds);
  };

  // Toggle Active / Draft Status
  const handleToggleStatus = async (sec: any) => {
    const newStatus = !sec.isActive;
    const toastId = toast.loading(
      newStatus ? `Publishing "${sec.title}"...` : `Setting "${sec.title}" to Draft...`
    );
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(sec._id);

    try {
      if (isMongoId) {
        await updateSection({
          id: sec._id,
          data: { isActive: newStatus },
        }).unwrap();
        toast.success(
          newStatus ? `"${sec.title}" is now LIVE on homepage!` : `"${sec.title}" hidden.`,
          { id: toastId }
        );
        refetch();
      } else {
        const updated = sections.map((s) =>
          s._id === sec._id ? { ...s, isActive: newStatus } : s
        );
        setLocalSections(updated);
        localStorage.setItem("zenith_cms_sections", JSON.stringify(updated));
        toast.success(newStatus ? "Section Published!" : "Section Set to Draft!", {
          id: toastId,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update status.", { id: toastId });
    }
  };

  // Move Section Order (Up / Down)
  const handleMoveSectionOrder = async (sec: any, direction: "up" | "down") => {
    const currentIndex = sections.findIndex((s) => s._id === sec._id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const targetSec = sections[targetIndex];
    const currentOrder = sec.displayOrder ?? currentIndex + 1;
    const targetOrder = targetSec.displayOrder ?? targetIndex + 1;

    const toastId = toast.loading("Reordering homepage sections...");
    const isMongoId =
      /^[0-9a-fA-F]{24}$/.test(sec._id) && /^[0-9a-fA-F]{24}$/.test(targetSec._id);

    try {
      if (isMongoId) {
        await Promise.all([
          updateSection({
            id: sec._id,
            data: { displayOrder: targetOrder },
          }).unwrap(),
          updateSection({
            id: targetSec._id,
            data: { displayOrder: currentOrder },
          }).unwrap(),
        ]);
        toast.success("Section sequence updated!", { id: toastId });
        refetch();
      } else {
        const updated = sections.map((s) => {
          if (s._id === sec._id) return { ...s, displayOrder: targetOrder };
          if (s._id === targetSec._id) return { ...s, displayOrder: currentOrder };
          return s;
        });
        setLocalSections(updated);
        localStorage.setItem("zenith_cms_sections", JSON.stringify(updated));
        toast.success("Section sequence updated locally!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to reorder sections.", { id: toastId });
    }
  };

  // Delete Section
  const handleDeleteSection = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the "${title}" section?`)) {
      return;
    }

    const toastId = toast.loading("Deleting section...");
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    try {
      if (isMongoId) {
        await deleteSection(id).unwrap();
        toast.success("Section deleted successfully!", { id: toastId });
        refetch();
      } else {
        const updated = sections.filter((s) => s._id !== id);
        setLocalSections(updated);
        localStorage.setItem("zenith_cms_sections", JSON.stringify(updated));
        toast.success("Section removed locally!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to delete section.", { id: toastId });
    }
  };

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
      <div className="space-y-4 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-5 text-foreground pb-12">
        {/* 1. TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Web CMS</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Homepage Sections</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-foreground flex items-center gap-2">
                <Layers className="text-primary" size={24} />
                Homepage Showcase Shelves
              </h1>
              <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                {activeCount} Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Easily manage, reorder, and populate products across your homepage collections and promotional rows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetch();
                toast.success("Storefront sections synced!");
              }}
              disabled={isFetching}
              className="h-8.5 px-3 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Refresh"
            >
              <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              onClick={handleOpenCreateSection}
              className="h-8.5 px-4 rounded-xl bg-primary hover:opacity-90 text-white flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-md shadow-primary/20 shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              <span>+ Add New Section</span>
            </button>
          </div>
        </div>

        {/* 2. TOOLBAR & SEARCH (COMPACT) */}
        <div className="glass-card p-2.5 rounded-xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border self-start">
            {[
              { key: "all", label: `All (${sections.length})` },
              { key: "active", label: `Published (${activeCount})` },
              { key: "inactive", label: `Drafts (${sections.length - activeCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as any)}
                className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                  statusFilter === tab.key
                    ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center h-8.5 w-full md:max-w-md rounded-lg px-2.5 gap-2 border border-border bg-card transition-all focus-within:border-primary">
            <Search className="text-muted-foreground shrink-0" size={14} />
            <input
              type="text"
              placeholder="Search collections or product names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-xs bg-transparent border-none font-medium text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground font-bold px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 3. VISUAL PRODUCT SHELVES (COMPACT STACK) */}
        <div className="space-y-3">
          {filteredSections.length > 0 ? (
            filteredSections.map((sec: any, idx: number) => (
              <VisualSectionShelf
                key={sec._id || idx}
                section={sec}
                index={idx}
                totalSections={filteredSections.length}
                onOpenAddProducts={handleOpenAddProducts}
                onEditSection={handleOpenEditSection}
                onDeleteSection={handleDeleteSection}
                onToggleStatus={handleToggleStatus}
                onMoveSectionOrder={handleMoveSectionOrder}
                onRemoveProductFromSection={handleRemoveProductFromShelf}
                onReorderProductInShelf={handleReorderProductInShelf}
                onOpenPreview={handleOpenPreview}
                isUpdating={isSaving}
              />
            ))
          ) : (
            <div className="glass-card p-12 text-center border border-dashed border-border rounded-3xl bg-card space-y-4">
              <Layers className="mx-auto text-muted-foreground/30" size={48} />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  No Homepage Sections Match
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchQuery
                    ? "Try searching for a different keyword or switch filter tabs."
                    : "Create your first homepage showcase section to feature deals, popular products, and new arrivals."}
                </p>
              </div>
              <button
                onClick={handleOpenCreateSection}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={15} />
                <span>Create First Section</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. MODALS */}
        {/* Visual Catalog Product Picker */}
        <AddProductPickerModal
          isOpen={addProductsModalOpen}
          onClose={() => {
            setAddProductsModalOpen(false);
            setTargetSectionForProducts(null);
          }}
          section={targetSectionForProducts}
          onConfirmAdd={handleConfirmAddProducts}
          isSaving={isSaving}
        />

        {/* Edit Section Title/Slug Settings */}
        <EditSectionModal
          isOpen={editSectionModalOpen}
          onClose={() => {
            setEditSectionModalOpen(false);
            setTargetSectionForEdit(null);
          }}
          section={targetSectionForEdit}
          onSave={handleSaveSectionSettings}
          isSaving={isSaving}
          totalSectionsCount={sections.length}
        />

        {/* Storefront Customer Simulator */}
        <StorefrontPreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewSection(null);
          }}
          section={previewSection}
        />
      </div>
    </DashboardLayout>
  );
}
