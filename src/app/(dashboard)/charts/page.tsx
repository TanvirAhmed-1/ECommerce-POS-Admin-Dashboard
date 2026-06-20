"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Compass,
  Zap,
  RotateCcw,
} from "lucide-react";

export default function ChartsPage() {
  const [activeBubble, setActiveBubble] = useState<{ x: number; y: number; label: string; size: number } | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Dashboard</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">Charts</span>
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2 mt-1">
              <BarChart3 className="text-primary" size={24} />
              Visualizations & Charts Playground
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive sandbox demonstrating pure SVG chart visualizations, animations, and telemetry telemetry dashboards.
            </p>
          </div>
        </div>

        {/* 6 Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Interactive Multi-Line Chart */}
          <div className="glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-heading text-sm font-bold text-foreground">Multi-Line Chart</h4>
                <TrendingUp size={14} className="text-indigo-500" />
              </div>
              <p className="text-[11px] text-muted-foreground">Product A vs Product B sales comparison</p>
            </div>

            <div className="w-full h-[180px] relative my-4">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="2" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="2" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="2" />

                {/* Line Product A (Indigo) */}
                <path d="M 0 140 C 80 120, 160 150, 240 80 C 320 60, 400 110, 500 50" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
                <circle cx="240" cy="80" r="4" fill="#4f46e5" stroke="currentColor" className="text-background" strokeWidth="2" />
                <circle cx="500" cy="50" r="4" fill="#4f46e5" stroke="currentColor" className="text-background" strokeWidth="2" />

                {/* Line Product B (Emerald) */}
                <path d="M 0 110 C 80 90, 160 100, 240 120 C 320 80, 400 60, 500 90" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2" />
                <circle cx="320" cy="80" r="4" fill="#10b981" stroke="currentColor" className="text-background" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold border-t border-border/40 pt-3">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Product A</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Product B</span>
              </div>
              <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">+14.8% combined</span>
            </div>
          </div>

          {/* Chart 2: Radial Gauge Chart */}
          <div className="glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-heading text-sm font-bold text-foreground">Radial Gauge Chart</h4>
                <Zap size={14} className="text-amber-500" />
              </div>
              <p className="text-[11px] text-muted-foreground">Resource utilization & compute engine load</p>
            </div>

            <div className="flex justify-center items-center my-4 h-[180px]">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-225" viewBox="0 0 100 100">
                  {/* Gauge background track */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="10" strokeDasharray="188.5" strokeDashoffset="0" strokeLinecap="round"></circle>
                  {/* Active gauge track (75% full) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#radialGaugeColor)" strokeWidth="10" strokeDasharray="188.5" strokeDashoffset="47.1" strokeLinecap="round"></circle>
                  
                  <defs>
                    <linearGradient id="radialGaugeColor" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground">75%</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">CPU Load</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground font-bold border-t border-border/40 pt-3 text-center">
              System State: <strong className="text-foreground">Optimal Uptime</strong>
            </div>
          </div>

          {/* Chart 3: Standard Bar Chart */}
          <div className="glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-heading text-sm font-bold text-foreground">Vertical Bar Chart</h4>
                <BarChart3 size={14} className="text-emerald-500" />
              </div>
              <p className="text-[11px] text-muted-foreground">New customer account profile signups</p>
            </div>

            <div className="w-full h-[180px] flex items-end justify-between gap-2.5 my-4 px-1">
              {[60, 45, 80, 55, 90, 70, 100].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-1.5 py-0.5 rounded text-[9px] font-black border border-border absolute -translate-y-8 select-none">
                    {val * 3}
                  </div>
                  <div className="w-full bg-muted rounded-t-lg overflow-hidden border border-border/30 h-[120px] flex items-end">
                    <div
                      className="w-full bg-primary/80 group-hover:bg-primary rounded-t-md transition-all duration-500"
                      style={{ height: `${val}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx]}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-muted-foreground font-bold border-t border-border/40 pt-3 flex justify-between items-center">
              <span>Weekly Total: <strong>1,492 signups</strong></span>
              <span className="text-emerald-500 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +24%</span>
            </div>
          </div>

          {/* Chart 4: Stacked Area Chart */}
          <div className="glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-heading text-sm font-bold text-foreground">Stacked Area Chart</h4>
                <Activity size={14} className="text-blue-500" />
              </div>
              <p className="text-[11px] text-muted-foreground">Revenue streams allocation</p>
            </div>

            <div className="w-full h-[180px] relative my-4">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="stackedAreaColor1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="stackedAreaColor2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Stacked Fill 1 */}
                <path d="M 0 150 C 120 120, 240 140, 360 80 C 430 70, 500 40, 500 40 L 500 180 L 0 180 Z" fill="url(#stackedAreaColor1)" />
                {/* Stacked Fill 2 */}
                <path d="M 0 170 C 120 150, 240 160, 360 120 C 430 110, 500 90, 500 90 L 500 180 L 0 180 Z" fill="url(#stackedAreaColor2)" />

                {/* Lines */}
                <path d="M 0 150 C 120 120, 240 140, 360 80 C 430 70, 500 40, 500 40" fill="none" stroke="#4f46e5" strokeWidth="2" />
                <path d="M 0 170 C 120 150, 240 160, 360 120 C 430 110, 500 90, 500 90" fill="none" stroke="#10b981" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold border-t border-border/40 pt-3">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Subscriptions</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> One-time POS</span>
              </div>
              <span className="text-muted-foreground">USD Margin</span>
            </div>
          </div>

          {/* Chart 5: Interactive Doughnut Chart */}
          <div className="glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-heading text-sm font-bold text-foreground">Doughnut Chart</h4>
                <PieChart size={14} className="text-yellow-500" />
              </div>
              <p className="text-[11px] text-muted-foreground">API responses breakdown status codes</p>
            </div>

            <div className="flex justify-center items-center my-4 h-[180px]">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                  <circle className="text-muted/15" cx="96" cy="96" r="76" fill="transparent" stroke="currentColor" strokeWidth="14"></circle>
                  
                  {/* Success (70%) */}
                  <circle className="text-emerald-500" cx="96" cy="96" r="76" fill="transparent" stroke="currentColor" strokeWidth="14" strokeDasharray="477.5" strokeDashoffset="143.2"></circle>
                  
                  {/* Client Error 4xx (22%) */}
                  <circle className="text-amber-500" cx="96" cy="96" r="76" fill="transparent" stroke="currentColor" strokeWidth="14" strokeDasharray="477.5" strokeDashoffset="372.45" transform="rotate(252 96 96)"></circle>
                  
                  {/* Server Error 5xx (8%) */}
                  <circle className="text-rose-500" cx="96" cy="96" r="76" fill="transparent" stroke="currentColor" strokeWidth="14" strokeDasharray="477.5" strokeDashoffset="439.3" transform="rotate(331.2 96 96)"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-foreground">99.9%</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Success Rate</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 text-center text-[9px] font-bold uppercase text-muted-foreground border-t border-border/40 pt-3">
              <span className="text-emerald-500 font-extrabold">2xx: 70%</span>
              <span className="text-amber-500 font-extrabold">4xx: 22%</span>
              <span className="text-rose-500 font-extrabold">5xx: 8%</span>
            </div>
          </div>

          {/* Chart 6: Bubble Chart / Scatter Telemetry Plot */}
          <div className="glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-heading text-sm font-bold text-foreground">Bubble / Scatter Plot</h4>
                <Compass size={14} className="text-indigo-500" />
              </div>
              <p className="text-[11px] text-muted-foreground">Product price vs unit sales count correlation</p>
            </div>

            <div className="w-full h-[180px] relative my-4 border-l border-b border-border/60">
              {/* Render Bubbles */}
              {[
                { x: 20, y: 140, label: "Gaming Mouse ($50)", size: 14 },
                { x: 50, y: 110, label: "Keyboard ($90)", size: 18 },
                { x: 80, y: 80, label: "Desk Pad ($35)", size: 10 },
                { x: 140, y: 40, label: "Monitor ($499)", size: 28 },
                { x: 220, y: 90, label: "Headphones ($150)", size: 22 },
                { x: 300, y: 60, label: "Laptop Pro ($1499)", size: 32 },
                { x: 400, y: 120, label: "USB Hub ($25)", size: 8 },
              ].map((bubble, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveBubble(bubble)}
                  className="absolute rounded-full bg-primary/30 hover:bg-primary/75 border border-primary transition-all duration-200 cursor-pointer flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${bubble.x}px`,
                    top: `${bubble.y}px`,
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                  }}
                  title={bubble.label}
                />
              ))}

              {/* Helper guide texts */}
              <span className="absolute bottom-2 right-2 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Price →</span>
              <span className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider text-muted-foreground -rotate-90 transform origin-left">Sales →</span>
            </div>

            {/* Bubble tooltip info */}
            <div className="text-[10px] text-muted-foreground font-bold border-t border-border/40 pt-3 text-center min-h-[30px] flex items-center justify-center">
              {activeBubble ? (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold animate-fade-in">
                  {activeBubble.label}: {activeBubble.size * 10} units sold
                </span>
              ) : (
                <span>Click bubbles to inspect correlation details</span>
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
