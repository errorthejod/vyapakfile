import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useStore } from "@/store/useStore";

export function RecentTransactions() {
  const { invoices } = useStore();

  const recent = [...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-card rounded-xl p-5 card-shadow"
    >
      <h3 className="font-heading font-semibold text-foreground mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
        ) : (
          recent.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${inv.type === 'sale' ? 'bg-success/10' : 'bg-payable/10'}`}>
                  {inv.type === 'sale' ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-payable" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{inv.partyName}</p>
                  <p className="text-xs text-muted-foreground">{inv.invoiceNumber} • {inv.date}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold ${inv.type === 'sale' ? 'text-success' : 'text-payable'}`}>
                {inv.type === 'sale' ? '+' : '-'}₹{inv.totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
