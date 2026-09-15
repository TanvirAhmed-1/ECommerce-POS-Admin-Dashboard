"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Palette, Sparkles } from "lucide-react";
import ThemeColorsForm from "@/components/ui/settings/ThemeColorsForm";
import { useGetCompanyQuery } from "@/redux/features/company/companyApi";

export default function SettingsPage() {
  const { data: companyRes } = useGetCompanyQuery({});
  const company = companyRes?.data || {};

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Dashboard</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Settings</span>
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2">
              <Palette className="text-primary" size={24} />
              Color & Theme Settings
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Customize enterprise brand colors, accents, and visual appearance across the administrative console.
            </p>
          </div>
        </div>

        {/* Theme Colors Form */}
        <div className="animate-fade-in">
          <ThemeColorsForm
            initialPrimary={company?.primaryColor || "#4f46e5"}
            initialSecondary={company?.secondaryColor || "#818cf8"}
            initialThemeName={company?.themeName || "Royal Indigo"}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

