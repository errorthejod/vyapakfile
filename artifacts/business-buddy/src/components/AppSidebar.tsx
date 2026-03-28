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
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)" }}>
            <span className="text-base font-black text-white tracking-tight drop-shadow">V</span>
            <div className="absolute inset-0 opacity-20"
              style={{ background: "radial-gradient(circle at 30% 30%, #fff 0%, transparent 60%)" }} />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight"
              style={{ background: "linear-gradient(90deg, #818cf8, #c084fc, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Vyapak Billing
            </h1>
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
