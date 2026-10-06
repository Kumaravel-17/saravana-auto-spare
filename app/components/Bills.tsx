"use client";

import React, { useMemo } from "react";
import { Printer, ClipboardList, Receipt } from "lucide-react";
import Invoice from "./Invoice";
import { StatusPill, type UI } from "./ui";
import { billNo, inr, orderTotals, paymentState, type Order } from "../lib/workshop";

export default function Bills({
  ui,
  orders,
  query,
  selectedId,
  onSelect,
  onOpenJob,
}: {
  ui: UI;
  orders: Order[];
  query: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenJob: (id: string) => void;
}) {
  const { dark, tk, glass, innerSurface } = ui;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => !q || [billNo(o), o.id, o.customer, o.vehicleNo, o.phone].some((f) => f.toLowerCase().includes(q)));
  }, [orders, query]);

  const summary = useMemo(() => {
    const totals = orders.map(orderTotals);
    return {
      billed: totals.reduce((s, t) => s + t.total, 0),
      collected: totals.reduce((s, t) => s + t.paid, 0),
      pending: totals.reduce((s, t) => s + t.pending, 0),
    };
  }, [orders]);

  const selected = orders.find((o) => o.id === selectedId) ?? rows[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ["Total billed", summary.billed, tk.text],
          ["Collected", summary.collected, "text-emerald-600"],
          ["Pending", summary.pending, "text-rose-500"],
        ].map(([label, value, color]) => (
          <article key={label as string} className="rounded-2xl border p-5" style={glass}>
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${tk.muted}`}>{label}</p>
            <p className={`mt-1 text-2xl font-extrabold tabular-nums ${color}`}>{inr(value as number)}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
        {/* ------------------------------ BILL LIST ------------------------------ */}
        <article className="rounded-2xl border p-4 xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto" style={glass}>
          <div className={`mb-3 flex items-center gap-2 border-b pb-3 ${tk.line}`}>
            <Receipt className="h-4 w-4 text-indigo-600" />
            <h2 className={`text-sm font-bold ${tk.text}`}>Bills</h2>
            <span className={`ml-auto text-xs ${tk.muted}`}>{rows.length}</span>
          </div>
          <ul className="space-y-2">
            {rows.map((o) => {
              const t = orderTotals(o);
              const on = selected?.id === o.id;
              return (
                <li key={o.id}>
                  <button
                    onClick={() => onSelect(o.id)}
                    aria-current={on ? "true" : undefined}
                    className={`w-full rounded-xl border p-3 text-left transition ${on ? (dark ? "border-indigo-400/60 bg-indigo-500/15" : "border-indigo-500/50 bg-indigo-50/80") : `${innerSurface} ${tk.hover}`}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold ${tk.text}`}>{billNo(o)}</p>
                      <StatusPill ui={ui} status={paymentState(o)} />
                    </div>
                    <p className={`mt-1 truncate text-xs font-semibold ${tk.sub}`}>{o.customer}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className={`truncate text-[11px] ${tk.muted}`}>{o.vehicleNo} · {o.id}</p>
                      <p className={`text-xs font-bold tabular-nums ${tk.text}`}>{inr(t.total)}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {!rows.length && <p className={`py-8 text-center text-xs ${tk.muted}`}>No bills found</p>}
        </article>

        {/* ------------------------------ PREVIEW ------------------------------- */}
        <article className="min-w-0 rounded-2xl border p-4 sm:p-5" style={glass}>
          {selected ? (
            <>
              <div className={`mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${tk.line}`}>
                <div>
                  <h2 className={`text-sm font-bold ${tk.text}`}>{billNo(selected)} · {selected.customer}</h2>
                  <p className={`text-xs ${tk.muted}`}>Invoice preview — prints exactly as shown</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onOpenJob(selected.id)} className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${tk.ghostBtn}`}>
                    <ClipboardList className="h-3.5 w-3.5" /> Job Card
                  </button>
                  <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500">
                    <Printer className="h-3.5 w-3.5" /> Print Bill
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl">
                <Invoice order={selected} />
              </div>
            </>
          ) : (
            <p className={`py-16 text-center text-sm ${tk.muted}`}>Select a bill to preview</p>
          )}
        </article>
      </div>
    </div>
  );
}
