import { LayoutDashboard, Users, Package, ShoppingCart, Receipt, Wallet, BarChart3, Settings } from "lucide-react";
import { NavLink } from "./NavLink";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/parties", icon: Users, label: "Parties" },
  { to: "/items", icon: Package, label: "Items" },
  { to: "/sales", icon: ShoppingCart, label: "Sales" },
  { to: "/purchase", icon: Receipt, label: "Purchase" },
  { to: "/cash-bank", icon: Wallet, label: "Cash & Bank" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  return (
    <aside className="w-60 shrink-0 bg-sidebar h-screen flex flex-col">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground">BusinessBuddy</h1>
            <p className="text-xs text-sidebar-foreground/60">Accounting Software</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 text-center">BusinessBuddy v1.0</p>
      </div>
    </aside>
  );
}
