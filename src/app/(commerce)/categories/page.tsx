"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetAllCategoriesQuery, useDeleteCategoryMutation } from "@/redux/features/category/categoryApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { Trash2 } from "lucide-react";
import CategoryTable from "@/components/ui/commerce/categories/CategoryTable";
import CategoryForm from "@/components/ui/commerce/categories/CategoryForm";


export default function CategoriesPage() {
  const { data: categoryRes, isLoading, refetch } = useGetAllCategoriesQuery({});
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Categories list with fallback
  const categories = useMemo(() => {
    if (categoryRes && Array.isArray(categoryRes.data) && categoryRes.data.length > 0) {
      return categoryRes.data;
    }
    if (Array.isArray(categoryRes)) {
      return categoryRes;
    }
    return [];
  }, [categoryRes]);

  // UI state controls
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  // Form edit target state
  const [formMode, setFormMode] = useState<"create" | "update" | "sub">("create");
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  // Reset pagination on search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Helper to flat list for selection
  const flatCategories = useMemo(() => {
    const list: { _id: string; name: string; level: number }[] = [];
    const traverse = (items: any[]) => {
      items.forEach((item) => {
        list.push({ _id: item._id, name: item.name, level: item.level });
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(categories);
    return list;
  }, [categories]);

  // Click Handlers
  const handleEditClick = (category: any) => {
    setFormMode("update");
    setSelectedCategory(category);
  };

  const handleAddSubClick = (category: any) => {
    setFormMode("sub");
    setSelectedCategory(category);
  };

  const handleCancel = () => {
    setFormMode("create");
    setSelectedCategory(null);
  };

  const handleSaveSuccess = () => {
    handleCancel();
    refetch();
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
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || `Failed to delete category. Verify it has no subcategories.`,
        { id: toastId }
      );
    }
  };

  if (isLoading) {
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
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Commerce</span>
            <span className="opacity-50">/</span>
            <span className="text-foreground">Categories</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-foreground">Categories</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your eCommerce product categories, subcategories, and hierarchy tree.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Category table & search */}
          <div className="lg:col-span-8 space-y-4">
            <CategoryTable
              categories={categories}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              targetId={selectedCategory?._id || null}
              handleEditClick={handleEditClick}
              handleAddSubClick={handleAddSubClick}
              handleDeleteClick={handleDeleteClick}
              handleCancel={handleCancel}
            />
          </div>

          {/* Right Panel: Edit/Create form */}
          <div className="lg:col-span-4">
            <CategoryForm
              formMode={formMode}
              activeCategory={selectedCategory}
              flatCategories={flatCategories}
              onSaveSuccess={handleSaveSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>

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
