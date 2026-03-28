import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Receipt } from "lucide-react";

const Purchase = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Purchase & Expense</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your purchases and expenses</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-12 card-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground">Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">Purchase and expense tracking will be available soon. You'll be able to record purchase invoices and track business expenses.</p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Purchase;
