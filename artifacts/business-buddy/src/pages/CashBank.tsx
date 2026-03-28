import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

const CashBank = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Cash & Bank</h1>
          <p className="text-sm text-muted-foreground mt-1">Track cash and bank transactions</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-12 card-shadow flex flex-col items-center justify-center text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground">Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">Cash and bank management features will be available in the next update.</p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CashBank;
