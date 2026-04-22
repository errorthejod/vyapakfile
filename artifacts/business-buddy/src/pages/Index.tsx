import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCurrentStore } from "@/store/useCurrentStore";
import { useAuthStore } from "@/store/useAuthStore";
import { SaleFormDialog } from "@/components/SaleFormDialog";
import { PurchaseFormDialog } from "@/components/PurchaseFormDialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ShoppingCart, FileText, Users, ChevronRight, ReceiptText,
  Bell, Settings, Wallet, Package, ArrowDownLeft, ArrowUpRight,
  ClipboardList, BarChart3, IndianRupee, Receipt, Truck, Boxes,
} from "lucide-react";

function formatFull(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}
function formatINR(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val.toFixed(0)}`;
}

type Period = "week" | "month" | "year";

export default function Index() {
  const { parties, items, invoices, shopInfo } = useCurrentStore();
  const currentUserId = useAuthStore(s => s.currentUserId);
  const users = useAuthStore(s => s.users);
  const navigate = useNavigate();
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [period, setPeriod] = useState<Period>("month");

  const currentUser = users.find(u => u.id === currentUserId);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString('en-IN', { month: 'long' });

  const totalReceivable = parties.reduce((sum, p) => sum + Math.max(p.balance, 0), 0);
  const totalPayable = parties.reduce((sum, p) => sum + Math.max(-p.balance, 0), 0);
  const receivableParties = parties.filter(p => p.balance > 0).length;
  const payableParties = parties.filter(p => p.balance < 0).length;

  const saleInvoices = invoices.filter(i => i.type === 'sale');
  const purchaseInvoices = invoices.filter(i => i.type === 'purchase');

  const stockValue = items.reduce((sum, it: any) => sum + (it.stock || 0) * (it.salePrice || it.rate || 0), 0);
  const lowStockItems = items.filter((it: any) => (it.stock || 0) <= (it.minStock ?? 5)).length;

  const thisMonthSale = saleInvoices.filter(i => {
    const d = new Date(i.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).reduce((sum, i) => sum + i.totalAmount, 0);

  const thisMonthPurchase = purchaseInvoices.filter(i => {
    const d = new Date(i.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).reduce((sum, i) => sum + i.totalAmount, 0);

  const chartData = useMemo(() => {
    if (period === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const today = new Date();
      const dayOfWeek = (today.getDay() + 6) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - dayOfWeek);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        const sale = saleInvoices.filter(inv => inv.date === dateStr).reduce((s, inv) => s + inv.totalAmount, 0);
        const purchase = purchaseInvoices.filter(inv => inv.date === dateStr).reduce((s, inv) => s + inv.totalAmount, 0);
        return { label: days[i], sale, purchase };
      });
    }
    if (period === "year") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.map((label, i) => {
        const sale = saleInvoices.filter(inv => {
          const d = new Date(inv.date);
          return d.getFullYear() === year && d.getMonth() === i;
        }).reduce((s, inv) => s + inv.totalAmount, 0);
        const purchase = purchaseInvoices.filter(inv => {
          const d = new Date(inv.date);
          return d.getFullYear() === year && d.getMonth() === i;
        }).reduce((s, inv) => s + inv.totalAmount, 0);
        return { label, sale, purchase };
      });
    }
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const sale = saleInvoices.filter(inv => inv.date === dateStr).reduce((s, inv) => s + inv.totalAmount, 0);
      const purchase = purchaseInvoices.filter(inv => inv.date === dateStr).reduce((s, inv) => s + inv.totalAmount, 0);
      return { label: String(day), sale, purchase };
    });
  }, [invoices, period, year, month]);

  const quickActions = [
    { label: "Sale Invoice", icon: FileText, color: "bg-rose-50 text-rose-600", action: () => setShowSaleForm(true) },
    { label: "Purchase", icon: ShoppingCart, color: "bg-emerald-50 text-emerald-600", action: () => setShowPurchaseForm(true) },
    { label: "Estimate", icon: ClipboardList, color: "bg-amber-50 text-amber-600", action: () => navigate('/sales') },
    { label: "Payment In", icon: ArrowDownLeft, color: "bg-blue-50 text-blue-600", action: () => navigate('/parties') },
    { label: "Payment Out", icon: ArrowUpRight, color: "bg-purple-50 text-purple-600", action: () => navigate('/parties') },
    { label: "Add Item", icon: Boxes, color: "bg-cyan-50 text-cyan-600", action: () => navigate('/items') },
  ];

  const reports = [
    { label: 'Sale Report', icon: BarChart3, path: '/reports' },
    { label: 'All Transactions', icon: ReceiptText, path: '/sales' },
    { label: 'Party Statement', icon: Users, path: '/parties' },
    { label: 'Stock Summary', icon: Package, path: '/items' },
    { label: 'GST Report', icon: Receipt, path: '/reports' },
    { label: 'Purchase Report', icon: Truck, path: '/purchase' },
  ];

  const recentTxns = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Layout>
      <SaleFormDialog open={showSaleForm} onClose={() => setShowSaleForm(false)} />
      <PurchaseFormDialog open={showPurchaseForm} onClose={() => setShowPurchaseForm(false)} />
      <div className="flex flex-col h-full -m-4 md:-m-6 bg-[#f3f4f6]">
        {/* Vyapar-style red header */}
        <div className="bg-gradient-to-br from-rose-600 to-red-700 text-white px-4 pt-3 pb-16 shrink-0 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center shrink-0 font-bold text-sm">
                {(shopInfo.name || "B").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold leading-tight truncate">{shopInfo.name}</h1>
                <p className="text-[11px] text-white/80 truncate">Hello, {currentUser?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="h-9 w-9 rounded-full hover:bg-white/15 flex items-center justify-center">
                <Bell className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('/settings')} className="h-9 w-9 rounded-full hover:bg-white/15 flex items-center justify-center">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 pb-6 -mt-12 space-y-3">
          {/* Receivable / Payable hero card */}
          <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
            <div className="grid grid-cols-2 divide-x">
              <button onClick={() => navigate('/parties')} className="px-4 py-4 text-left hover:bg-emerald-50/40 transition-colors">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">You'll Get</p>
                </div>
                <p className="text-xl font-bold text-emerald-600">{formatFull(totalReceivable)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{receivableParties} {receivableParties === 1 ? 'Party' : 'Parties'}</p>
              </button>
              <button onClick={() => navigate('/parties')} className="px-4 py-4 text-left hover:bg-rose-50/40 transition-colors">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">You'll Give</p>
                </div>
                <p className="text-xl font-bold text-rose-600">{formatFull(totalPayable)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{payableParties} {payableParties === 1 ? 'Party' : 'Parties'}</p>
              </button>
            </div>
          </div>

          {/* Stock + Cash mini cards */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/items')} className="bg-white rounded-xl p-3.5 border shadow-sm text-left hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Stock Value</p>
                <div className="h-7 w-7 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Package className="h-3.5 w-3.5 text-cyan-600" />
                </div>
              </div>
              <p className="text-base font-bold text-foreground">{formatFull(stockValue)}</p>
              <p className="text-[11px] text-amber-600 mt-0.5">{lowStockItems} low stock</p>
            </button>
            <button onClick={() => navigate('/cash-bank')} className="bg-white rounded-xl p-3.5 border shadow-sm text-left hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Cash in Hand</p>
                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Wallet className="h-3.5 w-3.5 text-blue-600" />
                </div>
              </div>
              <p className="text-base font-bold text-foreground">{formatFull(thisMonthSale - thisMonthPurchase)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{monthName} net</p>
            </button>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl shadow-sm border p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 px-1">Quick Actions</p>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map(({ label, icon: Icon, color, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-medium text-foreground text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sales bar chart with period tabs */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-rose-600" />
                <p className="text-sm font-bold text-foreground">Sales vs Purchase</p>
              </div>
              <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg">
                {(["week", "month", "year"] as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors capitalize ${
                      period === p ? "bg-white shadow text-rose-600" : "text-muted-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 px-4 pb-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                <span className="text-muted-foreground">Sale</span>
                <span className="font-semibold text-foreground">{formatINR(chartData.reduce((s, d) => s + d.sale, 0))}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                <span className="text-muted-foreground">Purchase</span>
                <span className="font-semibold text-foreground">{formatINR(chartData.reduce((s, d) => s + d.purchase, 0))}</span>
              </div>
            </div>
            <div className="h-44 px-2 pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={period === "month" ? 4 : 0} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={formatINR} width={50} />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatFull(value), name === 'sale' ? 'Sale' : 'Purchase']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  />
                  <Bar dataKey="sale" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="purchase" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reports grid */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="text-sm font-bold text-foreground">Reports & Tools</p>
              <button onClick={() => navigate('/reports')} className="text-xs text-rose-600 hover:text-rose-700 font-semibold">View All</button>
            </div>
            <div className="grid grid-cols-3 gap-px bg-gray-100">
              {reports.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white hover:bg-rose-50/40 transition-colors"
                >
                  <Icon className="h-4 w-4 text-rose-600" />
                  <span className="text-[11px] font-medium text-foreground text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          {recentTxns.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <p className="text-sm font-bold text-foreground">Recent Transactions</p>
                <button onClick={() => navigate('/sales')} className="text-xs text-rose-600 hover:text-rose-700 font-semibold">View All</button>
              </div>
              <div className="divide-y">
                {recentTxns.map((txn) => (
                  <button
                    key={txn.id}
                    onClick={() => navigate(txn.type === 'sale' ? '/sales' : '/purchase')}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        txn.type === 'sale' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {txn.type === 'sale' ? <FileText className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{txn.partyName || 'Unknown Party'}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {txn.invoiceNumber} · {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="text-right">
                        <p className={`text-sm font-bold ${txn.type === 'sale' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          <IndianRupee className="h-3 w-3 inline -mt-0.5" />{txn.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize">{txn.type}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
