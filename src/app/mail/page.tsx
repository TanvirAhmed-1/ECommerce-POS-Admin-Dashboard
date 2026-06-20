"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useGetAllMailsQuery,
  useSendMailMutation,
  useSendToAllCustomersMutation,
  useDeleteMailMutation,
} from "@/redux/features/mail/mailApi";
import Loader from "@/components/shared/Loader";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  Mail, Send, Trash2, Eye, X, Search, ChevronLeft, ChevronRight,
  Users, CheckCircle2, XCircle, Clock, Plus, RefreshCw, Inbox,
} from "lucide-react";

const STATUSES = ["all", "sent", "failed"];
const TYPES = ["all", "custom", "newsletter", "notification", "system"];
const LIMITS = [10, 20, 50];

function useDebounce(v: string, d: number) {
  const [val, setVal] = useState(v);
  useEffect(() => { const t = setTimeout(() => setVal(v), d); return () => clearTimeout(t); }, [v, d]);
  return val;
}

export default function MailPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMail, setViewMail] = useState<any | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  // Compose form state
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [toInput, setToInput] = useState("");
  const [mailType, setMailType] = useState("custom");
  const [broadcastAll, setBroadcastAll] = useState(false);

  const debouncedSearch = useDebounce(search, 400);
  useEffect(() => setPage(1), [debouncedSearch, status, type, limit]);

  const params = useMemo(() => ({
    page, limit,
    ...(status !== "all" && { status }),
    ...(type !== "all" && { type }),
    ...(debouncedSearch && { search: debouncedSearch }),
  }), [page, limit, status, type, debouncedSearch]);

  const { data: mailsRes, isLoading, isFetching, refetch } = useGetAllMailsQuery(params);
  const [sendMail, { isLoading: isSending }] = useSendMailMutation();
  const [sendToAll, { isLoading: isBroadcasting }] = useSendToAllCustomersMutation();
  const [deleteMail, { isLoading: isDeleting }] = useDeleteMailMutation();

  const mails: any[] = mailsRes?.data || [];
  const meta = mailsRes?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
  const isSubmitting = isSending || isBroadcasting;

  const resetForm = () => { setSubject(""); setBody(""); setToInput(""); setMailType("custom"); setBroadcastAll(false); };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) { toast.error("Subject and body are required"); return; }
    if (!broadcastAll && !toInput.trim()) { toast.error("Enter at least one recipient email"); return; }
    const toastId = toast.loading(broadcastAll ? "Broadcasting to all customers..." : "Sending email...");
    try {
      if (broadcastAll) {
        const res = await sendToAll({ subject, body, type: mailType }).unwrap();
        toast.success(res.message || "Broadcast sent!", { id: toastId });
      } else {
        const to = toInput.split(",").map((e) => e.trim()).filter(Boolean);
        const res = await sendMail({ to, subject, body, type: mailType }).unwrap();
        toast.success(res.message || "Email sent!", { id: toastId });
      }
      setShowCompose(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this mail record?")) return;
    try {
      await deleteMail(id).unwrap();
      toast.success("Mail deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      sent: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      failed: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      draft: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    };
    const icons: Record<string, React.ReactNode> = { sent: <CheckCircle2 size={10} />, failed: <XCircle size={10} />, draft: <Clock size={10} /> };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${map[s] || map.draft}`}>
        {icons[s]} {s}
      </span>
    );
  };

  const typeBadge = (t: string) => {
    const map: Record<string, string> = {
      newsletter: "bg-indigo-500/10 text-indigo-500",
      notification: "bg-amber-500/10 text-amber-500",
      order: "bg-cyan-500/10 text-cyan-500",
      system: "bg-violet-500/10 text-violet-500",
      custom: "bg-zinc-500/10 text-zinc-400",
    };
    return <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${map[t] || map.custom}`}>{t}</span>;
  };

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  if (isLoading) return (
    <DashboardLayout><div className="flex h-[80vh] items-center justify-center"><Loader size={50} /></div></DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto p-2 md:p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              Dashboard <span className="opacity-40">/</span> <span className="text-foreground">Mail</span>
            </p>
            <h1 className="text-2xl font-black font-heading tracking-tight text-foreground flex items-center gap-2 mt-1">
              <Inbox className="text-primary" size={22} /> Mail Center
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Send emails to customers, broadcast newsletters, and track delivery history.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => refetch()} className="h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors">
              <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => { setShowCompose(true); resetForm(); }}
              className="h-9 px-4 bg-primary text-white text-xs font-bold rounded-lg shadow-sm shadow-primary/20 hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus size={14} /> Compose Email
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Sent", val: meta.total, color: "text-indigo-500", bg: "bg-indigo-500/10", icon: <Mail size={16} /> },
            { label: "Delivered", val: "—", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <CheckCircle2 size={16} /> },
            { label: "Failed", val: "—", color: "text-rose-500", bg: "bg-rose-500/10", icon: <XCircle size={16} /> },
            { label: "Recipients", val: "—", color: "text-cyan-500", bg: "bg-cyan-500/10", icon: <Users size={16} /> },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-black ${s.color}`}>{i === 0 ? meta.total : "—"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex flex-1 items-center h-10 max-w-sm rounded-lg px-3 gap-2 border border-border bg-card focus-within:border-primary/50 transition-all">
            <Search className="text-muted-foreground shrink-0" size={14} />
            <input type="text" placeholder="Search by subject..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-xs font-medium outline-none placeholder:text-muted-foreground text-foreground" />
            {search && <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={12} /></button>}
          </div>

          <div className="flex bg-muted/80 p-0.5 rounded-lg border border-border gap-0.5">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md capitalize cursor-pointer transition-all ${status === s ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </div>

          <select value={type} onChange={(e) => setType(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-none cursor-pointer">
            {TYPES.map((t) => <option key={t} value={t}>{t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>

          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
            className="h-10 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-none cursor-pointer">
            {LIMITS.map((l) => <option key={l} value={l}>{l} per page</option>)}
          </select>
        </div>

        {/* Table */}
        <div className={`glass-card border border-border rounded-2xl bg-card overflow-hidden transition-opacity ${isFetching ? "opacity-70" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40">
                  {["Subject", "Type", "Recipients", "Sent By", "Date", "Status", ""].map((h) => (
                    <th key={h} className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {mails.length > 0 ? mails.map((m: any) => (
                  <tr key={m._id} className="hover:bg-muted/20 transition-colors group">
                    <td className="p-4 max-w-[260px]">
                      <p className="font-bold text-foreground truncate">{m.subject}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{m.to?.length > 2 ? `${m.to[0]}, +${m.to.length - 1} more` : m.to?.join(", ")}</p>
                    </td>
                    <td className="p-4">{typeBadge(m.type)}</td>
                    <td className="p-4 font-mono font-bold text-foreground">{m.recipientCount}</td>
                    <td className="p-4">
                      <span className="font-semibold text-foreground">{m.sentBy?.name || "—"}</span>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono text-[10px] whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-4">{statusBadge(m.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewMail(m)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors">
                          <Eye size={12} />
                        </button>
                        <button onClick={() => handleDelete(m._id)} disabled={isDeleting}
                          className="h-7 w-7 flex items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors disabled:opacity-50">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <Mail className="mx-auto mb-3 text-muted/30" size={36} />
                      <p className="text-xs font-bold text-muted-foreground">No mails found</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Compose your first email to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 px-5 py-3 bg-muted/10">
              <p className="text-[11px] text-muted-foreground">
                Showing <strong className="text-foreground">{start}–{end}</strong> of <strong className="text-foreground">{meta.total}</strong> emails
              </p>
              <div className="flex items-center gap-1.5">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  const p = meta.totalPages <= 5 ? i + 1 : Math.max(1, Math.min(meta.totalPages - 4, page - 2)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${p === page ? "bg-primary text-white border-primary" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>
                      {p}
                    </button>
                  );
                })}
                <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Mail Modal */}
      {viewMail && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setViewMail(null)} />
          <div className="relative z-10 w-full max-w-2xl h-full bg-card border-l border-border shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 shrink-0">
              <div className="flex items-center gap-2"><Mail className="text-primary" size={18} /><span className="font-heading font-black text-sm">Mail Preview</span></div>
              <button onClick={() => setViewMail(null)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-3 pb-5 border-b border-dashed border-border/70">
                <h2 className="text-lg font-black text-foreground">{viewMail.subject}</h2>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">From</p><p className="font-semibold text-foreground">{viewMail.from}</p></div>
                  <div><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Sent By</p><p className="font-semibold text-foreground">{viewMail.sentBy?.name || "—"}</p></div>
                  <div><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>{statusBadge(viewMail.status)}</div>
                  <div><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Type</p>{typeBadge(viewMail.type)}</div>
                  <div className="col-span-2"><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Recipients ({viewMail.recipientCount})</p>
                    <p className="text-foreground font-medium leading-relaxed">{viewMail.to?.join(", ")}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Message Body</p>
                <div className="rounded-xl border border-border bg-muted/10 p-4 text-xs text-foreground leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: viewMail.body }} />
              </div>
              {viewMail.errorMessage && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Delivery Error</p>
                  <p className="text-xs text-rose-400 font-mono">{viewMail.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => { setShowCompose(false); resetForm(); }} />
          <div className="relative z-10 w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2"><Send className="text-primary" size={18} /><span className="font-heading font-black text-sm">Compose Email</span></div>
              <button onClick={() => { setShowCompose(false); resetForm(); }} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSend} className="p-6 space-y-4">
              {/* Broadcast toggle */}
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors select-none">
                <input type="checkbox" checked={broadcastAll} onChange={(e) => setBroadcastAll(e.target.checked)} className="rounded border-border text-primary focus:ring-0 cursor-pointer" />
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Users size={13} className="text-primary" /> Broadcast to All Active Customers</p>
                  <p className="text-[10px] text-muted-foreground">Send this email to every active registered customer</p>
                </div>
              </label>

              {!broadcastAll && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To (comma-separated emails)</label>
                  <input type="text" placeholder="john@example.com, jane@example.com"
                    value={toInput} onChange={(e) => setToInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                  <input type="text" placeholder="Email subject..." value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground" />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type</label>
                  <select value={mailType} onChange={(e) => setMailType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer">
                    {["custom", "newsletter", "notification", "system"].map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Message Body (HTML supported)</label>
                <textarea rows={8} placeholder="Write your message here... HTML is supported."
                  value={body} onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground resize-none" />
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 h-10 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {isSubmitting ? <><Spinner className="w-3.5 h-3.5 animate-spin" /> Sending...</> : <><Send size={13} /> {broadcastAll ? "Broadcast to All" : "Send Email"}</>}
                </button>
                <button type="button" onClick={() => { setShowCompose(false); resetForm(); }}
                  className="h-10 px-4 border border-border bg-card text-foreground hover:bg-muted text-xs font-bold rounded-lg cursor-pointer transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
