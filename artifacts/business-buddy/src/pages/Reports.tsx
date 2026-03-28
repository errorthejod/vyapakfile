import { Layout } from "@/components/Layout";
import { useStore } from "@/store/useStore";
import { SalesChart } from "@/components/SalesChart";
import { motion } from "framer-motion";
import { BarChart3, Users, ShoppingCart, TrendingUp } from "lucide-react";

const Reports = () => {
  const { invoices, parties } = useStore();
  const totalSale = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalInvoices = invoices.length;
  const totalCustomers = parties.length;

  const partyWise = parties.map(p => {
    const partyInvoices = invoices.filter(i => i.partyId === p.id);
    const total = partyInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    return { name: p.name, total, count: partyInvoices.length };
  }).filter(p => p.total > 0).sort((a, b) => b.total - a.total);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Business analytics & insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Sales", value: `₹${totalSale.toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-receivable", bg: "bg-receivable/10" },
            { label: "Total Invoices", value: totalInvoices, icon: ShoppingCart, color: "text-sale", bg: "bg-sale/10" },
            { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-5 card-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <SalesChart />

        {partyWise.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-5 card-shadow"
          >
            <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Party-wise Sales
            </h3>
            <div className="space-y-3">
              {partyWise.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                      <span className="text-sm font-semibold text-receivable">₹{p.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, (p.total / totalSale) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">{p.count} invoice{p.count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
