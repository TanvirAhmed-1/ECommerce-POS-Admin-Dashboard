"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useReorderBannersMutation,
} from "@/redux/features/banner/bannerApi";
import { useGetAllCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi";
import Loader from "@/components/shared/Loader";
import { toast, Toaster } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Save,
  Image as ImageIcon,
  Search,
  Check,
  X,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Eye,
  Palette,
  RefreshCw,
  Layers,
  Flame,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Smartphone,
  Sliders,
  FolderTree,
  Link as LinkIcon,
} from "lucide-react";

// Default fallback banner matching user's exact specification
const defaultFallbackBanners = [
  {
    _id: "default-kitchen-banner",
    title: "Upgrade Your Everyday Kitchen",
    subtitle: "LIMITED EDITION KITCHEN GEAR",
    description:
      "Experience the joy of effortless culinary mastery with authentic heavy-gauge cookers, steamers, and food processors.",
    buttonText: "Explore Appliances",
    buttonLink: "/products?category=kitchenware",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCMJFzKFUf-nE5Yign340ZIpZcnhXX35cT0WqmzuJmVsuPm0eDjgK3kOHi0YrJW4jkirnkRlOs-hGHN-GuozjonjNFoED07EFNkPjS6Nx2WK6l2kyj3Ic4bUdj7fhc7cpjCDrnxd6_dTKLMl7Ku3xYzwpo-9ZV9Q_-AK5ve274yYgb0cKQlu6PvpmXWMWPjaftw6Lepn4JuQTa0erPseWLNl66x3FFE9sdOI--PNrKzoB2IXQ1O0jm2wA",
    bgColor: "#003820",
    textColor: "#ffffff",
    badgeColor: "#b0f1c7",
    buttonBgColor: "#fd651e",
    priority: 0,
    isActive: true,
  },
];

// Curated Preset Themes for quick 1-click styling
const colorThemePresets = [
  {
    name: "Emerald Chef",
    bgColor: "#003820",
    textColor: "#ffffff",
    badgeColor: "#b0f1c7",
    buttonBgColor: "#fd651e",
  },
  {
    name: "Obsidian Luxe",
    bgColor: "#0f172a",
    textColor: "#ffffff",
    badgeColor: "#38bdf8",
    buttonBgColor: "#3b82f6",
  },
  {
    name: "Sunset Ember",
    bgColor: "#7c2d12",
    textColor: "#ffffff",
    badgeColor: "#fde047",
    buttonBgColor: "#f97316",
  },
  {
    name: "Royal Velvet",
    bgColor: "#4c1d95",
    textColor: "#ffffff",
    badgeColor: "#f472b6",
    buttonBgColor: "#db2777",
  },
  {
    name: "Oceanic Deep",
    bgColor: "#0369a1",
    textColor: "#ffffff",
    badgeColor: "#67e8f9",
    buttonBgColor: "#0284c7",
  },
  {
    name: "Cyber Matte",
    bgColor: "#18181b",
    textColor: "#ffffff",
    badgeColor: "#a1a1aa",
    buttonBgColor: "#6366f1",
  },
];

export default function PromotionalBannerPage() {
  // RTK Queries & Mutations
  const { data: bannerRes, isLoading, refetch, isFetching } = useGetAllBannersQuery({});
  const { data: categoryRes } = useGetAllCategoriesQuery({});
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();
  const [reorderBanners, { isLoading: isReordering }] = useReorderBannersMutation();
  const [uploadSingleImage, { isLoading: isUploadingImage }] = useUploadSingleImageMutation();

  const isSaving = isCreating || isUpdating;

  // Filter ONLY Parent Categories (root level or parentCategory is null/undefined)
  const parentCategories = useMemo(() => {
    const list = categoryRes?.data || [];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (cat: any) =>
        !cat.parentCategory ||
        cat.parentCategory === null ||
        cat.level === 0 ||
        cat.level === 1
    );
  }, [categoryRes]);

  // Banner list from server or fallback
  const banners = useMemo(() => {
    if (bannerRes?.data && Array.isArray(bannerRes.data) && bannerRes.data.length > 0) {
      return [...bannerRes.data].sort((a: any, b: any) => (a.priority ?? 0) - (b.priority ?? 0));
    }
    if (Array.isArray(bannerRes) && bannerRes.length > 0) {
      return [...bannerRes].sort((a: any, b: any) => (a.priority ?? 0) - (b.priority ?? 0));
    }
    return defaultFallbackBanners;
  }, [bannerRes]);

  // Active banners for preview slider
  const activeBanners = useMemo(() => {
    const list = banners.filter((b: any) => b.isActive !== false);
    return list.length > 0 ? list : defaultFallbackBanners;
  }, [banners]);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Form states
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [title, setTitle] = useState("Upgrade Your Everyday Kitchen");
  const [subtitle, setSubtitle] = useState("LIMITED EDITION KITCHEN GEAR");
  const [description, setDescription] = useState(
    "Experience the joy of effortless culinary mastery with authentic heavy-gauge cookers, steamers, and food processors."
  );
  const [buttonText, setButtonText] = useState("Explore Appliances");
  
  // Link selection mode: 'select' (Parent Category Dropdown) or 'manual' (Direct URL / Route)
  const [linkInputMode, setLinkInputMode] = useState<"select" | "manual">("select");
  const [buttonLink, setButtonLink] = useState("/products?category=kitchenware");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("kitchenware");

  const [imageUrl, setImageUrl] = useState(
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCMJFzKFUf-nE5Yign340ZIpZcnhXX35cT0WqmzuJmVsuPm0eDjgK3kOHi0YrJW4jkirnkRlOs-hGHN-GuozjonjNFoED07EFNkPjS6Nx2WK6l2kyj3Ic4bUdj7fhc7cpjCDrnxd6_dTKLMl7Ku3xYzwpo-9ZV9Q_-AK5ve274yYgb0cKQlu6PvpmXWMWPjaftw6Lepn4JuQTa0erPseWLNl66x3FFE9sdOI--PNrKzoB2IXQ1O0jm2wA"
  );

  // Classic Color States
  const [bgColor, setBgColor] = useState("#003820");
  const [textColor, setTextColor] = useState("#ffffff");
  const [badgeColor, setBadgeColor] = useState("#b0f1c7");
  const [buttonBgColor, setButtonBgColor] = useState("#fd651e");
  const [priority, setPriority] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-advance preview slider
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  useEffect(() => {
    if (previewIndex >= activeBanners.length) {
      setPreviewIndex(0);
    }
  }, [activeBanners.length, previewIndex]);

  // Reset form to Create Mode
  const handleResetToCreate = () => {
    setFormMode("create");
    setTargetId(null);
    setTitle("");
    setSubtitle("");
    setDescription("");
    setButtonText("Explore Now");
    setButtonLink("/products");
    setSelectedCategorySlug("");
    setLinkInputMode("select");
    setImageUrl("");
    setBgColor("#003820");
    setTextColor("#ffffff");
    setBadgeColor("#b0f1c7");
    setButtonBgColor("#fd651e");
    setPriority(banners.length);
    setIsActive(true);
    setUploadMode("upload");
  };

  // Populate form for Edit Mode
  const handleSelectForEdit = (banner: any) => {
    setFormMode("update");
    setTargetId(banner._id);
    setTitle(banner.title || "");
    setSubtitle(banner.subtitle || "");
    setDescription(banner.description || "");
    setButtonText(banner.buttonText || "Explore Now");
    
    const currentLink = banner.buttonLink || "/products";
    setButtonLink(currentLink);

    // Detect if current link matches a category slug
    const match = currentLink.match(/category=([^&]+)/);
    if (match && match[1]) {
      setSelectedCategorySlug(match[1]);
      setLinkInputMode("select");
    } else {
      const directCat = parentCategories.find(
        (c: any) => currentLink === `/category/${c.slug}` || currentLink === c.slug
      );
      if (directCat) {
        setSelectedCategorySlug(directCat.slug);
        setLinkInputMode("select");
      } else {
        setSelectedCategorySlug("");
        setLinkInputMode("manual");
      }
    }

    setImageUrl(banner.imageUrl || banner.image || "");
    setBgColor(banner.bgColor || "#003820");
    setTextColor(banner.textColor || "#ffffff");
    setBadgeColor(banner.badgeColor || "#b0f1c7");
    setButtonBgColor(banner.buttonBgColor || "#fd651e");
    setPriority(banner.priority ?? 0);
    setIsActive(banner.isActive ?? true);
    setUploadMode("url");
  };

  // Handle Parent Category Select
  const handleParentCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    setSelectedCategorySlug(slug);
    if (slug) {
      setButtonLink(`/products?category=${slug}`);
    }
  };

  // Apply Theme Preset
  const handleApplyTheme = (theme: typeof colorThemePresets[0]) => {
    setBgColor(theme.bgColor);
    setTextColor(theme.textColor);
    setBadgeColor(theme.badgeColor);
    setButtonBgColor(theme.buttonBgColor);
  };

  // Handle image upload
  const handleFileUpload = async (file: File) => {
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

    const toastId = toast.loading("Uploading promotional banner image...");
    try {
      const res = await uploadSingleImage(formData).unwrap();
      if (res?.success && res?.data?.url) {
        setImageUrl(res.data.url);
        toast.success("Image uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload failed: Invalid response", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to upload image.", {
        id: toastId,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  // Submit banner form
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required!");
      return;
    }

    if (!imageUrl.trim()) {
      toast.error("Image is required! Please upload an image or provide a valid URL.");
      return;
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      buttonText: buttonText.trim() || "Explore Now",
      buttonLink: buttonLink.trim() || "/products",
      imageUrl: imageUrl.trim(),
      bgColor: bgColor || "#003820",
      textColor: textColor || "#ffffff",
      badgeColor: badgeColor || "#b0f1c7",
      buttonBgColor: buttonBgColor || "#fd651e",
      priority: Number(priority) || 0,
      isActive,
    };

    const toastId = toast.loading(
      formMode === "create" ? "Creating promotional banner..." : "Updating promotional banner..."
    );

    try {
      if (formMode === "create") {
        await createBanner(payload).unwrap();
        toast.success("Promotional Banner created successfully!", { id: toastId });
        handleResetToCreate();
      } else if (targetId) {
        if (targetId.startsWith("default-")) {
          await createBanner(payload).unwrap();
          toast.success("Banner saved to database!", { id: toastId });
          handleResetToCreate();
        } else {
          await updateBanner({ id: targetId, data: payload }).unwrap();
          toast.success("Promotional Banner updated successfully!", { id: toastId });
        }
      }
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to save promotional banner.", { id: toastId });
    }
  };

  // Quick toggle active status
  const handleToggleActive = async (banner: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (banner._id.startsWith("default-")) {
      toast.error("Save this banner to database first to customize its active state!");
      return;
    }
    const toastId = toast.loading("Updating status...");
    try {
      await updateBanner({
        id: banner._id,
        data: { isActive: !banner.isActive },
      }).unwrap();
      toast.success(
        `Banner "${banner.title}" is now ${!banner.isActive ? "Live in Slider" : "Hidden"}!`,
        { id: toastId }
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status.", { id: toastId });
    }
  };

  // Move priority up or down
  const handleMovePriority = async (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const currentBanner = banners[index];
    const swapBanner = banners[targetIndex];

    if (currentBanner._id.startsWith("default-") || swapBanner._id.startsWith("default-")) {
      toast.error("Save banners to database to enable reordering!");
      return;
    }

    const newOrders = banners.map((b: any, idx: number) => {
      if (idx === index) return { id: b._id, priority: targetIndex };
      if (idx === targetIndex) return { id: b._id, priority: index };
      return { id: b._id, priority: idx };
    });

    const toastId = toast.loading("Reordering slider...");
    try {
      await reorderBanners({ orders: newOrders }).unwrap();
      toast.success("Slider order updated!", { id: toastId });
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reorder banners.", { id: toastId });
    }
  };

  // Delete banner
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.id.startsWith("default-")) {
      setDeleteTarget(null);
      toast.error("Cannot delete the system default preview banner!");
      return;
    }

    const toastId = toast.loading("Deleting banner...");
    try {
      await deleteBanner(deleteTarget.id).unwrap();
      toast.success("Promotional Banner deleted successfully!", { id: toastId });
      if (targetId === deleteTarget.id) {
        handleResetToCreate();
      }
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete banner.", { id: toastId });
    }
  };

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return banners.filter((b: any) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.subtitle?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = b.isActive !== false;
      if (statusFilter === "inactive") matchesStatus = b.isActive === false;

      return matchesSearch && matchesStatus;
    });
  }, [banners, searchQuery, statusFilter]);

  const currentPreviewSlide = activeBanners[previewIndex] || defaultFallbackBanners[0];

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
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-2 md:p-6 text-foreground pb-16">
        
        {/* 1. TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span>Web CMS</span>
              <span>/</span>
              <span className="text-foreground">Promotional Banner</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-foreground flex items-center gap-2.5">
              <Sparkles className="text-primary" size={26} />
              Promotional Banner CMS
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Slider Active ({activeBanners.length} Live)
              </span>
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Design high-converting promotional banners with parent category link routing, customizable color palettes, and dynamic storefront slider support.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetch();
                toast.success("Banners refreshed!");
              }}
              disabled={isFetching}
              className="h-9 px-3.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin text-primary" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleResetToCreate}
              className="h-9 px-4 rounded-xl bg-primary hover:opacity-90 text-white flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-md shadow-primary/20 shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              <span>+ New Promotional Banner</span>
            </button>
          </div>
        </div>

        {/* 2. STATS SUMMARY ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Banners
              </span>
              <p className="text-2xl font-black text-foreground font-heading mt-0.5">
                {banners.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Layers size={20} />
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Live in Storefront Slider
              </span>
              <p className="text-2xl font-black text-emerald-600 font-heading mt-0.5">
                {activeBanners.length} {activeBanners.length === 1 ? "Slide" : "Slides"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Carousel Transition
              </span>
              <p className="text-sm font-bold text-foreground mt-1">
                {activeBanners.length > 1 ? "5.5s Autoplay (Active)" : "Static Single Showcase"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Flame size={20} />
            </div>
          </div>
        </div>

        {/* 3. STOREFRONT LIVE CAROUSEL PREVIEW */}
        <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Eye className="text-primary" size={18} />
              <h3 className="text-sm font-bold text-foreground font-heading">
                Storefront Live Carousel Preview
              </h3>
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono font-bold">
                Slide {previewIndex + 1} of {activeBanners.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-muted p-0.5 rounded-lg flex items-center gap-1 border border-border">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    previewDevice === "desktop"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Monitor size={13} /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    previewDevice === "mobile"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone size={13} /> Mobile
                </button>
              </div>

              {activeBanners.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewIndex((prev) =>
                        prev === 0 ? activeBanners.length - 1 : prev - 1
                      )
                    }
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
                    title="Previous Slide"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewIndex((prev) => (prev + 1) % activeBanners.length)
                    }
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
                    title="Next Slide"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actual Live Banner Render */}
          <div className="flex justify-center bg-zinc-950/5 dark:bg-zinc-950/60 p-3 sm:p-6 rounded-2xl border border-border/80 overflow-hidden">
            <div
              className={`w-full transition-all duration-300 ${
                previewDevice === "mobile" ? "max-w-md" : "max-w-5xl"
              }`}
            >
              <div
                style={{ backgroundColor: currentPreviewSlide.bgColor || "#003820" }}
                className="rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-2xl transition-colors duration-500 text-white"
              >
                {/* Decorative ambient glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
                  <div className="md:col-span-7 flex flex-col gap-3">
                    {currentPreviewSlide.subtitle && (
                      <span
                        style={{ color: currentPreviewSlide.badgeColor || "#b0f1c7" }}
                        className="text-xs font-black uppercase tracking-widest"
                      >
                        {currentPreviewSlide.subtitle}
                      </span>
                    )}
                    <h2
                      style={{ color: currentPreviewSlide.textColor || "#ffffff" }}
                      className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight"
                    >
                      {currentPreviewSlide.title}
                    </h2>
                    {currentPreviewSlide.description && (
                      <p className="text-xs sm:text-sm text-white/90 max-w-md leading-relaxed">
                        {currentPreviewSlide.description}
                      </p>
                    )}
                    <div className="pt-2">
                      <button
                        type="button"
                        style={{
                          backgroundColor: currentPreviewSlide.buttonBgColor || "#fd651e",
                        }}
                        className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl text-xs md:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>{currentPreviewSlide.buttonText || "Explore Appliances"}</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex items-center justify-center">
                    <div className="relative w-full aspect-[4/3] max-w-sm rounded-xl overflow-hidden flex items-center justify-center p-2">
                      {currentPreviewSlide.imageUrl ? (
                        <img
                          src={currentPreviewSlide.imageUrl}
                          alt={currentPreviewSlide.title}
                          className="w-full h-full object-contain filter drop-shadow-xl"
                        />
                      ) : (
                        <div className="w-full h-32 flex flex-col items-center justify-center text-white/50 border border-dashed border-white/30 rounded-xl">
                          <ImageIcon size={28} />
                          <span className="text-xs mt-1">No Image Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Slider indicators */}
                {activeBanners.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {activeBanners.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          previewIndex === idx
                            ? "w-7 bg-white shadow-sm"
                            : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. WORKSPACE: 2-COLUMN LAYOUT (LEFT: LIST OF BANNERS, RIGHT: FORM EDITOR) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: BANNERS LIST */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-foreground font-heading uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={16} className="text-primary" />
                  All Banners ({filteredBanners.length})
                </h3>

                {/* Status Tabs */}
                <div className="flex bg-muted p-0.5 rounded-lg border border-border text-xs">
                  {[
                    { key: "all", label: `All` },
                    { key: "active", label: `Active` },
                    { key: "inactive", label: `Hidden` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key as any)}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        statusFilter === tab.key
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <input
                  type="text"
                  placeholder="Search banners by title or subtitle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-muted/40 text-xs font-medium text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
                />
              </div>

              {/* Banners Scrollable List */}
              <div className="space-y-3 overflow-y-auto max-h-[750px] pr-1">
                {filteredBanners.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
                    <Sparkles size={32} className="mx-auto text-muted-foreground/60 mb-2" />
                    <p className="text-xs font-bold text-foreground">No promotional banners found</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Use the form on the right to create a new banner.
                    </p>
                  </div>
                ) : (
                  filteredBanners.map((banner: any, index: number) => {
                    const isSelected = targetId === banner._id;
                    const isFirst = index === 0;
                    const isLast = index === filteredBanners.length - 1;

                    return (
                      <div
                        key={banner._id || index}
                        onClick={() => handleSelectForEdit(banner)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 relative ${
                          isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                            : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card hover:bg-muted/20"
                        }`}
                      >
                        {/* Left: Reorder priority & thumbnail */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Priority Order Control */}
                          <div className="flex flex-col gap-0.5 items-center justify-center">
                            <button
                              type="button"
                              disabled={isFirst || isReordering}
                              onClick={(e) => handleMovePriority(index, "up", e)}
                              className={`p-1 rounded hover:bg-muted ${
                                isFirst ? "opacity-20 cursor-not-allowed" : "text-foreground cursor-pointer"
                              }`}
                              title="Move Up in Slider"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <span className="text-[10px] font-mono font-bold text-muted-foreground">
                              #{index + 1}
                            </span>
                            <button
                              type="button"
                              disabled={isLast || isReordering}
                              onClick={(e) => handleMovePriority(index, "down", e)}
                              className={`p-1 rounded hover:bg-muted ${
                                isLast ? "opacity-20 cursor-not-allowed" : "text-foreground cursor-pointer"
                              }`}
                              title="Move Down in Slider"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>

                          {/* Color block & Image */}
                          <div
                            style={{ backgroundColor: banner.bgColor || "#003820" }}
                            className="w-16 h-14 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center p-1 border border-border shadow-xs"
                          >
                            {banner.imageUrl ? (
                              <img
                                src={banner.imageUrl}
                                alt={banner.title}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <ImageIcon size={18} className="text-white/40" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {banner.subtitle && (
                                <span
                                  style={{
                                    color: banner.badgeColor || "#059669",
                                    backgroundColor: `${banner.badgeColor || "#059669"}18`,
                                  }}
                                  className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider"
                                >
                                  {banner.subtitle}
                                </span>
                              )}
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  banner.isActive !== false
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {banner.isActive !== false ? "Live" : "Hidden"}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-foreground truncate mt-1">
                              {banner.title}
                            </h4>

                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1 font-mono">
                                <span
                                  className="w-2 h-2 rounded-full inline-block border border-black/10"
                                  style={{ backgroundColor: banner.bgColor || "#003820" }}
                                />
                                {banner.bgColor || "#003820"}
                              </span>
                              <span>•</span>
                              <span className="truncate max-w-[120px] font-medium text-foreground/80">
                                {banner.buttonLink || "/products"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleToggleActive(banner, e)}
                            className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              banner.isActive !== false
                                ? "border border-border bg-card hover:bg-muted text-muted-foreground"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            {banner.isActive !== false ? "Hide" : "Publish"}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectForEdit(banner);
                            }}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-primary transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ id: banner._id, title: banner.title });
                            }}
                            className="p-1.5 rounded-lg border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: FORM EDITOR */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-5 shadow-sm">
              
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {formMode === "create" ? <Plus size={16} /> : <Edit size={16} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground font-heading">
                      {formMode === "create" ? "Create Promotional Banner" : "Edit Promotional Banner"}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {formMode === "create"
                        ? "Fill in details to add a new slide to the storefront carousel."
                        : `Editing banner: ${title}`}
                    </p>
                  </div>
                </div>

                {formMode === "update" && (
                  <button
                    type="button"
                    onClick={handleResetToCreate}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    + Switch to New Banner
                  </button>
                )}
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveBanner} className="space-y-4">
                
                {/* Banner Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    Banner Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Upgrade Your Everyday Kitchen"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-muted/40 text-foreground text-xs font-semibold outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
                  />
                </div>

                {/* Subtitle / Tagline */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Subtitle / Top Badge Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LIMITED EDITION KITCHEN GEAR"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-muted/40 text-foreground text-xs font-medium outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Description / Paragraph
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Experience the joy of effortless culinary mastery with authentic heavy-gauge cookers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-xs font-medium outline-none focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
                  />
                </div>

                {/* BUTTON CTA & ROUTE LINK (Parent Category Select OR Manual Input) */}
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <LinkIcon size={14} className="text-primary" />
                      Button Link & Category Route
                    </label>

                    {/* Mode switcher: Select from Parent Category vs Manual Input */}
                    <div className="flex bg-muted p-0.5 rounded-lg border border-border text-[10px]">
                      <button
                        type="button"
                        onClick={() => setLinkInputMode("select")}
                        className={`px-2.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                          linkInputMode === "select"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        📁 Select Category
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkInputMode("manual")}
                        className={`px-2.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                          linkInputMode === "manual"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        ✍️ Manual Link
                      </button>
                    </div>
                  </div>

                  {/* Option 1: Dropdown Select from Parent Categories */}
                  {linkInputMode === "select" ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Choose Parent Category (Auto-sets slug to link):
                        </span>
                        <span className="text-[10px] text-primary font-mono font-bold">
                          {parentCategories.length} Categories Available
                        </span>
                      </div>
                      <select
                        value={selectedCategorySlug}
                        onChange={handleParentCategorySelect}
                        className="w-full h-9 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-semibold outline-none focus:border-primary transition-all cursor-pointer"
                      >
                        <option value="">-- Select Parent Category --</option>
                        {parentCategories.map((cat: any) => (
                          <option key={cat._id || cat.slug} value={cat.slug}>
                            {cat.name} ({cat.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    /* Option 2: Manual Direct Link Input */
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Custom Route / URL (e.g. /products?category=XYZ or /flash-sale):
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. /products?category=kitchenware"
                        value={buttonLink}
                        onChange={(e) => setButtonLink(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-mono font-medium outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
                      />
                    </div>
                  )}

                  {/* Button CTA text + Preview of final URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/60">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">
                        Button CTA Text
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Explore Appliances"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        className="w-full h-8.5 px-3 rounded-lg border border-border bg-card text-foreground text-xs font-medium outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">
                        Active Target Link
                      </label>
                      <input
                        type="text"
                        value={buttonLink}
                        onChange={(e) => setButtonLink(e.target.value)}
                        className="w-full h-8.5 px-3 rounded-lg border border-border bg-card text-foreground text-xs font-mono font-medium outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Promotional Image Upload / URL */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      Promotional Image <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setUploadMode("upload")}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                          uploadMode === "upload"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode("url")}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                          uploadMode === "url"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        Direct URL
                      </button>
                    </div>
                  </div>

                  {uploadMode === "upload" ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/60 bg-muted/30"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center gap-1.5 py-2">
                          <Spinner className="w-5 h-5 text-primary" />
                          <span className="text-xs text-muted-foreground">Uploading image...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <UploadCloud size={22} className="text-primary" />
                          <p className="text-xs font-bold text-foreground">
                            Click or drag and drop image here
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            PNG, JPG, WebP up to 5MB (Transparent PNG recommended)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      placeholder="https://example.com/banner-product.png"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-border bg-muted/40 text-foreground text-xs font-mono outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                  )}

                  {imageUrl && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                      <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={imageUrl} alt="Thumbnail" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground truncate flex-1">
                        {imageUrl}
                      </span>
                    </div>
                  )}
                </div>

                {/* 🎨 COLOR THEME PRESETS & DIRECT COLOR PICKERS */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Palette size={15} className="text-primary" />
                    <label className="text-xs font-bold text-foreground">
                      Color Theme Presets
                    </label>
                  </div>

                  {/* 6 Theme Presets */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {colorThemePresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyTheme(preset)}
                        className={`p-2 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                          bgColor.toLowerCase() === preset.bgColor.toLowerCase()
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border hover:border-zinc-400 bg-card"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: preset.bgColor }}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: preset.buttonBgColor }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-foreground truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* 4 Custom Hex / Color Pickers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">
                        Background Color
                      </label>
                      <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-muted/40">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-5 h-5 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-full text-[11px] font-mono text-foreground bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">
                        Badge Text Color
                      </label>
                      <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-muted/40">
                        <input
                          type="color"
                          value={badgeColor}
                          onChange={(e) => setBadgeColor(e.target.value)}
                          className="w-5 h-5 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={badgeColor}
                          onChange={(e) => setBadgeColor(e.target.value)}
                          className="w-full text-[11px] font-mono text-foreground bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">
                        Headline Text Color
                      </label>
                      <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-muted/40">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-5 h-5 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full text-[11px] font-mono text-foreground bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">
                        CTA Button Color
                      </label>
                      <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-muted/40">
                        <input
                          type="color"
                          value={buttonBgColor}
                          onChange={(e) => setButtonBgColor(e.target.value)}
                          className="w-5 h-5 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={buttonBgColor}
                          onChange={(e) => setButtonBgColor(e.target.value)}
                          className="w-full text-[11px] font-mono text-foreground bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority & Active toggle */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-foreground">
                      Priority:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                      className="w-16 h-8 px-2 text-xs font-bold rounded-lg border border-border bg-muted/40 text-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      Live in Carousel:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        isActive ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          isActive ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  {formMode === "update" && (
                    <button
                      type="button"
                      onClick={handleResetToCreate}
                      className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="h-9 px-6 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isSaving ? <Spinner size="sm" /> : <Save size={15} />}
                    <span>{formMode === "create" ? "Create Banner" : "Update Banner"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 5. DELETE CONFIRMATION MODAL */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-foreground font-heading">
                  Delete Promotional Banner?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Are you sure you want to delete <span className="font-bold text-foreground">"{deleteTarget.title}"</span>? This will remove it from the homepage slider.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  {isDeleting ? <Spinner size="sm" /> : <Trash2 size={15} />}
                  <span>Delete Banner</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
