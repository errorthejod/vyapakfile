import { useState, useEffect } from "react";
import { useCurrentStore as useStore } from "@/store/useCurrentStore";
import { InvoiceItem, Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ShoppingBag, User, Calendar, Hash, Package } from "lucide-react";
import { toast } from "sonner";
import { ITEM_CATEGORIES, GST_RATES } from "@/lib/constants";

const SuggestionInput = ({
  value, onChange, suggestions, placeholder,
}: {
  value: string;
  onChange: (val: string, selected?: { id?: string; phone?: string; address?: string; gst?: string }) => void;
  suggestions: { label: string; id?: string; phone?: string; address?: string; gst?: string }[];
  placeholder: string;
}) => {
  const [query, setQuery] = useState(value);
  const [show, setShow] = useState(false);
  const filtered = suggestions.filter(s => s.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { setQuery(value); }, [value]);

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={e => { setQuery(e.target.value); setShow(true); onChange(e.target.value); }}
        onFocus={e => { setShow(true); e.target.select(); }}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={placeholder}
      />
      {show && query && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-44 overflow-auto">
          {filtered.map((s, i) => (
            <button key={s.id || i} className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent/10 border-b last:border-0"
              onMouseDown={() => { setQuery(s.label); setShow(false); onChange(s.label, s); }}>
              <span className="font-medium">{s.label}</span>
              {s.phone && <span className="ml-2 text-xs text-muted-foreground">{s.phone}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductInput = ({
  value, onChange, items: productList,
}: {
  value: string;
  onChange: (name: string, itemId?: string, rate?: number, gstPercent?: number, unit?: string, category?: string) => void;
  items: { id: string; name: string; price: number; gstPercent: number; unit: string; category?: string }[];
}) => {
  const [query, setQuery] = useState(value);
  const [show, setShow] = useState(false);
  const filtered = productList.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { setQuery(value); }, [value]);

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={e => { setQuery(e.target.value); setShow(true); onChange(e.target.value); }}
        onFocus={e => { setShow(true); e.target.select(); }}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder="Item name"
        className="text-sm"
      />
      {show && query && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-44 overflow-auto">
          {filtered.map(item => (
            <button key={item.id} className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent/10 border-b last:border-0"
              onMouseDown={() => { setQuery(item.name); setShow(false); onChange(item.name, item.id, item.price, item.gstPercent, item.unit, item.category); }}>
              <span className="font-medium">{item.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">₹{item.price} · Stock: {(item as any).stock ?? 0}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface PurchaseItem extends InvoiceItem {
  category?: string;
  hsn?: string;
}

const emptyItem = (): PurchaseItem => ({
  itemId: "", name: "", qty: 1, rate: 0, gstPercent: 18, amount: 0, cgst: 0, sgst: 0, category: "", hsn: "",
});

const calcFromRate = (item: PurchaseItem): PurchaseItem => {
  const base = item.qty * item.rate;
  const gst = (base * item.gstPercent) / 100;
  return { ...item, amount: base + gst, cgst: gst / 2, sgst: gst / 2 };
};

const calcFromAmount = (item: PurchaseItem): PurchaseItem => {
  const divisor = 1 + item.gstPercent / 100;
  const base = divisor > 0 ? item.amount / divisor : item.amount;
  const gst = item.amount - base;
  const rate = item.qty > 0 ? base / item.qty : 0;
  return { ...item, rate, cgst: gst / 2, sgst: gst / 2 };
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PurchaseFormDialog({ open, onClose }: Props) {
  const { parties, items, invoices, addInvoice, addParty, addItem, updateItem } = useStore();

  const suppliers = parties.filter(p => p.type === "supplier" || true);

  const getNextPurchaseNum = () => {
    const count = invoices.filter(i => i.type === "purchase").length + 1;
    return `pur.${String(count).padStart(4, "0")}`;
  };

  const makeDefault = () => ({
    supplierId: "", supplierName: "", supplierAddress: "", supplierPhone: "", supplierGst: "",
    date: new Date().toISOString().split("T")[0],
    purchaseNumber: getNextPurchaseNum(),
    purchaseItems: [emptyItem()],
    description: "",
  });

  const [form, setForm] = useState(makeDefault());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) { setForm(makeDefault()); setSaved(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const totalCgst = form.purchaseItems.reduce((s, i) => s + i.cgst, 0);
  const totalSgst = form.purchaseItems.reduce((s, i) => s + i.sgst, 0);
  const totalAmount = form.purchaseItems.reduce((s, i) => s + i.amount, 0);
  const subtotal = totalAmount - totalCgst - totalSgst;

  const updateRow = (index: number, updates: Partial<PurchaseItem>, fromAmount = false) => {
    setForm(prev => {
      const rows = [...prev.purchaseItems];
      const merged = { ...rows[index], ...updates };
      rows[index] = fromAmount ? calcFromAmount(merged) : calcFromRate(merged);
      return { ...prev, purchaseItems: rows };
    });
  };

  const addRow = () => setForm(prev => ({ ...prev, purchaseItems: [...prev.purchaseItems, emptyItem()] }));
  const removeRow = (i: number) => setForm(prev => ({ ...prev, purchaseItems: prev.purchaseItems.filter((_, idx) => idx !== i) }));

  const handleSave = () => {
    if (!form.supplierName) { toast.error("Please enter supplier name"); return; }
    if (form.purchaseItems.some(i => !i.name || i.amount <= 0)) { toast.error("Please fill all item details"); return; }

    // Auto-save supplier
    const supplierExists = parties.some(p => p.name.trim().toLowerCase() === form.supplierName.trim().toLowerCase());
    let savedSupplierId = form.supplierId;
    if (!supplierExists) {
      const newSupplier = {
        id: `party-${Date.now()}`,
        name: form.supplierName.trim(),
        phone: form.supplierPhone || "",
        address: form.supplierAddress || "",
        gst: form.supplierGst || undefined,
        type: "supplier" as const,
        balance: 0,
        createdAt: new Date().toISOString(),
      };
      addParty(newSupplier);
      savedSupplierId = newSupplier.id;
    }

    // Auto-save new items (stock will be auto-added by addInvoice)
    form.purchaseItems.forEach(pi => {
      if (!pi.name) return;
      const existingItem = items.find(it => it.name.trim().toLowerCase() === pi.name.trim().toLowerCase());
      if (!existingItem) {
        addItem({
          id: pi.itemId || `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: pi.name.trim(),
          category: pi.category || "",
          price: pi.rate,
          gstPercent: pi.gstPercent,
          stock: 0,
          unit: "Pcs",
          hsn: pi.hsn,
        });
      } else if (pi.category && !existingItem.category) {
        updateItem(existingItem.id, { category: pi.category });
      }
    });

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: form.purchaseNumber,
      date: form.date,
      partyId: savedSupplierId,
      partyName: form.supplierName,
      partyAddress: form.supplierAddress,
      partyPhone: form.supplierPhone,
      partyGst: form.supplierGst,
      items: form.purchaseItems,
      subtotal,
      totalCgst,
      totalSgst,
      igst: totalCgst + totalSgst,
      totalAmount,
      description: form.description || undefined,
      type: "purchase",
      createdAt: new Date().toISOString(),
    };

    addInvoice(invoice);
    toast.success(`Purchase ${form.purchaseNumber} saved! Stock updated.`);
    setSaved(true);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-auto p-0">
        {saved ? (
          <div>
            <div className="flex items-center justify-between px-5 py-3 border-b bg-card">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
                {form.purchaseNumber} — Saved
              </DialogTitle>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-emerald-800">Purchase saved successfully!</p>
                <p className="text-xs text-emerald-700 mt-1">Stock has been automatically updated for all items.</p>
              </div>
              <div className="bg-card rounded-xl border p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Supplier</span><span className="font-medium">{form.supplierName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span>{form.date}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Items</span><span>{form.purchaseItems.length} item(s)</span></div>
                <div className="flex justify-between text-sm border-t pt-2 mt-2"><span className="font-semibold">Total Amount</span><span className="font-bold text-emerald-700">₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setSaved(false); setForm(makeDefault()); }}>+ Add Another</Button>
                <Button onClick={onClose}>Done</Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between px-5 py-3.5 border-b bg-emerald-700 text-white">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold text-white">
                <ShoppingBag className="h-4 w-4" />
                New Purchase
              </DialogTitle>
              <div className="flex items-center gap-4 text-xs text-white/80">
                <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{form.purchaseNumber}</span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Supplier Info */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <User className="h-3 w-3" /> Supplier Name *
                  </Label>
                  <SuggestionInput
                    value={form.supplierName}
                    suggestions={parties.filter(p => p.type === "supplier").map(p => ({
                      label: p.name, id: p.id, phone: p.phone, address: p.address, gst: p.gst,
                    }))}
                    placeholder="Supplier name"
                    onChange={(val, sel) => setForm(prev => ({
                      ...prev, supplierName: val,
                      supplierId: sel?.id || "",
                      supplierPhone: sel?.phone || prev.supplierPhone,
                      supplierAddress: sel?.address || prev.supplierAddress,
                      supplierGst: sel?.gst || prev.supplierGst,
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Phone</Label>
                  <Input value={form.supplierPhone} onChange={e => setForm(p => ({ ...p, supplierPhone: e.target.value }))} placeholder="Phone" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">GST No.</Label>
                  <Input value={form.supplierGst} onChange={e => setForm(p => ({ ...p, supplierGst: e.target.value }))} placeholder="GSTIN" className="uppercase" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date
                  </Label>
                  <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Supplier Address</Label>
                <Input value={form.supplierAddress} onChange={e => setForm(p => ({ ...p, supplierAddress: e.target.value }))} placeholder="Address (optional)" />
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Package className="h-3 w-3" /> Items Purchased
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
                  </Button>
                </div>

                <div className="rounded-xl border overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-1 bg-secondary/60 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    <div className="col-span-3">Item</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-2 text-right">Rate (₹)</div>
                    <div className="col-span-1 text-center">GST%</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1"></div>
                  </div>

                  {form.purchaseItems.map((row, i) => (
                    <div key={i} className="grid grid-cols-12 gap-1 px-3 py-2 border-t items-center">
                      <div className="col-span-3">
                        <ProductInput
                          value={row.name}
                          items={items}
                          onChange={(name, id, rate, gst, unit, cat) => updateRow(i, {
                            name, itemId: id || "", rate: rate ?? row.rate,
                            gstPercent: gst ?? row.gstPercent,
                            category: cat || row.category,
                          })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Select value={row.category || ""} onValueChange={v => updateRow(i, { category: v })}>
                          <SelectTrigger className="text-xs h-9">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent className="max-h-56 overflow-y-auto">
                            {ITEM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Input type="number" min={1} value={row.qty} onChange={e => updateRow(i, { qty: Number(e.target.value) || 1 })} className="text-center text-sm h-9" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min={0} value={row.rate || ""} onChange={e => updateRow(i, { rate: Number(e.target.value) })} className="text-right text-sm h-9" placeholder="0" />
                      </div>
                      <div className="col-span-1">
                        <Select value={String(row.gstPercent)} onValueChange={v => updateRow(i, { gstPercent: Number(v) })}>
                          <SelectTrigger className="text-xs h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GST_RATES.map(g => <SelectItem key={g} value={String(g)}>{g === 0 ? "Non-GST" : `${g}%`}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          value={row.amount === 0 ? "" : row.amount}
                          onChange={e => updateRow(i, { amount: Number(e.target.value) }, true)}
                          className="text-right text-sm h-9 font-semibold px-2"
                          placeholder="0"
                        />
                        {form.purchaseItems.length > 1 && (
                          <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="col-span-1"></div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="bg-secondary/30 border-t px-4 py-3 space-y-1">
                    {totalCgst > 0 && (
                      <>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>CGST</span><span>₹{totalCgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>SGST</span><span>₹{totalSgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-bold text-sm border-t pt-1 mt-1">
                      <span>Total</span>
                      <span className="text-emerald-700">₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Notes / Description</Label>
                <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional notes about this purchase" />
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave}>
                  <ShoppingBag className="h-4 w-4 mr-2" /> Save Purchase
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
