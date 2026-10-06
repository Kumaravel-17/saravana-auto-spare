"use client";

import React, { useMemo, useState } from "react";
import { IndianRupee, Wallet, AlertCircle, ClipboardList, TrendingUp } from "lucide-react";
import { StatusPill, STATUS_STYLE, type UI } from "./ui";
import { JOB_STATUSES, MECHANICS, inr, orderTotals, type Order } from "../lib/workshop";

/** Billed revenue for closed months; the current month is computed from live job cards. */
const REVENUE_HISTORY = [
  { month: "May", value: 318000 },
  { month: "Jun", value: 382500 },
  { month: "Jul", value: 351200 },
  { month: "Aug", value: 409800 },
  { month: "Sep", value: 462300 },
];

const compact = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : inr(n));

export default function Reports({ ui, orders, onOpenJob }: { ui: UI; orders: Order[]; onOpenJob: (id: string) => void }) {
  const { dark, tk, glass, innerSurface } = ui;
  const [hoverBar, setHoverBar] = useState<number | null>(null);

  const r = useMemo(() => {
    const totals = orders.map((o) => ({ o, t: orderTotals(o) }));
    const billed = totals.reduce((s, x) => s + x.t.total, 0);
    const collected = totals.reduce((s, x) => s + x.t.paid, 0);
    const pending = totals.reduce((s, x) => s + x.t.pending, 0);

    const partMap = new Map<string, { name: string; qty: number; value: number }>();
    orders.forEach((o) =>
      o.parts.forEach((p) => {
        const cur = partMap.get(p.partId) ?? { name: p.name, qty: 0, value: 0 };
        partMap.set(p.partId, { name: p.name, qty: cur.qty + p.qty, value: cur.value + p.qty * p.price });
      })
    );
    const topParts = [...partMap.values()].sort((a, b) => b.value - a.value).slice(0, 6);

    const mechanics = MECHANICS.map((m) => {
      const mine = totals.filter((x) => x.o.mechanic === m);
      return {
        name: m,
        jobs: mine.length,
        open: mine.filter((x) => x.o.status !== "Delivered" && x.o.status !== "Completed").length,
        labour: mine.reduce((s, x) => s + x.t.labour, 0),
        billed: mine.reduce((s, x) => s + x.t.total, 0),
      };
    }).sort((a, b) => b.billed - a.billed);

    const statuses = JOB_STATUSES.map((s) => ({ name: s, count: orders.filter((o) => o.status === s).length }));
    const outstanding = totals.filter((x) => x.t.pending > 0).sort((a, b) => b.t.pending - a.t.pending);

    return { billed, collected, pending, topParts, mechanics, statuses, outstanding, avg: orders.length ? billed / orders.length : 0 };
  }, [orders]);

  const revenue = [...REVENUE_HISTORY, { month: "Oct (MTD)", value: Math.round(r.billed) }];
  const maxRevenue = Math.max(...revenue.map((m) => m.value)) * 1.1;
  const maxPart = Math.max(1, ...r.topParts.map((p) => p.value));
  const maxStatus = Math.max(1, ...r.statuses.map((s) => s.count));
  const grid = dark ? "border-white/[0.07]" : "border-slate-900/[0.06]";
  const track = dark ? "bg-white/[0.06]" : "bg-slate-900/[0.05]";

  const card = (title: string, subtitle: string, children: React.ReactNode, className = "") => (
    <article className={`rounded-2xl border p-4 sm:p-5 ${className}`} style={glass}>
      <div className={`mb-4 border-b pb-3 ${tk.line}`}>
        <h2 className={`text-base font-bold tracking-tight ${tk.text}`}>{title}</h2>
        <p className={`text-xs font-medium ${tk.muted}`}>{subtitle}</p>
      </div>
      {children}
    </article>
  );

  return (
    <div className="space-y-6">
      {/* --------------------------------- KPIs --------------------------------- */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total billed", value: inr(r.billed), icon: IndianRupee },
          { label: "Collected", value: inr(r.collected), icon: Wallet },
          { label: "Outstanding", value: inr(r.pending), icon: AlertCircle },
          { label: "Avg. bill value", value: inr(Math.round(r.avg)), icon: ClipboardList },
        ].map((k) => (
          <article key={k.label} className="rounded-2xl border p-4 sm:p-5" style={glass}>
            <div className="flex items-start justify-between gap-2">
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${tk.muted}`}>{k.label}</p>
              <k.icon className="h-4 w-4 text-indigo-600" />
            </div>
            <p className={`mt-2 text-lg font-extrabold tabular-nums sm:text-2xl ${tk.text}`}>{k.value}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ------------------------- MONTHLY REVENUE ------------------------- */}
        {card(
          "Monthly Revenue",
          "Total billed per month, including GST",
          <div className="relative">
            <div className="relative h-56">
              {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                <div key={f} className={`absolute inset-x-0 border-t ${grid}`} style={{ bottom: `${f * 100}%` }}>
                  <span className={`absolute -top-2 left-0 text-[10px] font-semibold tabular-nums ${tk.muted}`}>{compact(maxRevenue * f)}</span>
                </div>
              ))}
              <div className="absolute inset-0 left-12 flex items-end justify-around gap-2">
                {revenue.map((m, i) => (
                  <div
                    key={m.month}
                    className="relative flex h-full w-full max-w-[44px] items-end"
                    onMouseEnter={() => setHoverBar(i)}
                    onMouseLeave={() => setHoverBar(null)}
                    onClick={() => setHoverBar(hoverBar === i ? null : i)}
                  >
                    <div
                      className={`w-full rounded-t-[4px] transition-colors ${i === revenue.length - 1 ? "bg-indigo-400" : "bg-indigo-600"} ${hoverBar !== null && hoverBar !== i ? "opacity-50" : ""}`}
                      style={{ height: `${(m.value / maxRevenue) * 100}%` }}
                    />
                    {hoverBar === i && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900/95 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xl">
                        {m.month}: <span className="tabular-nums">{inr(m.value)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="ml-12 mt-2 flex justify-around gap-2">
              {revenue.map((m) => (
                <span key={m.month} className={`w-full max-w-[44px] text-center text-[10px] font-semibold ${tk.muted}`}>{m.month.replace(" (MTD)", "")}</span>
              ))}
            </div>
            <p className={`mt-3 flex items-center gap-1.5 text-[11px] font-medium ${tk.muted}`}>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> October bar is month-to-date from current job cards
            </p>
          </div>,
          "lg:col-span-7"
        )}

        {/* ------------------------- JOBS BY STATUS ------------------------- */}
        {card(
          "Jobs by Status",
          `${orders.length} job cards in the system`,
          <ul className="space-y-3">
            {r.statuses.map((s) => (
              <li key={s.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-2 font-semibold ${tk.sub}`}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_STYLE[s.name]?.dot }} />
                    {s.name}
                  </span>
                  <span className={`font-bold tabular-nums ${tk.text}`}>{s.count}</span>
                </div>
                <div className={`h-2 overflow-hidden rounded-full ${track}`}>
                  <div className="h-full rounded-full" style={{ width: `${(s.count / maxStatus) * 100}%`, backgroundColor: STATUS_STYLE[s.name]?.dot }} />
                </div>
              </li>
            ))}
          </ul>,
          "lg:col-span-5"
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* --------------------------- TOP PARTS --------------------------- */}
        {card(
          "Top Spare Parts",
          "By billed value across all job cards",
          r.topParts.length ? (
            <ul className="space-y-3">
              {r.topParts.map((p) => (
                <li key={p.name} title={`${p.name}: ${p.qty} units · ${inr(p.value)}`}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className={`truncate font-semibold ${tk.sub}`}>{p.name} <span className={tk.muted}>× {p.qty}</span></span>
                    <span className={`shrink-0 font-bold tabular-nums ${tk.text}`}>{inr(p.value)}</span>
                  </div>
                  <div className={`h-2 overflow-hidden rounded-full ${track}`}>
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${(p.value / maxPart) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className={`py-6 text-center text-xs ${tk.muted}`}>No parts used yet</p>
        )}

        {/* ----------------------- MECHANIC PERFORMANCE ----------------------- */}
        {card(
          "Mechanic Performance",
          "Jobs handled and amount billed",
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-xs">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${tk.muted} ${tk.line}`}>
                  <th className="py-2 pr-3">Mechanic</th>
                  <th className="px-3 py-2 text-center">Jobs</th>
                  <th className="px-3 py-2 text-center">Open</th>
                  <th className="px-3 py-2 text-right">Labour</th>
                  <th className="py-2 pl-3 text-right">Billed</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? "divide-white/[0.06]" : "divide-slate-900/[0.06]"}`}>
                {r.mechanics.map((m) => (
                  <tr key={m.name}>
                    <td className={`py-2.5 pr-3 font-semibold ${tk.text}`}>{m.name}</td>
                    <td className={`px-3 py-2.5 text-center tabular-nums ${tk.sub}`}>{m.jobs}</td>
                    <td className={`px-3 py-2.5 text-center tabular-nums ${tk.sub}`}>{m.open}</td>
                    <td className={`px-3 py-2.5 text-right tabular-nums ${tk.sub}`}>{inr(m.labour)}</td>
                    <td className={`py-2.5 pl-3 text-right font-bold tabular-nums ${tk.text}`}>{inr(m.billed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ------------------------ OUTSTANDING PAYMENTS ------------------------ */}
      {card(
        "Outstanding Payments",
        `${r.outstanding.length} job card${r.outstanding.length === 1 ? "" : "s"} with pending amount · ${inr(r.pending)} total`,
        r.outstanding.length ? (
          <div className={`overflow-x-auto rounded-xl border ${innerSurface}`}>
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${tk.muted} ${tk.line}`}>
                  {["Job Card", "Customer", "Status", "Total", "Paid", "Pending"].map((h) => (
                    <th key={h} className={`px-4 py-3 ${["Total", "Paid", "Pending"].includes(h) ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? "divide-white/[0.06]" : "divide-slate-900/[0.06]"}`}>
                {r.outstanding.map(({ o, t }) => (
                  <tr key={o.id} tabIndex={0} onClick={() => onOpenJob(o.id)} onKeyDown={(e) => { if (e.key === "Enter") onOpenJob(o.id); }} className={`cursor-pointer ${tk.hover}`}>
                    <td className="px-4 py-3 font-bold text-indigo-600">{o.id}</td>
                    <td className="px-4 py-3">
                      <p className={`font-semibold ${tk.text}`}>{o.customer}</p>
                      <p className={`text-[10px] ${tk.muted}`}>{o.phone}</p>
                    </td>
                    <td className="px-4 py-3"><StatusPill ui={ui} status={o.status} /></td>
                    <td className={`px-4 py-3 text-right tabular-nums ${tk.sub}`}>{inr(t.total)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-600">{inr(t.paid)}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-rose-500">{inr(t.pending)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className={`py-6 text-center text-xs ${tk.muted}`}>All payments are settled</p>
      )}
    </div>
  );
}
