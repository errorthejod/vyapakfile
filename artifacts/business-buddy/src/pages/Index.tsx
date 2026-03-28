import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { SalesChart } from "@/components/SalesChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { useStore } from "@/store/useStore";
import { TrendingUp, TrendingDown, ShoppingCart } from "lucide-react";

const Dashboard = () => {
  const { parties, invoices } = useStore();

  const totalReceivable = parties.reduce((sum, p) => sum + (p.balance > 0 ? p.balance : 0), 0);
  const totalPayable = parties.reduce((sum, p) => sum + (p.balance < 0 ? Math.abs(p.balance) : 0), 0);
  const totalSale = invoices.filter(i => i.type === 'sale').reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Receivable" amount={totalReceivable} icon={TrendingUp} colorClass="text-receivable" bgClass="bg-receivable/10" />
          <StatCard title="Total Payable" amount={totalPayable} icon={TrendingDown} colorClass="text-payable" bgClass="bg-payable/10" />
          <StatCard title="Total Sale" amount={totalSale} icon={ShoppingCart} colorClass="text-sale" bgClass="bg-sale/10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <SalesChart />
          </div>
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
