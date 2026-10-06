"use client";

import React, { useRef, useState } from "react";
import {
  ArrowLeft, Pencil, Printer, Plus, Trash2, Wrench, Package, Sparkles, StickyNote, Wallet,
  User, Phone, Truck, ClipboardList, CalendarDays, CreditCard, X,
} from "lucide-react";
import PartPicker from "./PartPicker";
import { StatusPill, type UI } from "./ui";
import {
  GST_RATE, JOB_STATUSES, PAYMENT_MODES, dateLabel, inr, orderTotals, paymentState, uid,
  type CatalogPart, type Order,
} from "../lib/workshop";

type Panel = "service" | "part" | "addon" | "payment" | null;

function Section({
  ui, sectionRef, icon: Icon, title, subtitle, total, action, children,
}: {
  ui: UI;
  sectionRef?: React.Ref<HTMLElement>;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  total?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { tk, glass } = ui;
  return (
    <section ref={sectionRef} className="scroll-mt-28 rounded-2xl border p-4 sm:p-5" style={glass}>
      <div className={`mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${tk.line}`}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className={`text-sm font-bold ${tk.text}`}>{title}</h3>
            {subtitle && <p className={`text-[11px] ${tk.muted}`}>{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {total !== undefined && <span className={`text-sm font-bold tabular-nums ${tk.text}`}>{inr(total)}</span>}
          {action}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function JobCardDetails({
  ui,
  order,
  catalog,
  onUpdate,
  onAddCatalogPart,
  onBack,
  onEdit,
  onPrint,
}: {
  ui: UI;
  order: Order;
  catalog: CatalogPart[];
  onUpdate: (order: Order) => void;
  onAddCatalogPart: (part: CatalogPart) => void;
  onBack: () => void;
  onEdit: () => void;
  onPrint: () => void;
}) {
  const { dark, tk, glass, innerSurface } = ui;
  const t = orderTotals(order);
  const payState = paymentState(order);

  const [panel, setPanel] = useState<Panel>(null);
  const serviceRef = useRef<HTMLElement | null>(null);
  const partRef = useRef<HTMLElement | null>(null);
  const addonRef = useRef<HTMLElement | null>(null);
  const paymentRef = useRef<HTMLElement | null>(null);
  const openPanel = (p: Exclude<Panel, null>) => {
    setPanel(p);
    const target = { service: serviceRef, part: partRef, addon: addonRef, payment: paymentRef }[p];
    requestAnimationFrame(() => target.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // Inline form state
  const [svc, setSvc] = useState({ name: "", labour: "" });
  const [partSel, setPartSel] = useState<CatalogPart | null>(null);
  const [partQty, setPartQty] = useState("1");
  const [partPrice, setPartPrice] = useState("");
  const [addon, setAddon] = useState({ name: "", amount: "" });
  const [pay, setPay] = useState({ amount: "", mode: PAYMENT_MODES[0], reference: "" });

  const update = (patch: Partial<Order>) => onUpdate({ ...order, ...patch });

  const addService = (e: React.FormEvent) => {
    e.preventDefault();
    update({ services: [...order.services, { id: uid(), name: svc.name.trim(), labour: Number(svc.labour) || 0 }] });
    setSvc({ name: "", labour: "" });
  };

  const choosePart = (p: CatalogPart) => {
    setPartSel(p);
    setPartPrice(String(p.price));
  };

  const createPart = (name: string) => {
    const p: CatalogPart = { id: `p-${uid()}`, name, sku: `CUS-${uid().slice(0, 4).toUpperCase()}`, brand: "Local", category: "Other", price: 0, stock: 0 };
    onAddCatalogPart(p);
    setPartSel(p);
    setPartPrice("");
  };

  const addPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partSel) return;
    const qty = Math.max(1, Number(partQty) || 1);
    const price = Number(partPrice) || 0;
    const existing = order.parts.find((p) => p.partId === partSel.id && p.price === price);
    update({
      parts: existing
        ? order.parts.map((p) => (p === existing ? { ...p, qty: p.qty + qty } : p))
        : [...order.parts, { id: uid(), partId: partSel.id, name: partSel.name, sku: partSel.sku, brand: partSel.brand, qty, price }],
    });
    setPartSel(null);
    setPartQty("1");
    setPartPrice("");
  };

  const addAddon = (e: React.FormEvent) => {
    e.preventDefault();
    update({ addOns: [...order.addOns, { id: uid(), name: addon.name.trim(), amount: Number(addon.amount) || 0 }] });
    setAddon({ name: "", amount: "" });
  };

  const addPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(pay.amount);
    if (!(amount > 0)) return;
    update({ payments: [...order.payments, { id: uid(), date: dateLabel(), mode: pay.mode, amount, reference: pay.reference.trim() }] });
    setPay({ amount: "", mode: PAYMENT_MODES[0], reference: "" });
    setPanel(null);
  };

  /* ---------------------------------- styles --------------------------------- */
  const field = `w-full rounded-xl border px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${tk.field}`;
  const smallLabel = `mb-1 block text-[10px] font-bold uppercase tracking-wider ${tk.muted}`;
  const primaryBtn = "inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-50";
  const ghostBtn = `inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${tk.ghostBtn}`;
  const divide = dark ? "divide-white/[0.06]" : "divide-slate-900/[0.06]";
  const iconBtn = `rounded-lg p-1.5 ${tk.muted} hover:bg-rose-500/10 hover:text-rose-500`;

  const toggle = (p: Exclude<Panel, null>, label: string) => (
    <button onClick={() => (panel === p ? setPanel(null) : setPanel(p))} className={panel === p ? ghostBtn : primaryBtn}>
      {panel === p ? <><X className="h-3.5 w-3.5" /> Close</> : <><Plus className="h-3.5 w-3.5" /> {label}</>}
    </button>
  );

  const empty = (text: string) => <p className={`py-6 text-center text-xs font-medium ${tk.muted}`}>{text}</p>;

  return (
    <div className="space-y-6">
      {/* ------------------------------- HEADER ------------------------------- */}
      <section className="rounded-2xl border p-4 sm:p-5" style={glass}>
        <button onClick={onBack} className={`mb-3 inline-flex items-center gap-1.5 text-xs font-semibold ${tk.muted} hover:text-indigo-600`}>
          <ArrowLeft className="h-3.5 w-3.5" /> All service orders
        </button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Job Card</p>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-xl font-extrabold tabular-nums sm:text-2xl ${tk.text}`}>{order.id}</h2>
                <StatusPill ui={ui} status={order.status} />
                <StatusPill ui={ui} status={payState} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="job-status">Job status</label>
            <select
              id="job-status"
              value={order.status}
              onChange={(e) => update({ status: e.target.value })}
              className={`rounded-xl border px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${dark ? "border-white/10 bg-slate-900 text-white" : "border-slate-900/10 bg-white/80 text-slate-800"}`}
            >
              {JOB_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button onClick={onEdit} className={ghostBtn}><Pencil className="h-3.5 w-3.5" /> Edit</button>
            <button onClick={onPrint} className={primaryBtn}><Printer className="h-3.5 w-3.5" /> Print Bill</button>
          </div>
        </div>

        {/* Quick actions */}
        <div className={`mt-4 grid grid-cols-2 gap-2 border-t pt-4 sm:grid-cols-4 ${tk.line}`}>
          {([
            ["service", "Add Service", Wrench],
            ["part", "Add Parts", Package],
            ["addon", "Add Item", Sparkles],
            ["payment", "Add Payment", Wallet],
          ] as const).map(([p, label, Icon]) => (
            <button key={p} onClick={() => openPanel(p)} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${innerSurface} ${tk.sub} ${tk.hover}`}>
              <Icon className="h-4 w-4 text-indigo-600" /> {label}
            </button>
          ))}
        </div>
      </section>

      {/* ---------------------------- INFO CARDS ---------------------------- */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: User, title: "Customer",
            rows: [
              ["Name", order.customer],
              ["Phone", <a key="p" href={`tel:${order.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-indigo-600 hover:underline"><Phone className="h-3 w-3" />{order.phone}</a>],
            ],
          },
          {
            icon: Truck, title: "Vehicle",
            rows: [["Registration", order.vehicleNo], ["Model", order.vehicleModel], ["Type", order.type]],
          },
          {
            icon: CalendarDays, title: "Service Order",
            rows: [["Job card no", order.id], ["Mechanic", order.mechanic], ["Received", order.receivedDate], ["Est. delivery", order.deliveryDate || "—"]],
          },
        ].map((c) => (
          <article key={c.title} className="rounded-2xl border p-4" style={glass}>
            <div className="mb-2 flex items-center gap-2">
              <c.icon className="h-4 w-4 text-indigo-600" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${tk.muted}`}>{c.title}</h3>
            </div>
            <dl className="space-y-1.5 text-sm">
              {c.rows.map(([k, v]) => (
                <div key={String(k)} className="flex items-center justify-between gap-3">
                  <dt className={`text-xs ${tk.muted}`}>{k}</dt>
                  <dd className={`truncate text-right font-semibold ${tk.text}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* ---------------------- SERVICES & LABOUR ---------------------- */}
          <Section ui={ui} sectionRef={serviceRef} icon={Wrench} title="Services & Labour" subtitle={`${order.services.length} service${order.services.length === 1 ? "" : "s"} added`} total={t.labour} action={toggle("service", "Add Service")}>
            {panel === "service" && (
              <form onSubmit={addService} className={`mb-3 grid grid-cols-1 gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_160px_auto] sm:items-end ${innerSurface}`}>
                <div>
                  <label className={smallLabel} htmlFor="svc-name">Service / work done</label>
                  <input id="svc-name" required autoFocus list="service-suggestions" value={svc.name} onChange={(e) => setSvc({ ...svc, name: e.target.value })} placeholder="Wheel alignment, brake service…" className={field} />
                  <datalist id="service-suggestions">
                    <option value="Engine overhaul" />
                    <option value="Oil & filter change" />
                    <option value="Brake service (all wheels)" />
                    <option value="Periodic service" />
                    <option value="Greasing" />
                    <option value="AC system repair" />
                    <option value="Clutch overhaul" />
                    <option value="Wheel alignment" />
                    <option value="Battery replacement" />
                  </datalist>
                </div>
                <div>
                  <label className={smallLabel} htmlFor="svc-labour">Labour charge (₹)</label>
                  <input id="svc-labour" required type="number" min={0} step="any" value={svc.labour} onChange={(e) => setSvc({ ...svc, labour: e.target.value })} placeholder="0" className={field} />
                </div>
                <button type="submit" className={primaryBtn}><Plus className="h-3.5 w-3.5" /> Add</button>
              </form>
            )}
            {order.services.length ? (
              <ul className={`divide-y ${divide}`}>
                {order.services.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                    <p className={`text-sm font-semibold ${tk.text}`}>{s.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold tabular-nums ${tk.sub}`}>{inr(s.labour)}</span>
                      <button aria-label={`Remove ${s.name}`} onClick={() => update({ services: order.services.filter((x) => x.id !== s.id) })} className={iconBtn}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : empty("No services added yet")}
          </Section>

          {/* --------------------------- PARTS USED --------------------------- */}
          <Section ui={ui} sectionRef={partRef} icon={Package} title="Parts Used" subtitle="Pick from the shared spare-parts catalog" total={t.parts} action={toggle("part", "Add Parts")}>
            {panel === "part" && (
              <form onSubmit={addPart} className={`mb-3 grid grid-cols-2 gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_90px_130px_auto] sm:items-end ${innerSurface}`}>
                <div className="col-span-2 sm:col-span-1">
                  <span className={smallLabel}>Spare part</span>
                  <PartPicker ui={ui} catalog={catalog} value={partSel} onSelect={choosePart} onCreate={createPart} />
                </div>
                <div>
                  <label className={smallLabel} htmlFor="part-qty">Qty</label>
                  <input id="part-qty" type="number" min={1} value={partQty} onChange={(e) => setPartQty(e.target.value)} className={field} />
                </div>
                <div>
                  <label className={smallLabel} htmlFor="part-price">Unit price (₹)</label>
                  <input id="part-price" required type="number" min={0} step="any" value={partPrice} onChange={(e) => setPartPrice(e.target.value)} placeholder="0" className={field} />
                </div>
                <button type="submit" disabled={!partSel} className={`col-span-2 sm:col-span-1 ${primaryBtn}`}><Plus className="h-3.5 w-3.5" /> Add</button>
              </form>
            )}
            {order.parts.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead>
                    <tr className={`text-[10px] font-bold uppercase tracking-wider ${tk.muted}`}>
                      <th className="py-2 pr-3">Part</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Unit</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divide}`}>
                    {order.parts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 pr-3">
                          <p className={`text-sm font-semibold ${tk.text}`}>{p.name}</p>
                          <p className={`text-[10px] ${tk.muted}`}>{p.sku} · {p.brand}</p>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            aria-label={`Quantity of ${p.name}`}
                            type="number" min={1} value={p.qty}
                            onChange={(e) => update({ parts: order.parts.map((x) => (x.id === p.id ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x)) })}
                            className={`w-16 rounded-lg border px-2 py-1 text-center text-xs font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${tk.field}`}
                          />
                        </td>
                        <td className={`px-3 py-2.5 text-right tabular-nums ${tk.sub}`}>{inr(p.price)}</td>
                        <td className={`px-3 py-2.5 text-right font-semibold tabular-nums ${tk.text}`}>{inr(p.qty * p.price)}</td>
                        <td className="text-right">
                          <button aria-label={`Remove ${p.name}`} onClick={() => update({ parts: order.parts.filter((x) => x.id !== p.id) })} className={iconBtn}><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : empty("No parts added yet")}
          </Section>

          {/* ---------------------- ADDITIONAL ITEMS ---------------------- */}
          <Section ui={ui} sectionRef={addonRef} icon={Sparkles} title="Additional Items / Add-ons" subtitle="Towing, washing, consumables, outside work…" total={t.addOns} action={toggle("addon", "Add Item")}>
            {panel === "addon" && (
              <form onSubmit={addAddon} className={`mb-3 grid grid-cols-1 gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_160px_auto] sm:items-end ${innerSurface}`}>
                <div>
                  <label className={smallLabel} htmlFor="addon-name">Item</label>
                  <input id="addon-name" required autoFocus list="addon-suggestions" value={addon.name} onChange={(e) => setAddon({ ...addon, name: e.target.value })} placeholder="Towing charges" className={field} />
                  <datalist id="addon-suggestions">
                    <option value="Towing charges" />
                    <option value="Washing" />
                    <option value="Consumables" />
                    <option value="Outside work" />
                    <option value="Lathe work" />
                    <option value="Electrical works" />
                    <option value="Denting & Painting" />
                  </datalist>
                </div>
                <div>
                  <label className={smallLabel} htmlFor="addon-amt">Amount (₹)</label>
                  <input id="addon-amt" required type="number" min={0} step="any" value={addon.amount} onChange={(e) => setAddon({ ...addon, amount: e.target.value })} placeholder="0" className={field} />
                </div>
                <button type="submit" className={primaryBtn}><Plus className="h-3.5 w-3.5" /> Add</button>
              </form>
            )}
            {order.addOns.length ? (
              <ul className={`divide-y ${divide}`}>
                {order.addOns.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <p className={`text-sm font-semibold ${tk.text}`}>{a.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold tabular-nums ${tk.sub}`}>{inr(a.amount)}</span>
                      <button aria-label={`Remove ${a.name}`} onClick={() => update({ addOns: order.addOns.filter((x) => x.id !== a.id) })} className={iconBtn}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : empty("No additional items")}
          </Section>

          {/* ------------------------------ NOTES ------------------------------ */}
          <Section ui={ui} icon={StickyNote} title="Notes" subtitle="Complaint, observations and instructions">
            <label className="sr-only" htmlFor="job-notes">Notes</label>
            <textarea
              id="job-notes"
              rows={4}
              value={order.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Add notes for this job card…"
              className={field}
            />
          </Section>
        </div>

        {/* ------------------------- PAYMENT SIDEBAR ------------------------- */}
        <aside className="xl:sticky xl:top-36 xl:self-start">
          <section ref={paymentRef} className="scroll-mt-28 rounded-2xl border p-4 sm:p-5" style={glass}>
            <div className={`mb-3 flex items-center justify-between border-b pb-3 ${tk.line}`}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600"><CreditCard className="h-4 w-4" /></span>
                <h3 className={`text-sm font-bold ${tk.text}`}>Payment</h3>
              </div>
              <StatusPill ui={ui} status={payState} />
            </div>

            <dl className="space-y-2 text-sm">
              {[
                ["Labour charges", t.labour],
                ["Parts", t.parts],
                ["Additional items", t.addOns],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className={tk.muted}>{k}</dt><dd className={`font-semibold tabular-nums ${tk.sub}`}>{inr(v as number)}</dd></div>
              ))}
              <div className={`flex justify-between border-t pt-2 ${tk.line}`}><dt className={tk.muted}>Subtotal</dt><dd className={`font-semibold tabular-nums ${tk.sub}`}>{inr(t.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className={tk.muted}>GST {GST_RATE * 100}%</dt><dd className={`font-semibold tabular-nums ${tk.sub}`}>{inr(t.tax)}</dd></div>
              <div className={`flex justify-between border-t pt-2 text-base ${tk.line}`}><dt className={`font-bold ${tk.text}`}>Total amount</dt><dd className={`font-extrabold tabular-nums ${tk.text}`}>{inr(t.total)}</dd></div>
            </dl>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className={`rounded-xl border p-3 ${innerSurface}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${tk.muted}`}>Paid</p>
                <p className="text-base font-extrabold tabular-nums text-emerald-600">{inr(t.paid)}</p>
              </div>
              <div className={`rounded-xl border p-3 ${innerSurface}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${tk.muted}`}>Pending</p>
                <p className={`text-base font-extrabold tabular-nums ${t.pending > 0 ? "text-rose-500" : "text-emerald-600"}`}>{inr(t.pending)}</p>
              </div>
            </div>
            <div className={`mt-3 h-2 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-slate-900/[0.07]"}`} role="progressbar" aria-label="Amount paid" aria-valuemin={0} aria-valuemax={100} aria-valuenow={t.total ? Math.round((t.paid / t.total) * 100) : 0}>
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${t.total ? Math.min(100, (t.paid / t.total) * 100) : 0}%` }} />
            </div>

            {panel === "payment" ? (
              <form onSubmit={addPayment} className={`mt-4 space-y-2 rounded-xl border p-3 ${innerSurface}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={smallLabel} htmlFor="pay-amt">Amount (₹)</label>
                    <input id="pay-amt" required autoFocus type="number" min={0.01} step="any" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} placeholder={String(t.pending)} className={field} />
                  </div>
                  <div>
                    <label className={smallLabel} htmlFor="pay-mode">Mode</label>
                    <select id="pay-mode" value={pay.mode} onChange={(e) => setPay({ ...pay, mode: e.target.value })} className={field}>
                      {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={smallLabel} htmlFor="pay-ref">Reference (optional)</label>
                  <input id="pay-ref" value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} placeholder="UPI txn / cheque no." className={field} />
                </div>
                {t.pending > 0 && (
                  <button type="button" onClick={() => setPay({ ...pay, amount: String(t.pending) })} className="text-[11px] font-bold text-indigo-600 hover:underline">
                    Fill pending amount ({inr(t.pending)})
                  </button>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setPanel(null)} className={`flex-1 ${ghostBtn}`}>Cancel</button>
                  <button type="submit" className={`flex-1 ${primaryBtn}`}>Record Payment</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setPanel("payment")} className={`mt-4 w-full ${primaryBtn}`}><Plus className="h-3.5 w-3.5" /> Add Payment</button>
            )}

            <div className="mt-5">
              <h4 className={`mb-2 text-[10px] font-bold uppercase tracking-wider ${tk.muted}`}>Payment history</h4>
              {order.payments.length ? (
                <ul className={`divide-y ${divide}`}>
                  {order.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${tk.text}`}>{p.mode}{p.reference ? ` · ${p.reference}` : ""}</p>
                        <p className={`text-[10px] ${tk.muted}`}>{p.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold tabular-nums text-emerald-600">{inr(p.amount)}</span>
                        <button aria-label="Remove payment" onClick={() => update({ payments: order.payments.filter((x) => x.id !== p.id) })} className={iconBtn}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className={`text-xs ${tk.muted}`}>No payments recorded</p>}
            </div>

            <button onClick={onPrint} className={`mt-4 w-full ${ghostBtn}`}><Printer className="h-3.5 w-3.5" /> Print Bill</button>
          </section>
        </aside>
      </div>
    </div>
  );
}
