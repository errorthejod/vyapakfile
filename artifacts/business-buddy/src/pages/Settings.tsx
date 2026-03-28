import { Layout } from "@/components/Layout";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store } from "lucide-react";

const SettingsPage = () => {
  const { shopInfo, updateShopInfo } = useStore();
  const [form, setForm] = useState(shopInfo);

  const handleSave = () => {
    updateShopInfo(form);
    toast.success("Shop info updated!");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your business details</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 card-shadow max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold">Shop Information</h3>
              <p className="text-xs text-muted-foreground">This appears on your invoices</p>
            </div>
          </div>
          <div className="space-y-4">
            <div><Label>Shop Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div><Label>GSTIN</Label><Input value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} /></div>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
