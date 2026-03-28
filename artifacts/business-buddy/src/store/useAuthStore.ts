import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, ApiUser } from '@/lib/api';

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
  usersLoaded: boolean;

  loadUsers: () => Promise<void>;
  loadAdminConfig: () => Promise<void>;
  login: (id: string, pin: string) => boolean;
  loginByName: (name: string, pin: string) => Promise<boolean>;
  logout: () => void;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => Promise<boolean>;
  createUser: (name: string, businessName: string, customPin?: string) => Promise<AppUser>;
  updateUserPin: (id: string, newPin: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserActive: (id: string) => Promise<void>;
}

function toAppUser(u: ApiUser): AppUser {
  return {
    id: u.id,
    name: u.name,
    businessName: u.businessName,
    pin: u.pin,
    createdAt: typeof u.createdAt === 'string' ? u.createdAt : new Date(u.createdAt).toISOString(),
    isActive: u.isActive,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      adminPassword: 'delhi5932',
      users: [],
      currentUserId: null,
      isAdminSession: false,
      usersLoaded: false,

      loadUsers: async () => {
        try {
          const apiUsers = await api.getUsers();
          set({ users: apiUsers.map(toAppUser), usersLoaded: true });
        } catch {
          set({ usersLoaded: true });
        }
      },

      loadAdminConfig: async () => {
        try {
          const config = await api.getAdminConfig();
          set({ adminPassword: config.adminPassword });
        } catch {}
      },

      login: (id, pin) => {
        const user = get().users.find(u => u.id === id && u.pin === pin && u.isActive);
        if (user) {
          set({ currentUserId: user.id, isAdminSession: false });
          return true;
        }
        return false;
      },

      loginByName: async (name, pin) => {
        try {
          const user = await api.login(name, pin);
          const appUser = toAppUser(user);
          set(s => ({
            currentUserId: appUser.id,
            isAdminSession: false,
            users: s.users.some(u => u.id === appUser.id)
              ? s.users.map(u => u.id === appUser.id ? appUser : u)
              : [...s.users, appUser],
          }));
          return true;
        } catch {
          return false;
        }
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

      changeAdminPassword: async (oldPass, newPass) => {
        if (oldPass !== get().adminPassword) return false;
        try {
          await api.updateAdminConfig(newPass);
          set({ adminPassword: newPass });
          return true;
        } catch {
          return false;
        }
      },

      createUser: async (name, businessName, customPin) => {
        const pin = customPin?.trim() || String(Math.floor(1000 + Math.random() * 9000));
        const apiUser = await api.createUser(name, businessName, pin);
        const appUser = toAppUser(apiUser);
        set(s => ({ users: [...s.users, appUser] }));
        return appUser;
      },

      updateUserPin: async (id, newPin) => {
        await api.updateUser(id, { pin: newPin });
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, pin: newPin } : u),
        }));
      },

      deleteUser: async (id) => {
        await api.deleteUser(id);
        set(s => ({ users: s.users.filter(u => u.id !== id) }));
      },

      toggleUserActive: async (id) => {
        const user = get().users.find(u => u.id === id);
        if (!user) return;
        const newActive = !user.isActive;
        await api.updateUser(id, { isActive: newActive });
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, isActive: newActive } : u),
        }));
      },
    }),
    {
      name: 'bb-auth-store',
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        adminPassword: state.adminPassword,
      }),
    }
  )
);
