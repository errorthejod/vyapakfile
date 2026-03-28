import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Party, Item, Invoice, ShopInfo } from '@/types';

interface AppState {
  parties: Party[];
  items: Item[];
  invoices: Invoice[];
  shopInfo: ShopInfo;
  addParty: (party: Party) => void;
  updateParty: (id: string, party: Partial<Party>) => void;
  deleteParty: (id: string) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateShopInfo: (info: Partial<ShopInfo>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      parties: [
        { id: '1', name: 'Rajesh Kumar', phone: '9876543210', address: '45 MG Road, Delhi', gst: '07AABCU9603R1ZM', type: 'customer', balance: 15000, createdAt: '2024-01-15' },
        { id: '2', name: 'Priya Electronics', phone: '9123456789', address: '12 Nehru Place, Delhi', gst: '07AADCS0472N1Z6', type: 'customer', balance: 28500, createdAt: '2024-02-10' },
        { id: '3', name: 'Amit Telecom', phone: '9988776655', address: '78 Lajpat Nagar, Delhi', type: 'customer', balance: 5200, createdAt: '2024-03-05' },
      ],
      items: [
        { id: '1', name: 'Samsung Galaxy M14', price: 12999, gstPercent: 18, stock: 25, unit: 'Pcs', hsn: '8517' },
        { id: '2', name: 'Realme C55', price: 10999, gstPercent: 18, stock: 40, unit: 'Pcs', hsn: '8517' },
        { id: '3', name: 'Boat Airdopes 141', price: 1299, gstPercent: 18, stock: 100, unit: 'Pcs', hsn: '8518' },
        { id: '4', name: 'USB-C Cable 1m', price: 199, gstPercent: 18, stock: 200, unit: 'Pcs', hsn: '8544' },
        { id: '5', name: 'Tempered Glass (Universal)', price: 99, gstPercent: 18, stock: 500, unit: 'Pcs', hsn: '7007' },
      ],
      invoices: [
        {
          id: '1', invoiceNumber: 'INV-001', date: '2024-01-20', partyId: '1', partyName: 'Rajesh Kumar',
          partyAddress: '45 MG Road, Delhi', partyGst: '07AABCU9603R1ZM',
          items: [
            { itemId: '1', name: 'Samsung Galaxy M14', qty: 2, rate: 12999, gstPercent: 18, amount: 25998, cgst: 2339.82, sgst: 2339.82 },
            { itemId: '4', name: 'USB-C Cable 1m', qty: 2, rate: 199, gstPercent: 18, amount: 398, cgst: 35.82, sgst: 35.82 },
          ],
          subtotal: 26396, totalCgst: 2375.64, totalSgst: 2375.64, totalAmount: 31147.28, type: 'sale', createdAt: '2024-01-20',
        },
      ],
      shopInfo: {
        name: 'Shuvidha Telecom Mobile and Electronics',
        address: 'GROUND FLOOR, SHOP NO-5 PLOT NO 1 KH NO-19/20, RAMA VIHAR BLOCK-D, VILLAGE MOHAMMAD PUR MAGRI DELHI-110081',
        phone: '011-28756432',
        gst: '07AABCK1234R1Z5',
        email: 'krishnamobile@email.com',
      },
      addParty: (party) => set((s) => ({ parties: [...s.parties, party] })),
      updateParty: (id, data) => set((s) => ({ parties: s.parties.map((p) => p.id === id ? { ...p, ...data } : p) })),
      deleteParty: (id) => set((s) => ({ parties: s.parties.filter((p) => p.id !== id) })),
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      updateItem: (id, data) => set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, ...data } : i) })),
      deleteItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      addInvoice: (invoice) => set((s) => ({ invoices: [...s.invoices, invoice] })),
      updateShopInfo: (info) => set((s) => ({ shopInfo: { ...s.shopInfo, ...info } })),
    }),
    { name: 'vyapar-store' }
  )
);
