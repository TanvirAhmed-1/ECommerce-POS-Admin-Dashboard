"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetDashboardAnalyticsQuery } from "@/redux/features/dashboard/dashboardApi";
import Loader from "@/components/shared/Loader";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Eye,
  MousePointer,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  Calendar,
  Activity,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function AnalyticsPage() {
  const { data: analyticsRes, isLoading } = useGetDashboardAnalyticsQuery({});
  const analyticsData = analyticsRes?.data;

  const [activeRange, setActiveRange] = useState<"7d" | "30d" | "90d">("7d");
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; count: number } | null>(null);

  // Heatmap generation helper (7 days x 24 hours)
  const heatmapData = useMemo(() => {
    if (analyticsData?.heatmap && analyticsData.heatmap.length > 0) {
      return analyticsData.heatmap;
    }
    
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return days.map((day) => {
      return {
        day,
        hours: hours.map((hour) => {
          // Generate a semi-random count biased by time of day
          let bias = 10;
          if (hour >= 9 && hour <= 17) bias = 75; // business hours peak
          else if (hour >= 18 && hour <= 22) bias = 50; // evening sub-peak
          else bias = 15; // night drop

          const count = Math.floor(bias + Math.sin(hour + day.length) * 15 + Math.random() * 10);
          return { hour, count: Math.max(0, count) };
        }),
      };
    });
  }, [analyticsData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[75vh] w-full items-center justify-center">
          <Loader size={50} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Dashboard</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Analytics</span>
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2 mt-1">
              <Activity className="text-primary animate-pulse" size={24} />
              Analytics Hub
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitor conversion metrics, heatmaps, visitor geography, and device segment breakdowns in real time.
            </p>
          </div>

          {/* Date range picker */}
          <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border self-start sm:self-auto shrink-0">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all uppercase ${
                  activeRange === range
                    ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bounce Rate</span>
                <h3 className="text-xl font-black text-foreground mt-1">42.32%</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <MousePointer size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingDown size={10} className="mr-0.5" /> -2.1%
              </span>
              <span className="text-muted-foreground font-medium">improvement vs last period</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg. Visit Duration</span>
                <h3 className="text-xl font-black text-foreground mt-1">4m 32s</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Clock size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingUp size={10} className="mr-0.5" /> +12.4%
              </span>
              <span className="text-muted-foreground font-medium">longer user engagement</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pages Per Session</span>
                <h3 className="text-xl font-black text-foreground mt-1">5.82</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Eye size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingUp size={10} className="mr-0.5" /> +4.2%
              </span>
              <span className="text-muted-foreground font-medium">average clickdepth</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Visitors</span>
                <h3 className="text-xl font-black text-foreground mt-1 flex items-center gap-1.5">
                  142
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Users size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="text-muted-foreground font-bold">18 active</span>
              <span className="text-muted-foreground font-medium">on checkout path currently</span>
            </div>
          </div>
        </div>

        {/* Live Heatmap of User Visits */}
        <div className="glass-card p-5 rounded-2xl border border-border bg-card">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
            <div>
              <h4 className="font-heading text-base font-bold text-foreground">User Visits Heatmap</h4>
              <p className="text-xs text-muted-foreground">Hourly heat pattern of orders and sessions over the week</p>
            </div>
            
            {/* Color key helper */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Less</span>
              <div className="w-3 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-3 h-3 rounded bg-primary/20" />
              <div className="w-3 h-3 rounded bg-primary/40" />
              <div className="w-3 h-3 rounded bg-primary/70" />
              <div className="w-3 h-3 rounded bg-primary" />
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar pt-2">
            <div className="min-w-[700px] space-y-1">
              {/* Hours row */}
              <div className="flex items-center text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest pl-10 pr-2 pb-1.5">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-center">
                    {i === 0 ? "12am" : i === 12 ? "12pm" : i % 12}
                  </div>
                ))}
              </div>

              {heatmapData.map((row: any) => (
                <div key={row.day} className="flex items-center gap-1">
                  {/* Day label */}
                  <div className="w-8 text-[10px] font-extrabold text-muted-foreground">{row.day}</div>
                  
                  {/* Hours block grid */}
                  <div className="flex-1 flex gap-1">
                    {row.hours.map((cell: any) => {
                      // Map count count to color density
                      let colorClass = "bg-zinc-200 dark:bg-zinc-800";
                      if (cell.count > 75) colorClass = "bg-primary text-white";
                      else if (cell.count > 50) colorClass = "bg-primary/70 text-white";
                      else if (cell.count > 25) colorClass = "bg-primary/40 text-foreground";
                      else if (cell.count > 8) colorClass = "bg-primary/20 text-foreground";

                      return (
                        <div
                          key={cell.hour}
                          onMouseEnter={() => setHoveredCell({ day: row.day, hour: cell.hour, count: cell.count })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`flex-1 h-6 rounded-md transition-all duration-150 cursor-pointer hover:ring-2 hover:ring-foreground/40 ${colorClass}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Cell Info Display */}
          <div className="mt-4 min-h-[30px] flex items-center justify-center text-center border-t border-border/40 pt-4">
            {hoveredCell ? (
              <span className="text-xs text-foreground font-semibold flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full animate-fade-in">
                <Sparkles size={12} />
                <strong>{hoveredCell.day}</strong> at{" "}
                <strong>
                  {hoveredCell.hour === 0
                    ? "12:00 AM"
                    : hoveredCell.hour === 12
                    ? "12:00 PM"
                    : hoveredCell.hour > 12
                    ? `${hoveredCell.hour - 12}:00 PM`
                    : `${hoveredCell.hour}:00 AM`}
                </strong>
                : <strong className="text-foreground">{hoveredCell.count} sessions</strong> registered
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground font-medium">
                Hover over heatmap grid cells above to view detailed hourly counts
              </span>
            )}
          </div>
        </div>

        {/* Lower Grid: Conversion Funnel & Device/Browser Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Conversion Funnel */}
          <div className="lg:col-span-7 glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-base font-bold text-foreground">Checkout & Acquisition Funnel</h4>
              <p className="text-xs text-muted-foreground">Detailed visual dropoff analysis from visit to purchase confirmation</p>
            </div>

            {/* Visual Funnel Representation */}
            <div className="space-y-4 my-6">
              {[
                { stage: "Website Sessions", count: "12,482", percentage: 100, color: "bg-indigo-600" },
                { stage: "Product Page Views", count: "8,920", percentage: 71.4, color: "bg-indigo-500" },
                { stage: "Added to Cart", count: "3,142", percentage: 25.1, color: "bg-indigo-400/90" },
                { stage: "Initiated Checkout", count: "1,248", percentage: 10.0, color: "bg-indigo-400/70" },
                { stage: "Completed Orders", count: "392", percentage: 3.14, color: "bg-emerald-500" },
              ].map((funnel, i) => (
                <div key={i} className="relative space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>{funnel.stage}</span>
                    <span className="text-muted-foreground font-medium">
                      {funnel.count} ({funnel.percentage}%)
                    </span>
                  </div>
                  <div className="h-6 w-full bg-muted rounded-lg overflow-hidden border border-border/30 relative">
                    <div
                      className={`h-full ${funnel.color} rounded-l-lg transition-all duration-1000 ease-out`}
                      style={{ width: `${funnel.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-semibold text-muted-foreground text-center border-t border-border/40 pt-4 flex justify-between items-center">
              <span>Overall conversion rate: <strong>3.14%</strong></span>
              <a href="/ecommerce" className="text-primary hover:underline flex items-center gap-0.5">
                E-commerce Report <ArrowRight size={10} />
              </a>
            </div>
          </div>

          {/* Traffic Breakdown by devices / Browser */}
          <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-base font-bold text-foreground">Device Breakdown</h4>
              <p className="text-xs text-muted-foreground">Performance metrics by user platform selection</p>
            </div>

            {/* Centered Donut breakdown */}
            <div className="flex justify-center py-6">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                  <circle className="text-muted/20" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="14"></circle>
                  
                  {/* Desktop 55% */}
                  <circle className="text-indigo-600 dark:text-indigo-400" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="14" strokeDasharray="502.6" strokeDashoffset="226.1"></circle>
                  
                  {/* Mobile 38% */}
                  <circle className="text-emerald-500" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="14" strokeDasharray="502.6" strokeDashoffset="311.6" transform="rotate(198 96 96)"></circle>
                  
                  {/* Tablet 7% */}
                  <circle className="text-amber-500" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="14" strokeDasharray="502.6" strokeDashoffset="467.4" transform="rotate(334.8 96 96)"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-foreground">55%</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Desktop</span>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                  <Laptop size={12} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Desktop</span>
                </div>
                <span className="text-foreground">55%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <Smartphone size={12} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Mobile</span>
                </div>
                <span className="text-foreground">38%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <Tablet size={12} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Tablet</span>
                </div>
                <span className="text-foreground">7%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
