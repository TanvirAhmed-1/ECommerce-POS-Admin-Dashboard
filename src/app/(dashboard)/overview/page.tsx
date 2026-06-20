"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useGetOverviewQuery } from "@/redux/features/dashboard/dashboardApi";
import Loader from "@/components/shared/Loader";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Eye,
  ArrowUpRight,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  Search,
} from "lucide-react";

export default function OverviewPage() {
  const { data: overviewRes, isLoading, refetch } = useGetOverviewQuery({});
  const overviewData = overviewRes?.data;

  const [activeSegment, setActiveSegment] = useState<"revenue" | "orders" | "profit">("revenue");
  const [accentColor, setAccentColor] = useState("#4f46e5");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHex = localStorage.getItem("dashboardColorHex");
      if (savedHex) {
        setAccentColor(savedHex);
      }
    }
  }, []);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Process data with fallbacks
  const stats = useMemo(() => {
    const totals = overviewData?.totals || {};
    
    return {
      totalRevenue: totals.totalRevenue || 0,
      totalOrders: totals.totalOrders || 0,
      totalProducts: totals.totalProducts || 0,
      totalUsers: totals.totalUsers || 0,
      recentOrders: overviewData?.recentOrders || []
    };
  }, [overviewData]);

  const parsedMonthlySales = useMemo(() => {
    return overviewData?.monthlySales || Array.from({ length: 12 }, (_, i) => ({ month: i + 1, revenue: 0, orders: 0 }));
  }, [overviewData]);

  // Chart data vectors depending on selected segment
  const chartData = useMemo(() => {
    const points = parsedMonthlySales.map((item: any) => {
      let val = item.revenue;
      if (activeSegment === "orders") {
        val = item.orders;
      } else if (activeSegment === "profit") {
        val = item.revenue * 0.15; // assume 15% profit margin
      }
      return val;
    });

    const maxVal = Math.max(...points, 10); // prevent division by zero

    // Map to coordinates: x from 0 to 1000, y from 250 to 50
    const coords = points.map((val: number, idx: number) => {
      const x = (idx / 11) * 1000;
      const y = 250 - (val / maxVal) * 200; // max height 200px
      return { x, y, raw: val };
    });

    // Create SVG Cubic Bezier Path
    let path = `M 0 ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const cp1x = prev.x + 40;
      const cp1y = prev.y;
      const cp2x = curr.x - 40;
      const cp2y = curr.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    const fillPath = `${path} L 1000 300 L 0 300 Z`;

    const pointIndicators = [
      { cx: coords[5].x, cy: coords[5].y, val: activeSegment === "orders" ? `${coords[5].raw} orders` : formatMoney(coords[5].raw) }, // June (index 5)
      { cx: coords[11].x, cy: coords[11].y, val: activeSegment === "orders" ? `${coords[11].raw} orders` : formatMoney(coords[11].raw) } // Dec (index 11)
    ];

    let color = accentColor;
    if (activeSegment === "orders") color = "#10b981";
    if (activeSegment === "profit") color = "#8b5cf6";

    return {
      path,
      fillPath,
      points: pointIndicators,
      color,
      tooltipOffset: `left-[${Math.round(coords[5].x)}px]`,
      tooltipText: `June: ${activeSegment === "orders" ? `${coords[5].raw} orders` : formatMoney(coords[5].raw)}`
    };
  }, [parsedMonthlySales, activeSegment, accentColor]);

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
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground">Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Welcome back, Aigars. Here's what's happening with your business today.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Revenue */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Revenue
                </span>
                <h3 className="text-2xl font-extrabold font-heading text-foreground mt-1">
                  {formatMoney(stats.totalRevenue)}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px]">
              <span className="flex items-center gap-0.5 font-bold text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                <TrendingUp size={10} /> +12.5%
              </span>
              <span className="text-muted-foreground font-medium">vs last month</span>
            </div>
            {/* Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-8 w-full overflow-hidden opacity-60">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0 35 C 20 30, 40 38, 60 25 C 80 22, 90 15, 100 10 L 100 40 L 0 40 Z" fill="url(#grad-rev)" />
                <path d="M 0 35 C 20 30, 40 38, 60 25 C 80 22, 90 15, 100 10" fill="none" stroke="#f97316" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Card 2: Active Users */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Active Users
                </span>
                <h3 className="text-2xl font-extrabold font-heading text-foreground mt-1">
                  {stats.totalUsers.toLocaleString()}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px]">
              <span className="flex items-center gap-0.5 font-bold text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                <TrendingUp size={10} /> +8.2%
              </span>
              <span className="text-muted-foreground font-medium">vs last month</span>
            </div>
            {/* Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-8 w-full overflow-hidden opacity-60">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-users" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0 32 C 15 28, 30 35, 50 20 C 70 24, 85 10, 100 8 L 100 40 L 0 40 Z" fill="url(#grad-users)" />
                <path d="M 0 32 C 15 28, 30 35, 50 20 C 70 24, 85 10, 100 8" fill="none" stroke="#10b981" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Card 3: Total Orders */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Orders
                </span>
                <h3 className="text-2xl font-extrabold font-heading text-foreground mt-1">
                  {stats.totalOrders.toLocaleString()}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <ShoppingCart size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px]">
              <span className="flex items-center gap-0.5 font-bold text-rose-500 bg-rose-500/10 dark:bg-rose-500/15 px-1.5 py-0.5 rounded-full">
                <TrendingDown size={10} /> -3.1%
              </span>
              <span className="text-muted-foreground font-medium">vs last month</span>
            </div>
            {/* Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-8 w-full overflow-hidden opacity-60">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-orders" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0 15 C 20 18, 40 28, 60 22 C 80 30, 90 28, 100 32 L 100 40 L 0 40 Z" fill="url(#grad-orders)" />
                <path d="M 0 15 C 20 18, 40 28, 60 22 C 80 30, 90 28, 100 32" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Card 4: Page Views */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Page Views
                </span>
                <h3 className="text-2xl font-extrabold font-heading text-foreground mt-1">
                  284K
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400">
                <Eye size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px]">
              <span className="flex items-center gap-0.5 font-bold text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                <TrendingUp size={10} /> +24.7%
              </span>
              <span className="text-muted-foreground font-medium">vs last month</span>
            </div>
            {/* Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-8 w-full overflow-hidden opacity-60">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-views" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 0 38 C 20 36, 40 28, 60 20 C 80 18, 90 12, 100 6 L 100 40 L 0 40 Z" fill="url(#grad-views)" />
                <path d="M 0 38 C 20 36, 40 28, 60 20 C 80 18, 90 12, 100 6" fill="none" stroke="#eab308" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Overview Chart Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h4 className="font-heading text-lg font-bold text-foreground">Overview</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly performance for the current year</p>
            </div>
            {/* Segment Selector */}
            <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border self-start sm:self-auto">
              {(["revenue", "orders", "profit"] as const).map((seg) => (
                <button
                  key={seg}
                  onClick={() => setActiveSegment(seg)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all capitalize ${
                    activeSegment === seg
                      ? "bg-white text-black dark:bg-zinc-800 dark:text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {seg}
                </button>
              ))}
            </div>
          </div>

          {/* Svg area chart */}
          <div className="w-full h-[280px] relative mt-2">
            <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mainChartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={chartData.color} stopOpacity="0.25"></stop>
                  <stop offset="100%" stopColor={chartData.color} stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="0" y1="50" x2="1000" y2="50" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="4" strokeWidth="1" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="4" strokeWidth="1" />
              <line x1="0" y1="250" x2="1000" y2="250" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="4" strokeWidth="1" />
              
              {/* Area */}
              <path d={chartData.fillPath} fill="url(#mainChartGradient)"></path>
              
              {/* Smooth Curve */}
              <path d={chartData.path} fill="none" stroke={chartData.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
              
              {/* Points */}
              {chartData.points.map((pt, idx) => (
                <circle key={idx} cx={pt.cx} cy={pt.cy} r="5" fill={chartData.color} stroke="currentColor" className="text-background" strokeWidth="2"></circle>
              ))}
            </svg>
            
            {/* Tooltip */}
            <div className={`absolute top-12 ${chartData.tooltipOffset} -translate-x-1/2 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg border border-border shadow-2xl pointer-events-none`}>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Telemetry</p>
              <p className="text-xs font-bold text-foreground">{chartData.tooltipText}</p>
            </div>
          </div>

          {/* Chart X axis */}
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
        </div>

        {/* Two Columns Layout (Traffic Sources & Recent Orders) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Traffic Sources (Donut Chart) */}
          <div className="lg:col-span-5 glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-lg font-bold text-foreground">Traffic Sources</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Where your visitors come from</p>
            </div>

            {/* Circular Pie Chart */}
            <div className="flex-1 flex flex-col justify-center items-center py-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                  <circle className="text-muted/20" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16"></circle>
                  {/* Direct (35%) */}
                  <circle className="text-indigo-600 dark:text-indigo-400" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="502.6" strokeDashoffset="175.9"></circle>
                  {/* Organic (28%) */}
                  <circle className="text-emerald-500" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="502.6" strokeDashoffset="316.6" transform="rotate(126 96 96)"></circle>
                  {/* Referral (20%) */}
                  <circle className="text-blue-500" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="502.6" strokeDashoffset="402" transform="rotate(226.8 96 96)"></circle>
                  {/* Social (17%) */}
                  <circle className="text-yellow-500" cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="502.6" strokeDashoffset="417.1" transform="rotate(298.8 96 96)"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-foreground leading-none font-heading">324K</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Visits</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                  <span className="text-muted-foreground">Direct</span>
                </div>
                <span className="text-foreground">35%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-muted-foreground">Organic Search</span>
                </div>
                <span className="text-foreground">28%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">Referral</span>
                </div>
                <span className="text-foreground">20%</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <span className="text-muted-foreground">Social Media</span>
                </div>
                <span className="text-foreground">17%</span>
              </div>
            </div>
          </div>

          {/* Recent Orders (Table) */}
          <div className="lg:col-span-7 glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-heading text-lg font-bold text-foreground">Recent Orders</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Quick overview of recent purchases</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Live
              </span>
            </div>
            
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5 pr-2 font-bold uppercase text-[10px]">Order</th>
                    <th className="py-2.5 px-2 font-bold uppercase text-[10px]">Customer</th>
                    <th className="py-2.5 px-2 font-bold uppercase text-[10px]">Status</th>
                    <th className="py-2.5 px-2 font-bold uppercase text-[10px] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((ord: any) => {
                      const statusColors: Record<string, string> = {
                        pending: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
                        processing: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
                        shipped: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
                        delivered: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
                        cancelled: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
                      };
                      
                      const orderNum = ord.orderNumber || `ORD-${String(ord._id).substring(18).toUpperCase()}`;
                      const userName = ord.user?.name || "Guest Checkout";
                      const userEmail = ord.user?.email || "N/A";
                      const status = ord.orderStatus || "pending";
                      
                      return (
                        <tr key={ord._id} className="hover:bg-muted/30 transition-colors group">
                          <td className="py-3 pr-2 font-bold text-foreground">{orderNum}</td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{userName}</span>
                              <span className="text-[10px] text-muted-foreground">{userEmail}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full inline-block uppercase tracking-wider ${statusColors[status] || "bg-zinc-100 dark:bg-zinc-800 text-foreground"}`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right font-black text-foreground">{formatMoney(ord.totalAmount)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        No orders recorded yet in system database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Link
              href="/orders"
              className="w-full py-2.5 mt-4 text-xs font-bold text-primary hover:bg-primary/5 transition-all text-center rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center gap-1 group"
            >
              <span>View All Orders</span>
              <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
