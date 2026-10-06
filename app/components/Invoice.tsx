import React from "react";
import { GST_RATE, PAYMENT_MODES, SHOP, billNo, inr, orderTotals, type Order } from "../lib/workshop";

const INK = "#2b2b2f";
const GOLD = "#f4b63f";

/** Printable bill, styled after the reference invoice design. Always rendered on light "paper". */
export default function Invoice({ order }: { order: Order }) {
  const t = orderTotals(order);
  const lastPayment = order.payments[order.payments.length - 1]?.date;

  const items = [
    ...order.services.map((s) => ({ key: s.id, title: s.name, desc: "Service / labour charge", price: s.labour, qty: 1 })),
    ...order.parts.map((p) => ({ key: p.id, title: p.name, desc: `Spare part · ${p.sku} · ${p.brand}`, price: p.price, qty: p.qty })),
    ...order.addOns.map((a) => ({ key: a.id, title: a.name, desc: "Additional item", price: a.amount, qty: 1 })),
  ];
  const modesUsed = [...new Set(order.payments.map((p) => p.mode))];

  return (
    <div id="invoice-print" className="invoice-paper mx-auto w-full min-w-[680px] max-w-[820px] overflow-hidden bg-[#ececed] text-[#2b2b2f] shadow-2xl" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
      {/* --------------------------- DARK HEADER --------------------------- */}
      <header className="flex items-start justify-between gap-6 px-10 pt-9 pb-4" style={{ backgroundColor: INK }}>
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 40 40" className="h-11 w-11" aria-hidden>
            <path d="M4 38 C4 22 10 12 22 8 C22 24 16 34 4 38 Z" fill={GOLD} />
            <path d="M18 30 C20 16 27 8 37 3 C37 17 30 27 18 30 Z" fill="none" stroke="#ffffff" strokeWidth="1.6" />
          </svg>
          <div>
            <p className="text-2xl font-extrabold uppercase tracking-wide text-white">{SHOP.name}</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">{SHOP.tagline}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 text-[10px] leading-relaxed text-white/75">
          <div><p className="mb-0.5 font-bold" style={{ color: GOLD }}>Phone:</p><p>{SHOP.phone}</p></div>
          <div><p className="mb-0.5 font-bold" style={{ color: GOLD }}>Email:</p><p>{SHOP.email}</p></div>
          <div><p className="mb-0.5 font-bold" style={{ color: GOLD }}>Address:</p><p>{SHOP.address}</p></div>
        </div>
      </header>
      <svg viewBox="0 0 800 90" preserveAspectRatio="none" className="-mt-px block h-20 w-full" aria-hidden>
        <defs>
          <linearGradient id="inv-wave" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#b9b9bd" />
            <stop offset="1" stopColor="#8f8f94" />
          </linearGradient>
        </defs>
        <path d="M0,0 H800 V54 C660,40 540,94 0,86 Z" fill="#d6d6d9" />
        <path d="M0,0 H800 V32 C640,22 520,80 0,70 Z" fill="url(#inv-wave)" />
        <path d="M0,0 H800 V8 C620,8 520,62 0,56 Z" fill={INK} />
      </svg>

      <div className="px-10 pb-10">
        {/* ----------------------- BILL TO / META ----------------------- */}
        <section className="mt-2 flex items-start justify-between gap-8">
          <div className="text-[11px] leading-relaxed">
            <p className="mb-2 text-[11px] text-[#55555b]">To:</p>
            <p className="text-sm font-extrabold uppercase">{order.customer}</p>
            <p>Phone: {order.phone}</p>
            <p>Vehicle: {order.vehicleNo}</p>
            <p>Model: {order.vehicleModel} ({order.type})</p>
          </div>
          <div>
            <h2 className="mb-2 text-4xl font-light tracking-[0.25em]">INVOICE</h2>
            <dl className="grid grid-cols-[auto_auto] gap-x-4 text-[11px] leading-relaxed">
              <dt className="font-bold">Invoice No</dt><dd>: {billNo(order)}</dd>
              <dt className="font-bold">Job Card No</dt><dd>: {order.id}</dd>
              <dt className="font-bold">Date</dt><dd>: {order.deliveryDate || order.receivedDate}</dd>
              <dt className="font-bold">Mechanic</dt><dd>: {order.mechanic}</dd>
            </dl>
          </div>
        </section>

        {/* ---------------------------- ITEMS ---------------------------- */}
        <table className="mt-8 w-full border-collapse text-[11px]">
          <thead>
            <tr className="text-[11px] font-bold uppercase">
              <th className="w-[52%] px-5 py-3 text-left" style={{ backgroundColor: GOLD, color: INK }}>Item Description</th>
              <th className="px-3 py-3 text-right text-white" style={{ backgroundColor: INK }}>Price</th>
              <th className="px-3 py-3 text-center text-white" style={{ backgroundColor: INK }}>Qty</th>
              <th className="px-5 py-3 text-right text-white" style={{ backgroundColor: INK }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.key} style={{ backgroundColor: i % 2 ? "#e3e3e5" : "#d9d9dc" }}>
                <td className="px-5 py-3">
                  <p className="font-bold">{it.title}</p>
                  <p className="text-[10px] text-[#66666c]">{it.desc}</p>
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{inr(it.price)}</td>
                <td className="px-3 py-3 text-center tabular-nums">{it.qty}</td>
                <td className="px-5 py-3 text-right tabular-nums">{inr(it.price * it.qty)}</td>
              </tr>
            ))}
            {!items.length && (
              <tr style={{ backgroundColor: "#d9d9dc" }}><td colSpan={4} className="px-5 py-6 text-center text-[#66666c]">No items on this job card yet</td></tr>
            )}
          </tbody>
        </table>

        {/* ----------------------- PAYMENT + TOTALS ----------------------- */}
        <section className="mt-6 flex items-start justify-between gap-8">
          <div className="pt-10 text-[10px] leading-relaxed">
            <p className="mb-1 text-xs font-extrabold uppercase">Payment Info</p>
            <p><span className="font-bold">Paid via:</span> {modesUsed.length ? modesUsed.join(", ") : "—"}</p>
            {lastPayment && <p><span className="font-bold">Last payment:</span> {lastPayment}</p>}
            <p>We accept {PAYMENT_MODES.join(", ")}</p>
          </div>
          <div className="w-[300px] text-[11px]">
            <dl className="space-y-1.5 px-5">
              <div className="flex justify-between"><dt>Sub Total</dt><dd className="font-bold tabular-nums">{inr(t.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>GST {GST_RATE * 100}%</dt><dd className="font-bold tabular-nums">{inr(t.tax)}</dd></div>
            </dl>
            <div className="mt-3 flex justify-between px-5 py-3 text-xs font-extrabold uppercase" style={{ backgroundColor: GOLD }}>
              <span>Grand Total</span><span className="tabular-nums">{inr(t.total)}</span>
            </div>
            <dl className="mt-2 space-y-1.5 px-5">
              <div className="flex justify-between"><dt>Paid</dt><dd className="font-bold tabular-nums">{inr(t.paid)}</dd></div>
              <div className="flex justify-between"><dt className="font-bold">Balance Due</dt><dd className="font-extrabold tabular-nums">{inr(t.pending)}</dd></div>
            </dl>
          </div>
        </section>

        {/* ---------------------------- FOOTER ---------------------------- */}
        <section className="mt-12 flex items-end justify-between gap-8">
          <div className="max-w-sm text-[10px] leading-relaxed">
            <p className="mb-2 text-base font-bold">Thank you for your business!</p>
            <p><span className="font-bold">TERMS :</span> Parts once fitted cannot be returned. Labour warranty of 30 days or 3,000 km, whichever is earlier. Payment due on delivery.</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold">{SHOP.manager}</p>
            <p className="text-[10px] text-[#55555b]">{SHOP.managerTitle}</p>
            <p className="mt-1 text-3xl" style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}>{SHOP.manager}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
