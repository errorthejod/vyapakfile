import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useStore } from "@/store/useStore";
import { Party } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Edit, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Parties = () => {
  const { parties, addParty, updateParty, deleteParty } = useStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", gst: "" });

  const filtered = parties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const handleSubmit = () => {
    if (!form.name || !form.phone) {
      toast.error("Name and phone are required");
      return;
    }
    if (editingParty) {
      updateParty(editingParty.id, { ...form });
      toast.success("Party updated");
    } else {
      addParty({
        id: Date.now().toString(),
        ...form,
        type: 'customer',
        balance: 0,
        createdAt: new Date().toISOString().split('T')[0],
      });
      toast.success("Party added");
    }
    setForm({ name: "", phone: "", address: "", gst: "" });
    setEditingParty(null);
    setOpen(false);
  };

  const handleEdit = (party: Party) => {
    setEditingParty(party);
    setForm({ name: party.name, phone: party.phone, address: party.address, gst: party.gst || "" });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteParty(id);
    toast.success("Party deleted");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Parties</h1>
            <p className="text-sm text-muted-foreground mt-1">{parties.length} customers</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingParty(null); setForm({ name: "", phone: "", address: "", gst: "" }); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Party</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingParty ? "Edit Party" : "Add New Party"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer name" /></div>
                <div><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" /></div>
                <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" /></div>
                <div><Label>GST Number (Optional)</Label><Input value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} placeholder="GSTIN" /></div>
                <Button onClick={handleSubmit} className="w-full">{editingParty ? "Update" : "Add Party"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parties..." className="pl-9" />
        </div>

        <div className="grid gap-3">
          {filtered.map((party, i) => (
            <motion.div
              key={party.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-4 card-shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{party.name[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{party.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{party.phone}</span>
                    {party.address && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{party.address}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`text-sm font-semibold ${party.balance >= 0 ? 'text-receivable' : 'text-payable'}`}>
                  ₹{Math.abs(party.balance).toLocaleString('en-IN')}
                </p>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(party)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(party.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Parties;
