"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Sliders, Check, Layout, Save, RotateCcw } from "lucide-react";

interface ColorOption {
  id: string;
  name: string;
  hex: string;
  class: string;
  desc: string;
}

const dashboardColors: ColorOption[] = [
  { id: "indigo", name: "Royal Indigo", hex: "#4f46e5", class: "bg-indigo-600", desc: "Classic trustworthy look" },
  { id: "emerald", name: "Forest Emerald", hex: "#10b981", class: "bg-emerald-500", desc: "Eco-friendly organic style" },
  { id: "violet", name: "Deep Violet", hex: "#8b5cf6", class: "bg-violet-500", desc: "Creative modern aesthetic" },
  { id: "rose", name: "Premium Rose", hex: "#f43f5e", class: "bg-rose-500", desc: "Luxury premium appeal" },
  { id: "amber", name: "Golden Amber", hex: "#f59e0b", class: "bg-amber-500", desc: "Warm energetic energy" },
];

export default function SettingsPage() {
  const [selectedDashboardColor, setSelectedDashboardColor] = useState("indigo");
  const [isSaved, setIsSaved] = useState(false);

  // Load colors from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDash = localStorage.getItem("dashboardColorTheme") || "indigo";
      setSelectedDashboardColor(savedDash);
    }
  }, []);

  const handleApplyDashboardColor = (colorId: string) => {
    setSelectedDashboardColor(colorId);
    const selected = dashboardColors.find(c => c.id === colorId);
    if (selected) {
      document.documentElement.style.setProperty("--primary", selected.hex);
      if (typeof window !== "undefined") {
        localStorage.setItem("dashboardColorTheme", colorId);
        localStorage.setItem("dashboardColorHex", selected.hex);
      }
    }
  };

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetSettings = () => {
    handleApplyDashboardColor("indigo");
  };

  const currentDashHex = dashboardColors.find(c => c.id === selectedDashboardColor)?.hex || "#4f46e5";

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Breadcrumb & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Dashboard</span>
            <span className="opacity-50">/</span>
            <span className="text-foreground">Settings</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold font-heading text-foreground">Settings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize layout themes, appearance parameters, and color schemes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold bg-card text-foreground hover:bg-muted/50 cursor-pointer transition-all"
              >
                <RotateCcw size={14} />
                Reset Defaults
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white hover:opacity-90 text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm shadow-primary/20"
              >
                <Save size={14} />
                {isSaved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Warning Alert */}
        {isSaved && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <Check size={16} /> Theme preferences saved and applied successfully.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dashboard Theme Setup Card */}
          <div className="glass-card p-5 rounded-2xl border border-border space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Layout size={16} />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-foreground">Dashboard Theme</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Select the primary accent color for the administration dashboard panels.</p>
              </div>
            </div>

            <div className="space-y-2">
              {dashboardColors.map((color) => {
                const isSelected = selectedDashboardColor === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => handleApplyDashboardColor(color.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${color.class} flex items-center justify-center text-white shrink-0 shadow-md`}>
                        {isSelected && <Check size={14} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{color.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{color.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded border border-border">
                      {color.hex}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Dashboard Preview Card */}
          <div className="glass-card p-5 rounded-2xl border border-border space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-sm font-bold text-foreground mb-4">Dashboard Accent Preview</h4>
              
              <div className="p-4 rounded-xl border border-border bg-background space-y-3 shadow-inner">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-white font-extrabold text-[9px]" style={{ backgroundColor: currentDashHex }}>
                      Z
                    </div>
                    <span className="text-[10px] font-extrabold text-foreground">Zenith Admin</span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: currentDashHex }} />
                </div>
                {/* Panel */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-card p-2 rounded border border-border">
                    <div>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase">Active Sales</p>
                      <p className="text-xs font-extrabold text-foreground">$12,492</p>
                    </div>
                    <span className="text-[8px] font-extrabold px-1 py-0.5 rounded-full" style={{ backgroundColor: `${currentDashHex}15`, color: currentDashHex }}>
                      +12%
                    </span>
                  </div>
                  {/* Button */}
                  <button className="w-full py-1.5 text-[9px] font-extrabold text-white rounded transition-opacity hover:opacity-90" style={{ backgroundColor: currentDashHex }}>
                    Generate Telemetry Report
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground border-t border-border/40 pt-4 flex items-center gap-1.5">
              <Sliders size={12} /> Live preview renders style variations instantly without affecting other pages until you hit Save.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
