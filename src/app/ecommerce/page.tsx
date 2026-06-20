"use client";

import React, { useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  DollarSign,
  ShoppingCart,
  Percent,
  TrendingUp,
  Tag,
  Package,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingDown,
  ShoppingBag,
} from "lucide-react";

import { useGetOverviewQuery, useGetDashboardAnalyticsQuery } from "@/redux/features/dashboard/dashboardApi";
import Loader from "@/components/shared/Loader";

export default function EcommerceAnalyticsPage() {
  const { data: overviewRes, isLoading: isOverviewLoading } = useGetOverviewQuery({});
  const { data: analyticsRes, isLoading: isAnalyticsLoading } = useGetDashboardAnalyticsQuery({});

  const isLoading = isOverviewLoading || isAnalyticsLoading;

  const totals = overviewRes?.data?.totals || {};
  const backendProducts = analyticsRes?.data?.topProducts || [];

  const topProducts = useMemo(() => {
    if (backendProducts.length > 0) {
      return backendProducts;
    }
    return [
      {
        id: "P-101",
        name: "Ergonomic Gaming Mouse",
        sales: 342,
        revenue: 17100,
        stock: 45,
        thumbnail: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=100",
      },
      {
        id: "P-102",
        name: "Mechanical Backlit Keyboard",
        sales: 284,
        revenue: 25560,
        stock: 12,
        thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=100",
      },
      {
        id: "P-103",
        name: "UltraWide Curved Monitor 34\"",
        sales: 112,
        revenue: 55888,
        stock: 8,
        thumbnail: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=100",
      },
      {
        id: "P-104",
        name: "Noise Cancelling Headphones",
        sales: 98,
        revenue: 14700,
        stock: 50,
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=100",
      },
      {
        id: "P-105",
        name: "Premium Leather Desk Pad",
        sales: 84,
        revenue: 2940,
        stock: 120,
        thumbnail: "https://images.unsplash.com/photo-1616499389997-4818867a6590?q=80&w=100",
      },
    ];
  }, [backendProducts]);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

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
              <span className="text-foreground">E-Commerce</span>
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2 mt-1">
              <ShoppingBag className="text-primary" size={24} />
              Sales & E-Commerce Report
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review transaction histories, average order sizes, sales pipeline conversions, and top-selling product logs.
            </p>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gross Sales</span>
                <h3 className="text-xl font-black text-foreground mt-1">
                  {totals.totalRevenue !== undefined ? formatMoney(totals.totalRevenue) : "$116,188"}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingUp size={10} className="mr-0.5" /> +15.8%
              </span>
              <span className="text-muted-foreground font-medium">vs last month</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg. Order Value</span>
                <h3 className="text-xl font-black text-foreground mt-1">$84.50</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <ShoppingCart size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingUp size={10} className="mr-0.5" /> +5.4%
              </span>
              <span className="text-muted-foreground font-medium">higher product mix</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</span>
                <h3 className="text-xl font-black text-foreground mt-1">3.14%</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Percent size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingUp size={10} className="mr-0.5" /> +0.8%
              </span>
              <span className="text-muted-foreground font-medium">improved checkouts</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sales Goal (Target)</span>
                <h3 className="text-xl font-black text-foreground mt-1">84%</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Tag size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="text-muted-foreground font-bold">$16,000 remaining</span>
              <span className="text-muted-foreground font-medium">to target</span>
            </div>
          </div>
        </div>

        {/* Sales Trend Chart (Double Gradient Area Chart) */}
        <div className="glass-card p-5 rounded-2xl border border-border bg-card">
          <div>
            <h4 className="font-heading text-base font-bold text-foreground">Gross Sales vs Cost of Goods</h4>
            <p className="text-xs text-muted-foreground">Comparison graph mapping net profit margins over the months</p>
          </div>

          {/* SVG Multi Line Area Chart */}
          <div className="w-full h-[280px] relative mt-4">
            <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <defs>
                {/* Gross Sales Gradient */}
                <linearGradient id="grossSalesGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2"></stop>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"></stop>
                </linearGradient>
                {/* Cost Gradient */}
                <linearGradient id="costGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15"></stop>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0"></stop>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="50" x2="1000" y2="50" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800/80" strokeDasharray="3" strokeWidth="1" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800/80" strokeDasharray="3" strokeWidth="1" />
              <line x1="0" y1="250" x2="1000" y2="250" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800/80" strokeDasharray="3" strokeWidth="1" />

              {/* Area path for Gross Sales */}
              <path d="M 0 240 C 150 210, 300 230, 450 120 C 600 160, 750 90, 900 70 C 950 65, 1000 40, 1000 40 L 1000 300 L 0 300 Z" fill="url(#grossSalesGrad)" />
              {/* Line for Gross Sales */}
              <path d="M 0 240 C 150 210, 300 230, 450 120 C 600 160, 750 90, 900 70 C 950 65, 1000 40, 1000 40" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />

              {/* Area path for Cost of Goods */}
              <path d="M 0 270 C 150 250, 300 270, 450 200 C 600 220, 750 180, 900 150 C 950 140, 1000 120, 1000 120 L 1000 300 L 0 300 Z" fill="url(#costGrad)" />
              {/* Line for Cost of Goods */}
              <path d="M 0 270 C 150 250, 300 270, 450 200 C 600 220, 750 180, 900 150 C 950 140, 1000 120, 1000 120" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider px-2 mt-3 border-t border-border/40 pt-3">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-foreground">Gross Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 border border-dashed" />
              <span className="text-foreground">Cost of Goods (COGS)</span>
            </div>
          </div>
        </div>

        {/* Lower Grid: Top Selling Products & Acquisition Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Top Selling Products */}
          <div className="lg:col-span-7 glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-base font-bold text-foreground">Top-Selling Products</h4>
              <p className="text-xs text-muted-foreground">Highest earning products based on unit sales count</p>
            </div>

            <div className="overflow-x-auto custom-scrollbar my-4">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-2.5 pr-2 font-bold uppercase text-[9px] tracking-wider">Product</th>
                    <th className="py-2.5 px-2 font-bold uppercase text-[9px] tracking-wider text-center">Sales</th>
                    <th className="py-2.5 px-2 font-bold uppercase text-[9px] tracking-wider text-center">Stock</th>
                    <th className="py-2.5 px-2 font-bold uppercase text-[9px] tracking-wider text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {topProducts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-3 pr-2 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground truncate max-w-[200px]">{p.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{p.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-foreground">{p.sales}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock < 15 ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                          {p.stock} left
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-black text-foreground">${p.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Acquisition Channels Performance */}
          <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-base font-bold text-foreground">Sales by Channels</h4>
              <p className="text-xs text-muted-foreground">Order volume breakdown by source channels</p>
            </div>

            <div className="space-y-4 my-6">
              {[
                { name: "Direct Website POS", value: 58, count: "831 orders", color: "bg-indigo-600" },
                { name: "Organic Search Google", value: 24, count: "343 orders", color: "bg-emerald-500" },
                { name: "Facebook Ads", value: 12, count: "171 orders", color: "bg-blue-500" },
                { name: "Affiliate Referral Links", value: 6, count: "85 orders", color: "bg-amber-500" },
              ].map((channel, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>{channel.name}</span>
                    <span className="text-muted-foreground font-medium">{channel.count} ({channel.value}%)</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                    <div className={`h-full ${channel.color} rounded-full`} style={{ width: `${channel.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-bold text-muted-foreground border-t border-border/40 pt-4 flex items-center justify-between">
              <span>Primary Source: <strong>Direct POS</strong></span>
              <span className="text-[10px] text-emerald-500 flex items-center gap-0.5">
                <TrendingUp size={10} /> +8% growth
              </span>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
