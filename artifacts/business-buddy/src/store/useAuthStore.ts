import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppUser {
  id: string;
  name: string;
  businessName: string;
  pin: string;
  createdAt: string;
  isActive: boolean;
}

interface AuthState {
  adminPassword: string;
  users: AppUser[];
  currentUserId: string | null;
  isAdminSession: boolean;
  nextUserNum: number;

  login: (id: string, pin: string) => boolean;
  logout: () => void;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => boolean;
  createUser: (name: string, businessName: string) => AppUser;
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      adminPassword: 'admin@123',
      users: [
        {
          id: 'BB001',
          name: 'Demo User',
          businessName: 'Krishna Mobile & Electronics',
          pin: '1234',
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      ],
      currentUserId: null,
      isAdminSession: false,
      nextUserNum: 2,

      login: (id, pin) => {
        const user = get().users.find(u => u.id === id && u.pin === pin && u.isActive);
        if (user) {
          set({ currentUserId: user.id, isAdminSession: false });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUserId: null, isAdminSession: false }),

      adminLogin: (password) => {
        if (password === get().adminPassword) {
          set({ isAdminSession: true });
          return true;
        }
        return false;
      },

      adminLogout: () => set({ isAdminSession: false }),

      changeAdminPassword: (oldPass, newPass) => {
        if (oldPass === get().adminPassword) {
          set({ adminPassword: newPass });
          return true;
        }
        return false;
      },

      createUser: (name, businessName) => {
        const num = get().nextUserNum;
        const id = `BB${String(num).padStart(3, '0')}`;
        const pin = String(Math.floor(1000 + Math.random() * 9000));
        const newUser: AppUser = {
          id,
          name,
          businessName,
          pin,
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        set(s => ({ users: [...s.users, newUser], nextUserNum: num + 1 }));
        return newUser;
      },

      deleteUser: (id) => set(s => ({ users: s.users.filter(u => u.id !== id) })),

      toggleUserActive: (id) =>
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u),
        })),
    }),
    { name: 'bb-auth-store' }
  )
);
