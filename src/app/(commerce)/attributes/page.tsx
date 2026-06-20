"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllAttributesQuery,
  useDeleteAttributeMutation,
} from "@/redux/features/attribute/attributeApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { Trash2 } from "lucide-react";
import AttributeTable from "@/components/ui/commerce/attributes/AttributeTable";
import AttributeForm from "@/components/ui/commerce/attributes/AttributeForm";

// Mock Fallback Data in case the backend DB is empty
const mockAttributes = [
  {
    _id: "attr-1",
    name: "Color",
    slug: "color",
    values: ["Black", "White", "Navy Blue", "Crimson Red", "Forest Green"],
    isActive: true,
  },
  {
    _id: "attr-2",
    name: "Size",
    slug: "size",
    values: ["S", "M", "L", "XL", "XXL"],
    isActive: true,
  },
  {
    _id: "attr-3",
    name: "Material",
    slug: "material",
    values: ["Cotton", "Polyester", "Leather", "Denim", "Wool"],
    isActive: true,
  },
];

export default function AttributesPage() {
  const { data: attrRes, isLoading, refetch } = useGetAllAttributesQuery({});
  const [deleteAttribute, { isLoading: isDeleting }] = useDeleteAttributeMutation();

  // Local storage state for mock persistence fallback
  const [localAttrs, setLocalAttrs] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zenith_attributes");
      if (saved) {
        try {
          setLocalAttrs(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        localStorage.setItem("zenith_attributes", JSON.stringify(mockAttributes));
        setLocalAttrs(mockAttributes);
      }
    }
  }, []);

  const attributes = useMemo(() => {
    if (attrRes && Array.isArray(attrRes.data) && attrRes.data.length > 0) {
      return attrRes.data;
    }
    if (Array.isArray(attrRes)) {
      return attrRes;
    }
    return localAttrs;
  }, [attrRes, localAttrs]);

  const updateLocalAttrs = (newAttrs: any[]) => {
    setLocalAttrs(newAttrs);
    localStorage.setItem("zenith_attributes", JSON.stringify(newAttrs));
  };

  const isServerConnected = useMemo(() => {
    return !!(attrRes && Array.isArray(attrRes.data) && attrRes.data.length > 0);
  }, [attrRes]);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Form states
  const [formMode, setFormMode] = useState<"create" | "update" >("create");
  const [selectedAttribute, setSelectedAttribute] = useState<any | null>(null);

  // Filtered attributes
  const filteredAttributes = useMemo(() => {
    return attributes.filter(
      (a: any) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [attributes, searchQuery]);

  const handleEditClick = (attr: any) => {
    setFormMode("update");
    setSelectedAttribute(attr);
  };

  const handleCancel = () => {
    setFormMode("create");
    setSelectedAttribute(null);
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

    const { id, name: targetName } = deleteTarget;
    const toastId = toast.loading(`Deleting attribute "${targetName}"...`);

    try {
      if (isServerConnected) {
        await deleteAttribute(id).unwrap();
        refetch();
      } else {
        const updated = localAttrs.filter((item) => item._id !== id);
        updateLocalAttrs(updated);
      }
      toast.success(`Successfully deleted attribute "${targetName}"!`, { id: toastId });
      setDeleteTarget(null);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || `Failed to delete attribute.`,
        { id: toastId }
      );
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>Commerce</span>
              <span>/</span>
              <span className="text-foreground font-semibold">Attributes</span>
            </div>
            <h1 className="font-heading text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Attributes & Variants
            </h1>
            <p className="text-xs text-muted-foreground max-w-xl">
              Configure product traits like Color, Size, and Material. These are used to generate purchase variants with custom price and stock.
            </p>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Attribute list view */}
          <div className="lg:col-span-7 space-y-4">
            <AttributeTable
              attributes={filteredAttributes}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              targetId={selectedAttribute?._id || null}
              handleEditClick={handleEditClick}
              handleDeleteClick={handleDeleteClick}
            />
          </div>

          {/* Right Panel: Edit/Create form */}
          <div className="lg:col-span-5">
            <AttributeForm
              formMode={formMode}
              activeAttribute={selectedAttribute}
              attributes={attributes}
              updateLocalAttrs={updateLocalAttrs}
              isServerConnected={isServerConnected}
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
                <h4 className="font-heading text-base font-bold text-foreground">Delete Attribute?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete attribute <span className="text-foreground font-bold">"{deleteTarget.name}"</span>? This will disable variant options built on this trait. This action cannot be undone.
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
