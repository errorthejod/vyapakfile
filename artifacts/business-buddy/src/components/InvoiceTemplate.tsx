import { forwardRef } from "react";
import { Invoice, ShopInfo } from "@/types";

interface InvoiceTemplateProps {
  invoice: Invoice;
  shopInfo: ShopInfo;
}

const defaultTerms = `1. Goods once sold will not be taken back.
2. Subject to local jurisdiction only.
3. All disputes subject to local jurisdiction.`;

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
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '');
      if (n < 100000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
      if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '');
      return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '');
    };

    const totalQty = invoice.items.reduce((s, i) => s + i.qty, 0);
    const totalGst = (invoice.igst ?? 0);
    const terms = shopInfo.termsAndConditions || defaultTerms;
    const termsLines = terms.split('\n').filter(l => l.trim());

    const border = '1px solid #aaa';
    const cellPad = '4px 6px';
    const fs = '11px';

    return (
      <div ref={ref} className="invoice-print bg-white text-black"
        style={{ fontFamily: 'Arial, sans-serif', fontSize: fs, lineHeight: '1.4', width: '190mm', margin: '0 auto', padding: '6mm 8mm', color: '#000' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{shopInfo.name}</p>
            <p style={{ fontSize: '10px', margin: '1px 0', maxWidth: '320px' }}>{shopInfo.address}</p>
            {shopInfo.phone && <p style={{ fontSize: '10px', margin: '1px 0' }}>Phone no. : {shopInfo.phone}{shopInfo.email ? `   Email : ${shopInfo.email}` : ''}</p>}
            {shopInfo.gst && <p style={{ fontSize: '10px', margin: '1px 0', fontWeight: '600' }}>GSTIN : {shopInfo.gst}</p>}
            {shopInfo.state && <p style={{ fontSize: '10px', margin: '1px 0' }}>State : {shopInfo.state}</p>}
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px' }}>
            <p style={{ fontWeight: '700', margin: '0 0 2px', fontSize: '11px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>ORIGINAL FOR RECIPIENT</p>
          </div>
        </div>

        {/* ── TITLE ── */}
        <div style={{ textAlign: 'center', borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '5px 0', margin: '6px 0' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', margin: 0, letterSpacing: '1px' }}>Tax Invoice</p>
        </div>

        {/* ── BILL TO + INVOICE DETAILS ── */}
        <div style={{ display: 'flex', gap: '0', border: border, marginBottom: '0' }}>
          <div style={{ flex: 1, padding: '6px 8px', borderRight: border }}>
            <p style={{ fontWeight: '700', fontSize: '11px', margin: '0 0 3px' }}>Bill To</p>
            <p style={{ fontWeight: '700', fontSize: '12px', margin: '1px 0', textTransform: 'uppercase' }}>{invoice.partyName}</p>
            {invoice.partyAddress && <p style={{ fontSize: '10px', margin: '1px 0' }}>{invoice.partyAddress}</p>}
            {invoice.partyPhone && <p style={{ fontSize: '10px', margin: '1px 0' }}>Contact No. : {invoice.partyPhone}</p>}
            {invoice.partyGst && <p style={{ fontSize: '10px', margin: '1px 0' }}>GSTIN : {invoice.partyGst}</p>}
          </div>
          <div style={{ minWidth: '200px', padding: '6px 8px' }}>
            <p style={{ fontWeight: '700', fontSize: '11px', margin: '0 0 3px' }}>Invoice Details</p>
            <table style={{ fontSize: '10px', borderSpacing: 0, width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '2px' }}>Invoice No. :</td>
                  <td style={{ fontWeight: '600' }}>{invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '2px' }}>Date :</td>
                  <td style={{ fontWeight: '600' }}>{new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                </tr>
                {invoice.invoiceYear && (
                  <tr>
                    <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '2px' }}>Invoice Year :</td>
                    <td style={{ fontWeight: '600' }}>{invoice.invoiceYear}</td>
                  </tr>
                )}
                {shopInfo.state && (
                  <tr>
                    <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '2px' }}>Place of supply :</td>
                    <td style={{ fontWeight: '600' }}>{shopInfo.state}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ITEMS TABLE ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: border, borderTop: 'none' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: border }}>
              <th style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', fontWeight: '700', borderRight: border, width: '22px' }}>#</th>
              <th style={{ padding: cellPad, textAlign: 'left', fontSize: '10px', fontWeight: '700', borderRight: border }}>Item name</th>
              <th style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', fontWeight: '700', borderRight: border, width: '55px' }}>HSN/SAC</th>
              <th style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', fontWeight: '700', borderRight: border, width: '40px' }}>Quantity</th>
              <th style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', fontWeight: '700', borderRight: border, width: '30px' }}>Unit</th>
              <th style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', fontWeight: '700', borderRight: border, width: '70px' }}>Price/ Unit</th>
              <th style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', fontWeight: '700', borderRight: border, width: '55px' }}>GST</th>
              <th style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', fontWeight: '700', width: '65px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => {
              const base = item.amount - item.cgst - item.sgst;
              const gstAmt = item.cgst + item.sgst;
              return (
                <tr key={i} style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', borderRight: border }}>{i + 1}</td>
                  <td style={{ padding: cellPad, fontSize: '10px', fontWeight: '600', borderRight: border }}>{item.name}</td>
                  <td style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', borderRight: border }}>{item.hsn || '-'}</td>
                  <td style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', borderRight: border }}>{item.qty}</td>
                  <td style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', borderRight: border }}>{item.unit || 'Pcs'}</td>
                  <td style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', borderRight: border }}>₹ {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                  <td style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', borderRight: border }}>₹ {gstAmt.toLocaleString('en-IN', { minimumFractionDigits: 1 })}<br /><span style={{ fontSize: '9px', color: '#555' }}>({item.gstPercent}%)</span></td>
                  <td style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', fontWeight: '600' }}>₹ {base.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</td>
                </tr>
              );
            })}
            {/* padding rows to fill space */}
            {invoice.items.length < 3 && Array.from({ length: 3 - invoice.items.length }).map((_, i) => (
              <tr key={`pad-${i}`} style={{ borderBottom: border }}>
                <td style={{ padding: '10px 6px', borderRight: border }}>&nbsp;</td>
                <td style={{ borderRight: border }}>&nbsp;</td>
                <td style={{ borderRight: border }}>&nbsp;</td>
                <td style={{ borderRight: border }}>&nbsp;</td>
                <td style={{ borderRight: border }}>&nbsp;</td>
                <td style={{ borderRight: border }}>&nbsp;</td>
                <td style={{ borderRight: border }}>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f0f0f0', borderTop: border, fontWeight: '700' }}>
              <td style={{ padding: cellPad, borderRight: border }}></td>
              <td style={{ padding: cellPad, fontSize: '11px', borderRight: border, fontWeight: '700' }}>Total</td>
              <td style={{ padding: cellPad, borderRight: border }}></td>
              <td style={{ padding: cellPad, textAlign: 'center', fontSize: '11px', borderRight: border }}>{totalQty}</td>
              <td style={{ padding: cellPad, borderRight: border }}></td>
              <td style={{ padding: cellPad, borderRight: border }}></td>
              <td style={{ padding: cellPad, textAlign: 'right', fontSize: '11px', borderRight: border }}>₹ {totalGst.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</td>
              <td style={{ padding: cellPad, textAlign: 'right', fontSize: '11px' }}>₹ {invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</td>
            </tr>
          </tfoot>
        </table>

        {/* ── DESCRIPTION + TOTALS ── */}
        <div style={{ display: 'flex', border: border, borderTop: 'none' }}>
          <div style={{ flex: 1, borderRight: border, padding: '6px 8px' }}>
            {invoice.description && (
              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontWeight: '700', fontSize: '11px', margin: '0 0 2px' }}>Description</p>
                <p style={{ fontSize: '10px', margin: 0, whiteSpace: 'pre-wrap' }}>{invoice.description}</p>
              </div>
            )}
            <div>
              <p style={{ fontWeight: '700', fontSize: '11px', margin: '0 0 2px' }}>Invoice Amount In Words</p>
              <p style={{ fontSize: '10px', margin: 0, fontStyle: 'italic' }}>{toWords(invoice.totalAmount)} Rupees Only</p>
            </div>
          </div>
          <div style={{ minWidth: '200px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <tbody>
                <tr style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, color: '#333' }}>Sub Total</td>
                  <td style={{ padding: cellPad, textAlign: 'right', fontWeight: '600' }}>₹ {invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</td>
                </tr>
                <tr style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, color: '#333' }}>SGST @ {invoice.items[0]?.gstPercent ? invoice.items[0].gstPercent / 2 : 9}%</td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>₹ {invoice.totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</td>
                </tr>
                <tr style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, color: '#333' }}>CGST @ {invoice.items[0]?.gstPercent ? invoice.items[0].gstPercent / 2 : 9}%</td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>₹ {invoice.totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</td>
                </tr>
                <tr style={{ borderBottom: border, backgroundColor: '#f0f0f0', fontWeight: '700' }}>
                  <td style={{ padding: cellPad }}>Total</td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>₹ {invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</td>
                </tr>
                <tr style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, color: '#333' }}>Received</td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>₹ {invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</td>
                </tr>
                <tr>
                  <td style={{ padding: cellPad, color: '#333' }}>Balance</td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>₹ 0.0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── TERMS + SIGNATORY ── */}
        <div style={{ display: 'flex', border: border, borderTop: 'none', minHeight: '80px' }}>
          <div style={{ flex: 1, borderRight: border, padding: '6px 8px' }}>
            <p style={{ fontWeight: '700', fontSize: '11px', margin: '0 0 3px' }}>Terms and Conditions</p>
            {termsLines.map((line, i) => (
              <p key={i} style={{ fontSize: '10px', margin: '1px 0', color: '#333' }}>{line}</p>
            ))}
          </div>
          <div style={{ minWidth: '200px', padding: '6px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 40px', textAlign: 'center' }}>For : {shopInfo.name}</p>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #555', paddingTop: '3px', marginTop: '4px' }}>
                <p style={{ fontSize: '10px', fontWeight: '600', margin: 0 }}>Authorised Signatory</p>
              </div>
              <p style={{ fontSize: '10px', fontWeight: '700', margin: '4px 0 0', textTransform: 'uppercase' }}>{shopInfo.name}</p>
              {shopInfo.address && <p style={{ fontSize: '9px', margin: '1px 0', color: '#444' }}>{shopInfo.address.split(',').slice(-2).join(',').trim()}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
InvoiceTemplate.displayName = "InvoiceTemplate";
