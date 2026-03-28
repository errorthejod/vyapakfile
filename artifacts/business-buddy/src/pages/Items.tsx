import { useState } from "react";
import Layout from "@/components/Layout";
import { useCurrentStore as useStore } from "@/store/useCurrentStore";
import { Item } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Edit, Package } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Items = () => {
  const { items, addItem, updateItem, deleteItem } = useStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [form, setForm] = useState({ name: "", price: "", gstPercent: "18", stock: "", unit: "Pcs", hsn: "" });

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    const data = { name: form.name, price: Number(form.price), gstPercent: Number(form.gstPercent), stock: Number(form.stock), unit: form.unit, hsn: form.hsn };
    if (editingItem) {
      updateItem(editingItem.id, data);
      toast.success("Item updated");
    } else {
      addItem({ id: Date.now().toString(), ...data });
      toast.success("Item added");
    }
    setForm({ name: "", price: "", gstPercent: "18", stock: "", unit: "Pcs", hsn: "" });
    setEditingItem(null);
    setOpen(false);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setForm({ name: item.name, price: String(item.price), gstPercent: String(item.gstPercent), stock: String(item.stock), unit: item.unit, hsn: item.hsn || "" });
    setOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Items</h1>
            <p className="text-sm text-muted-foreground mt-1">{items.length} products</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingItem(null); setForm({ name: "", price: "", gstPercent: "18", stock: "", unit: "Pcs", hsn: "" }); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Price (₹) *</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" /></div>
                  <div><Label>GST %</Label><Input type="number" value={form.gstPercent} onChange={e => setForm({ ...form, gstPercent: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" /></div>
                  <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
                </div>
                <div><Label>HSN Code</Label><Input value={form.hsn} onChange={e => setForm({ ...form, hsn: e.target.value })} placeholder="HSN Code" /></div>
                <Button onClick={handleSubmit} className="w-full">{editingItem ? "Update" : "Add Item"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="pl-9" />
        </div>

        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Item</th>
                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">GST</th>
                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Stock</th>
                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        {item.hsn && <p className="text-xs text-muted-foreground">HSN: {item.hsn}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right text-sm font-semibold text-foreground">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-center"><span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{item.gstPercent}%</span></td>
                  <td className="p-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.stock > 10 ? 'bg-success/10 text-success' : item.stock > 0 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                      {item.stock} {item.unit}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { deleteItem(item.id); toast.success("Item deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Items;
