"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, ArrowLeft } from "lucide-react";
import CompanySettingsForm from "@/components/ui/settings/CompanySettingsForm";
import Link from "next/link";

export default function CompanyInfoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Settings</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Company Info</span>
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2">
              <Building2 className="text-primary" size={24} />
              Company Details & Profile Info
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Configure company name, contacts, logos, favicons, SEO tags, map embeds, tracking IDs, and rich footer content.
            </p>
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all self-start sm:self-auto shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Theme & Colors</span>
          </Link>
        </div>

        {/* Company Settings Form */}
        <div className="animate-fade-in">
          <CompanySettingsForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
