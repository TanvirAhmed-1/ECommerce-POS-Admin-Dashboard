"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400 flex items-center justify-center shadow-md border border-indigo-500/10">
          <MessageSquare size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">Chat & Support</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Live agent chat dashboard. Instantly connect with active website visitors and customers using standard support templates.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
