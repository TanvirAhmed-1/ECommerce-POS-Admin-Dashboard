"use client";

import React from "react";
import {
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface MonthlyFlowItem {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

interface ExpenseCategoryItem {
  _id: string;
  total: number;
  count: number;
}

interface CashFlowChartsProps {
  monthlyFlow?: MonthlyFlowItem[];
  expenseCategories?: ExpenseCategoryItem[];
}

export default function CashFlowCharts({
  monthlyFlow = [],
  expenseCategories = [],
}: CashFlowChartsProps) {
  // Find max monthly value for height scaling
  const maxMonthlyVal = Math.max(
    ...monthlyFlow.map((m) => Math.max(m.revenue, m.expense)),
    1000
  );

  // Total expenses for percentage calculation
  const totalExpenseSum = expenseCategories.reduce((acc, cat) => acc + cat.total, 0);

  const categoryColors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-zinc-500",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Monthly Revenue vs Expense Cash Flow (7 cols) */}
      <div className="lg:col-span-7 p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            <h3 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">
              Cash Flow Trend (আয় বনাম ব্যয়)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <div className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Revenue (আয়)</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Expense (ব্যয়)</span>
            </div>
          </div>
        </div>

        {/* Bar Comparison Chart */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-[180px] border-b border-border/60 pb-2">
            {monthlyFlow.map((item, idx) => {
              const revPercent = Math.min(100, Math.round((item.revenue / maxMonthlyVal) * 100));
              const expPercent = Math.min(100, Math.round((item.expense / maxMonthlyVal) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="flex items-end gap-1.5 h-full w-full max-w-[42px] justify-center">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${Math.max(4, revPercent)}%` }}
                      className="w-1/2 bg-emerald-500/80 hover:bg-emerald-500 rounded-t-md transition-all relative cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none transition-opacity z-10 border border-border">
                        ৳{item.revenue.toLocaleString()}
                      </div>
                    </div>
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${Math.max(4, expPercent)}%` }}
                      className="w-1/2 bg-rose-500/80 hover:bg-rose-500 rounded-t-md transition-all relative cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none transition-opacity z-10 border border-border">
                        ৳{item.expense.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Expense Category Breakdown (5 cols) */}
      <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <PieChart size={16} className="text-primary" />
              <h3 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">
                Expense Breakdown
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-muted-foreground">
              Total: ৳{totalExpenseSum.toLocaleString()}
            </span>
          </div>

          {/* Category List with Progress Bars */}
          <div className="space-y-3 pt-3 max-h-[180px] overflow-y-auto pr-1">
            {expenseCategories.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No expense entries recorded yet.
              </div>
            ) : (
              expenseCategories.map((cat, idx) => {
                const percent =
                  totalExpenseSum > 0 ? Math.round((cat.total / totalExpenseSum) * 100) : 0;
                const colorClass = categoryColors[idx % categoryColors.length];

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${colorClass}`} />
                        <span className="font-semibold text-foreground truncate">{cat._id}</span>
                        <span className="text-[10px] text-muted-foreground">({cat.count})</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-foreground">
                          ৳{cat.total.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground w-7 text-right">
                          {percent}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${colorClass}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
          <span>Top Cost Driver:</span>
          <span className="font-bold text-foreground">
            {expenseCategories[0]?._id || "None"} (৳
            {expenseCategories[0]?.total?.toLocaleString() || "0"})
          </span>
        </div>
      </div>
    </div>
  );
}
