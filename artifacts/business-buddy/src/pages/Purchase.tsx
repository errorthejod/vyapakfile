import { useState } from "react";
import Layout from "@/components/Layout";
import { useCurrentStore as useStore } from "@/store/useCurrentStore";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingBag, Eye, Trash2, Search, TrendingDown, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Purchase = () => {
  const { invoices, deleteInvoice } = useStore();
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Invoice | null>(null);
  const [search, setSearch] = useState("");

  const purchaseInvoices = invoices
    .filter(i => i.type === "purchase")
    .slice()
    .reverse();

  const filtered = purchaseInvoices.filter(i =>
    i.partyName.toLowerCase().includes(search.toLowerCase()) ||
    i.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalPurchase = purchaseInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalItems = purchaseInvoices.reduce((s, i) => s + i.items.length, 0);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const thisMonthTotal = purchaseInvoices
    .filter(i => i.date >= thisMonthStart)
    .reduce((s, i) => s + i.totalAmount, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Purchase</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your stock purchases from suppliers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Purchase", value: `₹${totalPurchase.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "This Month", value: `₹${thisMonthTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: TrendingDown, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Orders", value: purchaseInvoices.length, icon: Package, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-card rounded-xl p-4 card-shadow flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by supplier or purchase number..." className="pl-9" />
        </div>

        {/* List */}
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-heading font-semibold flex items-center gap-2 text-sm">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              All Purchases ({filtered.length})
            </h3>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-25" />
              <p className="font-medium">{search ? "No results found" : "No purchases yet"}</p>
              <p className="text-sm mt-1">{search ? "Try a different search" : "Click 'Add Purchase' to record your first purchase"}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((inv, i) => (
                <motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <ShoppingBag className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.partyName} · {inv.date} · {inv.items.length} item(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-emerald-700 mr-1">
                      ₹{inv.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => setViewInvoice(inv)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete" onClick={() => setConfirmDelete(inv)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>



        {/* View Detail Dialog */}
        <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
                {viewInvoice?.invoiceNumber}
              </DialogTitle>
            </DialogHeader>
            {viewInvoice && (
              <div className="space-y-3 mt-1">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Supplier</span><p className="font-semibold">{viewInvoice.partyName}</p></div>
                  <div><span className="text-muted-foreground">Date</span><p className="font-semibold">{viewInvoice.date}</p></div>
                  {viewInvoice.partyPhone && <div><span className="text-muted-foreground">Phone</span><p className="font-semibold">{viewInvoice.partyPhone}</p></div>}
                  {viewInvoice.partyGst && <div><span className="text-muted-foreground">GSTIN</span><p className="font-semibold">{viewInvoice.partyGst}</p></div>}
                </div>

                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/60 border-b">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Item</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-muted-foreground">Qty</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Rate</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewInvoice.items.map((item, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-3 py-2">
                            <p className="font-medium">{item.name}</p>
                            {(item as any).category && <p className="text-xs text-muted-foreground">{(item as any).category}</p>}
                          </td>
                          <td className="px-3 py-2 text-center">{item.qty}</td>
                          <td className="px-3 py-2 text-right">₹{item.rate.toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2 text-right font-semibold">₹{item.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-secondary/30 border-t px-4 py-2 flex justify-between font-bold text-sm">
                    <span>Total</span>
                    <span className="text-emerald-700">₹{viewInvoice.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                {viewInvoice.description && (
                  <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2">{viewInvoice.description}</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirm Delete */}
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Purchase</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Delete <span className="font-semibold text-foreground">{confirmDelete?.invoiceNumber}</span>? This cannot be undone. Note: stock will not be automatically reversed.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { confirmDelete && deleteInvoice(confirmDelete.id); toast.success("Purchase deleted"); setConfirmDelete(null); }}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Purchase;
