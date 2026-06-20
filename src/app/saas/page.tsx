"use client";

import React, { useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu,
  Globe,
  Database,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export default function SaaSAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Dashboard</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">SaaS Metrics</span>
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2 mt-1">
              <Layers className="text-primary" size={24} />
              SaaS Operations & Subscriptions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review Monthly/Annual Recurring Revenues, subscription segment metrics, client churn rates, and service uptime.
            </p>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Recurring Revenue (MRR)</span>
                <h3 className="text-xl font-black text-foreground mt-1">$18,240</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingUp size={10} className="mr-0.5" /> +14.2%
              </span>
              <span className="text-muted-foreground font-medium">vs last month</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Annual Recurring Revenue (ARR)</span>
                <h3 className="text-xl font-black text-foreground mt-1">$218,880</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <RefreshCw size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingUp size={10} className="mr-0.5" /> +15.6%
              </span>
              <span className="text-muted-foreground font-medium">run-rate projections</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Churn Rate (L30D)</span>
                <h3 className="text-xl font-black text-foreground mt-1">2.14%</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <TrendingDown size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingDown size={10} className="mr-0.5" /> -0.4%
              </span>
              <span className="text-muted-foreground font-medium">improvement in churn</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net Revenue Retention (NRR)</span>
                <h3 className="text-xl font-black text-foreground mt-1">112%</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingUp size={10} className="mr-0.5" /> +3.0%
              </span>
              <span className="text-muted-foreground font-medium">expansion sales growth</span>
            </div>
          </div>
        </div>

        {/* Stepped MRR growth chart */}
        <div className="glass-card p-5 rounded-2xl border border-border bg-card">
          <div>
            <h4 className="font-heading text-base font-bold text-foreground">Monthly Recurring Revenue Growth</h4>
            <p className="text-xs text-muted-foreground">Cumulative growth curve of SaaS operations</p>
          </div>

          <div className="w-full h-[260px] relative mt-4">
            <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="saasGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="60" x2="1000" y2="60" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="3" />
              <line x1="0" y1="160" x2="1000" y2="160" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="3" />
              <line x1="0" y1="260" x2="1000" y2="260" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="3" />

              {/* Stepped area */}
              <path d="M 0 260 L 150 260 L 150 240 L 300 240 L 300 210 L 450 210 L 450 170 L 600 170 L 600 120 L 750 120 L 750 90 L 900 90 L 900 60 L 1000 60 L 1000 300 L 0 300 Z" fill="url(#saasGrad)" />
              {/* Stepped line */}
              <path d="M 0 260 L 150 260 L 150 240 L 300 240 L 300 210 L 450 210 L 450 170 L 600 170 L 600 120 L 750 120 L 750 90 L 900 90 L 900 60 L 1000 60" fill="none" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="square" />
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
        </div>

        {/* Lower Grid: Subscription Plans shares & System Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Subscription plan segmentation share */}
          <div className="lg:col-span-6 glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-base font-bold text-foreground">Subscription Tiers share</h4>
              <p className="text-xs text-muted-foreground">Distribution share of active clients by tier selection</p>
            </div>

            <div className="space-y-4 my-6">
              {[
                { name: "Starter Tier ($19/mo)", value: 45, count: "1,281 subscribers", color: "bg-indigo-500" },
                { name: "Professional Tier ($49/mo)", value: 40, count: "1,138 subscribers", color: "bg-emerald-500" },
                { name: "Enterprise Tier ($299/mo)", value: 15, count: "428 subscribers", color: "bg-amber-500" },
              ].map((tier, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>{tier.name}</span>
                    <span className="text-muted-foreground font-semibold">{tier.count} ({tier.value}%)</span>
                  </div>
                  <div className="h-3.5 w-full bg-muted rounded-lg overflow-hidden border border-border/30">
                    <div className={`h-full ${tier.color} rounded-lg`} style={{ width: `${tier.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-bold text-muted-foreground border-t border-border/40 pt-4 flex items-center justify-between">
              <span>Avg Expansion Rate: <strong>+4.8%</strong></span>
              <span className="text-emerald-500 flex items-center gap-0.5 text-[10px]">
                <TrendingUp size={10} /> +12% target MRR
              </span>
            </div>
          </div>

          {/* Infrastructure uptime logs / System telemetry */}
          <div className="lg:col-span-6 glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-base font-bold text-foreground">System Health & Telemetry</h4>
              <p className="text-xs text-muted-foreground">Real-time status of backend service APIs and servers</p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-5">
              
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Service Uptime</span>
                  <span className="text-sm font-extrabold text-foreground">99.98%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                  <Activity size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Response Latency</span>
                  <span className="text-sm font-extrabold text-foreground">84 ms</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Database size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">DB Query Exec</span>
                  <span className="text-sm font-extrabold text-foreground">12 ms avg</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Cpu size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Compute Load</span>
                  <span className="text-sm font-extrabold text-foreground">34.2%</span>
                </div>
              </div>

            </div>

            <div className="text-[11px] font-bold text-muted-foreground border-t border-border/40 pt-4 flex items-center justify-between">
              <span>All Node locations: <strong>US-EAST, SG-1, EU-WEST</strong></span>
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Operational
              </span>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
