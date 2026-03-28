import { LayoutDashboard, Users, Package, ShoppingCart, Receipt, Wallet, BarChart3, Settings, LogOut } from "lucide-react";
import { NavLink } from "./NavLink";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrentStore } from "@/store/useCurrentStore";
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/parties", icon: Users, label: "Parties" },
  { to: "/items", icon: Package, label: "Items" },
  { to: "/sales", icon: ShoppingCart, label: "Sale" },
  { to: "/purchase", icon: Receipt, label: "Purchase & Expense" },
  { to: "/cash-bank", icon: Wallet, label: "Cash & Bank" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const { logout, currentUserId, users } = useAuthStore();
  const { shopInfo } = useCurrentStore();
  const navigate = useNavigate();

  const currentUser = users.find(u => u.id === currentUserId);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 shrink-0 bg-sidebar h-screen flex flex-col">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground">BusinessBuddy</h1>
            <p className="text-xs text-sidebar-foreground/60">Accounting Software</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="bg-sidebar-border/30 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser?.name || 'User'}</p>
          <p className="text-xs text-sidebar-foreground/50 truncate">{shopInfo.name || currentUser?.businessName || 'My Business'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-border/30 rounded-lg transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
