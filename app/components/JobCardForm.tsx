"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { JOB_STATUSES, MECHANICS, VEHICLE_TYPES, fromInputDate, toInputDate, type Order } from "../lib/workshop";

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25";
const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500";

/** Create / edit modal for a job card's header details. */
export default function JobCardForm({
  mode,
  initial,
  onSave,
  onClose,
}: {
  mode: "create" | "edit";
  initial: Order;
  onSave: (order: Order) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Order>(initial);
  const set = <K extends keyof Order>(k: K, v: Order[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, vehicleNo: form.vehicleNo.trim(), vehicleModel: form.vehicleModel.trim(), customer: form.customer.trim(), phone: form.phone.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="job-form-title" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 id="job-form-title" className="text-lg font-bold text-slate-900">{mode === "create" ? "New Job Card" : `Edit ${initial.id}`}</h3>
            <p className="text-xs text-slate-500">{mode === "create" ? "Register the vehicle, customer and assigned mechanic" : "Update vehicle, customer and job details"}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="jc-reg" className={label}>Registration No</label>
              <input id="jc-reg" required autoFocus placeholder="TN 58 AB 1234" value={form.vehicleNo} onChange={(e) => set("vehicleNo", e.target.value.toUpperCase())} className={field} />
            </div>
            <div>
              <label htmlFor="jc-model" className={label}>Car / Vehicle Model</label>
              <input id="jc-model" required placeholder="Tata LPT 1613" value={form.vehicleModel} onChange={(e) => set("vehicleModel", e.target.value)} className={field} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="jc-type" className={label}>Vehicle Type</label>
              <select id="jc-type" value={form.type} onChange={(e) => set("type", e.target.value)} className={field}>
                {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="jc-mech" className={label}>Mechanic</label>
              <select id="jc-mech" value={form.mechanic} onChange={(e) => set("mechanic", e.target.value)} className={field}>
                {MECHANICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="jc-cust" className={label}>Customer / Company</label>
              <input id="jc-cust" required placeholder="SR Transport" value={form.customer} onChange={(e) => set("customer", e.target.value)} className={field} />
            </div>
            <div>
              <label htmlFor="jc-phone" className={label}>Customer Phone</label>
              <input
                id="jc-phone" required type="tel" inputMode="tel" placeholder="+91 94430 11223"
                pattern="^\+?[0-9][0-9 \-]{8,15}$" title="Enter a valid phone number (10+ digits)"
                value={form.phone} onChange={(e) => set("phone", e.target.value)} className={field}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="jc-due" className={label}>Est. Delivery</label>
              <input id="jc-due" type="date" value={toInputDate(form.deliveryDate)} onChange={(e) => set("deliveryDate", fromInputDate(e.target.value))} className={field} />
            </div>
            <div>
              <label htmlFor="jc-status" className={label}>Status</label>
              <select id="jc-status" value={form.status} onChange={(e) => set("status", e.target.value)} className={field}>
                {JOB_STATUSES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {mode === "create" && (
            <div>
              <label htmlFor="jc-notes" className={label}>Complaint / Notes</label>
              <textarea id="jc-notes" rows={2} placeholder="Customer complaint or observations…" value={form.notes} onChange={(e) => set("notes", e.target.value)} className={field} />
            </div>
          )}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500">
              {mode === "create" ? "Create Job Card" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
