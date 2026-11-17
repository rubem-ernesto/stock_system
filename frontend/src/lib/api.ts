const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, statusCode: number, data: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function getStoredTokens() {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: getAccessTokenCookie(),
    refreshToken: localStorage.getItem("stock_refresh_token"),
  };
}

function getAccessTokenCookie() {
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("access_token="));

  return cookie ? decodeURIComponent(cookie.slice("access_token=".length)) : null;
}

export function setStoredTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("stock_refresh_token", refreshToken);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `access_token=${encodeURIComponent(accessToken)}; path=/; max-age=900; SameSite=Lax${secure}`;
}

export function clearStoredTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("stock_refresh_token");
  localStorage.removeItem("stock_user");
  localStorage.removeItem("stock_active_workspace_id");
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("stock_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem("stock_user", JSON.stringify(user));
}

export function getActiveWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("stock_active_workspace_id");
}

export function setActiveWorkspaceId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("stock_active_workspace_id", id);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const { refreshToken } = getStoredTokens();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Não enviar Authorization header — backend lê apenas o cookie access_token
  // O cookie é enviado automaticamente pelo browser via credentials: 'include'

  const url = `${API_BASE}${endpoint}`;

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Se der 401 e tivermos refresh token, tentamos renovar
  if (response.status === 401 && retry && refreshToken) {
    try {
      const refreshRes = await fetch(`${API_BASE}/user/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newAccess = data.accessToken || data.token;
        const newRefresh = data.refreshToken || refreshToken;
        setStoredTokens(newAccess, newRefresh); // também atualiza o cookie

        // Retenta requisição original (cookie já atualizado)
        response = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });
      } else {
        clearStoredTokens();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    } catch {
      clearStoredTokens();
    }
  }

  let data: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const errorMsg =
      (data && (data.message || data.error)) ||
      `Erro na requisição HTTP: ${response.status} ${response.statusText}`;
    throw new ApiError(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth & User
  register: (body: { name: string; email: string; password: string; birthdate: string }) =>
    request<{ accessToken: string; refreshToken: string; user: any; message: string }>("/user/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }, false),

  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string; user: any; message: string }>("/user/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }, false),

  refreshToken: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>("/user/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }, false),

  getUser: (params?: { id?: string; slug?: string }) => {
    const query = new URLSearchParams();
    if (params?.id) query.set("id", params.id);
    if (params?.slug) query.set("slug", params.slug);
    return request<any>(`/user/get?${query.toString()}`);
  },

  getUsers: (params?: { limit?: number; last_id?: string; slug_filter?: string; name_filter?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.last_id) query.set("last_id", params.last_id);
    if (params?.slug_filter) query.set("slug_filter", params.slug_filter);
    if (params?.name_filter) query.set("name_filter", params.name_filter);
    return request<any>(`/user/get-many?${query.toString()}`);
  },

  updateUser: (id: string, body: { name?: string; birthdate?: string }) =>
    request<any>(`/user/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  updatePassword: (id: string, body: { currentPassword?: string; oldPassword?: string; newPassword?: string; password?: string }) =>
    request<any>(`/user/update/password/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteUser: (id: string) =>
    request<any>(`/user?id=${id}`, {
      method: "DELETE",
    }),

  // Workspaces
  createWorkspace: (body: { name: string; planId: number; description?: string }) =>
    request<{ workspace: any; message: string }>("/workspace", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getWorkspace: (params?: { id?: string; slug?: string }) => {
    const query = new URLSearchParams();
    if (params?.id) query.set("id", params.id);
    if (params?.slug) query.set("slug", params.slug);
    return request<{ workspace: any }>(`/workspace/get?${query.toString()}`);
  },

  getWorkspaces: (params?: { limit?: number; last_id?: string; slug_filter?: string; name_filter?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.last_id) query.set("last_id", params.last_id);
    if (params?.slug_filter) query.set("slug_filter", params.slug_filter);
    if (params?.name_filter) query.set("name_filter", params.name_filter);
    return request<{ workspaces: any[] }>(`/workspace/get-many?${query.toString()}`);
  },

  updateWorkspace: (id: string, body: { name?: string; description?: string; planId?: number }) =>
    request<{ workspace: any }>(`/workspace/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteWorkspace: (id: string) =>
    request<{ isDeleted: boolean; message: string }>(`/workspace/delete/${id}`, {
      method: "DELETE",
    }),

  // Products
  createProduct: (body: {
    barcode: string;
    workspaceId: string;
    name: string;
    purchasedPrice: number;
    price: number;
    quantity: number;
    minQuantity: number;
    unit?: string;
  }) =>
    request<{ product: any; message: string }>("/product", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getProduct: (params?: { id?: string; slug?: string; barcode?: string }) => {
    const query = new URLSearchParams();
    if (params?.id) query.set("id", params.id);
    if (params?.slug) query.set("slug", params.slug);
    if (params?.barcode) query.set("barcode", params.barcode);
    return request<{ product: any; message: string }>(`/product/get?${query.toString()}`);
  },

  getProducts: (params: {
    workspace_id: string;
    limit?: number;
    last_id?: string;
    slug_filter?: string;
    name_filter?: string;
    barcode_filter?: string;
  }) => {
    const query = new URLSearchParams();
    query.set("workspace_id", params.workspace_id);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.last_id) query.set("last_id", params.last_id);
    if (params.slug_filter) query.set("slug_filter", params.slug_filter);
    if (params.name_filter) query.set("name_filter", params.name_filter);
    if (params.barcode_filter) query.set("barcode_filter", params.barcode_filter);
    return request<{ products: any[]; message: string }>(`/product/get-many?${query.toString()}`);
  },

  updateProduct: (
    id: string,
    body: {
      barcode?: string;
      name?: string;
      purchasedPrice?: number;
      price?: number;
      quantity?: number;
      minQuantity?: number;
      unit?: string;
    }
  ) =>
    request<{ product: any; message: string }>(`/product/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteProduct: (id: string) =>
    request<{ isDeleted: boolean; message: string }>(`/product/delete/${id}`, {
      method: "DELETE",
    }),

  // Inventory Movements
  createInventoryMovement: (body: {
    workspaceId: string;
    productId: string;
    type: "IN" | "OUT" | "ADJUST" | "DELETE" | "RESTORE";
    reason?: "VENDA" | "COMPRA" | "PERDA" | "DEVOLUCAO" | "AJUSTE" | "OUTRO";
    quantity?: number;
    unitPrice?: number;
    note?: string;
  }) =>
    request<{ movement: any; message: string }>("/inventory-movement", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getInventoryMovement: (params: { id: string; workspace_id: string }) => {
    const query = new URLSearchParams({
      id: params.id,
      workspace_id: params.workspace_id,
    });
    return request<{ movement: any; message: string }>(`/inventory-movement/get?${query.toString()}`);
  },

  getInventoryMovements: (params: {
    workspace_id: string;
    product_id?: string;
    type?: string;
    reason?: string;
    last_id?: string;
    limit?: number;
  }) => {
    const query = new URLSearchParams({ workspace_id: params.workspace_id });
    if (params.product_id) query.set("product_id", params.product_id);
    if (params.type) query.set("type", params.type);
    if (params.reason) query.set("reason", params.reason);
    if (params.last_id) query.set("last_id", params.last_id);
    if (params.limit) query.set("limit", String(params.limit));
    return request<{ movements: any[]; message: string }>(`/inventory-movement/get-many?${query.toString()}`);
  },

  deleteInventoryMovement: (id: string, workspace_id: string) =>
    request<{ isDeleted: boolean; message: string }>(`/inventory-movement/delete/${id}?workspace_id=${workspace_id}`, {
      method: "DELETE",
    }),
};
