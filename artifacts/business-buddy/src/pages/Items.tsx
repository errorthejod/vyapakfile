import { useState } from "react";
import Layout from "@/components/Layout";
import { useCurrentStore as useStore } from "@/store/useCurrentStore";
import { Item } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trash2, Edit, Package, AlertTriangle, IndianRupee, Boxes, TrendingUp, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const UNITS = ["Pcs", "Kg", "Gm", "Ltr", "Ml", "Mtr", "Ft", "Box", "Dozen", "Set", "Pair", "Roll"];

const emptyForm = () => ({ name: "", price: "", gstPercent: "18", stock: "", unit: "Pcs", hsn: "" });

const Items = () => {
  const { items, addItem, updateItem, deleteItem } = useStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [stockAdjust, setStockAdjust] = useState<{ item: Item; qty: string; mode: "add" | "reduce" } | null>(null);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const totalProducts = items.length;
  const totalStockValue = items.reduce((s, i) => s + i.price * i.stock, 0);
  const lowStockItems = items.filter(i => i.stock <= 5).length;
  const totalUnits = items.reduce((s, i) => s + i.stock, 0);

  const handleSubmit = () => {
    if (!form.name || !form.price) { toast.error("Name and price are required"); return; }
    const data = {
      name: form.name,
      price: Number(form.price),
      gstPercent: Number(form.gstPercent),
      stock: Number(form.stock) || 0,
      unit: form.unit,
      hsn: form.hsn,
    };
    if (editingItem) {
      updateItem(editingItem.id, data);
      toast.success("Product updated");
    } else {
      addItem({ id: Date.now().toString(), ...data });
      toast.success("Product added to stock");
    }
    setForm(emptyForm());
    setEditingItem(null);
    setOpen(false);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setForm({ name: item.name, price: String(item.price), gstPercent: String(item.gstPercent), stock: String(item.stock), unit: item.unit, hsn: item.hsn || "" });
    setOpen(true);
  };

  const handleStockAdjust = () => {
    if (!stockAdjust) return;
    const qty = Number(stockAdjust.qty);
    if (!qty || qty <= 0) { toast.error("Enter a valid quantity"); return; }
    const newStock = stockAdjust.mode === "add"
      ? stockAdjust.item.stock + qty
      : Math.max(0, stockAdjust.item.stock - qty);
    updateItem(stockAdjust.item.id, { stock: newStock });
    toast.success(`Stock ${stockAdjust.mode === "add" ? "added" : "reduced"} successfully`);
    setStockAdjust(null);
  };

  const stockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", cls: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" };
    if (stock <= 5) return { label: "Low Stock", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" };
    return { label: "In Stock", cls: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Stock Maintain</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your product inventory</p>
          </div>
          <Button onClick={() => { setEditingItem(null); setForm(emptyForm()); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, label: "Total Products", value: totalProducts, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { icon: Boxes, label: "Total Units", value: totalUnits.toLocaleString('en-IN'), color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
            { icon: IndianRupee, label: "Stock Value", value: `₹${totalStockValue.toLocaleString('en-IN')}`, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
            { icon: AlertTriangle, label: "Low / Out of Stock", value: lowStockItems, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-card rounded-xl p-4 card-shadow flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-lg font-bold text-foreground">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" />
        </div>

        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-25" />
              <p className="font-medium">No products found</p>
              <p className="text-sm mt-1">Add your first product to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Product</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">GST</th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Stock</th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Status</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Value</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const status = stockStatus(item.stock);
                  return (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.name}</p>
                            {item.hsn && <p className="text-xs text-muted-foreground">HSN: {item.hsn}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right text-sm font-bold text-foreground">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center">
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{item.gstPercent}%</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setStockAdjust({ item, qty: "", mode: "reduce" })}
                            className="h-5 w-5 rounded bg-red-100 hover:bg-red-200 dark:bg-red-950/40 flex items-center justify-center text-red-600 transition-colors"
                            title="Reduce stock"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-semibold min-w-[40px] text-center">{item.stock} <span className="text-xs text-muted-foreground font-normal">{item.unit}</span></span>
                          <button
                            onClick={() => setStockAdjust({ item, qty: "", mode: "add" })}
                            className="h-5 w-5 rounded bg-green-100 hover:bg-green-200 dark:bg-green-950/40 flex items-center justify-center text-green-600 transition-colors"
                            title="Add stock"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-center hidden md:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="p-3 text-right text-sm text-muted-foreground hidden md:table-cell">
                        ₹{(item.price * item.stock).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { deleteItem(item.id); toast.success("Product deleted"); }}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingItem(null); setForm(emptyForm()); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              {editingItem ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Product Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Samsung Galaxy M14" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">GST %</Label>
                <Select value={form.gstPercent} onValueChange={v => setForm({ ...form, gstPercent: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 5, 12, 18, 28].map(g => <SelectItem key={g} value={String(g)}>{g}%</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Opening Stock</Label>
                <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">HSN Code</Label>
              <Input value={form.hsn} onChange={e => setForm({ ...form, hsn: e.target.value })} placeholder="HSN / SAC Code (optional)" />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              {editingItem ? "Update Product" : "Add to Stock"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!stockAdjust} onOpenChange={(v) => { if (!v) setStockAdjust(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {stockAdjust?.mode === "add"
                ? <><Plus className="h-4 w-4 text-green-600" /> Add Stock</>
                : <><Minus className="h-4 w-4 text-red-600" /> Reduce Stock</>
              }
            </DialogTitle>
          </DialogHeader>
          {stockAdjust && (
            <div className="space-y-4 mt-2">
              <div className="bg-secondary/50 rounded-lg px-4 py-3">
                <p className="text-sm font-semibold">{stockAdjust.item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Current Stock: <span className="font-medium text-foreground">{stockAdjust.item.stock} {stockAdjust.item.unit}</span>
                </p>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">
                  Quantity to {stockAdjust.mode === "add" ? "Add" : "Reduce"}
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={stockAdjust.qty}
                  onChange={e => setStockAdjust(s => s ? { ...s, qty: e.target.value } : null)}
                  placeholder="Enter quantity"
                  autoFocus
                  onKeyDown={e => { if (e.key === "Enter") handleStockAdjust(); }}
                />
              </div>
              {stockAdjust.qty && Number(stockAdjust.qty) > 0 && (
                <div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2">
                  New Stock will be:{" "}
                  <span className="font-bold text-foreground">
                    {stockAdjust.mode === "add"
                      ? stockAdjust.item.stock + Number(stockAdjust.qty)
                      : Math.max(0, stockAdjust.item.stock - Number(stockAdjust.qty))
                    } {stockAdjust.item.unit}
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStockAdjust(null)}>Cancel</Button>
                <Button
                  className={`flex-1 ${stockAdjust.mode === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  onClick={handleStockAdjust}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Items;
