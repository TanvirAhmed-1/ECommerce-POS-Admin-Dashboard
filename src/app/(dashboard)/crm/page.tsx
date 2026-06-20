"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Users,
  Sparkles,
  TrendingUp,
  UserPlus,
  ShieldAlert,
  Heart,
  MessageSquare,
  Search,
  CheckCircle,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function CRMPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const activities = [
    {
      id: "ACT-01",
      user: "Emma Wilson",
      email: "emma@example.com",
      action: "Placed a cash-on-delivery order worth $299",
      time: "2 mins ago",
      type: "purchase",
    },
    {
      id: "ACT-02",
      user: "James Chen",
      email: "james@company.io",
      action: "Opened support ticket #4928: 'Broken mouse scroll wheel'",
      time: "15 mins ago",
      type: "ticket",
    },
    {
      id: "ACT-03",
      user: "Sofia Garcia",
      email: "sofia@startup.co",
      action: "Upgraded account profile status to loyalty tier 'VIP Platinum'",
      time: "1 hour ago",
      type: "account",
    },
    {
      id: "ACT-04",
      user: "Rahat Ahmed",
      email: "rahat@code.net",
      action: "Submitted refund request for order ORD-1249",
      time: "3 hours ago",
      type: "refund",
    },
    {
      id: "ACT-05",
      user: "Alex Thompson",
      email: "alex@dev.com",
      action: "Registered a new system user profile",
      time: "5 hours ago",
      type: "account",
    },
  ];

  const filteredActivities = activities.filter(
    (act) =>
      act.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-1 md:p-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Dashboard</span>
              <span className="opacity-50">/</span>
              <span className="text-foreground">CRM</span>
            </div>
            <h2 className="text-2xl font-black font-heading text-foreground tracking-tight flex items-center gap-2 mt-1">
              <Users className="text-primary" size={24} />
              Customer Relationship Hub
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review customer segments, loyalty program progressions, client lifetime values, and active help desk ticket lists.
            </p>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Customers</span>
                <h3 className="text-xl font-black text-foreground mt-1">2,847</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <Users size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <UserPlus size={10} className="mr-0.5" /> +12.4%
              </span>
              <span className="text-muted-foreground font-medium">vs last month</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer Lifetime Value (LTV)</span>
                <h3 className="text-xl font-black text-foreground mt-1">$480.00</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Heart size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingUp size={10} className="mr-0.5" /> +5.1%
              </span>
              <span className="text-muted-foreground font-medium">higher retention rate</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Acquisition Cost (CAC)</span>
                <h3 className="text-xl font-black text-foreground mt-1">$18.20</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <ShieldAlert size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="flex items-center font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">
                <TrendingUp size={10} className="mr-0.5" /> -3.5%
              </span>
              <span className="text-muted-foreground font-medium">ad spend optimized</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border bg-card flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LTV : CAC Ratio</span>
                <h3 className="text-xl font-black text-foreground mt-1">26.3x</h3>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] mt-3">
              <span className="text-emerald-500 font-bold">Outstanding</span>
              <span className="text-muted-foreground font-medium">market benchmark is 3x</span>
            </div>
          </div>
        </div>

        {/* Lower Content Grid: Recent Customer activity list & Support Tickets summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Customer Activity Feed */}
          <div className="lg:col-span-7 glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="font-heading text-base font-bold text-foreground">Recent Customer Activities</h4>
                <p className="text-xs text-muted-foreground">Audit log of latest actions taken by platform clients</p>
              </div>

              {/* Search activities */}
              <div className="flex items-center h-8 px-2.5 rounded-lg border border-border bg-muted/30 max-w-[200px]">
                <Search className="text-muted-foreground mr-1.5" size={12} />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[11px] placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Logs List */}
            <div className="flex-1 space-y-4 my-4">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all border border-transparent hover:border-border/30">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0 text-xs font-bold font-mono">
                      {act.user.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-xs text-foreground truncate">{act.user}</span>
                        <span className="text-[9px] font-medium text-muted-foreground shrink-0">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{act.email}</p>
                      <p className="text-xs text-foreground font-semibold mt-1">{act.action}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground space-y-1">
                  <p className="text-xs font-bold">No activity logs found</p>
                  <p className="text-[10px]">Try resetting search query filter terms.</p>
                </div>
              )}
            </div>
          </div>

          {/* Help Desk Support Tickets Breakdown */}
          <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-border bg-card flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-base font-bold text-foreground">Help Desk & Customer Tickets</h4>
              <p className="text-xs text-muted-foreground">Support ticket volume distributions and resolution stats</p>
            </div>

            <div className="space-y-4 my-6">
              
              {/* Ticket Resolution Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-border bg-muted/20 text-center">
                  <Clock size={16} className="mx-auto text-amber-500 mb-1" />
                  <span className="text-xs text-muted-foreground block font-medium">Pending</span>
                  <span className="text-lg font-black text-foreground">12</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-muted/20 text-center">
                  <CheckCircle size={16} className="mx-auto text-emerald-500 mb-1" />
                  <span className="text-xs text-muted-foreground block font-medium">Resolved</span>
                  <span className="text-lg font-black text-foreground">84</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-muted/20 text-center">
                  <MessageSquare size={16} className="mx-auto text-indigo-500 mb-1" />
                  <span className="text-xs text-muted-foreground block font-medium">Total</span>
                  <span className="text-lg font-black text-foreground">96</span>
                </div>
              </div>

              {/* Progress bar resolution target */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>First Response SLA Target</span>
                  <span className="text-muted-foreground font-semibold">97.8% Met</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "97.8%" }} />
                </div>
              </div>

              {/* Progress bar customer satisfaction */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>Customer Satisfaction Score (CSAT)</span>
                  <span className="text-muted-foreground font-semibold">4.8 / 5.0 Rating</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }} />
                </div>
              </div>
            </div>

            <div className="text-[11px] font-bold text-muted-foreground border-t border-border/40 pt-4 flex items-center justify-between">
              <span>Avg Resolution Time: <strong>1.4 hrs</strong></span>
              <a href="/chat" className="text-primary hover:underline flex items-center gap-0.5">
                Go to Live Support <ChevronRight size={10} />
              </a>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
