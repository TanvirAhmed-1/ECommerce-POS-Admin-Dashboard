"use client";

import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Sliders,
  Plus,
  Trash2,
  Copy,
  X,
  Sparkles,
} from "lucide-react";
import RichTextEditor, { TemplateOption } from "@/components/shared/RichTextEditor";

interface DescriptionTabProps {
  shortDescription?: string;
  setShortDescription?: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  keyFeatures?: string[];
  setKeyFeatures?: React.Dispatch<React.SetStateAction<string[]>>;
  warrantyPolicy?: string;
  setWarrantyPolicy?: (val: string) => void;
  setActiveTab: (val: any) => void;
}

const SPECIFICATION_TEMPLATES: TemplateOption[] = [
  {
    label: "📊 Full Technical Specs Table",
    templateHtml: `
      <table class="w-full my-4 border-collapse border border-slate-200 dark:border-slate-800 text-xs">
        <thead>
          <tr class="bg-slate-100 dark:bg-slate-800/80">
            <th class="border border-slate-200 dark:border-slate-800 p-2.5 text-left font-bold text-slate-800 dark:text-slate-200">Specification</th>
            <th class="border border-slate-200 dark:border-slate-800 p-2.5 text-left font-bold text-slate-800 dark:text-slate-200">Details / Values</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 font-medium">Model / Version</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100 font-semibold">Flagship Pro Edition</td>
          </tr>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 font-medium">Chipset / Processor</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100 font-semibold">Jerry AC7003D4 / Ultra Core</td>
          </tr>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 font-medium">Connectivity</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100 font-semibold">Bluetooth 5.4, 10m range</td>
          </tr>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 font-medium">Battery Capacity</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100 font-semibold">Case 300mAh; Earbuds 40mAh</td>
          </tr>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 font-medium">Operating Time</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100 font-semibold">7 Hours Continuous Playback</td>
          </tr>
          <tr>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-300 font-medium">Dimensions & Weight</td>
            <td class="border border-slate-200 dark:border-slate-800 p-2 text-slate-800 dark:text-slate-100 font-semibold">61 x 51.5 x 28.5 mm | 44.8g</td>
          </tr>
        </tbody>
      </table>
    `,
  },
  {
    label: "📱 Quick Specs Key-Value Cards",
    templateHtml: `
      <div class="grid grid-cols-2 gap-3 my-4 text-xs">
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <span class="text-muted-foreground block text-[11px]">Material</span>
          <span class="font-bold text-slate-900 dark:text-white">Aerospace-grade ABS</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <span class="text-muted-foreground block text-[11px]">Interface</span>
          <span class="font-bold text-slate-900 dark:text-white">Type-C Fast Charging</span>
        </div>
      </div>
    `,
  },
];

const WARRANTY_TEMPLATES: TemplateOption[] = [
  {
    label: "🛡️ Official 1-Year Replacement Warranty",
    templateHtml: `
      <div class="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-3">
        <h4 class="font-bold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-1.5">
          🛡️ 1-Year Official Brand Replacement Guarantee
        </h4>
        <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
          This product comes with a 100% authentic manufacturer warranty. If any manufacturing defect occurs during the warranty duration, you are eligible for authorized repair or replacement.
        </p>
        <div class="space-y-1 pt-1 border-t border-emerald-500/20 text-[11px]">
          <p><strong>Claim Requirements:</strong></p>
          <ul class="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
            <li>Retain the original purchase invoice and serial number badge.</li>
            <li>Physical damage, water exposure, or unauthorized dismantling will void coverage.</li>
            <li>Contact official helpline or visit nearest authorized service center for instant verification.</li>
          </ul>
        </div>
      </div>
    `,
  },
  {
    label: "⚡ 7-Day Hassle-Free Replacement Policy",
    templateHtml: `
      <div class="p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-xs space-y-2">
        <h4 class="font-bold text-blue-700 dark:text-blue-400 text-sm">
          ⚡ 7 Days Instant Return & Replacement
        </h4>
        <p class="text-slate-700 dark:text-slate-300 leading-relaxed">
          In case of functional defects or transit damages upon receiving the parcel, request a replacement within 7 calendar days with original packaging intact.
        </p>
      </div>
    `,
  },
];

export default function DescriptionTab({
  shortDescription = "",
  setShortDescription,
  description,
  setDescription,
  keyFeatures = [],
  setKeyFeatures,
  warrantyPolicy = "",
  setWarrantyPolicy,
  setActiveTab,
}: DescriptionTabProps) {
  // Key Features local state
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [bulkFeatureText, setBulkFeatureText] = useState("");
  const [showBulkFeatureModal, setShowBulkFeatureModal] = useState(false);

  // Key Features Helper Actions
  const handleAddFeature = () => {
    const trimmed = newFeatureInput.trim();
    if (!trimmed || !setKeyFeatures) return;
    setKeyFeatures((prev) => [...prev, trimmed]);
    setNewFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    if (!setKeyFeatures) return;
    setKeyFeatures((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBulkAddFeatures = () => {
    if (!bulkFeatureText.trim() || !setKeyFeatures) return;
    const lines = bulkFeatureText
      .split("\n")
      .map((l) => l.trim().replace(/^[-•*✅\s]+/, "").trim())
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      setKeyFeatures((prev) => [...prev, ...lines]);
      setBulkFeatureText("");
      setShowBulkFeatureModal(false);
    }
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* 1. KEY FEATURES HIGHLIGHTS (Bullet Points with ✅) */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 font-black text-[11px]">
                ✅
              </span>
              Key Feature Highlights (Bullet Points)
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Top selling highlights with checkmarks (e.g. Bluetooth 5.4, 40-hour Battery, ANC, Waterproof).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowBulkFeatureModal(true)}
            className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <Copy size={12} /> Bulk Paste
          </button>
        </div>

        {/* Input to add single feature */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs select-none">
              ✅
            </span>
            <input
              type="text"
              placeholder="e.g. Bluetooth 5.4; chip: Jerry AC7003D4; 7h playtime"
              value={newFeatureInput}
              onChange={(e) => setNewFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleAddFeature}
            className="h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>

        {/* Features List Preview */}
        {keyFeatures.length > 0 && (
          <div className="space-y-2 p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              Active Highlights ({keyFeatures.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-card border border-border hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-start gap-2 text-xs font-semibold text-foreground flex-1">
                    <span className="text-emerald-500 shrink-0 font-bold select-none text-sm leading-none">
                      ✅
                    </span>
                    <span className="leading-snug">{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. DETAILED DESCRIPTION (WYSIWYG RICH HTML EDITOR) */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-border">
        <RichTextEditor
          label="Detailed Description (HTML Formatted Rich WYSIWYG Editor)"
          sublabel="Full product story, specifications table, image embeds, formatted typography, and layout."
          badge="HTML Formatted"
          value={description}
          onChange={setDescription}
          minHeight="280px"
          icon={<FileText size={14} className="text-primary" />}
        />
      </div>

      {/* 3. PRODUCT SPECIFICATIONS (HTML FORMATTED RICH EDITOR) */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-border">
        <RichTextEditor
          label="Product Specifications & Details (HTML Formatted)"
          sublabel="Custom specifications tables, technical parameters, hardware features, and dimension specs."
          badge="HTML Formatted"
          value={shortDescription}
          onChange={(val) => setShortDescription && setShortDescription(val)}
          placeholder="Insert specifications table, technical specs, or detailed breakdown..."
          minHeight="220px"
          templates={SPECIFICATION_TEMPLATES}
          icon={<Sliders size={14} className="text-primary" />}
        />
      </div>

      {/* 4. WARRANTY & CUSTOMER SUPPORT POLICY (HTML FORMATTED RICH EDITOR) */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-border">
        <RichTextEditor
          label="Warranty & Customer Support Policy (HTML Formatted)"
          sublabel="Custom warranty terms, durations, replacement guarantee, and official claim instructions."
          badge="HTML Formatted"
          value={warrantyPolicy}
          onChange={(val) => setWarrantyPolicy && setWarrantyPolicy(val)}
          placeholder="Write official warranty duration, terms, claim instructions, and guarantee rules..."
          minHeight="200px"
          templates={WARRANTY_TEMPLATES}
          icon={<ShieldCheck size={14} className="text-primary" />}
        />
      </div>

      {/* Navigation Actions */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className="h-9 px-4 border border-border bg-card text-foreground hover:bg-muted text-xs font-bold rounded-lg cursor-pointer transition-colors"
        >
          ← Back to Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className="h-9 px-5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer shadow-sm shadow-primary/20 transition-all flex items-center gap-1.5"
        >
          <span>Continue to Media</span>
          <span>→</span>
        </button>
      </div>

      {/* Bulk Features Modal */}
      {showBulkFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md p-5 rounded-2xl border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Copy size={13} className="text-primary" />
                Bulk Paste Feature Highlights
              </h4>
              <button
                type="button"
                onClick={() => setShowBulkFeatureModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Paste bullet points line by line from your product sheet. Any leading bullets (•, -, *, ✅) will automatically be parsed.
            </p>

            <textarea
              rows={6}
              placeholder="Bluetooth 5.4; chip: Jerry AC7003D4&#10;Battery capacity: charging case 300mAh; headset 40mAh&#10;Use time: 7 hours (ANC on 6 hours)&#10;Material: ABS; size:61*51.5*28.5 mm; total weight: 44.8g&#10;With APP function, supports for hall switch"
              value={bulkFeatureText}
              onChange={(e) => setBulkFeatureText(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-card text-xs font-mono text-foreground outline-none focus:border-primary resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkFeatureModal(false)}
                className="h-8 px-3 text-xs font-bold rounded-lg border border-border hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAddFeatures}
                className="h-8 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
              >
                Import All Lines
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
