export interface Party {
  id: string;
  name: string;
  phone: string;
  address: string;
  gst?: string;
  type: 'customer' | 'supplier';
  balance: number;
  createdAt: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  gstPercent: number;
  stock: number;
  unit: string;
  hsn?: string;
}

export interface InvoiceItem {
  itemId: string;
  name: string;
  hsn?: string;
  qty: number;
  unit?: string;
  rate: number;
  gstPercent: number;
  amount: number;
  cgst: number;
  sgst: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceYear?: string;
  date: string;
  partyId: string;
  partyName: string;
  partyAddress: string;
  partyPhone?: string;
  partyGst?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  igst?: number;
  totalAmount: number;
  description?: string;
  type: 'sale' | 'purchase';
  createdAt: string;
}

export interface ShopInfo {
  name: string;
  address: string;
  phone: string;
  gst: string;
  email?: string;
  gtNo?: string;
  state?: string;
  termsAndConditions?: string;
  logoImage?: string;
  signatureImage?: string;
  stampImage?: string;
}

export interface MonthlySales {
  month: string;
  amount: number;
}
