"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Check, Layout, Save, RotateCcw, Palette, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUpsertCompanyMutation } from "@/redux/features/company/companyApi";

export interface ColorPalette {
  id: string;
  name: string;
  hex: string;
  secondaryHex: string;
  class: string;
  desc: string;
}

export const colorPalettes: ColorPalette[] = [
  { id: "indigo", name: "Royal Indigo", hex: "#4f46e5", secondaryHex: "#818cf8", class: "bg-indigo-600", desc: "Classic trustworthy enterprise navy-indigo" },
  { id: "emerald", name: "Forest Emerald", hex: "#10b981", secondaryHex: "#34d399", class: "bg-emerald-500", desc: "Eco-friendly, organic & fresh commerce style" },
  { id: "violet", name: "Deep Violet", hex: "#8b5cf6", secondaryHex: "#a78bfa", class: "bg-violet-500", desc: "Creative modern digital aesthetic" },
  { id: "rose", name: "Crimson Ruby", hex: "#e11d48", secondaryHex: "#fb7185", class: "bg-rose-500", desc: "Bold luxury & high-energy appeal" },
  { id: "amber", name: "Golden Amber", hex: "#f59e0b", secondaryHex: "#fbbf24", class: "bg-amber-500", desc: "Warm energetic and engaging tone" },
  { id: "cyan", name: "Ocean Cyan", hex: "#06b6d4", secondaryHex: "#22d3ee", class: "bg-cyan-500", desc: "Crisp modern tech-forward aqua" },
  { id: "slate", name: "Midnight Obsidian", hex: "#0f172a", secondaryHex: "#334155", class: "bg-slate-900", desc: "Minimalist executive high-contrast dark style" },
  { id: "blue", name: "Electric Sapphire", hex: "#2563eb", secondaryHex: "#60a5fa", class: "bg-blue-600", desc: "High-contrast digital e-commerce blue" },
];

interface ThemeColorsFormProps {
  initialPrimary?: string;
  initialSecondary?: string;
  initialThemeName?: string;
}

export default function ThemeColorsForm({
  initialPrimary = "#4f46e5",
  initialSecondary = "#818cf8",
  initialThemeName = "Royal Indigo",
}: ThemeColorsFormProps) {
  const [selectedPaletteId, setSelectedPaletteId] = useState("indigo");
  const [customPrimaryHex, setCustomPrimaryHex] = useState(initialPrimary);
  const [customSecondaryHex, setCustomSecondaryHex] = useState(initialSecondary);
  const [themeName, setThemeName] = useState(initialThemeName);
  const [isSaved, setIsSaved] = useState(false);

  const [upsertCompany, { isLoading: isUpserting }] = useUpsertCompanyMutation();

  // Load saved colors on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("dashboardColorTheme") || "indigo";
      const savedHex = localStorage.getItem("dashboardColorHex") || initialPrimary;
      setSelectedPaletteId(savedTheme);
      setCustomPrimaryHex(savedHex);
      const matched = colorPalettes.find((p) => p.id === savedTheme || p.hex.toLowerCase() === savedHex.toLowerCase());
      if (matched) {
        setThemeName(matched.name);
      }
    }
  }, [initialPrimary]);

  const handleApplyPalette = (palette: ColorPalette) => {
    setSelectedPaletteId(palette.id);
    setCustomPrimaryHex(palette.hex);
    setCustomSecondaryHex(palette.secondaryHex);
    setThemeName(palette.name);
    applyColorToDom(palette.hex);
  };

  const handleCustomPrimaryChange = (hex: string) => {
    setSelectedPaletteId("custom");
    setCustomPrimaryHex(hex);
    setThemeName("Custom Palette");
    applyColorToDom(hex);
  };

  const applyColorToDom = (hex: string) => {
    if (typeof window !== "undefined") {
      document.documentElement.style.setProperty("--primary", hex);
    }
  };

  const handleSaveThemeSettings = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardColorTheme", selectedPaletteId);
      localStorage.setItem("dashboardColorHex", customPrimaryHex);
    }

    try {
      await upsertCompany({
        primaryColor: customPrimaryHex,
        secondaryColor: customSecondaryHex,
        themeName: themeName,
      } as any).unwrap();

      setIsSaved(true);
      toast.success("Theme & brand color preferences saved successfully!");
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "Saved locally, backend sync failed.");
    }
  };

  const handleResetDefaults = () => {
    const defaultPalette = colorPalettes[0];
    handleApplyPalette(defaultPalette);
    toast.success("Reset to Royal Indigo default theme.");
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Success Alert */}
      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check size={16} /> Theme preferences saved and applied across the admin interface.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Palettes */}
        <div className="lg:col-span-7 glass-card p-5 rounded-2xl border border-border bg-card space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Palette size={16} />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground">Brand Color Palettes</h4>
                <p className="text-[11px] text-muted-foreground">Select a curated color theme with defined names and tones</p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
              Active: {themeName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {colorPalettes.map((palette) => {
              const isSelected = selectedPaletteId === palette.id;
              return (
                <button
                  key={palette.id}
                  onClick={() => handleApplyPalette(palette)}
                  className={`flex flex-col p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary/30 scale-[1.01]"
                      : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-xs shrink-0"
                        style={{ backgroundColor: palette.hex }}
                      >
                        {isSelected && <Check size={12} />}
                      </div>
                      <span className="text-xs font-bold text-foreground">{palette.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded border border-border">
                      {palette.hex}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium line-clamp-2">
                    {palette.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom Color Selector */}
          <div className="pt-3 border-t border-border/60">
            <h5 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-primary" />
              Custom Color Selector
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-muted/30">
                <input
                  type="color"
                  value={customPrimaryHex}
                  onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Primary Color</p>
                  <input
                    type="text"
                    value={customPrimaryHex}
                    onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                    className="text-xs font-mono font-bold bg-transparent text-foreground outline-none uppercase w-full"
                    placeholder="#4F46E5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-muted/30">
                <input
                  type="color"
                  value={customSecondaryHex}
                  onChange={(e) => setCustomSecondaryHex(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Accent / Secondary</p>
                  <input
                    type="text"
                    value={customSecondaryHex}
                    onChange={(e) => setCustomSecondaryHex(e.target.value)}
                    className="text-xs font-mono font-bold bg-transparent text-foreground outline-none uppercase w-full"
                    placeholder="#818CF8"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time UI Preview */}
        <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-border bg-card space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Layout size={16} />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground">Live Dashboard Preview</h4>
                <p className="text-[11px] text-muted-foreground">Preview how widgets look with your selected theme</p>
              </div>
            </div>

            {/* Mock Dashboard Window */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-3 shadow-inner">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-border/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-xs"
                    style={{ backgroundColor: customPrimaryHex }}
                  >
                    D
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-foreground">Dekora Admin</p>
                    <p className="text-[9px] text-muted-foreground">Live Commerce POS</p>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ backgroundColor: `${customPrimaryHex}15`, color: customPrimaryHex }}
                >
                  Online
                </span>
              </div>

              {/* Metric Card */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg border border-border bg-card">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Today's Sales</p>
                  <p className="text-sm font-black text-foreground mt-0.5">৳3,480.00</p>
                  <span className="text-[8px] font-bold text-emerald-500">+18.4%</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-card">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Completed</p>
                  <p className="text-sm font-black text-foreground mt-0.5">48 Orders</p>
                  <span className="text-[8px] font-bold text-blue-500">100% fulfill</span>
                </div>
              </div>

              {/* Sample Action Button */}
              <button
                className="w-full py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-95 cursor-pointer"
                style={{ backgroundColor: customPrimaryHex }}
              >
                + New Quick Order
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:text-foreground bg-card hover:bg-muted/50 cursor-pointer transition-all"
            >
              <RotateCcw size={13} />
              Reset Defaults
            </button>

            <button
              onClick={handleSaveThemeSettings}
              disabled={isUpserting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:opacity-90 text-xs font-bold rounded-lg cursor-pointer transition-all shadow-md shadow-primary/20"
            >
              <Save size={14} />
              <span>{isUpserting ? "Saving Theme..." : "Save Theme Colors"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
