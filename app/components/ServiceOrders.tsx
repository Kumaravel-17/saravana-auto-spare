"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight, Phone } from "lucide-react";
import { StatusPill, type UI } from "./ui";
import { JOB_STATUSES, inr, orderTotals, type Order } from "../lib/workshop";

/** Full listing of job cards. Clicking a row opens its Service Details page. */
export default function ServiceOrders({
  ui,
  orders,
  query,
  onOpen,
}: {
  ui: UI;
  orders: Order[];
  query: string;
  onOpen: (id: string) => void;
}) {
  const { dark, tk, glass, innerSurface } = ui;
  const [status, setStatus] = useState("All");

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    JOB_STATUSES.forEach((s) => (c[s] = orders.filter((o) => o.status === s).length));
    return c;
  }, [orders]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (status === "All" || o.status === status) &&
        (!q || [o.id, o.vehicleNo, o.vehicleModel, o.customer, o.phone, o.mechanic, o.status].some((f) => f.toLowerCase().includes(q)))
    );
  }, [orders, query, status]);

  return (
    <article className="rounded-2xl border p-4 sm:p-6" style={glass}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={`text-base font-bold tracking-tight ${tk.text}`}>Service Orders</h2>
          <p className={`text-xs font-medium ${tk.muted}`}>
            {rows.length} job card{rows.length === 1 ? "" : "s"}{query ? ` matching “${query}”` : ""} · click a row to open its details
          </p>
        </div>
      </div>

      <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter by status">
        {["All", ...JOB_STATUSES].map((s) => {
          const on = status === s;
          return (
            <button
              key={s}
              role="tab"
              aria-selected={on}
              onClick={() => setStatus(s)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? "border-indigo-600 bg-indigo-600 text-white" : tk.ghostBtn}`}
            >
              {s} <span className={`ml-1 tabular-nums ${on ? "text-white/80" : tk.muted}`}>{counts[s]}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {rows.map((o) => {
          const t = orderTotals(o);
          return (
            <li key={o.id}>
              <button onClick={() => onOpen(o.id)} className={`w-full rounded-xl border p-4 text-left transition ${innerSurface} ${tk.hover}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-indigo-600">{o.id}</p>
                    <p className={`truncate text-sm font-bold ${tk.text}`}>{o.vehicleNo}</p>
                    <p className={`truncate text-xs ${tk.muted}`}>{o.vehicleModel} · {o.type}</p>
                  </div>
                  <StatusPill ui={ui} status={o.status} />
                </div>
                <div className={`mt-3 flex items-end justify-between gap-3 border-t pt-3 ${tk.line}`}>
                  <div className="min-w-0">
                    <p className={`truncate text-xs font-semibold ${tk.sub}`}>{o.customer}</p>
                    <p className={`text-[11px] ${tk.muted}`}>{o.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold tabular-nums ${tk.text}`}>{inr(t.total)}</p>
                    {t.pending > 0 && <p className="text-[11px] font-semibold tabular-nums text-rose-500">{inr(t.pending)} due</p>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Desktop: table */}
      <div className={`hidden overflow-x-auto rounded-xl border md:block ${innerSurface}`}>
        <table className="w-full min-w-[860px] border-collapse text-left text-xs">
          <thead>
            <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${tk.muted} ${tk.line}`}>
              {["Job Card", "Vehicle", "Customer", "Mechanic", "Status", "Total", "Pending", "Delivery", ""].map((h, i) => (
                <th key={i} scope="col" className={`whitespace-nowrap px-4 py-3 ${h === "Total" || h === "Pending" ? "text-right" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${dark ? "divide-white/[0.06]" : "divide-slate-900/[0.06]"}`}>
            {rows.map((o) => {
              const t = orderTotals(o);
              return (
                <tr
                  key={o.id}
                  tabIndex={0}
                  onClick={() => onOpen(o.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") onOpen(o.id); }}
                  className={`cursor-pointer transition-colors focus:outline-none focus-visible:bg-indigo-500/10 ${tk.hover}`}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-indigo-600">{o.id}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className={`font-bold ${tk.text}`}>{o.vehicleNo}</p>
                    <p className={`text-[10px] ${tk.muted}`}>{o.vehicleModel} · {o.type}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className={`font-semibold ${tk.sub}`}>{o.customer}</p>
                    <p className={`flex items-center gap-1 text-[10px] ${tk.muted}`}><Phone className="h-2.5 w-2.5" />{o.phone}</p>
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 font-medium ${tk.sub}`}>{o.mechanic}</td>
                  <td className="whitespace-nowrap px-4 py-3"><StatusPill ui={ui} status={o.status} /></td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums ${tk.text}`}>{inr(t.total)}</td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums ${t.pending > 0 ? "text-rose-500" : "text-emerald-600"}`}>
                    {t.pending > 0 ? inr(t.pending) : "Paid"}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 font-medium tabular-nums ${tk.muted}`}>{o.deliveryDate || "—"}</td>
                  <td className={`px-2 py-3 ${tk.muted}`}><ChevronRight className="h-4 w-4" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!rows.length && <p className={`py-10 text-center text-sm font-medium ${tk.muted}`}>No job cards found</p>}
    </article>
  );
}
