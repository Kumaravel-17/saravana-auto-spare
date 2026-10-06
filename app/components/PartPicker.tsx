"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, Plus, Package, ChevronDown } from "lucide-react";
import type { UI } from "./ui";
import { inr, type CatalogPart } from "../lib/workshop";

/**
 * Searchable dropdown over the shared spare-parts catalog. The same catalog is
 * used by every job card; parts that aren't listed can be added on the fly.
 */
export default function PartPicker({
  ui,
  catalog,
  value,
  onSelect,
  onCreate,
}: {
  ui: UI;
  catalog: CatalogPart[];
  value: CatalogPart | null;
  onSelect: (part: CatalogPart) => void;
  onCreate: (name: string) => void;
}) {
  const { dark, tk } = ui;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((p) => [p.name, p.sku, p.brand, p.category].some((f) => f.toLowerCase().includes(q)));
  }, [catalog, query]);

  const exact = catalog.some((p) => p.name.toLowerCase() === query.trim().toLowerCase());
  const canCreate = query.trim().length > 1 && !exact;

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const pick = (p: CatalogPart) => {
    onSelect(p);
    setQuery("");
    setOpen(false);
  };

  const create = () => {
    onCreate(query.trim());
    setQuery("");
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) pick(results[active]);
      else if (canCreate) create();
    } else if (e.key === "Escape") { e.stopPropagation(); setOpen(false); }
  };

  const panel = dark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200";

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${tk.muted}`} />
        <input
          role="combobox"
          aria-label="Search spare parts"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={open ? query : value ? `${value.name} · ${value.sku}` : query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(""); }}
          onKeyDown={onKey}
          placeholder="Search spare parts by name, SKU, brand…"
          className={`w-full rounded-xl border py-2.5 pl-9 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${tk.field}`}
        />
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${tk.muted}`} />
      </div>

      {open && (
        <div className={`absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border shadow-2xl ${panel}`}>
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {results.map((p, i) => (
              <li
                key={p.id}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => { e.preventDefault(); pick(p); }}
                className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${i === active ? (dark ? "bg-indigo-500/20" : "bg-indigo-50") : ""}`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${dark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
                    <Package className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className={`truncate font-semibold ${tk.text}`}>{p.name}</p>
                    <p className={`truncate text-[11px] ${tk.muted}`}>{p.sku} · {p.brand} · {p.category}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-xs font-bold tabular-nums ${tk.text}`}>{inr(p.price)}</p>
                  <p className={`text-[10px] font-semibold ${p.stock <= 3 ? "text-rose-500" : tk.muted}`}>{p.stock} in stock</p>
                </div>
              </li>
            ))}
            {!results.length && (
              <li className={`px-3 py-4 text-center text-xs ${tk.muted}`}>No parts match “{query}”</li>
            )}
          </ul>
          {canCreate && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); create(); }}
              className={`flex w-full items-center gap-2 border-t px-3 py-2.5 text-left text-xs font-bold text-indigo-600 ${dark ? "border-white/10 hover:bg-white/5 text-indigo-300" : "border-slate-100 hover:bg-indigo-50"}`}
            >
              <Plus className="h-3.5 w-3.5" /> Add “{query.trim()}” as a new part
            </button>
          )}
        </div>
      )}
    </div>
  );
}
