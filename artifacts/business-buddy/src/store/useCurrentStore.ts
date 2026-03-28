import { useAuthStore } from './useAuthStore';
import { useDataStore } from './useDataStore';
import { Party, Item, Invoice, ShopInfo } from '@/types';

export function useCurrentStore() {
  const currentUserId = useAuthStore(s => s.currentUserId) || '';
  const allData = useDataStore(s => s.allData);
  const store = useDataStore();

  const userData = allData[currentUserId] || {
    parties: [],
    items: [],
    invoices: [],
    shopInfo: { name: 'My Business', address: '', phone: '', gst: '', email: '' },
  };

  return {
    parties: userData.parties,
    items: userData.items,
    invoices: userData.invoices,
    shopInfo: userData.shopInfo,

    addParty: (party: Party) => store.addParty(currentUserId, party),
    updateParty: (id: string, data: Partial<Party>) => store.updateParty(currentUserId, id, data),
    deleteParty: (id: string) => store.deleteParty(currentUserId, id),

    addItem: (item: Item) => store.addItem(currentUserId, item),
    updateItem: (id: string, data: Partial<Item>) => store.updateItem(currentUserId, id, data),
    deleteItem: (id: string) => store.deleteItem(currentUserId, id),

    addInvoice: (invoice: Invoice) => store.addInvoice(currentUserId, invoice),
    updateShopInfo: (info: Partial<ShopInfo>) => store.updateShopInfo(currentUserId, info),
  };
}
