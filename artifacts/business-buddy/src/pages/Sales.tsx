import { useState, useRef } from "react";
import Layout from "@/components/Layout";
import { useCurrentStore as useStore } from "@/store/useCurrentStore";
import { Invoice } from "@/types";
import { InvoiceTemplate } from "@/components/InvoiceTemplate";
import { SaleFormDialog } from "@/components/SaleFormDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Printer, Download, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Sales = () => {
  const { invoices, shopInfo, deleteInvoice } = useStore();
  const [showInvoice, setShowInvoice] = useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Invoice | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const saleInvoices = invoices.filter((i) => i.type === "sale").slice().reverse();

  const handlePrint = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) { toast.error("Popup blocked. Please allow popups."); return; }
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${showInvoice?.invoiceNumber || "Invoice"}</title>
          <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; font-size: 13px; color: #000; background: #fff; }</style>
        </head>
        <body>${content.innerHTML}</body>
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
      pdf.save(`${showInvoice?.invoiceNumber || "invoice"}.pdf`);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleDelete = (inv: Invoice) => {
    deleteInvoice(inv.id);
    toast.success(`Invoice ${inv.invoiceNumber} deleted`);
    setConfirmDelete(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage your saved sales invoices</p>
        </div>

        <div className="bg-card rounded-xl p-5 card-shadow">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            All Invoices ({saleInvoices.length})
          </h3>
          {saleInvoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No invoices yet. Use "Add Sale" on the dashboard to create one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {saleInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.partyName} • {inv.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold mr-2">₹{inv.totalAmount.toLocaleString("en-IN")}</p>
                    <Button variant="ghost" size="icon" title="View" onClick={() => setShowInvoice(inv)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => setEditInvoice(inv)}>
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete" onClick={() => setConfirmDelete(inv)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Invoice Dialog */}
        <Dialog open={!!showInvoice} onOpenChange={() => setShowInvoice(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Invoice Preview</span>
                <div className="flex gap-2 no-print">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1" /> Print
                  </Button>
                  <Button size="sm" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            {showInvoice && <InvoiceTemplate ref={invoiceRef} invoice={showInvoice} shopInfo={shopInfo} />}
          </DialogContent>
        </Dialog>

        {/* Edit Invoice Dialog */}
        <SaleFormDialog
          open={!!editInvoice}
          onClose={() => setEditInvoice(null)}
          editInvoice={editInvoice}
        />

        {/* Confirm Delete Dialog */}
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Invoice</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">{confirmDelete?.invoiceNumber}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => confirmDelete && handleDelete(confirmDelete)}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Sales;
