"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

interface AccountingMetricCardsProps {
  overview?: {
    totalRevenue: number;
    grossSales: number;
    paidSales: number;
    manualIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalDiscounts: number;
    totalVat: number;
    totalDeliveryCharge: number;
    totalWalletBalance: number;
  };
}

export default function AccountingMetricCards({
  overview,
}: AccountingMetricCardsProps) {
  const netProfit = overview?.netProfit ?? 0;
  const isPositiveProfit = netProfit >= 0;
  const totalRevenue = overview?.totalRevenue ?? 0;
  const totalExpenses = overview?.totalExpenses ?? 0;
  const profitMargin = overview?.profitMargin ?? 0;
  const totalWalletBalance = overview?.totalWalletBalance ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Profit Card */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Net Profit (নিট লাভ)
          </span>
          <div
            className={`p-2 rounded-xl ${
              isPositiveProfit
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500"
            }`}
          >
            {isPositiveProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          </div>
        </div>
        <div>
          <h3
            className={`text-2xl font-black font-heading tracking-tight ${
              isPositiveProfit ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            ৳{netProfit.toLocaleString()}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <span
              className={`inline-flex items-center font-bold ${
                isPositiveProfit ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {isPositiveProfit ? (
                <ArrowUpRight size={13} className="inline mr-0.5" />
              ) : (
                <ArrowDownRight size={13} className="inline mr-0.5" />
              )}
              {profitMargin}%
            </span>
            <span>net profit margin</span>
          </div>
        </div>
        <div
          className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
            isPositiveProfit ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />
      </div>

      {/* 2. Total Gross Revenue Card */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Revenue (মোট আয়)
          </span>
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <DollarSign size={18} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black font-heading tracking-tight text-foreground">
            ৳{totalRevenue.toLocaleString()}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Delivered orders & manual income
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-15 bg-primary" />
      </div>

      {/* 3. Total Operational Expenses Card */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Expenses (মোট ব্যয়)
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <TrendingDown size={18} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black font-heading tracking-tight text-foreground">
            ৳{totalExpenses.toLocaleString()}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Ads, delivery, inventory & operations
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-15 bg-amber-500" />
      </div>

      {/* 4. Active Wallets & Cash Reserves */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Wallet Funds (মোট ফান্ড)
          </span>
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
            <Wallet size={18} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black font-heading tracking-tight text-foreground">
            ৳{totalWalletBalance.toLocaleString()}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Cash, bank, bKash & courier COD
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-15 bg-violet-500" />
      </div>
    </div>
  );
}
