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

    const isNonGst = invoice.items.length > 0 && invoice.items.every(i => i.gstPercent === 0);
    const totalQty = invoice.items.reduce((s, i) => s + i.qty, 0);
    const totalGstAmt = isNonGst ? 0 : (invoice.igst ?? 0);
    const terms = shopInfo.termsAndConditions || defaultTerms;
    const termsLines = terms.split('\n').filter(l => l.trim());

    const border = '1px solid #aaa';
    const cellPad = '4px 6px';

    const addressLines = (addr?: string) =>
      (addr || '').split('\n').filter(l => l.trim());

    return (
      <div ref={ref} className="invoice-print bg-white text-black"
        style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.4', width: '190mm', margin: '0 auto', padding: '6mm 8mm', color: '#000' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '17px', fontWeight: '900', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{shopInfo.name}</p>
            {addressLines(shopInfo.address).map((line, i) => (
              <p key={i} style={{ fontSize: '10px', margin: '1px 0', maxWidth: '340px' }}>{line}</p>
            ))}
            {shopInfo.phone && (
              <p style={{ fontSize: '10px', margin: '1px 0' }}>
                Phone no. : {shopInfo.phone}{shopInfo.email ? `   Email : ${shopInfo.email}` : ''}
              </p>
            )}
            {shopInfo.gst && !isNonGst && (
              <p style={{ fontSize: '10px', margin: '1px 0', fontWeight: '600' }}>GSTIN : {shopInfo.gst}</p>
            )}
            {isNonGst && (
              <p style={{ fontSize: '10px', margin: '1px 0', fontWeight: '700', color: '#555' }}>NON-GST</p>
            )}
            {shopInfo.state && <p style={{ fontSize: '10px', margin: '1px 0' }}>State : {shopInfo.state}</p>}
          </div>
          {/* TOP RIGHT: Logo or "ORIGINAL FOR RECIPIENT" */}
          <div style={{ textAlign: 'right', fontSize: '10px', minWidth: '110px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {shopInfo.logoImage ? (
              <img
                src={shopInfo.logoImage}
                alt="Company Logo"
                style={{ maxHeight: '65px', maxWidth: '130px', objectFit: 'contain' }}
              />
            ) : (
              <p style={{ fontWeight: '700', margin: '0', fontSize: '10px', borderBottom: '1px solid #000', paddingBottom: '2px' }}>ORIGINAL FOR RECIPIENT</p>
            )}
          </div>
        </div>

        {/* ── TITLE ── */}
        <div style={{ textAlign: 'center', borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '4px 0', margin: '5px 0' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', margin: 0, letterSpacing: '1px' }}>
            {isNonGst ? 'Invoice' : 'Tax Invoice'}
          </p>
        </div>

        {/* ── BILL TO + INVOICE DETAILS ── */}
        <div style={{ display: 'flex', gap: '0', border: border }}>
          <div style={{ flex: 1, padding: '5px 8px', borderRight: border }}>
            <p style={{ fontWeight: '700', fontSize: '11px', margin: '0 0 2px' }}>Bill To</p>
            <p style={{ fontWeight: '700', fontSize: '12px', margin: '1px 0', textTransform: 'uppercase' }}>{invoice.partyName}</p>
            {invoice.partyAddress && (
              <div style={{ margin: '1px 0' }}>
                <span style={{ fontSize: '10px', color: '#555' }}>Address : </span>
                {addressLines(invoice.partyAddress).map((line, i) => (
                  <span key={i} style={{ fontSize: '10px' }}>{line}{i < addressLines(invoice.partyAddress).length - 1 ? ', ' : ''}</span>
                ))}
              </div>
            )}
            {invoice.partyPhone && (
              <p style={{ fontSize: '10px', margin: '2px 0', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="#25D366" style={{ display: 'inline', flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {invoice.partyPhone}
              </p>
            )}
            {invoice.partyGst && !isNonGst && <p style={{ fontSize: '10px', margin: '1px 0' }}>GSTIN : {invoice.partyGst}</p>}
            {isNonGst && invoice.partyGst && <p style={{ fontSize: '10px', margin: '1px 0', fontWeight: '700' }}>NON-GST</p>}
          </div>
          <div style={{ minWidth: '230px', padding: '5px 8px' }}>
            <p style={{ fontWeight: '700', fontSize: '11px', margin: '0 0 3px' }}>
              Invoice Details {invoice.invoiceYear && <span style={{ fontWeight: '400', fontSize: '10px', color: '#555' }}>{invoice.invoiceYear}</span>}
            </p>
            <table style={{ fontSize: '10px', borderSpacing: 0, width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '2px', whiteSpace: 'nowrap' }}>Invoice No. :</td>
                  <td style={{ fontWeight: '600' }}>{invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style={{ color: '#555', paddingRight: '8px', paddingBottom: '2px', whiteSpace: 'nowrap' }}>Date :</td>
                  <td style={{ fontWeight: '600' }}>{new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                </tr>
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
              <th style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', fontWeight: '700', borderRight: border, width: '38px' }}>Quantity</th>
              <th style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', fontWeight: '700', borderRight: border, width: '30px' }}>Unit</th>
              <th style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', fontWeight: '700', borderRight: border, width: '70px' }}>Price/ Unit</th>
              <th style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', fontWeight: '700', borderRight: border, width: '55px' }}>
                {isNonGst ? 'NON-GST' : 'GST'}
              </th>
              <th style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', fontWeight: '700', width: '65px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => {
              const gstAmt = item.cgst + item.sgst;
              return (
                <tr key={i} style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', borderRight: border }}>{i + 1}</td>
                  <td style={{ padding: cellPad, fontSize: '10px', fontWeight: '600', borderRight: border }}>{item.name}</td>
                  <td style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', borderRight: border }}>{item.hsn || '-'}</td>
                  <td style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', borderRight: border }}>{item.qty}</td>
                  <td style={{ padding: cellPad, textAlign: 'center', fontSize: '10px', borderRight: border }}>{item.unit || 'Pcs'}</td>
                  <td style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', borderRight: border }}>
                    ₹ {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </td>
                  <td style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', borderRight: border }}>
                    {isNonGst ? '-' : (
                      <>₹ {gstAmt.toLocaleString('en-IN', { minimumFractionDigits: 1 })}<br />
                        <span style={{ fontSize: '9px', color: '#555' }}>({item.gstPercent}%)</span>
                      </>
                    )}
                  </td>
                  <td style={{ padding: cellPad, textAlign: 'right', fontSize: '10px', fontWeight: '600' }}>
                    ₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f0f0f0', borderTop: border, fontWeight: '700' }}>
              <td style={{ padding: cellPad, borderRight: border }}></td>
              <td style={{ padding: cellPad, fontSize: '11px', borderRight: border }}>Total</td>
              <td style={{ padding: cellPad, borderRight: border }}></td>
              <td style={{ padding: cellPad, textAlign: 'center', fontSize: '11px', borderRight: border }}>{totalQty}</td>
              <td style={{ padding: cellPad, borderRight: border }}></td>
              <td style={{ padding: cellPad, borderRight: border }}></td>
              <td style={{ padding: cellPad, textAlign: 'right', fontSize: '11px', borderRight: border }}>
                {isNonGst ? '-' : `₹ ${totalGstAmt.toLocaleString('en-IN', { minimumFractionDigits: 1 })}`}
              </td>
              <td style={{ padding: cellPad, textAlign: 'right', fontSize: '11px' }}>
                ₹ {invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ── DESCRIPTION + TOTALS ── */}
        <div style={{ display: 'flex', border: border, borderTop: 'none' }}>
          <div style={{ flex: 1, borderRight: border, padding: '5px 8px' }}>
            {invoice.description && (
              <div style={{ marginBottom: '6px' }}>
                <p style={{ fontWeight: '700', fontSize: '11px', margin: '0 0 2px' }}>Description</p>
                <p style={{ fontSize: '10px', margin: 0, whiteSpace: 'pre-wrap' }}>{invoice.description}</p>
              </div>
            )}
            <div>
              <p style={{ fontWeight: '700', fontSize: '11px', margin: '0 0 1px' }}>Invoice Amount In Words</p>
              <p style={{ fontSize: '10px', margin: 0, fontStyle: 'italic' }}>{toWords(invoice.totalAmount)} Rupees Only</p>
            </div>
          </div>
          <div style={{ minWidth: '215px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <tbody>
                <tr style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, color: '#333' }}>Sub Total</td>
                  <td style={{ padding: cellPad, textAlign: 'right', fontWeight: '600' }}>
                    ₹ {invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                </tr>
                <tr style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, color: '#333' }}>
                    SGST @ {invoice.items[0]?.gstPercent ? invoice.items[0].gstPercent / 2 : 9}%
                  </td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>
                    ₹ {invoice.totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                </tr>
                <tr style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, color: '#333' }}>
                    CGST @ {invoice.items[0]?.gstPercent ? invoice.items[0].gstPercent / 2 : 9}%
                  </td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>
                    ₹ {invoice.totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                </tr>
                <tr style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, color: '#333' }}>
                    IGST <span style={{ fontSize: '9px', color: '#888' }}>(CGST+SGST)</span>
                  </td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>
                    ₹ {(invoice.igst ?? (invoice.totalCgst + invoice.totalSgst)).toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                </tr>
                <tr style={{ borderBottom: border, backgroundColor: '#f0f0f0', fontWeight: '700' }}>
                  <td style={{ padding: cellPad }}>Total</td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>
                    ₹ {invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                </tr>
                <tr style={{ borderBottom: border }}>
                  <td style={{ padding: cellPad, color: '#333' }}>Received</td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>
                    ₹ {invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
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
        <div style={{ display: 'flex', border: border, borderTop: 'none', minHeight: '100px' }}>
          <div style={{ flex: 1, minWidth: 0, borderRight: border, padding: '5px 8px' }}>
            <p style={{ fontWeight: '700', fontSize: '11px', margin: '0 0 2px' }}>Terms and Conditions</p>
            {termsLines.map((line, i) => (
              <p key={i} style={{ fontSize: '10px', margin: '1px 0', color: '#333' }}>{line}</p>
            ))}
          </div>
          {/* ── AUTHORISED SIGNATORY ── */}
          <div style={{ flex: 1, minWidth: 0, padding: '5px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            {/* spacer fills top */}
            <div style={{ flex: 1 }} />
            <p style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 4px', textAlign: 'center' }}>For : {shopInfo.name}</p>
            {/* Signature + stamp row */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px', minHeight: '52px', marginBottom: '4px' }}>
              {shopInfo.signatureImage ? (
                <img
                  src={shopInfo.signatureImage}
                  alt="Signature"
                  style={{ maxHeight: '50px', maxWidth: '110px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: '110px', height: '50px' }} />
              )}
              {shopInfo.stampImage ? (
                <img
                  src={shopInfo.stampImage}
                  alt="Stamp"
                  style={{ maxHeight: '50px', maxWidth: '80px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: '80px', height: '50px' }} />
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #555', paddingTop: '3px' }}>
                <p style={{ fontSize: '10px', fontWeight: '600', margin: 0 }}>Authorised Signatory</p>
              </div>
              <p style={{ fontSize: '10px', fontWeight: '700', margin: '3px 0 0', textTransform: 'uppercase' }}>{shopInfo.name}</p>
              {shopInfo.address && (
                <p style={{ fontSize: '9px', margin: '1px 0', color: '#444' }}>
                  {addressLines(shopInfo.address).slice(-2).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
InvoiceTemplate.displayName = "InvoiceTemplate";
