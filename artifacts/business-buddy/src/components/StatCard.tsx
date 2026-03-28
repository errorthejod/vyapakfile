import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

export function StatCard({ title, amount, icon: Icon, colorClass, bgClass }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-5 card-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${colorClass}`}>
            ₹{amount.toLocaleString('en-IN')}
          </p>
        </div>
        <div className={`h-12 w-12 rounded-xl ${bgClass} flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
      </div>
    </motion.div>
  );
}
