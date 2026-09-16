"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileCode,
  Image as ImageIcon,
  Clock,
  Save,
  RotateCcw,
  CheckCircle2,
  UploadCloud,
  X,
  Eye,
  Sparkles,
  Layers,
  HelpCircle,
  Bold,
  Italic,
  Underline,
  List,
  Link2,
  Code,
  Heading,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useGetCompanyQuery, useUpsertCompanyMutation } from "@/redux/features/company/companyApi";
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi";
import Loader from "@/components/shared/Loader";

interface ImageUploadFieldProps {
  label: string;
  sublabel?: string;
  sizeNote?: string;
  value: string;
  onChange: (url: string) => void;
  aspectDesc?: string;
}

function ImageUploadField({
  label,
  sublabel,
  sizeNote,
  value,
  onChange,
  aspectDesc,
}: ImageUploadFieldProps) {
  const [uploadSingleImage, { isLoading: isUploading }] = useUploadSingleImageMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading(`Uploading ${label}...`);
    try {
      const res = await uploadSingleImage(formData).unwrap();
      const imageUrl = res.data?.url || res.data?.secure_url || res.data || res.url;
      if (imageUrl) {
        onChange(imageUrl);
        toast.success(`${label} uploaded!`, { id: toastId });
      } else {
        toast.error("Upload failed: No URL returned", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to upload image", { id: toastId });
    }
  };

  return (
    <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card/60 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <ImageIcon size={13} className="text-primary" />
          <span>{label}</span>
        </label>
        {sizeNote && (
          <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {sizeNote}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-9 px-3.5 rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <UploadCloud size={14} className={isUploading ? "animate-bounce" : ""} />
          <span>{isUploading ? "Uploading..." : "Choose File"}</span>
        </button>

        <input
          type="text"
          placeholder={value ? value : "No file chosen (or paste image URL)"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-9 px-3 text-xs bg-muted/40 border border-border rounded-lg text-foreground font-mono truncate outline-none focus:border-primary transition-all"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
            title="Remove image"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Live Preview if available */}
      {value && (
        <div className="mt-2 relative group w-fit">
          <div className="h-16 max-w-full rounded-lg border border-border overflow-hidden bg-muted/40 p-1 flex items-center justify-center">
            <img
              src={value}
              alt={label}
              className="max-h-full max-w-full object-contain rounded"
              onError={(e) => {
                (e.target as any).style.display = "none";
              }}
            />
          </div>
          <span className="text-[9px] font-mono text-muted-foreground mt-0.5 block truncate max-w-xs">
            Preview: {value.split("/").pop()}
          </span>
        </div>
      )}
    </div>
  );
}

export default function CompanySettingsForm() {
  const { data: companyRes, isLoading, refetch } = useGetCompanyQuery({});
  const [upsertCompany, { isLoading: isSaving }] = useUpsertCompanyMutation();

  const [formData, setFormData] = useState({
    // Left column
    companyName: "",
    companyTitle: "",
    phone: "",
    hotline: "",
    whatsapp: "",
    email: "",
    address: "",
    billFooter: "",
    bin: "",

    // Images
    companyLogo: "",
    favicon: "",
    adminFavicon: "",
    careSectionBg: "",
    companyAboutImg: "",

    // Right column
    websiteLink: "",
    facebookLink: "",
    googleTag: "",
    googleMap: "",
    facebookPixel: "",
    googleTagManager: "",
    googleAnalytics: "",
    appLink: "",
    iosLink: "",
    parentingLink: "",

    // SEO
    metaKeyword: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    ogImg: "",
    loginBgImg: "",

    // Coming Soon
    comingSoon: false,
    comingSoonDate: "",

    // Footers
    footerInfo: "",
    footerDescription: "",
  });

  // Populate data from backend
  useEffect(() => {
    if (companyRes?.data) {
      const d = companyRes.data;
      setFormData({
        companyName: d.companyName || d.name || "",
        companyTitle: d.companyTitle || "",
        phone: d.phone || "",
        hotline: d.hotline || "",
        whatsapp: d.whatsapp || "",
        email: d.email || "",
        address: d.address || "",
        billFooter: d.billFooter || "",
        bin: d.bin || "",

        companyLogo: d.companyLogo || d.logo || "",
        favicon: d.favicon || "",
        adminFavicon: d.adminFavicon || "",
        careSectionBg: d.careSectionBg || "",
        companyAboutImg: d.companyAboutImg || "",

        websiteLink: d.websiteLink || "",
        facebookLink: d.facebookLink || "",
        googleTag: d.googleTag || "",
        googleMap: d.googleMap || "",
        facebookPixel: d.facebookPixel || "",
        googleTagManager: d.googleTagManager || "",
        googleAnalytics: d.googleAnalytics || "",
        appLink: d.appLink || "",
        iosLink: d.iosLink || "",
        parentingLink: d.parentingLink || "",

        metaKeyword: d.metaKeyword || (Array.isArray(d.metaKeywords) ? d.metaKeywords.join(", ") : d.metaKeywords || ""),
        metaDescription: d.metaDescription || d.seo?.metaDescription || "",
        ogTitle: d.ogTitle || d.seo?.ogTitle || "",
        ogDescription: d.ogDescription || d.seo?.ogDescription || "",
        ogImg: d.ogImg || d.seo?.ogImage || "",
        loginBgImg: d.loginBgImg || "",

        comingSoon: Boolean(d.comingSoon),
        comingSoonDate: d.comingSoonDate || "",

        footerInfo: d.footerInfo || "",
        footerDescription: d.footerDescription || d.description || "",
      });
    }
  }, [companyRes]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.companyName) {
      toast.error("Company Name is required!");
      return;
    }

    const toastId = toast.loading("Saving company settings...");
    try {
      await upsertCompany({
        name: formData.companyName,
        companyName: formData.companyName,
        companyTitle: formData.companyTitle,
        phone: formData.phone,
        hotline: formData.hotline,
        whatsapp: formData.whatsapp,
        email: formData.email,
        address: formData.address,
        billFooter: formData.billFooter,
        bin: formData.bin,

        logo: formData.companyLogo,
        companyLogo: formData.companyLogo,
        favicon: formData.favicon,
        adminFavicon: formData.adminFavicon,
        careSectionBg: formData.careSectionBg,
        companyAboutImg: formData.companyAboutImg,

        websiteLink: formData.websiteLink,
        facebookLink: formData.facebookLink,
        googleTag: formData.googleTag,
        googleMap: formData.googleMap,
        facebookPixel: formData.facebookPixel,
        googleTagManager: formData.googleTagManager,
        googleAnalytics: formData.googleAnalytics,
        appLink: formData.appLink,
        iosLink: formData.iosLink,
        parentingLink: formData.parentingLink,

        metaKeyword: formData.metaKeyword,
        metaKeywords: formData.metaKeyword,
        metaDescription: formData.metaDescription,
        ogTitle: formData.ogTitle,
        ogDescription: formData.ogDescription,
        ogImg: formData.ogImg,
        loginBgImg: formData.loginBgImg,

        comingSoon: formData.comingSoon,
        comingSoonDate: formData.comingSoonDate,

        footerInfo: formData.footerInfo,
        footerDescription: formData.footerDescription,
      } as any).unwrap();

      toast.success("Company settings saved successfully!", { id: toastId });
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Failed to save company settings", { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border glass-card shadow-xs">
        <div>
          <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <Building2 className="text-primary" size={18} />
            Company Profile & Configuration
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure business identity, asset uploads, SEO meta tags, social channels, and rich footers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground bg-card hover:bg-muted transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={13} />
            Reload
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid matching reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Identity, Contact, Address, Brand Images                     */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border flex items-center gap-2">
              <Building2 size={14} className="text-primary" />
              General Business Info
            </h4>

            {/* Company Name* */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="e.g. Dekora Sportswear Ltd"
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                required
              />
            </div>

            {/* Company Title* */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Company Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyTitle}
                onChange={(e) => handleChange("companyTitle", e.target.value)}
                placeholder="e.g. Custom Sportswear Manufacturer Made in Bangladesh"
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
              />
            </div>

            {/* Phone* & Hotline* */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="01911663336"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Hotline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.hotline}
                  onChange={(e) => handleChange("hotline", e.target.value)}
                  placeholder="01911663338"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                />
              </div>
            </div>

            {/* WhatsApp & Email* */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Whats App</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="01911663336"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="info@dekorasportswear.com"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                  required
                />
              </div>
            </div>

            {/* Address* */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="House# 1, Road# 5, Block# B, Future Town, Bosila, Mohammadpur, Dhaka-1207"
                className="w-full p-3 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all custom-scrollbar"
                required
              />
            </div>

            {/* Bill Footer & BIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Bill Footer</label>
                <input
                  type="text"
                  value={formData.billFooter}
                  onChange={(e) => handleChange("billFooter", e.target.value)}
                  placeholder="House# 1, Road# 5, Block# B, Future Town..."
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">BIN (Business ID)</label>
                <input
                  type="text"
                  value={formData.bin}
                  onChange={(e) => handleChange("bin", e.target.value)}
                  placeholder="e.g. 002910391-0101"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Left Column: Image Assets */}
          <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border flex items-center gap-2">
              <ImageIcon size={14} className="text-primary" />
              Company Brand Images
            </h4>

            {/* Company Logo */}
            <ImageUploadField
              label="Company Logo"
              value={formData.companyLogo}
              onChange={(url) => handleChange("companyLogo", url)}
            />

            {/* Favicon Icon */}
            <ImageUploadField
              label="Favicon Icon"
              sizeNote="Favicon Icon size must be 50x50"
              value={formData.favicon}
              onChange={(url) => handleChange("favicon", url)}
            />

            {/* Admin Favicon */}
            <ImageUploadField
              label="Admin Favicon"
              sizeNote="Favicon Icon size must be 50x50"
              value={formData.adminFavicon}
              onChange={(url) => handleChange("adminFavicon", url)}
            />

            {/* Care Section Background */}
            <ImageUploadField
              label="Care Section Background"
              sizeNote="Background Image size must be 2500px x 590px"
              value={formData.careSectionBg}
              onChange={(url) => handleChange("careSectionBg", url)}
            />

            {/* Company About Img */}
            <ImageUploadField
              label="Company About Img"
              value={formData.companyAboutImg}
              onChange={(url) => handleChange("companyAboutImg", url)}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Links, Tracking Pixels, SEO, Maintenance, Auth Backgrounds   */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border flex items-center gap-2">
              <Globe size={14} className="text-primary" />
              Web Links & Tracking Tags
            </h4>

            {/* Website Link */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Website Link</label>
              <input
                type="text"
                value={formData.websiteLink}
                onChange={(e) => handleChange("websiteLink", e.target.value)}
                placeholder="https://dekorasportswear.com"
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
              />
            </div>

            {/* Facebook Link */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Facebook Link</label>
              <input
                type="text"
                value={formData.facebookLink}
                onChange={(e) => handleChange("facebookLink", e.target.value)}
                placeholder="https://www.facebook.com/DekoraSportswear/"
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
              />
            </div>

            {/* Google Tag */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Google Tag</label>
              <input
                type="text"
                value={formData.googleTag}
                onChange={(e) => handleChange("googleTag", e.target.value)}
                placeholder="GTM-XXXXXX or script code"
                className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all font-mono"
              />
            </div>

            {/* Google Map Embed Code */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Google Map Embed Code</label>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Note: Google Map Embed Code must be W:600, H:400
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.googleMap}
                onChange={(e) => handleChange("googleMap", e.target.value)}
                placeholder='<iframe src="https://www.google.com/maps/embed?..." width="600" height="400" ...></iframe>'
                className="w-full p-3 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-mono transition-all custom-scrollbar"
              />
            </div>

            {/* Facebook Pixel & Google Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Facebook Pixel</label>
                <input
                  type="text"
                  value={formData.facebookPixel}
                  onChange={(e) => handleChange("facebookPixel", e.target.value)}
                  placeholder="Pixel ID or Script snippet"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-mono transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Google Analytics</label>
                <input
                  type="text"
                  value={formData.googleAnalytics}
                  onChange={(e) => handleChange("googleAnalytics", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-mono transition-all"
                />
              </div>
            </div>

            {/* App Link, iOS Link & Parenting Link */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">App Link (Android)</label>
                <input
                  type="text"
                  value={formData.appLink}
                  onChange={(e) => handleChange("appLink", e.target.value)}
                  placeholder="https://play.google.com/..."
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">iOS Link (Apple)</label>
                <input
                  type="text"
                  value={formData.iosLink}
                  onChange={(e) => handleChange("iosLink", e.target.value)}
                  placeholder="https://apps.apple.com/..."
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Parenting Link</label>
                <input
                  type="text"
                  value={formData.parentingLink}
                  onChange={(e) => handleChange("parentingLink", e.target.value)}
                  placeholder="Parent company link"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right Column: SEO & Social Media Meta */}
          <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              SEO & Social Sharing Meta
            </h4>

            {/* Meta Keyword */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Meta Keyword</label>
              <textarea
                rows={2}
                value={formData.metaKeyword}
                onChange={(e) => handleChange("metaKeyword", e.target.value)}
                placeholder="custom sportswear manufacturer, custom teamwear, jersey manufacturer..."
                className="w-full p-3 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all custom-scrollbar"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Meta Description</label>
              <textarea
                rows={2}
                value={formData.metaDescription}
                onChange={(e) => handleChange("metaDescription", e.target.value)}
                placeholder="DEKORA Sportswear is a custom sportswear manufacturer in Bangladesh..."
                className="w-full p-3 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all custom-scrollbar"
              />
            </div>

            {/* OG Title & OG Description */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">OG Title</label>
                <input
                  type="text"
                  value={formData.ogTitle}
                  onChange={(e) => handleChange("ogTitle", e.target.value)}
                  placeholder="Custom Sportswear Manufacturer Worldwide | DEKORA"
                  className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">OG Description</label>
                <textarea
                  rows={2}
                  value={formData.ogDescription}
                  onChange={(e) => handleChange("ogDescription", e.target.value)}
                  placeholder="Create custom jerseys, teamwear and performance apparel with DEKORA..."
                  className="w-full p-3 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary text-foreground outline-none font-medium transition-all custom-scrollbar"
                />
              </div>
            </div>

            {/* OG Img & Login Background Img */}
            <ImageUploadField
              label="OG Img (Social Preview)"
              value={formData.ogImg}
              onChange={(url) => handleChange("ogImg", url)}
            />

            <ImageUploadField
              label="Login Background Img"
              value={formData.loginBgImg}
              onChange={(url) => handleChange("loginBgImg", url)}
            />

            {/* Coming Soon Mode & Target Date */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Coming Soon Mode</p>
                  <p className="text-[10px] text-muted-foreground">Put store in maintenance / pre-launch mode</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.comingSoon}
                    onChange={(e) => handleChange("comingSoon", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {formData.comingSoon && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Clock size={12} className="text-primary" />
                    Coming Soon Target Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.comingSoonDate}
                    onChange={(e) => handleChange("comingSoonDate", e.target.value)}
                    className="w-full h-10 px-3.5 text-xs rounded-xl border border-border bg-card text-foreground outline-none font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: Rich Footers & Legal Information                          */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Footer Info */}
        <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h4 className="font-heading text-sm font-bold text-foreground">Footer Info</h4>
              <p className="text-[11px] text-muted-foreground">
                Company registration, trade license (TL), factory locations, and office contacts displayed in the footer
              </p>
            </div>
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-muted-foreground text-xs">
              <span className="px-2 py-0.5 font-mono text-[10px] font-bold">Rich Text Format</span>
            </div>
          </div>

          <textarea
            rows={4}
            value={formData.footerInfo}
            onChange={(e) => handleChange("footerInfo", e.target.value)}
            placeholder="Company Name: Dekora Sportswear Ltd | TL: TRAD/DNCC/133681/2022 | Office & Factory: House# 1, Road# 5, Block# B, Future Town, Bosila, Mohammadpur, Dhaka-1207, Bangladesh"
            className="w-full p-4 text-xs rounded-xl border border-border bg-muted/20 focus:bg-background focus:border-primary text-foreground outline-none font-medium leading-relaxed transition-all custom-scrollbar"
          />
        </div>

        {/* Footer Description */}
        <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h4 className="font-heading text-sm font-bold text-foreground">Footer Description</h4>
              <p className="text-[11px] text-muted-foreground">
                SEO-rich manufacturer overview, product capabilities, and branding text
              </p>
            </div>
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-muted-foreground text-xs">
              <span className="px-2 py-0.5 font-mono text-[10px] font-bold">SEO Content Block</span>
            </div>
          </div>

          <textarea
            rows={6}
            value={formData.footerDescription}
            onChange={(e) => handleChange("footerDescription", e.target.value)}
            placeholder="Custom Sportswear Manufacturer for Global Buyers&#10;DEKORA SPORTSWEAR manufactures fully custom jerseys, team uniforms and performance apparel for sports teams, clubs, schools, universities, distributors and apparel brands worldwide..."
            className="w-full p-4 text-xs rounded-xl border border-border bg-muted/20 focus:bg-background focus:border-primary text-foreground outline-none font-medium leading-relaxed transition-all custom-scrollbar"
          />
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground bg-card hover:bg-muted transition-all cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw size={14} />
          Reset / Discard
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save size={15} />
          <span>{isSaving ? "Saving Configuration..." : "Save All Company Settings"}</span>
        </button>
      </div>
    </form>
  );
}
