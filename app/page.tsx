"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Truck,
  Wrench,
  CheckCircle2,
  Coins,
  FileText,
  Search,
  ChevronDown,
  X,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Receipt,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Plus,
  Clock,
  CalendarDays,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
} from "lucide-react";
import JobCardForm from "./components/JobCardForm";
import JobCardDetails from "./components/JobCardDetails";
import ServiceOrders from "./components/ServiceOrders";
import Bills from "./components/Bills";
import Reports from "./components/Reports";
import { StatusPill, STATUS_STYLE, type UI } from "./components/ui";
import { INITIAL_ORDERS, PARTS_CATALOG, blankOrder, type CatalogPart, type Order } from "./lib/workshop";

/* -------------------------------------------------------------------------- */
/*  DATA                                                                      */
/* -------------------------------------------------------------------------- */

const STATS = [
  { id: "vehicles", title: "Vehicles Received", sub: "Today", value: "18", change: "+20%", period: "vs yesterday", up: true, good: true, icon: Truck, accent: "#3B82F6", spark: [8, 11, 9, 14, 12, 15, 18] },
  { id: "repairs", title: "Active Repairs", sub: "In workshop", value: "24", change: "+12%", period: "vs yesterday", up: true, good: false, icon: Wrench, accent: "#8B5CF6", spark: [16, 18, 17, 20, 21, 22, 24] },
  { id: "delivery", title: "Ready for Delivery", sub: "Awaiting pickup", value: "6", change: "+50%", period: "vs yesterday", up: true, good: true, icon: CheckCircle2, accent: "#10B981", spark: [2, 3, 2, 4, 3, 4, 6] },
  { id: "payments", title: "Pending Payments", sub: "Outstanding", value: "₹1,24,500", change: "+18%", period: "vs last week", up: true, good: false, icon: Coins, accent: "#F59E0B", spark: [70, 82, 78, 95, 101, 110, 124] },
];

const INFLOW: Record<string, { day: string; lorries: number; buses: number }[]> = {
  "Last 7 Days": [
    { day: "Sep 28", lorries: 12, buses: 6 },
    { day: "Sep 29", lorries: 18, buses: 10 },
    { day: "Sep 30", lorries: 14, buses: 7 },
    { day: "Oct 1", lorries: 20, buses: 12 },
    { day: "Oct 2", lorries: 16, buses: 9 },
    { day: "Oct 3", lorries: 19, buses: 11 },
    { day: "Oct 4", lorries: 22, buses: 13 },
  ],
  "Last 30 Days": [
    { day: "Wk 1", lorries: 62, buses: 31 },
    { day: "Wk 2", lorries: 71, buses: 38 },
    { day: "Wk 3", lorries: 66, buses: 40 },
    { day: "Wk 4", lorries: 84, buses: 45 },
    { day: "Wk 5", lorries: 91, buses: 52 },
  ],
  "This Month": [
    { day: "Oct 1", lorries: 20, buses: 12 },
    { day: "Oct 2", lorries: 16, buses: 9 },
    { day: "Oct 3", lorries: 19, buses: 11 },
    { day: "Oct 4", lorries: 22, buses: 13 },
  ],
};

const SERVICE_STATUS = [
  { name: "Inspection", count: 8, color: "#3B82F6", icon: Clock },
  { name: "In Progress", count: 2, color: "#F59E0B", icon: Wrench },
  { name: "Completed", count: 2, color: "#10B981", icon: CheckCircle2 },
  { name: "Ready for Delivery", count: 4, color: "#8B5CF6", icon: Truck },
];

const ACTIVITIES = [
  { time: "09:00 AM", title: "Vehicle received", vehicle: "TN 58 AB 1234 · Lorry", color: "#3B82F6" },
  { time: "10:15 AM", title: "Inspection completed", vehicle: "TN 72 CD 5678 · Bus", color: "#10B981" },
  { time: "11:30 AM", title: "Repair started", vehicle: "TN 61 EF 9012 · Lorry", color: "#F59E0B" },
  { time: "03:20 PM", title: "Repair completed", vehicle: "TN 37 IJ 7890 · Lorry", color: "#14B8A6" },
  { time: "04:10 PM", title: "Ready for delivery", vehicle: "TN 58 KL 1122 · Bus", color: "#EF4444" },
];

const DELIVERIES = [
  { vehicleNo: "TN 72 CD 5678", type: "Bus", customer: "KPR Travels", date: "Today", status: "Ready" },
  { vehicleNo: "TN 37 IJ 7890", type: "Lorry", customer: "SSK Transport", date: "Today", status: "Ready" },
  { vehicleNo: "TN 58 KL 1122", type: "Bus", customer: "RRR Tours", date: "Tomorrow", status: "In Progress" },
  { vehicleNo: "TN 61 EF 9012", type: "Lorry", customer: "VPM Logistics", date: "Tomorrow", status: "Inspection" },
  { vehicleNo: "TN 45 GH 3456", type: "Bus", customer: "Shree Tours", date: "Oct 3, 2026", status: "In Progress" },
];

const NAV: { id: string; label: string; short?: string; icon: React.ElementType; badge?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Services & Orders", short: "Services", icon: FileText },
  { id: "bills", label: "Bills", icon: Receipt },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                   */
/* -------------------------------------------------------------------------- */

function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* -------------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                            */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Authentication State (Initially land on Sign In page)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState("velk@2058.com");
  const [loginPassword, setLoginPassword] = useState("kumaravel_05");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check localStorage for saved auth session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("saravena_auth");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const dark = theme === "dark";

  // Background / glass controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoOpacity, setVideoOpacity] = useState(0.5);
  const [glassOpacity, setGlassOpacity] = useState(0.55);
  const [blur, setBlur] = useState(14);
  const [showControls, setShowControls] = useState(false);

  // Navigation
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  // Sync activeNav with URL search params so each tab acts as a page route
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) setActiveNav(tab);
    }
    
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") || "dashboard";
      setActiveNav(tab);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Data
  const [query, setQuery] = useState("");
  const [timeframe, setTimeframe] = useState("Last 7 Days");
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [catalog, setCatalog] = useState<CatalogPart[]>(PARTS_CATALOG);
  const [hovered, setHovered] = useState<number | null>(null);
  const [jobForm, setJobForm] = useState<{ mode: "create" | "edit"; order: Order } | null>(null);
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const [billId, setBillId] = useState<string | null>(null);
  const openJob = orders.find((o) => o.id === openJobId) ?? null;

  /* ---- design tokens ---- */
  const tk = {
    text: dark ? "text-white" : "text-slate-900",
    sub: dark ? "text-slate-300" : "text-slate-600",
    muted: dark ? "text-slate-400" : "text-slate-500",
    line: dark ? "border-white/10" : "border-slate-900/[0.07]",
    hover: dark ? "hover:bg-white/[0.06]" : "hover:bg-slate-900/[0.04]",
    field: dark
      ? "bg-white/[0.06] border-white/10 text-white placeholder-slate-400"
      : "bg-white/70 border-slate-900/10 text-slate-900 placeholder-slate-400",
    ghostBtn: dark
      ? "bg-white/[0.06] border-white/10 text-slate-200 hover:bg-white/10"
      : "bg-white/70 border-slate-900/10 text-slate-700 hover:bg-white",
  };

  const glass: React.CSSProperties = {
    backgroundColor: dark ? `rgba(15,23,42,${glassOpacity + 0.1})` : `rgba(255,255,255,${glassOpacity})`,
    backdropFilter: `blur(${blur}px) saturate(160%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(160%)`,
    borderColor: dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.7)",
    boxShadow: dark
      ? "0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 40px -12px rgba(0,0,0,0.55)"
      : "0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 40px -16px rgba(30,41,99,0.28)",
  };

  const innerSurface = dark ? "bg-white/[0.04] border-white/10" : "bg-white/55 border-white/70";

  /* ---- Handlers ---- */
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    setTimeout(() => {
      if (loginEmail.trim().toLowerCase() === "velk@2058.com" && loginPassword === "kumaravel_05") {
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("saravena_auth", "true");
        }
      } else {
        setLoginError("Invalid email or password. Please check credentials.");
      }
      setIsSubmitting(false);
    }, 350);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("saravena_auth", "false");
    }
  };

  const fillDemoCredentials = () => {
    setLoginEmail("velk@2058.com");
    setLoginPassword("kumaravel_05");
    setLoginError("");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setJobForm(null);
        setMobileNav(false);
        setShowControls(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigate = (id: string) => {
    setActiveNav(id);
    setOpenJobId(null);
    window.history.pushState(null, "", `?tab=${id}`);
    window.scrollTo({ top: 0 });
  };

  const showJob = (id: string) => {
    setActiveNav("orders");
    setOpenJobId(id);
    window.history.pushState(null, "", `?tab=orders`);
    window.scrollTo({ top: 0 });
  };

  const updateOrder = (order: Order) => setOrders((os) => os.map((o) => (o.id === order.id ? order : o)));

  const startNewJob = () => {
    const n = Math.max(1023, ...orders.map((o) => parseInt(o.id.split("-")[1], 10))) + 1;
    setJobForm({ mode: "create", order: blankOrder(`JC-${n}`) });
  };

  const saveJob = (order: Order) => {
    if (jobForm?.mode === "create") {
      setOrders((os) => [order, ...os]);
      showJob(order.id);
    } else {
      updateOrder(order);
    }
    setJobForm(null);
  };

  const printBill = (id: string) => {
    setActiveNav("bills");
    setOpenJobId(null);
    setBillId(id);
    setTimeout(() => window.print(), 300);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.id, o.vehicleNo, o.vehicleModel, o.customer, o.phone, o.mechanic, o.status].some((f) => f.toLowerCase().includes(q))
    );
  }, [orders, query]);

  /* ---- Chart Geometry (Reduced Height: H=200) ---- */
  const data = INFLOW[timeframe];
  const totalLorries = useMemo(() => data.reduce((s, d) => s + d.lorries, 0), [data]);
  const totalBuses = useMemo(() => data.reduce((s, d) => s + d.buses, 0), [data]);
  const totalInflow = totalLorries + totalBuses;

  const W = 900, H = 200, padL = 40, padR = 20, padT = 24, padB = 34;
  const maxVal = useMemo(() => {
    const m = Math.max(...data.map((d) => Math.max(d.lorries, d.buses)));
    const step = m > 60 ? 20 : 5;
    return Math.ceil((m + step * 0.4) / step) * step;
  }, [data]);
  const ticks = useMemo(() => {
    const step = maxVal / 4;
    return [0, 1, 2, 3, 4].map((i) => Math.round(i * step));
  }, [maxVal]);
  const gx = (i: number) => padL + (i * (W - padL - padR)) / Math.max(1, data.length - 1);
  const gy = (v: number) => H - padB - (v / maxVal) * (H - padT - padB);
  const lorryPts = data.map((d, i) => [gx(i), gy(d.lorries)] as [number, number]);
  const busPts = data.map((d, i) => [gx(i), gy(d.buses)] as [number, number]);
  const lorryLine = smoothPath(lorryPts);
  const busLine = smoothPath(busPts);
  const baseY = H - padB;
  const lorryArea = `${lorryLine} L ${gx(data.length - 1)},${baseY} L ${gx(0)},${baseY} Z`;
  const busArea = `${busLine} L ${gx(data.length - 1)},${baseY} L ${gx(0)},${baseY} Z`;

  /* ---- Pie Chart Geometry (With Data Labels) ---- */
  const totalRepairs = SERVICE_STATUS.reduce((s, x) => s + x.count, 0);
  const pieSlices = useMemo(() => {
    let currentAngle = -Math.PI / 2;
    const gap = 0;
    const rOut = 45;
    const rIn = 24;
    const cx = 50;
    const cy = 50;

    return SERVICE_STATUS.map((s) => {
      const angleSpan = (s.count / totalRepairs) * (2 * Math.PI);
      const startAngle = currentAngle + gap / 2;
      const endAngle = currentAngle + angleSpan - gap / 2;
      const midAngle = currentAngle + angleSpan / 2;
      currentAngle += angleSpan;

      const x1 = cx + rOut * Math.cos(startAngle);
      const y1 = cy + rOut * Math.sin(startAngle);
      const x2 = cx + rOut * Math.cos(endAngle);
      const y2 = cy + rOut * Math.sin(endAngle);

      const x3 = cx + rIn * Math.cos(endAngle);
      const y3 = cy + rIn * Math.sin(endAngle);
      const x4 = cx + rIn * Math.cos(startAngle);
      const y4 = cy + rIn * Math.sin(startAngle);

      const rLabel = (rOut + rIn) / 2;
      const lx = cx + rLabel * Math.cos(midAngle);
      const ly = cy + rLabel * Math.sin(midAngle);

      const largeArc = angleSpan > Math.PI ? 1 : 0;
      const pathData = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;

      return {
        ...s,
        pathData,
        lx,
        ly,
        pct: Math.round((s.count / totalRepairs) * 100),
      };
    });
  }, [totalRepairs]);

  const statusBadge = (status: string) => {
    const s = STATUS_STYLE[status];
    if (!s) return dark ? "bg-white/10 text-slate-200 ring-white/10" : "bg-slate-100 text-slate-700 ring-slate-300";
    return dark ? s.dark : s.light;
  };

  const ui: UI = { dark, tk, glass, innerSurface, statusBadge };

  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(2026, 9, 4));

  /* ---- Sidebar Render ---- */
  const renderNav = (expanded: boolean, onPick?: () => void) => (
    <nav className="space-y-2" aria-label="Primary">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = activeNav === item.id;
        return (
          <button
            key={item.id}
            onClick={() => { navigate(item.id); onPick?.(); }}
            aria-current={active ? "page" : undefined}
            title={!expanded ? item.label : undefined}
            className={`group relative flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${active
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold"
                : `${dark ? "text-slate-300" : "text-slate-600"} ${tk.hover}`
              } ${!expanded ? "justify-center" : ""}`}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.3 : 2} />
            {expanded && <span className="flex-1 truncate text-left tracking-wide">{item.label}</span>}
            {expanded && item.badge && (
              <span className={`rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${active ? "bg-white/20 text-white" : dark ? "bg-white/10 text-slate-300" : "bg-slate-900/[0.06] text-slate-600"}`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const brand = (expanded: boolean) => (
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
        <Truck className="h-5 w-5" />
      </div>
      {expanded && (
        <div className="min-w-0">
          <p className={`truncate text-sm font-bold leading-tight ${tk.text}`}>Saravena</p>
          <p className={`truncate text-[11px] font-medium ${tk.muted}`}>Spare Parts & Service</p>
        </div>
      )}
    </div>
  );

  const profile = (expanded: boolean) => (
    <div className={`flex items-center justify-between rounded-xl border p-2 ${innerSurface}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">KV</div>
        {expanded && (
          <div className="min-w-0">
            <p className={`truncate text-xs font-bold ${tk.text}`}>Kumaravel</p>
            <p className={`truncate text-[11px] ${tk.muted}`}>velk@2058.com</p>
          </div>
        )}
      </div>
      {expanded && (
        <button
          onClick={handleLogout}
          title="Sign Out"
          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-rose-500 hover:bg-rose-500/10 transition ${dark ? "border-rose-500/20" : "border-rose-500/30"}`}
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  /* ======================================================================== */
  /*  SIGN IN PAGE VIEW                                                       */
  /* ======================================================================== */
  if (!isAuthenticated) {
    return (
      <div className={`relative flex min-h-screen w-full items-center justify-center p-4 font-sans antialiased transition-colors duration-500 ${dark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
        {/* Background Video with Blur & Overlay */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          <video
            ref={videoRef}
            src="/video/dashboardBanner.mp4"
            autoPlay loop muted playsInline
            className="h-full w-full scale-105 object-cover motion-reduce:hidden"
            style={{ opacity: videoOpacity }}
          />
          <div className={`absolute inset-0 ${dark ? "bg-slate-950/60" : "bg-slate-100/50"}`} />
          <div className={`absolute inset-0 ${dark
            ? "bg-[radial-gradient(60%_50%_at_50%_30%,rgba(99,102,241,0.3),transparent),linear-gradient(to_top,rgba(2,6,23,0.9),transparent_70%)]"
            : "bg-[radial-gradient(60%_50%_at_50%_30%,rgba(99,102,241,0.22),transparent),linear-gradient(to_top,rgba(241,245,249,0.8),transparent_70%)]"}`} />
        </div>

        {/* Top Right Theme Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label="Toggle theme"
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition shadow-lg ${tk.ghostBtn}`}
          >
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>{dark ? "Dark Mode" : "Light Mode"}</span>
          </button>
        </div>

        {/* Sign In Glass Card */}
        <div className="relative z-10 w-full max-w-md space-y-6 rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all duration-300" style={glass}>
          {/* Header & Brand */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-600/40">
              <Truck className="h-7 w-7" />
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${tk.text}`}>Saravena Spare Parts</h1>
            <p className={`mt-1 text-xs font-semibold ${tk.muted}`}>Workshop & Service Management Portal</p>
          </div>


          {/* Error Alert */}
          {loginError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${tk.muted}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${tk.muted}`} />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="velk@2058.com"
                  className={`w-full rounded-xl border py-3 pl-10 pr-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${tk.field}`}
                />
              </div>
            </div>

            <div>
              <label className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${tk.muted}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${tk.muted}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="kumaravel_05"
                  className={`w-full rounded-xl border py-3 pl-10 pr-10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${tk.field}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 ${tk.muted} ${tk.hover}`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="border-t pt-4 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 border-white/10">
            Authorized Workshop Personnel Only · Saravena Commercial Repairs
          </div>
        </div>
      </div>
    );
  }

  /* ======================================================================== */
  /*  AUTHENTICATED DASHBOARD VIEW                                            */
  /* ======================================================================== */
  return (
    <div className={`relative flex min-h-screen w-full font-sans antialiased transition-colors duration-500 ${dark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
      {/* ------------------------------ BACKGROUND ------------------------------ */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <video
          ref={videoRef}
          src="/video/dashboardBanner.mp4"
          autoPlay loop muted playsInline
          className="h-full w-full scale-105 object-cover motion-reduce:hidden"
          style={{ opacity: videoOpacity }}
        />
        <div className={`absolute inset-0 ${dark ? "bg-slate-950/40" : "bg-slate-100/30"}`} />
        <div className={`absolute inset-0 ${dark
          ? "bg-[radial-gradient(60%_50%_at_15%_0%,rgba(99,102,241,0.25),transparent),linear-gradient(to_top,rgba(2,6,23,0.85),transparent_60%)]"
          : "bg-[radial-gradient(60%_50%_at_15%_0%,rgba(99,102,241,0.18),transparent),linear-gradient(to_top,rgba(241,245,249,0.7),transparent_60%)]"}`} />
      </div>

      {/* ------------------------------- SIDEBAR -------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden flex-col justify-between border-r p-3 transition-[width] duration-300 ease-out md:flex ${sidebarOpen ? "w-64" : "w-[76px]"}`}
        style={glass}
      >
        <div>
          <div className={`mb-4 flex items-center justify-between border-b pb-4 pl-1 ${tk.line}`}>
            {brand(sidebarOpen)}
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} aria-label="Collapse sidebar" className={`rounded-lg p-1.5 ${tk.muted} ${tk.hover}`}>
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} aria-label="Expand sidebar" className={`mx-auto mb-3 flex rounded-lg p-1.5 ${tk.muted} ${tk.hover}`}>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {renderNav(sidebarOpen)}
        </div>
        <div className={`border-t pt-3 ${tk.line}`}>{profile(sidebarOpen)}</div>
      </aside>

      {/* -------------------------------- MAIN --------------------------------- */}
      <div className={`relative z-10 mx-auto min-h-screen w-full max-w-[1680px] flex-1 space-y-6 p-4 pb-24 transition-[margin] duration-300 sm:p-6 lg:p-8 ${sidebarOpen ? "md:ml-64" : "md:ml-[76px]"}`}>
        {/* STICKY HEADER ONLY AT DESKTOP ("Workshop Overview") */}
        <header className="relative lg:sticky lg:top-4 z-40 flex flex-col gap-4 rounded-2xl border p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between backdrop-blur-xl transition-all shadow-xl" style={glass}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {/* Mobile brand header badge */}
              <div className="mb-2.5 flex items-center gap-2.5 md:hidden border-b pb-2 border-slate-500/15">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-600/30">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className={`text-xs font-bold leading-tight ${tk.text}`}>Saravena</p>
                  <p className={`text-[10px] font-medium ${tk.muted}`}>Spare Parts & Service</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className={`text-lg sm:text-2xl font-bold tracking-tight ${tk.text}`}>
                  {activeNav === "settings"
                    ? "Settings & Account"
                    : activeNav === "orders"
                    ? openJob ? "Job Card Details" : "Services & Orders"
                    : activeNav === "bills"
                    ? "Bills & Invoices"
                    : activeNav === "reports"
                    ? "Reports & Analytics"
                    : "Workshop Overview"}
                </h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold ring-1 ring-inset ${dark ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25" : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"}`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>
              <p className={`mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-medium sm:text-[13px] ${tk.sub}`}>
                <CalendarDays className="h-3.5 w-3.5 shrink-0" /> {today}
                <span className="hidden sm:inline opacity-40">•</span>
                <span className="hidden sm:inline">
                  {activeNav === "settings" ? "Manage user profile, appearance & session settings" : "Multi-brand commercial vehicle repair"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex  flex-col sm:flex-row flex-wrap sm:items-center gap-2 sm:gap-2.5 lg:flex-nowrap">
            <div className="relative min-w-[140px] flex-1 lg:w-72 lg:flex-none">
              <Search className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${tk.muted}`} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search job cards, vehicles…"
                aria-label="Search job cards"
                className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-xs sm:text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${tk.field}`}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={startNewJob} className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-indigo-600 px-3 sm:px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                <Plus className="h-4 w-4 shrink-0" /> <span>New Job Card</span>
              </button>

              <button onClick={() => setTheme(dark ? "light" : "dark")} aria-label="Toggle theme" className={`rounded-xl border p-2.5 transition ${tk.ghostBtn}`}>
                {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* VIEW CONDITIONAL: SETTINGS PAGE OR DASHBOARD */}
        {activeNav === "settings" ? (
          <div className="space-y-6">
            {/* Account & User Profile Card */}
            <article className="rounded-2xl border p-5 sm:p-6 shadow-xl" style={glass}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
                <div className="flex items-center gap-4">
                  <div className="flex  h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-xl shadow-indigo-600/30">
                    KV
                  </div>
                  <div>
                    <div className="flex  flex-col gap-2">
                      <h2 className={`text-xl font-bold ${tk.text}`}>Kumaravel</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${dark ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}>
                        Workshop Manager
                      </span>
                    </div>
                    <p className={`text-xs font-medium ${tk.muted}`}>velk@2058.com</p>
                    <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      Authenticated Session
                    </p>
                  </div>
                </div>

                {/* Top Quick Sign Out Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
                <div className={`rounded-xl border p-4 ${innerSurface}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${tk.muted}`}>Access Level</p>
                  <p className={`mt-1 text-sm font-bold ${tk.text}`}>Full Administrator</p>
                </div>
                <div className={`rounded-xl border p-4 ${innerSurface}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${tk.muted}`}>Login Credential</p>
                  <p className={`mt-1 text-sm font-bold ${tk.text}`}>velk@2058.com</p>
                </div>
                <div className={`rounded-xl border p-4 ${innerSurface}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${tk.muted}`}>Main Workshop</p>
                  <p className={`mt-1 text-sm font-bold ${tk.text}`}>Saravena Spare Parts & Service</p>
                </div>
              </div>
            </article>

  


          </div>
        ) : activeNav === "orders" ? (
          openJob ? (
            <JobCardDetails
              key={openJob.id}
              ui={ui}
              order={openJob}
              catalog={catalog}
              onUpdate={updateOrder}
              onAddCatalogPart={(p) => setCatalog((c) => [...c, p])}
              onBack={() => setOpenJobId(null)}
              onEdit={() => setJobForm({ mode: "edit", order: openJob })}
              onPrint={() => printBill(openJob.id)}
            />
          ) : (
            <ServiceOrders ui={ui} orders={orders} query={query} onOpen={showJob} />
          )
        ) : activeNav === "bills" ? (
          <Bills ui={ui} orders={orders} query={query} selectedId={billId} onSelect={setBillId} onOpenJob={showJob} />
        ) : activeNav === "reports" ? (
          <Reports ui={ui} orders={orders} onOpenJob={showJob} />
        ) : (
          <>
            {/* STATS */}
            <section aria-label="Key metrics" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((s) => {
            const Icon = s.icon;
            const Arrow = s.up ? ArrowUpRight : ArrowDownRight;
            return (
              <article key={s.id} className="group rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5" style={glass}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${tk.muted}`}>{s.title}</p>
                    <p className={`text-[11px] ${tk.muted} opacity-80`}>{s.sub}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${s.accent}1F`, color: s.accent }}>
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className={`text-[28px] font-extrabold leading-none tracking-tight tabular-nums ${tk.text}`}>{s.value}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${s.good
                      ? dark ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25" : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                      : dark ? "bg-rose-500/10 text-rose-300 ring-rose-400/25" : "bg-rose-50 text-rose-700 ring-rose-600/20"
                    }`}>
                    <Arrow className="h-3 w-3" /> {s.change}
                  </span>
                  <span className={`text-[11px] font-medium ${tk.muted}`}>{s.period}</span>
                </div>
              </article>
            );
          })}
        </section>

        {/* ROW 1: VEHICLE INFLOW & SERVICE STATUS (REDUCED HEIGHT) */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
          {/* VEHICLE INFLOW (COMPACT HEIGHT) */}
          <article className="rounded-2xl border p-4 sm:p-5 lg:col-span-7 xl:col-span-7 flex flex-col justify-between h-full" style={glass}>
            <div className={`mb-3 flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between ${tk.line}`}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`text-base font-bold tracking-tight ${tk.text}`}>Vehicle Inflow</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Truck className="h-3.5 w-3.5" />
                    {totalInflow} Vehicles Total
                  </span>
                </div>
                <p className={`mt-0.5 text-xs font-medium ${tk.muted}`}>
                  Daily count of incoming lorries & buses ({timeframe.toLowerCase()})
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
                <div className={`flex items-center gap-2 text-xs font-semibold ${tk.sub}`}>
                  <span className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-2 py-0.5 text-blue-600 dark:text-blue-400">
                    <span className="h-2 w-2 rounded-full bg-blue-500" /> Lorries <strong className="font-extrabold tabular-nums">({totalLorries})</strong>
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-2 py-0.5 text-violet-600 dark:text-violet-400">
                    <span className="h-2 w-2 rounded-full bg-violet-500" /> Buses <strong className="font-extrabold tabular-nums">({totalBuses})</strong>
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={timeframe}
                    onChange={(e) => { setTimeframe(e.target.value); setHovered(null); }}
                    aria-label="Select timeframe"
                    className={`cursor-pointer appearance-none rounded-lg border py-1 pl-2.5 pr-6 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${dark ? "border-white/10 bg-slate-900 text-white" : "border-slate-900/10 bg-white/80 text-slate-800"}`}
                  >
                    {Object.keys(INFLOW).map((k) => <option key={k}>{k}</option>)}
                  </select>
                  <ChevronDown className={`pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${tk.muted}`} />
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Mobile helper hint */}
              <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:hidden">
                <span>Tap graph points for detail</span>
                <span className="text-indigo-500 dark:text-indigo-400">Scroll &rarr;</span>
              </div>

              <div className="overflow-x-auto scrollbar-thin pb-1">
                <div className="min-w-[500px] sm:min-w-0">
                  <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="h-[160px] sm:h-[180px] lg:h-[195px] w-full overflow-visible"
                    role="img"
                    aria-label="Vehicle inflow line chart"
                  >
                    <defs>
                      <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="gViolet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.30" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {ticks.map((v) => (
                      <g key={v}>
                        <line
                          x1={padL}
                          x2={W - padR}
                          y1={gy(v)}
                          y2={gy(v)}
                          stroke={dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"}
                          strokeDasharray={v === 0 ? undefined : "3 5"}
                        />
                        <text
                          x={padL - 8}
                          y={gy(v) + 4}
                          textAnchor="end"
                          fontSize="11"
                          fontWeight="700"
                          fill={dark ? "#94A3B8" : "#64748B"}
                        >
                          {v}
                        </text>
                      </g>
                    ))}

                    {hovered !== null && (
                      <line
                        x1={gx(hovered)}
                        x2={gx(hovered)}
                        y1={padT}
                        y2={baseY}
                        stroke={dark ? "rgba(255,255,255,0.3)" : "rgba(15,23,42,0.25)"}
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                      />
                    )}

                    <path d={lorryArea} fill="url(#gBlue)" />
                    <path d={busArea} fill="url(#gViolet)" />
                    <path d={lorryLine} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={busLine} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {data.map((d, i) => {
                      const on = hovered === i;
                      const lY = gy(d.lorries);
                      const bY = gy(d.buses);
                      const diff = Math.abs(lY - bY);
                      const lNumY = lY <= bY ? lY - 12 : lY + 16;
                      const bNumY = bY < lY ? bY - 12 : (diff < 18 ? bY + 18 : bY + 16);

                      return (
                        <g key={d.day} className="cursor-pointer" onClick={() => setHovered(hovered === i ? null : i)}>
                          <circle cx={gx(i)} cy={lY} r={on ? 6 : 4.5} fill="#3B82F6" stroke={dark ? "#0F172A" : "#fff"} strokeWidth="2" className="transition-all" />
                          {on && (
                            <g transform={`translate(${gx(i)}, ${lNumY})`}>
                              <rect x="-12" y="-9" width="24" height="14" rx="4" fill={dark ? "#1E293B" : "#EFF6FF"} stroke="#3B82F6" strokeWidth="1" opacity="0.95" />
                              <text textAnchor="middle" y="1" fontSize="9" fontWeight="800" fill="#2563EB">{d.lorries}</text>
                            </g>
                          )}

                          <circle cx={gx(i)} cy={bY} r={on ? 6 : 4.5} fill="#8B5CF6" stroke={dark ? "#0F172A" : "#fff"} strokeWidth="2" className="transition-all" />
                          {on && (
                            <g transform={`translate(${gx(i)}, ${bNumY})`}>
                              <rect x="-12" y="-9" width="24" height="14" rx="4" fill={dark ? "#2E1065" : "#F5F3FF"} stroke="#8B5CF6" strokeWidth="1" opacity="0.95" />
                              <text textAnchor="middle" y="1" fontSize="9" fontWeight="800" fill="#7C3AED">{d.buses}</text>
                            </g>
                          )}

                          <text
                            x={gx(i)}
                            y={H - 6}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight={on ? 800 : 700}
                            fill={on ? (dark ? "#60A5FA" : "#1D4ED8") : dark ? "#94A3B8" : "#475569"}
                          >
                            {d.day}
                          </text>

                          <rect
                            x={gx(i) - (W - padL - padR) / Math.max(1, data.length - 1) / 2}
                            y={padT}
                            width={(W - padL - padR) / Math.max(1, data.length - 1)}
                            height={baseY - padT + 18}
                            fill="transparent"
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Hover / Touch Active Tooltip */}
              {hovered !== null && (
                <div
                  className="pointer-events-none absolute top-1 z-20 w-40 -translate-x-1/2 rounded-xl border border-indigo-500/30 bg-slate-900/95 p-2.5 text-xs text-white shadow-2xl backdrop-blur-md"
                  style={{ left: `${Math.min(Math.max((gx(hovered) / W) * 100, 16), 84)}%` }}
                >
                  <div className="mb-1.5 flex items-center justify-between border-b border-white/10 pb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">{data[hovered].day}</span>
                    <span className="rounded bg-indigo-500/20 px-1 py-0.5 text-[9px] font-bold text-indigo-300">
                      Total: {data[hovered].lorries + data[hovered].buses}
                    </span>
                  </div>
                  <div className="space-y-0.5 font-semibold text-[11px]">
                    <p className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Lorries</span>
                      <span className="tabular-nums font-extrabold text-blue-400">{data[hovered].lorries}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" />Buses</span>
                      <span className="tabular-nums font-extrabold text-violet-400">{data[hovered].buses}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Compact summary pill */}
              <div className={`mt-2 flex flex-col gap-2 rounded-xl border p-2.5 sm:flex-row sm:items-center sm:justify-between ${innerSurface}`}>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    <Truck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${tk.text}`}>
                      {hovered !== null ? `${data[hovered].day} Count` : "Daily Average"}
                    </p>
                    <p className={`text-[10px] ${tk.muted}`}>
                      {hovered !== null ? "Selected date breakdown" : "Overall daily influx"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2.5 text-xs font-bold border-t pt-2 border-slate-500/15 sm:border-t-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="block text-[9px] uppercase font-medium text-slate-400">Lorries</span>
                    <span className="text-blue-600 dark:text-blue-400 tabular-nums text-xs font-extrabold">
                      {hovered !== null ? data[hovered].lorries : Math.round(totalLorries / data.length)}
                    </span>
                  </div>
                  <div className="text-center sm:text-right border-l pl-2.5 border-slate-500/20">
                    <span className="block text-[9px] uppercase font-medium text-slate-400">Buses</span>
                    <span className="text-violet-600 dark:text-violet-400 tabular-nums text-xs font-extrabold">
                      {hovered !== null ? data[hovered].buses : Math.round(totalBuses / data.length)}
                    </span>
                  </div>
                  <div className="text-right border-l pl-2.5 border-slate-500/20">
                    <span className="block text-[9px] uppercase font-medium text-slate-400">Total</span>
                    <span className="text-indigo-600 dark:text-indigo-400 tabular-nums text-xs font-extrabold">
                      {hovered !== null ? data[hovered].lorries + data[hovered].buses : Math.round(totalInflow / data.length)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* SERVICE STATUS (REDUCED HEIGHT PIE CHART) */}
          <article
            className="flex flex-col justify-between rounded-2xl border p-4 sm:p-5 lg:col-span-5 xl:col-span-5 h-full transition-all duration-300"
            style={glass}
          >
            {/* Header with Title and Live Badge */}
            <div className={`flex items-center justify-between border-b pb-3 mb-3 ${tk.line}`}>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-bold tracking-tight ${tk.text}`}>Service Status</h2>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className={`text-xs font-medium ${tk.muted}`}>
                  Breakdown of {totalRepairs} active workshop jobs
                </p>
              </div>

              <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {totalRepairs} Active
              </span>
            </div>

            {/* Pie Chart with Integrated Data Labels & Legend Chips */}
            <div className="my-auto flex flex-col items-center justify-center gap-4 py-2">
              {/* Sleek SVG Pie Chart with Direct Slice Data Labels */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full blur-xl opacity-20 bg-indigo-500" />
                <div className="relative h-44 w-44 shrink-0 sm:h-48 sm:w-48">
                  <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" role="img" aria-label="Pie chart of repair status">
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
                      strokeWidth="20"
                    />
                    {pieSlices.map((s) => (
                      <g key={s.name}>
                        <path
                          d={s.pathData}
                          fill={s.color}
                          className="transition-colors duration-200 hover:opacity-90"
                        />
                        {/* Slice Data Label (Count) */}
                        <text
                          x={s.lx}
                          y={s.ly}
                          fill="#FFFFFF"
                          fontSize="6"
                          fontWeight="900"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="drop-shadow-sm pointer-events-none"
                        >
                          {s.count}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Center Total Readout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pointer-events-none">
                    <div>
                      <span className={`text-2xl sm:text-3xl font-black leading-none tabular-nums ${tk.text}`}>{totalRepairs}</span>
                      <span className={`mt-0.5 block text-[9px] font-extrabold uppercase tracking-widest ${tk.muted}`}>Total Jobs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Legend Grid (4 items) Below Line */}
              <div className={`w-full border-t pt-3 ${tk.line}`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                  {SERVICE_STATUS.map((s) => (
                    <div key={s.name} className={`flex items-center justify-between gap-1.5 rounded-xl border px-2 py-1.5 ${innerSurface}`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: s.color }} />
                        <span className={`truncate text-[11px] font-semibold ${tk.sub}`}>{s.name}</span>
                      </div>
                      <span className={`text-xs font-black tabular-nums ${tk.text}`}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Workshop Capacity Metric Pill */}
            <div className={`mt-2 flex items-center justify-between rounded-xl border p-2.5 text-xs font-semibold ${innerSurface}`}>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className={`block text-[10px] font-bold leading-tight ${tk.text}`}>Workshop Capacity</span>
                  <span className={`text-[9px] ${tk.muted}`}>24 of 30 bays occupied</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">80% Load</span>
              </div>
            </div>
          </article>
        </section>

        {/* ROW 2: RECENT SERVICE ORDERS (FULL WIDTH) */}
        <section className="w-full">
          <article className="rounded-2xl border p-4 sm:p-6 w-full" style={glass}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className={`text-base font-bold tracking-tight ${tk.text}`}>Recent Service Orders</h2>
                <p className={`text-xs font-medium ${tk.muted}`}>
                  {query ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} for “${query}”` : "Live status of workshop job cards"}
                </p>
              </div>
              {query ? (
                <button onClick={() => setQuery("")} className="text-xs font-bold text-indigo-600 hover:text-indigo-500">Clear search</button>
              ) : (
                <button onClick={() => navigate("orders")} className="text-xs font-bold text-indigo-600 hover:text-indigo-500">View all</button>
              )}
            </div>

            {/* Mobile helper hint */}
            <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 md:hidden">
              <span>Tap order for job card details</span>
              <span className="text-indigo-500 dark:text-indigo-400">Scroll table &rarr;</span>
            </div>

            <div className={`overflow-x-auto scrollbar-thin rounded-xl border ${innerSurface}`}>
              <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                <thead>
                  <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${tk.muted} ${tk.line}`}>
                    {["Vehicle", "Customer", "Mechanic", "Status", "Delivery"].map((h) => (
                      <th key={h} scope="col" className="whitespace-nowrap px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${dark ? "divide-white/[0.06]" : "divide-slate-900/[0.06]"}`}>
                  {filtered.length ? (
                    filtered.map((o) => (
                      <tr
                        key={o.id}
                        tabIndex={0}
                        onClick={() => showJob(o.id)}
                        onKeyDown={(e) => { if (e.key === "Enter") showJob(o.id); }}
                        className={`cursor-pointer transition-colors focus:outline-none focus-visible:bg-indigo-500/10 ${tk.hover}`}
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className={`font-bold ${tk.text}`}>{o.vehicleNo}</p>
                          <p className={`text-[10px] ${tk.muted}`}>{o.vehicleModel} · {o.type}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className={`font-semibold ${tk.sub}`}>{o.customer}</p>
                          <p className={`text-[10px] ${tk.muted}`}>{o.phone}</p>
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3 font-medium ${tk.sub}`}>
                          <span className="inline-flex items-center gap-2">
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${dark ? "bg-white/10" : "bg-slate-900/[0.07]"}`}>{o.mechanic[0]}</span>
                            {o.mechanic}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3"><StatusPill ui={ui} status={o.status} /></td>
                        <td className={`whitespace-nowrap px-4 py-3 font-medium tabular-nums ${tk.muted}`}>{o.deliveryDate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={`px-4 py-10 text-center font-medium ${tk.muted}`}>No matching service orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        {/* ROW 3: UPCOMING DELIVERIES (SEPARATELY) */}
        <section className="w-full">
          <article className="rounded-2xl border p-6 w-full" style={glass} aria-label="Upcoming deliveries">
            <div className="mb-4">
              <h2 className={`text-base font-bold tracking-tight ${tk.text}`}>Upcoming Deliveries</h2>
              <p className={`text-xs font-medium ${tk.muted}`}>Scheduled vehicle dispatches</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {DELIVERIES.map((d) => (
                <div key={d.vehicleNo} className={`rounded-xl border p-4 transition hover:-translate-y-0.5 ${innerSurface}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                      <Truck className="h-4 w-4" />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusBadge(d.status)}`}>{d.status}</span>
                  </div>
                  <p className={`text-[13px] font-bold ${tk.text}`}>{d.vehicleNo}</p>
                  <p className={`truncate text-xs font-medium ${tk.muted}`}>{d.type} · {d.customer}</p>
                  <p className={`mt-3 flex items-center gap-1.5 border-t pt-3 text-[11px] font-semibold ${tk.sub} ${tk.line}`}>
                    <CalendarDays className="h-3.5 w-3.5" /> {d.date}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </>
    )}
  </div>

      {/* --------------------------- JOB CARD FORM MODAL --------------------------- */}
      {jobForm && (
        <JobCardForm
          key={`${jobForm.mode}-${jobForm.order.id}`}
          mode={jobForm.mode}
          initial={jobForm.order}
          onSave={saveJob}
          onClose={() => setJobForm(null)}
        />
      )}

      {/* --------------------------- BOTTOM NAV (MOBILE) --------------------------- */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 border-t py-2 px-2 md:hidden transition-all duration-300"
        style={{
          ...glass,
          backgroundColor: dark ? `rgba(15,23,42,${Math.min(glassOpacity + 0.35, 0.95)})` : `rgba(255,255,255,${Math.min(glassOpacity + 0.35, 0.95)})`,
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(226,232,240,0.8)",
          boxShadow: dark ? "0 -4px 20px rgba(0,0,0,0.5)" : "0 -4px 20px rgba(0,0,0,0.08)",
        }}
        aria-label="Mobile Navigation Bar"
      >
        <div className="mx-auto grid w-full max-w-lg grid-cols-5 items-center justify-items-center">
          {NAV.map((item) => ({ ...item, label: item.short ?? item.label })).map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`relative flex w-full flex-col items-center justify-center rounded-xl py-1 px-1 text-center transition-all ${
                  active
                    ? "text-indigo-600 dark:text-indigo-400 font-bold"
                    : dark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.5 : 2} />
                  {item.badge && (
                    <span className="absolute -right-2.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-[11px] font-semibold leading-none truncate w-full text-center">{item.label}</span>
                {active && (
                  <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}