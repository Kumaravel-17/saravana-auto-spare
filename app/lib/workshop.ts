/* -------------------------------------------------------------------------- */
/*  WORKSHOP DATA MODEL                                                       */
/*  Shared by the job card listing, details page, bills and reports.          */
/* -------------------------------------------------------------------------- */

export type ServiceItem = { id: string; name: string; labour: number };
export type PartItem = { id: string; partId: string; name: string; sku: string; brand: string; qty: number; price: number };
export type AddOn = { id: string; name: string; amount: number };
export type Payment = { id: string; date: string; mode: string; amount: number; reference: string };

export type Order = {
  id: string;
  vehicleNo: string;
  vehicleModel: string;
  type: string;
  customer: string;
  phone: string;
  mechanic: string;
  status: string;
  receivedDate: string;
  deliveryDate: string;
  notes: string;
  services: ServiceItem[];
  parts: PartItem[];
  addOns: AddOn[];
  payments: Payment[];
};

export type CatalogPart = { id: string; name: string; sku: string; brand: string; category: string; price: number; stock: number };

export const GST_RATE = 0.18;
export const VEHICLE_TYPES = ["Lorry", "Bus", "Trailer", "Tipper", "Car", "Van"];
export const MECHANICS = ["Ravi", "Kumar", "Arun", "Mani", "Selvam"];
export const JOB_STATUSES = ["Inspection", "In Progress", "Completed", "Ready for Delivery", "Delivered"];
export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"];

/** Shop details printed on bills — replace with the real business details. */
export const SHOP = {
  name: "Saravena",
  tagline: "Spare Parts & Service",
  phone: "+91 98765 43210",
  email: "billing@saravena.in",
  address: "Main Road, Tamil Nadu",
  manager: "Kumaravel",
  managerTitle: "Workshop Manager",
};

/* ---------------------------------- helpers --------------------------------- */

export const uid = () => Math.random().toString(36).slice(2, 10);

export const inr = (n: number) => {
  const digits = Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2;
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};

export const dateLabel = (d: Date = new Date()) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "Oct 7, 2026" -> "2026-10-07" for <input type="date"> */
export const toInputDate = (label: string) => {
  const d = new Date(label);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** "2026-10-07" -> "Oct 7, 2026" */
export const fromInputDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return y ? dateLabel(new Date(y, m - 1, d)) : "";
};

export function orderTotals(o: Order) {
  const labour = o.services.reduce((s, x) => s + x.labour, 0);
  const parts = o.parts.reduce((s, x) => s + x.qty * x.price, 0);
  const addOns = o.addOns.reduce((s, x) => s + x.amount, 0);
  const subtotal = labour + parts + addOns;
  const tax = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + tax;
  const paid = o.payments.reduce((s, x) => s + x.amount, 0);
  const pending = Math.max(0, Math.round((total - paid) * 100) / 100);
  return { labour, parts, addOns, subtotal, tax, total, paid, pending };
}

export function paymentState(o: Order): "Paid" | "Partial" | "Unpaid" {
  const t = orderTotals(o);
  if (t.total > 0 && t.pending === 0) return "Paid";
  return t.paid > 0 ? "Partial" : "Unpaid";
}

export const billNo = (o: Order) => `INV-${o.id.split("-")[1]}`;

/* ----------------------------------- data ---------------------------------- */

export const PARTS_CATALOG: CatalogPart[] = [
  { id: "p01", name: "Brake Lining Set", sku: "BRK-LN-210", brand: "Rane", category: "Brakes", price: 2850, stock: 24 },
  { id: "p02", name: "Brake Chamber (Type 24)", sku: "BRK-CH-024", brand: "Wabco", category: "Brakes", price: 4200, stock: 8 },
  { id: "p03", name: "Brake Drum", sku: "BRK-DR-410", brand: "Tata Genuine", category: "Brakes", price: 6800, stock: 6 },
  { id: "p04", name: "Clutch Plate 380mm", sku: "CLT-PL-380", brand: "Valeo", category: "Clutch", price: 7400, stock: 10 },
  { id: "p05", name: "Pressure Plate Assembly", sku: "CLT-PP-380", brand: "Valeo", category: "Clutch", price: 11800, stock: 5 },
  { id: "p06", name: "Clutch Release Bearing", sku: "CLT-RB-112", brand: "SKF", category: "Clutch", price: 1650, stock: 14 },
  { id: "p07", name: "Engine Oil 15W-40 (1 L)", sku: "OIL-EN-1540", brand: "Castrol", category: "Lubricants", price: 420, stock: 180 },
  { id: "p08", name: "Gear Oil EP-90 (1 L)", sku: "OIL-GR-090", brand: "Servo", category: "Lubricants", price: 360, stock: 90 },
  { id: "p09", name: "Grease (1 kg)", sku: "OIL-GS-001", brand: "Servo", category: "Lubricants", price: 280, stock: 40 },
  { id: "p10", name: "Coolant (5 L)", sku: "CLN-5L-001", brand: "Castrol", category: "Cooling", price: 1150, stock: 22 },
  { id: "p11", name: "Oil Filter", sku: "FLT-OL-310", brand: "Mann", category: "Filters", price: 650, stock: 60 },
  { id: "p12", name: "Fuel Filter", sku: "FLT-FL-220", brand: "Bosch", category: "Filters", price: 780, stock: 48 },
  { id: "p13", name: "Air Filter Element", sku: "FLT-AR-540", brand: "Mann", category: "Filters", price: 1450, stock: 30 },
  { id: "p14", name: "Head Gasket Kit", sku: "ENG-HG-697", brand: "Ashok Leyland Genuine", category: "Engine", price: 5600, stock: 7 },
  { id: "p15", name: "Piston Ring Set", sku: "ENG-PR-697", brand: "Goetze", category: "Engine", price: 8900, stock: 4 },
  { id: "p16", name: "Fan Belt", sku: "ENG-FB-150", brand: "Gates", category: "Engine", price: 890, stock: 26 },
  { id: "p17", name: "Radiator Hose", sku: "CLN-RH-075", brand: "Tata Genuine", category: "Cooling", price: 720, stock: 18 },
  { id: "p18", name: "Wheel Bearing", sku: "SUS-WB-330", brand: "SKF", category: "Suspension", price: 2350, stock: 16 },
  { id: "p19", name: "King Pin Kit", sku: "SUS-KP-045", brand: "Rane", category: "Suspension", price: 3200, stock: 9 },
  { id: "p20", name: "Shock Absorber", sku: "SUS-SA-260", brand: "Gabriel", category: "Suspension", price: 3900, stock: 12 },
  { id: "p21", name: "Leaf Spring Assembly", sku: "SUS-LS-009", brand: "Jamna Auto", category: "Suspension", price: 9800, stock: 3 },
  { id: "p22", name: "Self Starter Motor", sku: "ELC-SM-024", brand: "Lucas TVS", category: "Electrical", price: 14500, stock: 2 },
  { id: "p23", name: "Alternator 24V", sku: "ELC-AL-024", brand: "Lucas TVS", category: "Electrical", price: 12800, stock: 3 },
  { id: "p24", name: "AC Compressor", sku: "AC-CMP-110", brand: "Sanden", category: "AC", price: 21500, stock: 2 },
  { id: "p25", name: "AC Gas Refill (R134a)", sku: "AC-GAS-134", brand: "Refron", category: "AC", price: 1800, stock: 20 },
];

const part = (id: string, catalogId: string, qty: number): PartItem => {
  const p = PARTS_CATALOG.find((x) => x.id === catalogId)!;
  return { id, partId: p.id, name: p.name, sku: p.sku, brand: p.brand, qty, price: p.price };
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: "JC-1024", vehicleNo: "TN 58 AB 1234", vehicleModel: "Tata LPT 1613", type: "Lorry",
    customer: "SR Transport", phone: "+91 94430 11223", mechanic: "Ravi", status: "In Progress",
    receivedDate: "Sep 28, 2026", deliveryDate: "Oct 6, 2026",
    notes: "Heavy smoke at start-up and loss of power on gradients. Customer requested full engine overhaul.",
    services: [
      { id: "s1", name: "Engine overhaul", labour: 18000 },
      { id: "s2", name: "Oil & filter change", labour: 600 },
    ],
    parts: [part("pi1", "p14", 1), part("pi2", "p15", 1), part("pi3", "p07", 14), part("pi4", "p11", 1), part("pi5", "p12", 1)],
    addOns: [{ id: "a1", name: "Towing charges", amount: 2500 }],
    payments: [{ id: "py1", date: "Sep 28, 2026", mode: "UPI", amount: 20000, reference: "Advance" }],
  },
  {
    id: "JC-1025", vehicleNo: "TN 72 CD 5678", vehicleModel: "Ashok Leyland Viking", type: "Bus",
    customer: "KPR Travels", phone: "+91 98422 55667", mechanic: "Kumar", status: "Inspection",
    receivedDate: "Oct 2, 2026", deliveryDate: "Oct 7, 2026",
    notes: "Brake pedal feels spongy, rear left wheel drags.",
    services: [{ id: "s1", name: "Brake service (all wheels)", labour: 3500 }],
    parts: [part("pi1", "p01", 2), part("pi2", "p02", 1)],
    addOns: [],
    payments: [],
  },
  {
    id: "JC-1026", vehicleNo: "TN 61 EF 9012", vehicleModel: "Eicher Pro 3015", type: "Lorry",
    customer: "VPM Logistics", phone: "+91 90031 77889", mechanic: "Arun", status: "Completed",
    receivedDate: "Sep 30, 2026", deliveryDate: "Oct 1, 2026",
    notes: "Periodic service.",
    services: [
      { id: "s1", name: "Periodic service", labour: 1800 },
      { id: "s2", name: "Greasing", labour: 400 },
    ],
    parts: [part("pi1", "p07", 10), part("pi2", "p11", 1), part("pi3", "p13", 1), part("pi4", "p09", 2)],
    addOns: [{ id: "a1", name: "Washing", amount: 500 }],
    payments: [{ id: "py1", date: "Oct 1, 2026", mode: "Cash", amount: 11280.8, reference: "" }],
  },
  {
    id: "JC-1027", vehicleNo: "TN 45 GH 3456", vehicleModel: "BharatBenz 1623", type: "Bus",
    customer: "Shree Tours", phone: "+91 97890 33445", mechanic: "Mani", status: "In Progress",
    receivedDate: "Oct 1, 2026", deliveryDate: "Oct 8, 2026",
    notes: "AC not cooling in the rear half of the cabin.",
    services: [{ id: "s1", name: "AC system repair", labour: 4500 }],
    parts: [part("pi1", "p24", 1), part("pi2", "p25", 2)],
    addOns: [],
    payments: [{ id: "py1", date: "Oct 2, 2026", mode: "Bank Transfer", amount: 15000, reference: "NEFT 77120" }],
  },
  {
    id: "JC-1028", vehicleNo: "TN 37 IJ 7890", vehicleModel: "Ashok Leyland 2518", type: "Lorry",
    customer: "SSK Transport", phone: "+91 99440 66778", mechanic: "Selvam", status: "Ready for Delivery",
    receivedDate: "Oct 2, 2026", deliveryDate: "Oct 5, 2026",
    notes: "Clutch slipping under load.",
    services: [{ id: "s1", name: "Clutch overhaul", labour: 6000 }],
    parts: [part("pi1", "p04", 1), part("pi2", "p05", 1), part("pi3", "p06", 1), part("pi4", "p08", 6)],
    addOns: [],
    payments: [{ id: "py1", date: "Oct 4, 2026", mode: "UPI", amount: 10000, reference: "" }],
  },
];

export function blankOrder(id: string): Order {
  return {
    id, vehicleNo: "", vehicleModel: "", type: "Lorry", customer: "", phone: "", mechanic: MECHANICS[0],
    status: "Inspection", receivedDate: dateLabel(), deliveryDate: "", notes: "",
    services: [], parts: [], addOns: [], payments: [],
  };
}
