"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllSlidersQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} from "@/redux/features/slider/sliderApi";
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  Images,
  Plus,
  Edit,
  Trash2,
  Save,
  Globe,
  Image as ImageIcon,
  Search,
  Check,
  X,
  UploadCloud,
  ArrowUpDown,
  Eye,
} from "lucide-react";

// Mock Fallback Data in case the backend DB is empty
const mockSliders = [
  {
    _id: "mock-s1",
    title: "Summer Collection Sale",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
    link: "https://shop.com/summer-sale",
    priority: 1,
    isActive: true,
  },
  {
    _id: "mock-s2",
    title: "Premium Footwear Arrivals",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    link: "https://shop.com/footwear",
    priority: 2,
    isActive: true,
  },
  {
    _id: "mock-s3",
    title: "Smart Devices Expo",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
    link: "https://shop.com/gadgets",
    priority: 3,
    isActive: false,
  },
];

export default function SlidersPage() {
  // Queries & Mutations
  const { data: sliderRes, isLoading, refetch } = useGetAllSlidersQuery({});
  const [createSlider, { isLoading: isCreating }] = useCreateSliderMutation();
  const [updateSlider, { isLoading: isUpdating }] = useUpdateSliderMutation();
  const [deleteSlider, { isLoading: isDeleting }] = useDeleteSliderMutation();

  const isSaving = isCreating || isUpdating;

  // Sliders list with fallback
  const sliders = useMemo(() => {
    if (sliderRes && Array.isArray(sliderRes.data) && sliderRes.data.length > 0) {
      return sliderRes.data;
    }
    if (Array.isArray(sliderRes)) {
      return sliderRes;
    }
    return mockSliders;
  }, [sliderRes]);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Form states
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [priority, setPriority] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSingleImage, { isLoading: isUploadingImage }] = useUploadSingleImageMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size exceeds the 5MB limit!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const toastId = toast.loading("Uploading slider image...");
    try {
      const res = await uploadSingleImage(formData).unwrap();
      if (res?.success && res?.data?.url) {
        setImageUrl(res.data.url);
        toast.success("Slider image uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed: Invalid response", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "Failed to upload image.",
        { id: toastId }
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size exceeds the 5MB limit!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const toastId = toast.loading("Uploading slider image...");
    try {
      const res = await uploadSingleImage(formData).unwrap();
      if (res?.success && res?.data?.url) {
        setImageUrl(res.data.url);
        toast.success("Slider image uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed: Invalid response", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "Failed to upload image.",
        { id: toastId }
      );
    }
  };

  // Filtered sliders sorted by priority
  const filteredSliders = useMemo(() => {
    return sliders
      .filter((s: any) => {
        const titleStr = s.title || "";
        const linkStr = s.link || "";
        return (
          titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          linkStr.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a: any, b: any) => a.priority - b.priority);
  }, [sliders, searchQuery]);

  const handleEditClick = (slider: any) => {
    setFormMode("update");
    setTargetId(slider._id);
    setTitle(slider.title || "");
    setImageUrl(slider.image || "");
    setLink(slider.link || "");
    setPriority(slider.priority || 0);
    setIsActive(slider.isActive !== false);
  };

  const handleCancel = () => {
    setFormMode("create");
    setTargetId(null);
    setTitle("");
    setImageUrl("");
    setLink("");
    setPriority(0);
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      toast.error("Slider image is required!");
      return;
    }

    const toastId = toast.loading(
      formMode === "update" ? "Updating slider details..." : "Saving new slider..."
    );

    try {
      const payload = {
        title: title.trim() || undefined,
        image: imageUrl.trim(),
        link: link.trim() || undefined,
        priority: Number(priority),
        isActive,
      };

      if (formMode === "create") {
        await createSlider(payload).unwrap();
        toast.success("Successfully created new slider!", { id: toastId });
        handleCancel();
        refetch();
      } else if (formMode === "update" && targetId) {
        if (targetId.startsWith("mock")) {
          toast.error("Cannot edit mock demo data. Please create a new slider instead!", { id: toastId });
          return;
        }
        await updateSlider({ id: targetId, data: payload }).unwrap();
        toast.success("Successfully updated slider!", { id: toastId });
        handleCancel();
        refetch();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "An unexpected error occurred while saving.",
        { id: toastId }
      );
    }
  };

  const handleDeleteClick = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const { id, title } = deleteTarget;
    if (id.startsWith("mock")) {
      toast.error("Cannot delete mock demo data.");
      setDeleteTarget(null);
      return;
    }
    const toastId = toast.loading(`Deleting slider "${title || "untitled"}"...`);

    try {
      await deleteSlider(id).unwrap();
      toast.success("Successfully deleted slider!", { id: toastId });
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || `Failed to delete slider.`,
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
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-2 md:p-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>CMS</span>
              <span>/</span>
              <span className="text-foreground font-semibold">Sliders</span>
            </div>
            <h1 className="font-heading text-2xl font-black tracking-tight text-foreground md:text-3xl flex items-center gap-2">
              <Images className="text-primary" size={26} />
              Homepage Sliders
            </h1>
            <p className="text-xs text-muted-foreground max-w-xl">
              Configure promo banners, slideshow carousels, marketing link mappings, and priority sequences.
            </p>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Sliders list view */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-card p-5 rounded-2xl border border-border bg-card">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  Active Slides ({filteredSliders.length})
                </h3>
                {/* Search Bar */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input
                    type="text"
                    placeholder="Search sliders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Sliders List */}
              <div className="space-y-4 overflow-y-auto max-h-[650px] pr-1 custom-scrollbar">
                {filteredSliders.length > 0 ? (
                  <div className="space-y-3">
                    {filteredSliders.map((slider: any) => {
                      const isSelectedForEdit = targetId === slider._id;
                      return (
                        <div
                          key={slider._id}
                          onClick={() => handleEditClick(slider)}
                          className={`group p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row gap-4 relative overflow-hidden ${
                            isSelectedForEdit
                              ? "border-primary bg-primary/5 dark:bg-primary/10"
                              : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card hover:bg-muted/10"
                          }`}
                        >
                          {/* Slider Image Container */}
                          <div className="w-full md:w-44 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border relative">
                            {slider.image ? (
                              <img
                                src={slider.image}
                                alt={slider.title || "Slider"}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                onError={(e) => {
                                  (e.target as any).src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200";
                                }}
                              />
                            ) : (
                              <Images size={24} className="text-muted-foreground" />
                            )}
                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-extrabold flex items-center gap-1 shadow-md">
                              <ArrowUpDown size={8} />
                              Priority: {slider.priority}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-bold text-foreground truncate max-w-[250px]">
                                  {slider.title || "Untitled Slider"}
                                </h4>
                                {slider.isActive ? (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0 border border-emerald-500/20">
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-500/10 text-muted-foreground uppercase tracking-wider shrink-0 border border-border">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              {slider.link && (
                                <a
                                  href={slider.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1 font-medium truncate"
                                >
                                  <Globe size={10} className="shrink-0" />
                                  {slider.link}
                                </a>
                              )}
                            </div>
                            
                            <p className="text-[9px] text-muted-foreground font-mono truncate mt-2">
                              ID: {slider._id}
                            </p>
                          </div>

                          {/* Float Actions */}
                          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur p-1 rounded-lg border border-border shadow-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(slider);
                              }}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer transition-colors"
                              title="Edit Slider"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                handleDeleteClick(slider._id, slider.title || "Untitled Slider", e);
                              }}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors"
                              title="Delete Slider"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground space-y-2 border border-dashed border-border rounded-xl">
                    <Images className="mx-auto text-muted/30 animate-pulse" size={42} />
                    <p className="text-xs font-bold">No Homepage Sliders Found</p>
                    <p className="text-[10px]">Create your first promotional slider using the form on the right.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Edit/Create Form */}
          <div className="lg:col-span-5">
            <div className="glass-card p-5 rounded-2xl border border-border bg-card sticky top-20 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Images size={16} />
                </div>
                <div>
                  <h4 className="font-heading text-base font-bold text-foreground capitalize">
                    {formMode === "create" ? "Add Slider" : "Update Slider"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formMode === "create" ? "Establish a new homepage promotion slide" : "Modify configuration settings for active slide"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Slider Image Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Slider Banner Image *
                    </label>
                    <div className="flex gap-1 p-0.5 rounded-lg bg-muted border border-border">
                      <button
                        type="button"
                        onClick={() => setUploadMode("upload")}
                        className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                          uploadMode === "upload"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode("url")}
                        className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                          uploadMode === "url"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        URL Link
                      </button>
                    </div>
                  </div>

                  {uploadMode === "upload" ? (
                    <div>
                      {imageUrl ? (
                        <div className="relative group rounded-xl border border-border bg-card p-3 flex flex-col gap-2 shadow-inner">
                          <div className="w-full h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border relative">
                            <img
                              src={imageUrl}
                              alt="Slider preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as any).src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setImageUrl("")}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600/90 text-white rounded-lg cursor-pointer transition-all shadow-md"
                              title="Remove Image"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-[9px] text-muted-foreground truncate font-mono">
                            {imageUrl}
                          </p>
                        </div>
                      ) : (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById("slider-file-input")?.click()}
                          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                            isDragging
                              ? "border-primary bg-primary/5 dark:bg-primary/10"
                              : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card hover:bg-muted/10"
                          }`}
                        >
                          <input
                            id="slider-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          
                          {isUploadingImage ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-2">
                              <Spinner className="w-6 h-6 animate-spin text-primary" />
                              <span className="text-[10px] font-bold text-muted-foreground">Uploading banner image...</span>
                            </div>
                          ) : (
                            <>
                              <UploadCloud
                                size={26}
                                className={`text-muted-foreground/60 transition-transform ${
                                  isDragging ? "scale-110 text-primary" : "group-hover:scale-105"
                                }`}
                              />
                              <div className="space-y-0.5">
                                <p className="text-[11px] font-bold text-foreground">
                                  Drag & drop image file here
                                </p>
                                <p className="text-[9px] text-muted-foreground">
                                  or <span className="text-primary hover:underline font-bold">browse your files</span>
                                </p>
                              </div>
                              <p className="text-[8px] text-muted-foreground/80 mt-1">
                                High-res banners recommended (Max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <input
                        type="url"
                        required
                        disabled={isSaving}
                        placeholder="https://domain.com/banner-image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>

                {/* Slider Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Slider Title (Optional)
                  </label>
                  <input
                    type="text"
                    disabled={isSaving}
                    placeholder="e.g. Summer Promo, Tech Expo"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                  />
                </div>

                {/* Slider Redirect Link */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Redirect Link (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input
                      type="url"
                      disabled={isSaving}
                      placeholder="e.g. https://shop.com/summer-sale"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Slider Priority */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowUpDown size={12} /> Priority Sequence
                    </label>
                    <input
                      type="number"
                      disabled={isSaving}
                      required
                      min={0}
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                    />
                  </div>

                  {/* Active checkbox */}
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/10 transition-all select-none opacity-90 h-10">
                      <input
                        type="checkbox"
                        disabled={isSaving}
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-0 cursor-pointer disabled:opacity-50"
                      />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground">Active Status</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-border/40">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 h-10 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Spinner className="w-4 h-4 mr-1 animate-spin text-white" />
                    ) : (
                      <Save size={14} className="shrink-0" />
                    )}
                    <span>
                      {isSaving ? "Saving..." : formMode === "create" ? "Save Slider" : "Update Slider"}
                    </span>
                  </button>
                  {formMode !== "create" && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleCancel}
                      className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted/50 text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card w-full max-w-[400px] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl relative overflow-hidden animate-scale-in">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-destructive" />

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <Trash2 size={22} />
              </div>

              <div className="text-center space-y-1.5">
                <h4 className="font-heading text-base font-bold text-foreground">Delete Slider?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete slider <span className="text-foreground font-bold">"{deleteTarget.title || "untitled"}"</span>? This action cannot be undone.
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
