import { useState, useRef } from "react";
import { useCurrentStore as useStore } from "@/store/useCurrentStore";
import { InvoiceItem, Invoice } from "@/types";
import { InvoiceTemplate } from "@/components/InvoiceTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText, Printer, Download, User, Calendar, Hash } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function getFinancialYear(dateStr: string): string {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

const SuggestionInput = ({
  value,
  onChange,
  suggestions,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (val: string, selected?: { id?: string; phone?: string; address?: string; gst?: string }) => void;
  suggestions: { label: string; id?: string; phone?: string; address?: string; gst?: string }[];
  placeholder: string;
  className?: string;
}) => {
  const [query, setQuery] = useState(value);
  const [show, setShow] = useState(false);
  const filtered = suggestions.filter((s) =>
    s.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShow(true);
          onChange(e.target.value);
        }}
        onFocus={(e) => { setShow(true); e.target.select(); }}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {show && query && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-44 overflow-auto">
          {filtered.map((s, idx) => (
            <button
              key={s.id || idx}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent/10 border-b border-border/40 last:border-0"
              onMouseDown={() => { setQuery(s.label); setShow(false); onChange(s.label, s); }}
            >
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
  value,
  onChange,
  items: productList,
}: {
  value: string;
  onChange: (name: string, itemId?: string, rate?: number, gstPercent?: number, unit?: string) => void;
  items: { id: string; name: string; price: number; gstPercent: number; unit: string }[];
}) => {
  const [query, setQuery] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filtered = productList.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); onChange(e.target.value); }}
        onFocus={(e) => { setShowSuggestions(true); e.target.select(); }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Item / Service name"
        className="text-sm"
      />
      {showSuggestions && query && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-44 overflow-auto">
          {filtered.map((item) => (
            <button
              key={item.id}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent/10 border-b border-border/40 last:border-0"
              onMouseDown={() => { setQuery(item.name); setShowSuggestions(false); onChange(item.name, item.id, item.price, item.gstPercent, item.unit); }}
            >
              <span className="font-medium">{item.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">₹{item.price}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const emptyItem = (): InvoiceItem => ({
  itemId: "", name: "", qty: 1, rate: 0, gstPercent: 18, amount: 0, cgst: 0, sgst: 0,
});

const calcFromRate = (item: InvoiceItem): InvoiceItem => {
  const baseAmount = item.qty * item.rate;
  const gstAmount = (baseAmount * item.gstPercent) / 100;
  const amount = baseAmount + gstAmount;
  return { ...item, amount, cgst: gstAmount / 2, sgst: gstAmount / 2 };
};

const calcFromAmount = (item: InvoiceItem): InvoiceItem => {
  const divisor = 1 + item.gstPercent / 100;
  const baseAmount = divisor > 0 ? item.amount / divisor : item.amount;
  const gstAmount = item.amount - baseAmount;
  const rate = item.qty > 0 ? baseAmount / item.qty : 0;
  return { ...item, rate, cgst: gstAmount / 2, sgst: gstAmount / 2 };
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SaleFormDialog({ open, onClose }: Props) {
  const { parties, items, invoices, addInvoice, shopInfo } = useStore();
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const getNextInvoiceNum = (offset = 0) => {
    const count = invoices.filter((i) => i.type === "sale").length + 1 + offset;
    return `INV-${String(count).padStart(3, "0")}`;
  };

  const makeDefaultForm = () => {
    const today = new Date().toISOString().split("T")[0];
    return {
      partyId: "", partyName: "", partyAddress: "", partyPhone: "", partyGst: "",
      date: today,
      invoiceItems: [emptyItem()],
      invoiceYear: getFinancialYear(today),
      invoiceNumber: getNextInvoiceNum(),
    };
  };

  const [form, setForm] = useState(makeDefaultForm());

  const updateItem = (index: number, updates: Partial<InvoiceItem>, fromAmount = false) => {
    setForm((prev) => {
      const newItems = [...prev.invoiceItems];
      const merged = { ...newItems[index], ...updates };
      newItems[index] = fromAmount ? calcFromAmount(merged) : calcFromRate(merged);
      return { ...prev, invoiceItems: newItems };
    });
  };

  const addItemRow = () => setForm((prev) => ({ ...prev, invoiceItems: [...prev.invoiceItems, emptyItem()] }));
  const removeItemRow = (index: number) => setForm((prev) => ({ ...prev, invoiceItems: prev.invoiceItems.filter((_, i) => i !== index) }));

  const totalCgst = form.invoiceItems.reduce((s, i) => s + i.cgst, 0);
  const totalSgst = form.invoiceItems.reduce((s, i) => s + i.sgst, 0);
  const igst = totalCgst + totalSgst;
  const totalAmount = form.invoiceItems.reduce((s, i) => s + i.amount, 0);
  const subtotal = totalAmount - igst;

  const handleSave = () => {
    if (!form.partyName) { toast.error("Please enter customer name"); return; }
    if (form.invoiceItems.some((i) => !i.name || i.amount <= 0)) { toast.error("Please fill all item details"); return; }

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: form.invoiceNumber,
      invoiceYear: form.invoiceYear,
      date: form.date,
      partyId: form.partyId,
      partyName: form.partyName,
      partyAddress: form.partyAddress,
      partyPhone: form.partyPhone,
      partyGst: form.partyGst,
      items: form.invoiceItems,
      subtotal, totalCgst, totalSgst,
      igst,
      totalAmount,
      type: "sale",
      createdAt: new Date().toISOString(),
    };
    addInvoice(invoice);
    toast.success(`Invoice ${form.invoiceNumber} saved!`);
    setSavedInvoice(invoice);
    const today = new Date().toISOString().split("T")[0];
    setForm({
      partyId: "", partyName: "", partyAddress: "", partyPhone: "", partyGst: "",
      date: today,
      invoiceItems: [emptyItem()],
      invoiceYear: getFinancialYear(today),
      invoiceNumber: getNextInvoiceNum(1),
    });
  };

  const handlePrint = (invoice: Invoice) => {
    const content = invoiceRef.current;
    if (!content) return;
    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) { toast.error("Popup blocked. Please allow popups."); return; }
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #000; background: #fff; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); printWin.close(); }, 400);
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    toast.info("Generating PDF...");
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${savedInvoice?.invoiceNumber || "invoice"}.pdf`);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleClose = () => {
    setSavedInvoice(null);
    setForm(makeDefaultForm());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-auto p-0">
        {savedInvoice ? (
          <div>
            <div className="flex items-center justify-between px-5 py-3 border-b bg-card">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                {savedInvoice.invoiceNumber} — Saved
              </DialogTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePrint(savedInvoice)}>
                  <Printer className="h-4 w-4 mr-1.5" /> Print
                </Button>
                <Button size="sm" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-1.5" /> PDF
                </Button>
              </div>
            </div>
            <div className="p-4">
              <InvoiceTemplate ref={invoiceRef} invoice={savedInvoice} shopInfo={shopInfo} />
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <Button variant="outline" onClick={() => setSavedInvoice(null)}>+ Create Another</Button>
                <Button onClick={handleClose}>Done</Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between px-5 py-3.5 border-b bg-primary text-primary-foreground">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold text-primary-foreground">
                <FileText className="h-4 w-4" />
                New Sale Invoice
              </DialogTitle>
              <div className="flex items-center gap-4 text-xs text-primary-foreground/80">
                <span className="flex items-center gap-1 font-medium opacity-90">FY {form.invoiceYear}</span>
                <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{form.invoiceNumber}</span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <User className="h-3 w-3" /> Customer Name *
                  </Label>
                  <SuggestionInput
                    value={form.partyName}
                    suggestions={parties.map((p) => ({
                      label: p.name, id: p.id, phone: p.phone, address: p.address, gst: p.gst,
                    }))}
                    placeholder="Select or type name"
                    onChange={(val, selected) => {
                      setForm((prev) => ({
                        ...prev,
                        partyName: val,
                        partyId: selected?.id || "",
                        partyPhone: selected?.phone || prev.partyPhone,
                        partyAddress: selected?.address || prev.partyAddress,
                        partyGst: selected?.gst || prev.partyGst,
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Phone</Label>
                  <Input
                    value={form.partyPhone}
                    onChange={(e) => setForm((prev) => ({ ...prev, partyPhone: e.target.value }))}
                    placeholder="Mobile no."
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Invoice Date
                  </Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => {
                      const d = e.target.value;
                      setForm((prev) => ({ ...prev, date: d, invoiceYear: getFinancialYear(d) }));
                    }}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Bill No
                  </Label>
                  <Input
                    value={form.invoiceNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="INV-001"
                    className="text-sm font-medium"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">GSTIN</Label>
                  <Input value={form.partyGst} onChange={(e) => setForm((prev) => ({ ...prev, partyGst: e.target.value }))} placeholder="Optional" className="text-sm" />
                </div>
                <div className="md:col-span-5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Address</Label>
                  <Input value={form.partyAddress} onChange={(e) => setForm((prev) => ({ ...prev, partyAddress: e.target.value }))} placeholder="Customer address (optional)" className="text-sm" />
                </div>
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-12 gap-0 bg-slate-700 dark:bg-slate-800 text-white text-xs font-semibold">
                  <div className="col-span-4 px-3 py-2.5">#  Item / Service</div>
                  <div className="col-span-1 px-2 py-2.5 text-center">Qty</div>
                  <div className="col-span-2 px-2 py-2.5 text-right">Rate (₹)</div>
                  <div className="col-span-1 px-1 py-2.5 text-center">GST%</div>
                  <div className="col-span-2 px-2 py-2.5 text-right">CGST</div>
                  <div className="col-span-2 px-2 py-2.5 text-right">Amount (₹)</div>
                </div>
                <div className="divide-y divide-border">
                  {form.invoiceItems.map((item, i) => (
                    <div key={i} className={`grid grid-cols-12 gap-0 items-center ${i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                      <div className="col-span-4 px-2 py-1.5 flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                        <ProductInput
                          value={item.name}
                          items={items}
                          onChange={(name, itemId, rate, gstPercent) => {
                            updateItem(i, { name, itemId: itemId || "", rate: rate || 0, gstPercent: gstPercent || 18 });
                          }}
                        />
                      </div>
                      <div className="col-span-1 px-1 py-1.5">
                        <Input type="number" min={1} value={item.qty}
                          onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                          className="text-center text-sm h-8 px-1" />
                      </div>
                      <div className="col-span-2 px-1 py-1.5">
                        <Input type="number" value={item.rate}
                          onChange={(e) => updateItem(i, { rate: Number(e.target.value) })}
                          className="text-right text-sm h-8 px-2" />
                      </div>
                      <div className="col-span-1 px-1 py-1.5">
                        <Select value={String(item.gstPercent)} onValueChange={(v) => updateItem(i, { gstPercent: Number(v) })}>
                          <SelectTrigger className="text-xs h-8 px-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[0, 5, 12, 18, 28].map((g) => <SelectItem key={g} value={String(g)}>{g}%</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 px-2 py-1.5 text-right text-xs text-muted-foreground">
                        ₹{item.cgst.toFixed(2)}
                      </div>
                      <div className="col-span-2 px-1 py-1.5 flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.amount === 0 ? "" : item.amount}
                          onChange={(e) => updateItem(i, { amount: Number(e.target.value) }, true)}
                          className="text-right text-sm h-8 px-2 font-semibold"
                          placeholder="0"
                        />
                        {form.invoiceItems.length > 1 && (
                          <button onClick={() => removeItemRow(i)} className="text-destructive hover:text-destructive/80 shrink-0">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 bg-muted/20 border-t">
                  <Button variant="ghost" size="sm" onClick={addItemRow} className="text-primary hover:text-primary text-xs gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Item
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-72 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-2 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sub Total</span>
                      <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CGST</span>
                      <span>₹{totalCgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SGST</span>
                      <span>₹{totalSgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1.5">
                      <span className="text-muted-foreground">IGST <span className="text-xs opacity-60">(CGST+SGST)</span></span>
                      <span>₹{igst.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 bg-primary text-primary-foreground font-bold text-sm">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 border-t">
                <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground">Cancel</Button>
                <Button onClick={handleSave} size="default" className="px-8">
                  <FileText className="h-4 w-4 mr-2" /> Save Invoice
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
