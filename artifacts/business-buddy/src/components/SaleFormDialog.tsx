import { useState, useRef } from "react";
import { useCurrentStore as useStore } from "@/store/useCurrentStore";
import { InvoiceItem, Invoice } from "@/types";
import { InvoiceTemplate } from "@/components/InvoiceTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText, Printer, Download } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SuggestionInput = ({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string;
  onChange: (val: string, selected?: { id?: string; phone?: string; address?: string; gst?: string }) => void;
  suggestions: { label: string; id?: string; phone?: string; address?: string; gst?: string }[];
  placeholder: string;
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
      />
      {show && query && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-40 overflow-auto">
          {filtered.map((s, idx) => (
            <button
              key={s.id || idx}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onMouseDown={() => { setQuery(s.label); setShow(false); onChange(s.label, s); }}
            >
              {s.label}
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
        placeholder="Type product name"
      />
      {showSuggestions && query && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-40 overflow-auto">
          {filtered.map((item) => (
            <button
              key={item.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onMouseDown={() => { setQuery(item.name); setShowSuggestions(false); onChange(item.name, item.id, item.price, item.gstPercent, item.unit); }}
            >
              <span className="font-medium">{item.name}</span>
              <span className="ml-2 text-muted-foreground">₹{item.price}</span>
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

const calcItem = (item: InvoiceItem): InvoiceItem => {
  const amount = item.qty * item.rate;
  const gstAmount = (amount * item.gstPercent) / 100;
  return { ...item, amount, cgst: gstAmount / 2, sgst: gstAmount / 2 };
};

const defaultForm = () => ({
  partyId: "", partyName: "", partyAddress: "", partyGst: "",
  date: new Date().toISOString().split("T")[0],
  invoiceItems: [emptyItem()],
});

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SaleFormDialog({ open, onClose }: Props) {
  const { parties, items, invoices, addInvoice, shopInfo } = useStore();
  const [form, setForm] = useState(defaultForm());
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const partySuggestions = parties.map((p) => ({
    label: p.name, id: p.id, phone: p.phone, address: p.address, gst: p.gst,
  }));

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    setForm((prev) => {
      const newItems = [...prev.invoiceItems];
      newItems[index] = calcItem({ ...newItems[index], ...updates });
      return { ...prev, invoiceItems: newItems };
    });
  };

  const addItemRow = () => setForm((prev) => ({ ...prev, invoiceItems: [...prev.invoiceItems, emptyItem()] }));
  const removeItemRow = (index: number) => setForm((prev) => ({ ...prev, invoiceItems: prev.invoiceItems.filter((_, i) => i !== index) }));

  const subtotal = form.invoiceItems.reduce((s, i) => s + i.amount, 0);
  const totalCgst = form.invoiceItems.reduce((s, i) => s + i.cgst, 0);
  const totalSgst = form.invoiceItems.reduce((s, i) => s + i.sgst, 0);
  const totalAmount = subtotal + totalCgst + totalSgst;

  const handleSave = () => {
    if (!form.partyName) { toast.error("Please select a customer"); return; }
    if (form.invoiceItems.some((i) => !i.name || i.rate <= 0)) { toast.error("Please fill all item details"); return; }

    const invNum = `INV-${String(invoices.filter((i) => i.type === "sale").length + 1).padStart(3, "0")}`;
    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: invNum,
      date: form.date,
      partyId: form.partyId,
      partyName: form.partyName,
      partyAddress: form.partyAddress,
      partyGst: form.partyGst,
      items: form.invoiceItems,
      subtotal, totalCgst, totalSgst, totalAmount,
      type: "sale",
      createdAt: new Date().toISOString(),
    };
    addInvoice(invoice);
    toast.success(`Invoice ${invNum} saved!`);
    setSavedInvoice(invoice);
    setForm(defaultForm());
  };

  const handlePrint = () => window.print();

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
    setForm(defaultForm());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {savedInvoice ? "Invoice Saved" : "New Sale Invoice"}
            {savedInvoice && (
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
                <Button size="sm" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {savedInvoice ? (
          <div>
            <InvoiceTemplate ref={invoiceRef} invoice={savedInvoice} shopInfo={shopInfo} />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setSavedInvoice(null)}>Create Another</Button>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Customer Name *</Label>
                <SuggestionInput
                  value={form.partyName}
                  suggestions={partySuggestions}
                  placeholder="Select or type customer name"
                  onChange={(val, selected) => {
                    setForm((prev) => ({
                      ...prev,
                      partyName: val,
                      partyId: selected?.id || "",
                      partyAddress: selected?.address || prev.partyAddress,
                      partyGst: selected?.gst || prev.partyGst,
                    }));
                  }}
                />
              </div>
              <div>
                <Label>Invoice Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
              </div>
              <div>
                <Label>Customer Address</Label>
                <Input value={form.partyAddress} onChange={(e) => setForm((prev) => ({ ...prev, partyAddress: e.target.value }))} placeholder="Address" />
              </div>
              <div>
                <Label>Customer GSTIN</Label>
                <Input value={form.partyGst} onChange={(e) => setForm((prev) => ({ ...prev, partyGst: e.target.value }))} placeholder="GSTIN (optional)" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-1">
                <div className="col-span-4">Item</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate (₹)</div>
                <div className="col-span-1 text-center">GST%</div>
                <div className="col-span-2 text-right">CGST</div>
                <div className="col-span-1 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>
              {form.invoiceItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <ProductInput
                      value={item.name}
                      items={items}
                      onChange={(name, itemId, rate, gstPercent) => {
                        updateItem(i, { name, itemId: itemId || "", rate: rate || 0, gstPercent: gstPercent || 18 });
                      }}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input type="number" min={1} value={item.qty} onChange={(e) => updateItem(i, { qty: Number(e.target.value) })} className="text-center" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.rate} onChange={(e) => updateItem(i, { rate: Number(e.target.value) })} className="text-right" />
                  </div>
                  <div className="col-span-1">
                    <Select value={String(item.gstPercent)} onValueChange={(v) => updateItem(i, { gstPercent: Number(v) })}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[0, 5, 12, 18, 28].map((g) => <SelectItem key={g} value={String(g)}>{g}%</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 text-right text-sm text-muted-foreground px-2">₹{item.cgst.toFixed(2)}</div>
                  <div className="col-span-1 text-right text-sm font-medium px-2">₹{item.amount.toLocaleString('en-IN')}</div>
                  <div className="col-span-1 flex justify-center">
                    {form.invoiceItems.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeItemRow(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItemRow}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">CGST</span><span>₹{totalCgst.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">SGST</span><span>₹{totalSgst.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold border-t pt-1.5"><span>Total</span><span className="text-primary">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} size="lg"><FileText className="h-4 w-4 mr-2" />Save Invoice</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
