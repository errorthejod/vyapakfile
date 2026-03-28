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
      <div ref={ref} className="invoice-print bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', lineHeight: '1.5', maxWidth: '210mm', margin: '0 auto', padding: '10mm 12mm' }}>
        <div style={{ borderBottom: '3px solid #1e40af', paddingBottom: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 3px', color: '#1e3a8a', letterSpacing: '0.5px' }}>{shopInfo.name}</h1>
              <p style={{ fontSize: '12px', margin: '2px 0', color: '#555' }}>{shopInfo.address}</p>
              {shopInfo.phone && <p style={{ fontSize: '12px', margin: '2px 0', color: '#555' }}>📞 {shopInfo.phone}{shopInfo.email ? ` | ✉ ${shopInfo.email}` : ''}</p>}
              <div style={{ display: 'flex', gap: '16px', marginTop: '3px' }}>
                {shopInfo.gst && <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>GSTIN: {shopInfo.gst}</p>}
                {shopInfo.gtNo && <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>GT No: {shopInfo.gtNo}</p>}
              </div>
            </div>
            <div style={{ textAlign: 'right', backgroundColor: '#1e40af', color: 'white', padding: '8px 14px', borderRadius: '6px' }}>
              <p style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>TAX INVOICE</p>
              <p style={{ fontSize: '11px', margin: '3px 0 0', opacity: 0.9 }}>{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 14px', gap: '20px' }}>
          <div style={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: '6px', padding: '10px 12px', backgroundColor: '#f8f9ff' }}>
            <p style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bill To</p>
            <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>{invoice.partyName}</p>
            {invoice.partyPhone && <p style={{ fontSize: '12px', margin: '2px 0', color: '#555' }}>📞 {invoice.partyPhone}</p>}
            {invoice.partyAddress && <p style={{ fontSize: '12px', margin: '2px 0', color: '#555' }}>{invoice.partyAddress}</p>}
            {invoice.partyGst && <p style={{ fontSize: '12px', margin: '2px 0' }}>GSTIN: {invoice.partyGst}</p>}
          </div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '6px', padding: '10px 14px', backgroundColor: '#f8f9ff', minWidth: '160px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invoice Details</p>
            <table style={{ fontSize: '12px', borderSpacing: 0 }}>
              <tbody>
                <tr><td style={{ paddingRight: '10px', color: '#666' }}>Invoice No</td><td style={{ fontWeight: '600' }}>{invoice.invoiceNumber}</td></tr>
                <tr><td style={{ paddingRight: '10px', color: '#666' }}>Date</td><td style={{ fontWeight: '600' }}>{new Date(invoice.date).toLocaleDateString('en-IN')}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0 0 14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
              <th style={{ padding: '9px 8px', textAlign: 'left', fontSize: '11px', fontWeight: '600', width: '30px' }}>S.No</th>
              <th style={{ padding: '9px 8px', textAlign: 'left', fontSize: '11px', fontWeight: '600' }}>Item / Description</th>
              <th style={{ padding: '9px 8px', textAlign: 'center', fontSize: '11px', fontWeight: '600', width: '40px' }}>Qty</th>
              <th style={{ padding: '9px 8px', textAlign: 'right', fontSize: '11px', fontWeight: '600' }}>Rate (₹)</th>
              <th style={{ padding: '9px 8px', textAlign: 'center', fontSize: '11px', fontWeight: '600' }}>GST%</th>
              <th style={{ padding: '9px 8px', textAlign: 'right', fontSize: '11px', fontWeight: '600' }}>CGST</th>
              <th style={{ padding: '9px 8px', textAlign: 'right', fontSize: '11px', fontWeight: '600' }}>SGST</th>
              <th style={{ padding: '9px 8px', textAlign: 'right', fontSize: '11px', fontWeight: '600' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e8e8e8', backgroundColor: i % 2 === 0 ? '#ffffff' : '#f7f8ff' }}>
                <td style={{ padding: '7px 8px', fontSize: '12px', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ padding: '7px 8px', fontSize: '12px', fontWeight: '500' }}>{item.name}</td>
                <td style={{ padding: '7px 8px', fontSize: '12px', textAlign: 'center' }}>{item.qty}</td>
                <td style={{ padding: '7px 8px', fontSize: '12px', textAlign: 'right' }}>₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '7px 8px', fontSize: '12px', textAlign: 'center' }}>{item.gstPercent}%</td>
                <td style={{ padding: '7px 8px', fontSize: '12px', textAlign: 'right' }}>₹{item.cgst.toFixed(2)}</td>
                <td style={{ padding: '7px 8px', fontSize: '12px', textAlign: 'right' }}>₹{item.sgst.toFixed(2)}</td>
                <td style={{ padding: '7px 8px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
          <table style={{ width: '280px', borderCollapse: 'collapse', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '6px 12px', fontSize: '12px', color: '#666' }}>Sub Total</td>
                <td style={{ padding: '6px 12px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '6px 12px', fontSize: '12px', color: '#666' }}>CGST</td>
                <td style={{ padding: '6px 12px', fontSize: '12px', textAlign: 'right' }}>₹{invoice.totalCgst.toFixed(2)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e8e8e8' }}>
                <td style={{ padding: '6px 12px', fontSize: '12px', color: '#666' }}>SGST</td>
                <td style={{ padding: '6px 12px', fontSize: '12px', textAlign: 'right' }}>₹{invoice.totalSgst.toFixed(2)}</td>
              </tr>
              <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                <td style={{ padding: '9px 12px', fontSize: '14px', fontWeight: 'bold' }}>Total Amount</td>
                <td style={{ padding: '9px 12px', fontSize: '14px', fontWeight: 'bold', textAlign: 'right' }}>₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ padding: '8px 12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '5px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', margin: 0 }}>
            <strong>Amount in Words:</strong> {toWords(invoice.totalAmount)} Rupees Only
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#555', margin: '0 0 4px' }}>Terms & Conditions:</p>
            <p style={{ fontSize: '10px', color: '#888', margin: '1px 0' }}>1. Goods once sold will not be taken back.</p>
            <p style={{ fontSize: '10px', color: '#888', margin: '1px 0' }}>2. Subject to local jurisdiction only.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '36px' }}>For {shopInfo.name}</p>
            <div style={{ borderTop: '1px solid #555', paddingTop: '4px' }}>
              <p style={{ fontSize: '11px', color: '#555' }}>Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
InvoiceTemplate.displayName = "InvoiceTemplate";
