"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetAllCategoriesQuery, useDeleteCategoryMutation } from "@/redux/features/category/categoryApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Plus } from "lucide-react";
import CategoryTable from "@/components/ui/commerce/categories/CategoryTable";
import CategoryModal from "@/components/ui/commerce/categories/CategoryModal";

export default function CategoriesPage() {
  // Query Filters & Pagination State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [navbarFilter, setNavbarFilter] = useState<string>("");
  const [footerFilter, setFooterFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  // Construct backend query params
  const queryParams = useMemo(() => {
    const p: Record<string, any> = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (searchQuery.trim()) p.search = searchQuery.trim();
    if (activeFilter) p.isActive = activeFilter;
    if (navbarFilter) p.showInNavbar = navbarFilter;
    if (footerFilter) p.showInFooter = footerFilter;
    return p;
  }, [currentPage, itemsPerPage, searchQuery, activeFilter, navbarFilter, footerFilter]);

  // Main categories query (backend filtered & paginated)
  const { data: categoryRes, isLoading, refetch } = useGetAllCategoriesQuery(queryParams);

  // Full category list query (for parent category selector in Modal)
  const { data: allCategoriesRes, refetch: refetchAll } = useGetAllCategoriesQuery({ isAll: true });

  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Categories array with fallback
  const categories = useMemo(() => {
    if (categoryRes && Array.isArray(categoryRes.data)) {
      return categoryRes.data;
    }
    if (Array.isArray(categoryRes)) {
      return categoryRes;
    }
    return [];
  }, [categoryRes]);

  // Meta pagination data
  const meta = useMemo(() => {
    return (
      categoryRes?.meta || {
        page: currentPage,
        limit: itemsPerPage,
        total: categories.length,
        totalPage: Math.ceil(categories.length / itemsPerPage) || 1,
      }
    );
  }, [categoryRes, currentPage, itemsPerPage, categories.length]);

  // Flat list for Parent Category selection in Modal
  const flatCategories = useMemo(() => {
    const list = Array.isArray(allCategoriesRes?.data) ? allCategoriesRes.data : [];
    return list.map((c: any) => ({
      _id: c._id,
      name: c.name,
      level: c.level || 0,
    }));
  }, [allCategoriesRes]);

  // UI state controls
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "update" | "sub">("create");
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveFilter("");
    setNavbarFilter("");
    setFooterFilter("");
    setCurrentPage(1);
  };

  // Click Handlers
  const handleCreateClick = () => {
    setFormMode("create");
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (category: any) => {
    setFormMode("update");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAddSubClick = (category: any) => {
    setFormMode("sub");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setFormMode("create");
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    refetch();
    refetchAll();
  };

  const handleDeleteClick = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const { id, name } = deleteTarget;
    const toastId = toast.loading(`Deleting category "${name}"...`);

    try {
      await deleteCategory(id).unwrap();
      toast.success(`Successfully deleted "${name}"!`, { id: toastId });
      setDeleteTarget(null);
      refetch();
      refetchAll();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || `Failed to delete category. Verify it has no subcategories.`,
        { id: toastId }
      );
    }
  };

  if (isLoading && !categoryRes) {
    return (
      <DashboardLayout>
        <div className="flex h-[75vh] w-full items-center justify-center">
          <Loader size={50} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Commerce</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Categories</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">Categories</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your eCommerce product categories, subcategories, hero banners, and SEO descriptions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateClick}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-md shadow-primary/25 active:scale-98"
          >
            <Plus size={16} />
            <span>Add New Category</span>
          </button>
        </div>

        {/* Category Hierarchy Table */}
        <div className="w-full">
          <CategoryTable
            categories={categories}
            meta={meta}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            navbarFilter={navbarFilter}
            setNavbarFilter={setNavbarFilter}
            footerFilter={footerFilter}
            setFooterFilter={setFooterFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            targetId={selectedCategory?._id || null}
            handleEditClick={handleEditClick}
            handleAddSubClick={handleAddSubClick}
            handleDeleteClick={handleDeleteClick}
            handleResetFilters={handleResetFilters}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* CATEGORY CREATE / UPDATE MODAL */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formMode={formMode}
        activeCategory={selectedCategory}
        flatCategories={flatCategories}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card w-full max-w-[400px] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl relative overflow-hidden animate-scale-in">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-destructive" />

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <Trash2 size={22} />
              </div>

              <div className="text-center space-y-1.5">
                <h4 className="font-heading text-base font-bold text-foreground">Delete Category?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete category <span className="text-foreground font-bold">"{deleteTarget.name}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 h-10 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-destructive/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Spinner className="w-3.5 h-3.5 animate-spin text-destructive-foreground" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  <span>{isDeleting ? "Deleting..." : "Yes, Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


