import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCurrentStore } from "@/store/useCurrentStore";
import { useAuthStore } from "@/store/useAuthStore";
import { SaleFormDialog } from "@/components/SaleFormDialog";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown, ShoppingCart, FileText, BookOpen, Users, ChevronRight, TrendingDown, TrendingUp, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";

function formatFull(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}
function formatINR(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val.toFixed(0)}`;
}

export default function Index() {
  const { parties, invoices, shopInfo } = useCurrentStore();
  const currentUserId = useAuthStore(s => s.currentUserId);
  const users = useAuthStore(s => s.users);
  const navigate = useNavigate();
  const [showSaleForm, setShowSaleForm] = useState(false);

  const currentUser = users.find(u => u.id === currentUserId);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleString('en-IN', { month: 'long' });

  const totalReceivable = parties.reduce((sum, p) => sum + Math.max(p.balance, 0), 0);
  const totalPayable = parties.reduce((sum, p) => sum + Math.max(-p.balance, 0), 0);
  const receivableParties = parties.filter(p => p.balance > 0).length;
  const payableParties = parties.filter(p => p.balance < 0).length;

  const saleInvoices = invoices.filter(i => i.type === 'sale');
  const totalSale = saleInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const lastMonthStart = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(year, month, 0).toISOString().split('T')[0];
  const thisMonthStart = new Date(year, month, 1).toISOString().split('T')[0];

  const lastMonthSale = saleInvoices
    .filter(i => i.date >= lastMonthStart && i.date <= lastMonthEnd)
    .reduce((sum, i) => sum + i.totalAmount, 0);
  const thisMonthSale = saleInvoices
    .filter(i => i.date >= thisMonthStart)
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const pctChange = lastMonthSale > 0 ? ((thisMonthSale - lastMonthSale) / lastMonthSale) * 100 : 0;

  const dailyData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTotal = saleInvoices
        .filter(inv => inv.date === dateStr)
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      return { day: String(day), amount: dayTotal };
    });
  }, [invoices, year, month, daysInMonth]);

  const quickReports = [
    { label: 'Sale Report', icon: ShoppingCart, path: '/reports' },
    { label: 'All Transactions', icon: ReceiptText, path: '/sales' },
    { label: 'Party Statement', icon: Users, path: '/parties' },
    { label: 'Daybook Report', icon: BookOpen, path: '/reports' },
  ];

  return (
    <Layout>
      <SaleFormDialog open={showSaleForm} onClose={() => setShowSaleForm(false)} />
      <div className="flex flex-col h-full -m-4 md:-m-6">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-white shrink-0">
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">{shopInfo.name}</h1>
            <p className="text-xs text-muted-foreground">{currentUser?.name}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSaleForm(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              + Add Sale
            </button>
            <button
              onClick={() => navigate('/purchase')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              + Add Purchase
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4 bg-[#f5f6fa]">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">Total Receivable</p>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <p className="text-xl font-bold text-emerald-600">{formatFull(totalReceivable)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">From {receivableParties} {receivableParties === 1 ? 'Party' : 'Parties'}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <ArrowDown className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">Total Payable</p>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <p className="text-xl font-bold text-red-500">{formatFull(totalPayable)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">From {payableParties} {payableParties === 1 ? 'Party' : 'Parties'}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <ArrowUp className="h-4 w-4 text-red-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Sale</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{formatFull(totalSale)}</p>
                {pctChange !== 0 && (
                  <div className={cn("flex items-center gap-1 text-xs mt-1 font-medium", pctChange > 0 ? "text-emerald-600" : "text-red-500")}>
                    {pctChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{Math.abs(pctChange).toFixed(0)}% {pctChange > 0 ? 'more' : 'less'} than last month</span>
                  </div>
                )}
              </div>
              <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 font-medium px-2.5 py-1 rounded-lg">
                {monthName}
              </span>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="saleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={formatINR} />
                  <Tooltip
                    formatter={(value: number) => [formatFull(value), 'Sales']}
                    labelFormatter={(label) => `Day ${label}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#saleGrad)"
                    dot={false}
                    activeDot={{ r: 3, fill: '#3b82f6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="text-sm font-semibold text-foreground">Most Used Reports</p>
              <button onClick={() => navigate('/reports')} className="text-xs text-blue-600 hover:text-blue-500 font-medium">View All</button>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y">
              {quickReports.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-blue-50/50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
