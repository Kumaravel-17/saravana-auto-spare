import type React from "react";

/** Theme tokens built in the dashboard shell and passed down to each page. */
export type UI = {
  dark: boolean;
  tk: {
    text: string;
    sub: string;
    muted: string;
    line: string;
    hover: string;
    field: string;
    ghostBtn: string;
  };
  glass: React.CSSProperties;
  innerSurface: string;
  statusBadge: (status: string) => string;
};

export const STATUS_STYLE: Record<string, { dot: string; light: string; dark: string }> = {
  Inspection: { dot: "#3B82F6", light: "bg-blue-50 text-blue-700 ring-blue-600/20", dark: "bg-blue-500/10 text-blue-300 ring-blue-400/25" },
  "In Progress": { dot: "#F59E0B", light: "bg-amber-50 text-amber-700 ring-amber-600/20", dark: "bg-amber-500/10 text-amber-300 ring-amber-400/25" },
  Completed: { dot: "#10B981", light: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dark: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25" },
  "Ready for Delivery": { dot: "#8B5CF6", light: "bg-violet-50 text-violet-700 ring-violet-600/20", dark: "bg-violet-500/10 text-violet-300 ring-violet-400/25" },
  Ready: { dot: "#8B5CF6", light: "bg-violet-50 text-violet-700 ring-violet-600/20", dark: "bg-violet-500/10 text-violet-300 ring-violet-400/25" },
  Delivered: { dot: "#64748B", light: "bg-slate-100 text-slate-700 ring-slate-500/20", dark: "bg-slate-500/15 text-slate-300 ring-slate-400/25" },
  Paid: { dot: "#10B981", light: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dark: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25" },
  Partial: { dot: "#F59E0B", light: "bg-amber-50 text-amber-700 ring-amber-600/20", dark: "bg-amber-500/10 text-amber-300 ring-amber-400/25" },
  Unpaid: { dot: "#EF4444", light: "bg-rose-50 text-rose-700 ring-rose-600/20", dark: "bg-rose-500/10 text-rose-300 ring-rose-400/25" },
};

export function StatusPill({ ui, status }: { ui: UI; status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${ui.statusBadge(status)}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATUS_STYLE[status]?.dot ?? "#64748B" }} />
      {status}
    </span>
  );
}
