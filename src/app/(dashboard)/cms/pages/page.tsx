"use client";

import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} from "@/redux/features/page/pageApi";
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi";
import Loader from "@/components/shared/Loader";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Settings,
  Globe,
  Monitor,
  Smartphone,
  Check,
  Search,
  Undo2,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function CMSPagesPage() {
  const { data: pagesRes, isLoading, refetch } = useGetAllPagesQuery({});
  const [createPage] = useCreatePageMutation();
  const [updatePage] = useUpdatePageMutation();
  const [deletePage] = useDeletePageMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadSingleImageMutation();

  const pages = useMemo(() => pagesRes?.data || [], [pagesRes]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const loadingToast = toast.loading("Uploading OG image...");
    try {
      const response = await uploadImage(formData).unwrap();
      toast.dismiss(loadingToast);
      if (response.success && response.data?.url) {
        setOgImage(response.data.url);
        toast.success("OG Image uploaded successfully!");
      } else {
        toast.error("Upload failed.");
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err?.data?.message || "Failed to upload image.");
    }
  };

  // Mode: "list" | "editor"
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  
  // Editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [group, setGroup] = useState("Quick Links");
  const [isActive, setIsActive] = useState(true);
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");

  // Preview options
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewTab, setPreviewTab] = useState<"page" | "seo" | "social">("page");

  const customSlugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  // Auto-generate slug and meta title from title
  useEffect(() => {
    if (!editingId) {
      setSlug(customSlugify(title));
      setMetaTitle(title);
    }
  }, [title, editingId]);

  // Handle open editor for create
  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setGroup("Quick Links");
    setIsActive(true);
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setOgImage("");
    setViewMode("editor");
  };

  // Handle open editor for edit
  const handleOpenEdit = (page: any) => {
    setEditingId(page._id);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setGroup(page.group || "Quick Links");
    setIsActive(page.isActive !== undefined ? page.isActive : true);
    setMetaTitle(page.seo?.metaTitle || "");
    setMetaDescription(page.seo?.metaDescription || "");
    setMetaKeywords(page.seo?.metaKeywords?.join(", ") || "");
    setOgImage(page.seo?.ogImage || "");
    setViewMode("editor");
  };

  // Delete page handler
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      try {
        await deletePage(id).unwrap();
        toast.success("Page deleted successfully!");
        refetch();
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to delete page.");
      }
    }
  };

  // Save page handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content || !metaTitle || !metaDescription) {
      toast.error("Please fill in all required fields, including SEO info.");
      return;
    }

    const keywordsArray = metaKeywords
      ? metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    const pageData = {
      title,
      slug,
      content,
      group,
      isActive,
      seo: {
        metaTitle,
        metaDescription,
        metaKeywords: keywordsArray,
        ogImage,
      },
    };

    try {
      if (editingId) {
        await updatePage({ id: editingId, data: pageData }).unwrap();
        toast.success("Page updated successfully!");
      } else {
        await createPage(pageData).unwrap();
        toast.success("Page created successfully!");
      }
      setViewMode("list");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "An error occurred while saving the page.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6">
        <Toaster position="top-right" reverseOrder={false} />

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Web CMS</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Dynamic Pages</span>
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2 mt-1">
              <FileText className="text-primary" size={24} />
              Pages Management
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create, edit, and preview dynamic content pages (About, Terms, Refund Policy) on your e-commerce storefront.
            </p>
          </div>

          {viewMode === "list" && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-none"
            >
              <Plus size={16} /> Create Page
            </button>
          )}
        </div>

        {/* View Mode: List view */}
        {viewMode === "list" && (
          <div className="glass-card p-5 rounded-2xl border border-border bg-card">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader size={40} />
              </div>
            ) : pages.length > 0 ? (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="py-3 pr-2 font-bold uppercase text-[9px] tracking-wider">Title & Slug</th>
                      <th className="py-3 px-2 font-bold uppercase text-[9px] tracking-wider">Group</th>
                      <th className="py-3 px-2 font-bold uppercase text-[9px] tracking-wider text-center">Status</th>
                      <th className="py-3 pl-2 font-bold uppercase text-[9px] tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {pages.map((p: any) => (
                      <tr key={p._id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3.5 pr-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm">{p.title}</span>
                            <span className="text-[10px] font-mono text-muted-foreground mt-0.5">/{p.slug}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold text-muted-foreground">
                            {p.group}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              p.isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                                : "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground"
                            }`}
                          >
                            {p.isActive ? "Active" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3.5 pl-2 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground cursor-pointer transition-colors"
                              title="Edit Page"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500 cursor-pointer transition-colors"
                              title="Delete Page"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground space-y-2.5">
                <FileText className="mx-auto text-muted-foreground/40" size={40} />
                <div>
                  <p className="text-sm font-bold text-foreground">No pages created yet</p>
                  <p className="text-xs">Dynamic storefront legal or custom policies pages will appear here.</p>
                </div>
                <button
                  onClick={handleOpenCreate}
                  className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/15 transition-all cursor-pointer border-none"
                >
                  Create Your First Page
                </button>
              </div>
            )}
          </div>
        )}

        {/* View Mode: Editor & Preview Split Panel */}
        {viewMode === "editor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Input Form (5 Cols) */}
            <form onSubmit={handleSave} className="lg:col-span-5 space-y-4">
              <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer transition-all bg-background"
                    >
                      <Undo2 size={13} />
                    </button>
                    <h3 className="font-heading text-sm font-extrabold text-foreground">
                      {editingId ? "Edit Page Info" : "Create New Page"}
                    </h3>
                  </div>

                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground px-3.5 py-1.5 rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-none"
                  >
                    Save Page
                  </button>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Page Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Terms of Service"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-muted/20 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Slug & Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">URL Slug *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. terms-of-service"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-muted/20 text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Menu Group *</label>
                    <select
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full h-10 px-2 rounded-lg border border-border bg-card text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Quick Links">Quick Links</option>
                      <option value="Company">Company</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                    Publish immediately (Active status)
                  </label>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Page Content *</label>
                  <textarea
                    required
                    rows={10}
                    placeholder="Write page content in HTML or plain text..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-muted/20 text-xs focus:ring-1 focus:ring-primary outline-none font-mono"
                  />
                </div>
              </div>

              {/* SEO Subcard */}
              <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-1.5 border-b border-border/40 pb-2 mb-1">
                  <Globe className="text-primary" size={14} />
                  <h4 className="font-heading text-xs font-bold text-foreground">SEO & Meta Configuration</h4>
                </div>

                {/* Meta Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meta Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Terms of Service | StoreName"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-muted/20 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meta Description *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter summary search engines show on result lists..."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-muted/20 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Meta Keywords */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meta Keywords</label>
                  <input
                    type="text"
                    placeholder="comma separated values, e.g. terms, policy, legal"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-muted/20 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* OpenGraph Image URL & Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">OpenGraph Image (OG Image)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL or upload file..."
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg border border-border bg-muted/20 text-xs focus:ring-1 focus:ring-primary outline-none"
                    />
                    <label className="h-10 px-3 rounded-lg border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold transition-all shrink-0">
                      {isUploading ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Plus size={13} />
                      )}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {ogImage && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center group mt-1">
                      <img src={ogImage} alt="OG Thumbnail Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setOgImage("")}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 font-bold border-none"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Right Column: Live Emulator Preview (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[500px]">
                
                {/* Preview Settings Toolbar */}
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-border/40 pb-3 mb-4">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewTab("page")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        previewTab === "page"
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Store Page
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab("seo")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        previewTab === "seo"
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Google Search SEO
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab("social")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        previewTab === "social"
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Social (OpenGraph)
                    </button>
                  </div>

                  {previewTab === "page" && (
                    <div className="flex bg-muted/65 p-0.5 rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("desktop")}
                        className={`p-1.5 rounded-md transition-all ${
                          previewDevice === "desktop"
                            ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Desktop Preview"
                      >
                        <Monitor size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("mobile")}
                        className={`p-1.5 rounded-md transition-all ${
                          previewDevice === "mobile"
                            ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Mobile Portrait Preview"
                      >
                        <Smartphone size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Preview Frame */}
                <div className="flex-1 flex justify-center items-center bg-zinc-100 dark:bg-zinc-950/40 p-4 rounded-xl border border-border/40">
                  {previewTab === "page" ? (
                    /* Page view rendering */
                    <div
                      className={`bg-white dark:bg-zinc-900 border border-border shadow-md rounded-lg overflow-hidden transition-all duration-300 ${
                        previewDevice === "mobile"
                          ? "w-[340px] min-h-[500px]"
                          : "w-full min-h-[500px]"
                      }`}
                    >
                      {/* Browser header mockup */}
                      <div className="bg-muted px-4 py-2 border-b border-border flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400 block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-400 block" />
                        </div>
                        <div className="flex-1 bg-background rounded-md text-[10px] px-3 py-1 font-mono text-muted-foreground text-center truncate border border-border/40 select-none">
                          https://yourstore.com/page/{slug || "new-page"}
                        </div>
                      </div>

                      {/* Store Top Bar mockup */}
                      <div className="p-4 border-b border-border/40 flex justify-between items-center text-xs font-bold text-foreground bg-card">
                        <span>🛍️ Storefront</span>
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          <span>Home</span>
                          <span>Catalog</span>
                          <span>Contact</span>
                        </div>
                      </div>

                      {/* Page Content Body */}
                      <div className="p-6 space-y-4 text-left">
                        <h1 className="text-xl md:text-2xl font-black font-heading text-foreground">
                          {title || "Enter Page Title..."}
                        </h1>
                        <div className="text-[10px] text-muted-foreground flex gap-3 font-semibold uppercase tracking-wider">
                          <span>Group: {group}</span>
                          <span>•</span>
                          <span className={isActive ? "text-emerald-500" : "text-amber-500"}>
                            {isActive ? "Active / Published" : "Draft Status"}
                          </span>
                        </div>

                        {/* Page Body Text rendering */}
                        <div
                          className="text-xs text-foreground/80 leading-relaxed font-sans mt-4 border-t border-border/40 pt-4"
                          dangerouslySetInnerHTML={{
                            __html: content || "<p className='text-muted-foreground italic'>Page content body rendering will appear here. Write something in the content box to see changes.</p>"
                          }}
                        />
                      </div>
                    </div>
                  ) : previewTab === "seo" ? (
                    /* Google Search Snippet Preview */
                    <div className="bg-white dark:bg-zinc-900 border border-border shadow-md rounded-xl p-5 w-full max-w-[600px] text-left">
                      <div className="flex items-center gap-2 mb-1.5 text-xs text-zinc-500">
                        <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs">🌐</div>
                        <div className="flex flex-col">
                          <span className="text-foreground font-semibold text-[11px] leading-tight">yourstore.com</span>
                          <span className="text-[10px] text-zinc-400">https://yourstore.com › page › {slug || "new-page"}</span>
                        </div>
                      </div>
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline text-lg font-medium leading-normal block">
                        {metaTitle || title || "Enter Page Title..."}
                      </a>
                      <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed mt-1 select-none">
                        {metaDescription || "Provide an SEO description in the editor meta box to optimize how this page is displayed in search engine directories."}
                      </p>
                    </div>
                  ) : (
                    /* Social Share OpenGraph Preview card */
                    <div className="bg-white dark:bg-zinc-900 border border-border shadow-md rounded-xl overflow-hidden w-full max-w-[500px] text-left">
                      <div className="h-48 bg-zinc-100 dark:bg-zinc-800/50 relative flex items-center justify-center overflow-hidden border-b border-border/40">
                        {ogImage ? (
                          <img src={ogImage} alt="Social Share OG Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <span className="text-4xl">🖼️</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider">No OG Image URL Provided</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-1 bg-card">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest font-mono">YOURSTORE.COM</span>
                        <h4 className="text-sm font-bold text-foreground truncate">{metaTitle || title || "Dynamic CMS Page Title"}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{metaDescription || "OpenGraph meta description description will appear here..."}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground font-semibold text-center mt-3 pt-3 border-t border-border/40 flex justify-between items-center">
                  <span>Interactive Emulator view</span>
                  <span className="text-primary font-bold flex items-center gap-0.5"><Sparkles size={10} /> Auto-Sync Active</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
