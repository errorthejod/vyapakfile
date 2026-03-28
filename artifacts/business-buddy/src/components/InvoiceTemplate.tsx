import { forwardRef } from "react";
import { Invoice, ShopInfo } from "@/types";

interface InvoiceTemplateProps {
  invoice: Invoice;
  shopInfo: ShopInfo;
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ invoice, shopInfo }, ref) => {
    const toWords = (num: number): string => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      if (num === 0) return 'Zero';
      const n = Math.floor(num);
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + toWords(n % 100) : '');
      if (n < 100000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
      if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '');
      return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '');
    };

    return (
      <div ref={ref} className="invoice-print bg-white text-black p-8 max-w-[210mm] mx-auto" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', lineHeight: '1.4' }}>
        <div style={{ borderBottom: '3px solid #1a1a1a', paddingBottom: '12px', marginBottom: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px', letterSpacing: '1px' }}>{shopInfo.name}</h1>
            <p style={{ fontSize: '12px', margin: '2px 0', color: '#444' }}>{shopInfo.address}</p>
            <p style={{ fontSize: '12px', margin: '2px 0', color: '#444' }}>Phone: {shopInfo.phone} | Email: {shopInfo.email}</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '4px 0' }}>GSTIN: {shopInfo.gst}</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', margin: '8px 0', padding: '6px', backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>TAX INVOICE</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', borderBottom: '1px solid #ccc', paddingBottom: '2px' }}>Bill To:</p>
            <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>{invoice.partyName}</p>
            <p style={{ fontSize: '12px', margin: '2px 0', color: '#444' }}>{invoice.partyAddress}</p>
            {invoice.partyGst && <p style={{ fontSize: '12px', margin: '2px 0' }}>GSTIN: {invoice.partyGst}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', margin: '2px 0' }}><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
            <p style={{ fontSize: '12px', margin: '2px 0' }}><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
              <th style={{ padding: '8px 6px', textAlign: 'left', fontSize: '11px', fontWeight: '600' }}>S.No</th>
              <th style={{ padding: '8px 6px', textAlign: 'left', fontSize: '11px', fontWeight: '600' }}>Item Description</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: '600' }}>HSN</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: '600' }}>Qty</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '11px', fontWeight: '600' }}>Rate</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '11px', fontWeight: '600' }}>GST%</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '11px', fontWeight: '600' }}>CGST</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '11px', fontWeight: '600' }}>SGST</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '11px', fontWeight: '600' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '7px 6px', fontSize: '12px' }}>{i + 1}</td>
                <td style={{ padding: '7px 6px', fontSize: '12px', fontWeight: '500' }}>{item.name}</td>
                <td style={{ padding: '7px 6px', fontSize: '12px', textAlign: 'center' }}>-</td>
                <td style={{ padding: '7px 6px', fontSize: '12px', textAlign: 'center' }}>{item.qty}</td>
                <td style={{ padding: '7px 6px', fontSize: '12px', textAlign: 'right' }}>₹{item.rate.toLocaleString('en-IN')}</td>
                <td style={{ padding: '7px 6px', fontSize: '12px', textAlign: 'right' }}>{item.gstPercent}%</td>
                <td style={{ padding: '7px 6px', fontSize: '12px', textAlign: 'right' }}>₹{item.cgst.toFixed(2)}</td>
                <td style={{ padding: '7px 6px', fontSize: '12px', textAlign: 'right' }}>₹{item.sgst.toFixed(2)}</td>
                <td style={{ padding: '7px 6px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>₹{item.amount.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <table style={{ width: '300px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '6px 8px', fontSize: '12px' }}>Sub Total</td>
                <td style={{ padding: '6px 8px', fontSize: '12px', textAlign: 'right' }}>₹{invoice.subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '6px 8px', fontSize: '12px' }}>CGST (9%)</td>
                <td style={{ padding: '6px 8px', fontSize: '12px', textAlign: 'right' }}>₹{invoice.totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '6px 8px', fontSize: '12px' }}>SGST (9%)</td>
                <td style={{ padding: '6px 8px', fontSize: '12px', textAlign: 'right' }}>₹{invoice.totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                <td style={{ padding: '8px', fontSize: '14px', fontWeight: 'bold' }}>Total</td>
                <td style={{ padding: '8px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ margin: '12px 0', padding: '8px', backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
          <p style={{ fontSize: '12px', margin: 0 }}>
            <strong>Amount in Words:</strong> {toWords(invoice.totalAmount)} Rupees Only
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '12px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#666', margin: '2px 0' }}>Terms & Conditions:</p>
            <p style={{ fontSize: '10px', color: '#888', margin: '2px 0' }}>1. Goods once sold will not be taken back.</p>
            <p style={{ fontSize: '10px', color: '#888', margin: '2px 0' }}>2. Subject to local jurisdiction only.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '40px' }}>For {shopInfo.name}</p>
            <div style={{ borderTop: '1px solid #333', paddingTop: '4px' }}>
              <p style={{ fontSize: '11px' }}>Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
InvoiceTemplate.displayName = "InvoiceTemplate";
