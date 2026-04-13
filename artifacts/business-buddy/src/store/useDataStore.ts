import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Party, Item, Invoice, ShopInfo } from '@/types';

export interface UserData {
  parties: Party[];
  items: Item[];
  invoices: Invoice[];
  shopInfo: ShopInfo;
}

const defaultShopInfo: ShopInfo = {
  name: 'My Business',
  address: '',
  phone: '',
  gst: '',
  email: '',
};

const sampleData: UserData = {
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
    phone: '8851711152',
    gst: '07AFLPN1298M2ZR',
    email: 'shuvidhatelecom@gmail.com',
    state: '07-Delhi',
    termsAndConditions: '1. All phones will be under warranty from the service center and not from the dealer.\n2. The customer has to visit the service center.\n3. Sold goods will not be returned.\n4. All phone are repaired here.\n5. Damage item is not exchange.',
  },
};

const emptyUserData = (): UserData => ({
  parties: [],
  items: [],
  invoices: [],
  shopInfo: { ...defaultShopInfo },
});

interface DataStore {
  allData: Record<string, UserData>;
  initUser: (userId: string, isDemo?: boolean, businessName?: string) => void;
  addParty: (userId: string, party: Party) => void;
  updateParty: (userId: string, id: string, data: Partial<Party>) => void;
  deleteParty: (userId: string, id: string) => void;
  addItem: (userId: string, item: Item) => void;
  updateItem: (userId: string, id: string, data: Partial<Item>) => void;
  deleteItem: (userId: string, id: string) => void;
  addInvoice: (userId: string, invoice: Invoice) => void;
  updateInvoice: (userId: string, invoiceId: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (userId: string, invoiceId: string) => void;
  updateShopInfo: (userId: string, info: Partial<ShopInfo>) => void;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      allData: { BB001: sampleData },

      initUser: (userId, isDemo = false, businessName) => {
        if (!get().allData[userId]) {
          const userData = isDemo ? sampleData : emptyUserData();
          if (!isDemo && businessName) {
            userData.shopInfo.name = businessName;
          }
          set(s => ({
            allData: {
              ...s.allData,
              [userId]: userData,
            },
          }));
        } else if (businessName && get().allData[userId]?.shopInfo?.name === 'My Business') {
          set(s => ({
            allData: {
              ...s.allData,
              [userId]: {
                ...s.allData[userId],
                shopInfo: { ...s.allData[userId].shopInfo, name: businessName },
              },
            },
          }));
        }
      },

      addParty: (userId, party) =>
        set(s => ({
          allData: {
            ...s.allData,
            [userId]: { ...s.allData[userId], parties: [...(s.allData[userId]?.parties || []), party] },
          },
        })),

      updateParty: (userId, id, data) =>
        set(s => ({
          allData: {
            ...s.allData,
            [userId]: {
              ...s.allData[userId],
              parties: s.allData[userId]?.parties.map(p => p.id === id ? { ...p, ...data } : p) || [],
            },
          },
        })),

      deleteParty: (userId, id) =>
        set(s => ({
          allData: {
            ...s.allData,
            [userId]: {
              ...s.allData[userId],
              parties: s.allData[userId]?.parties.filter(p => p.id !== id) || [],
            },
          },
        })),

      addItem: (userId, item) =>
        set(s => ({
          allData: {
            ...s.allData,
            [userId]: { ...s.allData[userId], items: [...(s.allData[userId]?.items || []), item] },
          },
        })),

      updateItem: (userId, id, data) =>
        set(s => ({
          allData: {
            ...s.allData,
            [userId]: {
              ...s.allData[userId],
              items: s.allData[userId]?.items.map(i => i.id === id ? { ...i, ...data } : i) || [],
            },
          },
        })),

      deleteItem: (userId, id) =>
        set(s => ({
          allData: {
            ...s.allData,
            [userId]: {
              ...s.allData[userId],
              items: s.allData[userId]?.items.filter(i => i.id !== id) || [],
            },
          },
        })),

      addInvoice: (userId, invoice) =>
        set(s => {
          const userData = s.allData[userId] || { parties: [], items: [], invoices: [], shopInfo: { ...defaultShopInfo } };
          const updatedItems = userData.items.map(item => {
            const invoiceItem = invoice.items.find(ii => ii.itemId === item.id || ii.name.trim().toLowerCase() === item.name.trim().toLowerCase());
            if (!invoiceItem) return item;
            if (invoice.type === 'purchase') return { ...item, stock: item.stock + invoiceItem.qty };
            if (invoice.type === 'sale') return { ...item, stock: Math.max(0, item.stock - invoiceItem.qty) };
            return item;
          });
          return {
            allData: {
              ...s.allData,
              [userId]: {
                ...userData,
                items: updatedItems,
                invoices: [...userData.invoices, invoice],
              },
            },
          };
        }),

      updateInvoice: (userId: string, invoiceId: string, updates: Partial<Invoice>) =>
        set(s => ({
          allData: {
            ...s.allData,
            [userId]: {
              ...s.allData[userId],
              invoices: (s.allData[userId]?.invoices || []).map(inv =>
                inv.id === invoiceId ? { ...inv, ...updates } : inv
              ),
            },
          },
        })),

      deleteInvoice: (userId: string, invoiceId: string) =>
        set(s => ({
          allData: {
            ...s.allData,
            [userId]: {
              ...s.allData[userId],
              invoices: (s.allData[userId]?.invoices || []).filter(inv => inv.id !== invoiceId),
            },
          },
        })),

      updateShopInfo: (userId, info) =>
        set(s => ({
          allData: {
            ...s.allData,
            [userId]: {
              ...s.allData[userId],
              shopInfo: { ...s.allData[userId]?.shopInfo, ...info },
            },
          },
        })),
    }),
    {
      name: 'bb-data-store',
      onRehydrateStorage: () => (state) => {
        if (state && state.allData['BB001']) {
          state.allData['BB001'].shopInfo.name = 'Shuvidha Telecom Mobile and Electronics';
          state.allData['BB001'].shopInfo.address = 'GROUND FLOOR, SHOP NO-5 PLOT NO 1 KH NO-19/20, RAMA VIHAR BLOCK-D, VILLAGE MOHAMMAD PUR MAGRI DELHI-110081';
          state.allData['BB001'].shopInfo.phone = '8851711152';
          state.allData['BB001'].shopInfo.gst = '07AFLPN1298M2ZR';
          state.allData['BB001'].shopInfo.email = 'shuvidhatelecom@gmail.com';
          if (!state.allData['BB001'].shopInfo.state) {
            state.allData['BB001'].shopInfo.state = '07-Delhi';
          }
          if (!state.allData['BB001'].shopInfo.termsAndConditions) {
            state.allData['BB001'].shopInfo.termsAndConditions = '1. All phones will be under warranty from the service center and not from the dealer.\n2. The customer has to visit the service center.\n3. Sold goods will not be returned.\n4. All phone are repaired here.\n5. Damage item is not exchange.';
          }
        }
      },
    }
  )
);
