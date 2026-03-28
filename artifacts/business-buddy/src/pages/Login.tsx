import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useDataStore } from "@/store/useDataStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User, Briefcase } from "lucide-react";

export default function Login() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const loginByName = useAuthStore(s => s.loginByName);
  const loadAdminConfig = useAuthStore(s => s.loadAdminConfig);
  const currentUserId = useAuthStore(s => s.currentUserId);
  const initUser = useDataStore(s => s.initUser);
  const navigate = useNavigate();

  useEffect(() => {
    loadAdminConfig();
  }, [loadAdminConfig]);

  useEffect(() => {
    if (currentUserId) {
      navigate("/", { replace: true });
    }
  }, [currentUserId, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) {
      toast.error("Please enter your name and password");
      return;
    }
    setLoading(true);
    try {
      const success = await loginByName(name.trim(), pin.trim());
      if (success) {
        const users = useAuthStore.getState().users;
        const user = users.find(u => u.name.toLowerCase() === name.trim().toLowerCase());
        if (user) initUser(user.id, false, user.businessName);
        toast.success("Login successful!");
        navigate("/", { replace: true });
      } else {
        toast.error("Invalid name or password. Contact your admin.");
        setLoading(false);
      }
    } catch {
      toast.error("Could not connect to server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-4 shadow-lg relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)" }}>
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight"
            style={{ background: "linear-gradient(90deg, #818cf8, #c084fc, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Vyapak Billing
          </h1>
          <p className="text-blue-300 mt-1 text-sm">Smart Accounting for Small Business</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Sign In to Your Account</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label className="text-blue-200 text-sm font-medium">Your Name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/20"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <Label className="text-blue-200 text-sm font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                <Input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/20"
                  autoComplete="off"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30 mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-white/40 text-xs">
              Don't have an account? Contact your administrator.
            </p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Vyapak Billing v1.0 · Powered by secure login
        </p>
      </div>
    </div>
  );
}
