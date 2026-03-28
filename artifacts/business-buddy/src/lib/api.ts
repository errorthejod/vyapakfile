const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export interface ApiUser {
  id: string;
  name: string;
  businessName: string;
  pin: string;
  isActive: boolean;
  createdAt: string;
}

export const api = {
  getUsers: () => request<{ users: ApiUser[] }>("/users").then(r => r.users),

  login: (name: string, pin: string) =>
    request<{ user: ApiUser }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ name, pin }),
    }).then(r => r.user),

  createUser: (name: string, businessName: string, pin: string) =>
    request<{ user: ApiUser }>("/users", {
      method: "POST",
      body: JSON.stringify({ name, businessName, pin }),
    }).then(r => r.user),

  updateUser: (id: string, updates: Partial<{ pin: string; isActive: boolean; name: string; businessName: string }>) =>
    request<{ user: ApiUser }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }).then(r => r.user),

  deleteUser: (id: string) =>
    request<{ ok: boolean }>(`/users/${id}`, { method: "DELETE" }),

  getAdminConfig: () =>
    request<{ adminPassword: string }>("/admin/config"),

  updateAdminConfig: (adminPassword: string) =>
    request<{ ok: boolean }>("/admin/config", {
      method: "PUT",
      body: JSON.stringify({ adminPassword }),
    }),
};
