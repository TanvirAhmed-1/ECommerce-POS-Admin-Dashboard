"use client";

import React from "react";
import {
  Wallet,
  Building2,
  Smartphone,
  Truck,
  CreditCard,
  Layers,
  ArrowRight,
} from "lucide-react";

interface WalletItem {
  name: string;
  type: string;
  balance: number;
}

interface AccountWalletsRowProps {
  wallets?: WalletItem[];
}

export default function AccountWalletsRow({ wallets = [] }: AccountWalletsRowProps) {
  const getWalletIcon = (name: string, type: string) => {
    if (name.includes("Cash")) return <Wallet size={16} className="text-emerald-500" />;
    if (name.includes("bKash")) return <Smartphone size={16} className="text-pink-500" />;
    if (name.includes("Nagad")) return <Smartphone size={16} className="text-orange-500" />;
    if (name.includes("Bank")) return <Building2 size={16} className="text-sky-500" />;
    if (name.includes("Courier") || type === "receivable")
      return <Truck size={16} className="text-indigo-500" />;
    return <CreditCard size={16} className="text-primary" />;
  };

  const getWalletBadgeClass = (name: string) => {
    if (name.includes("Cash")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (name.includes("bKash")) return "bg-pink-500/10 text-pink-500 border-pink-500/20";
    if (name.includes("Nagad")) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (name.includes("Bank")) return "bg-sky-500/10 text-sky-500 border-sky-500/20";
    if (name.includes("Courier")) return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    return "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-primary" />
          <h3 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">
            Account Balances & Cash Flow Wallets
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground font-semibold">
          Real-time Cash, Bank & Courier Reconciliation
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {wallets.map((wallet, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-border bg-card shadow-sm space-y-2 hover:border-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-muted/60 border border-border/50">
                {getWalletIcon(wallet.name, wallet.type)}
              </div>
              <span
                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${getWalletBadgeClass(
                  wallet.name
                )}`}
              >
                {wallet.type === "receivable" ? "COD Due" : "Active"}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-muted-foreground truncate">
                {wallet.name}
              </p>
              <h4 className="text-base font-black font-mono tracking-tight text-foreground mt-0.5">
                ৳{wallet.balance.toLocaleString()}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
