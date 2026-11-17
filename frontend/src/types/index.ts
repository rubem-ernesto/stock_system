export interface User {
  id: string;
  name: string;
  email: string;
  birthdate: string;
  slug: string;
  status: "ACTIVE" | "DELETED" | "PADDING" | "SUSPENDED";
  role: "NORMAL" | "ADMIN" | string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  statusCode: number;
  message: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  statusCode: number;
  message: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  planId: number;
  ownerId: string;
  description?: string | null;
  status: "ACTIVE" | "DELETED" | "PADDING" | "SUSPENDED";
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  purchasedPrice: number;
  price: number;
  quantity: number;
  minQuantity: number;
  unit?: string | null;
  slug: string;
  cadasterId: string;
  workspaceId: string;
  status: "ACTIVE" | "DELETED" | "PADDING" | "SUSPENDED";
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface InventoryMovement {
  id: string;
  workspaceId: string;
  userId: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUST" | "DELETE" | "RESTORE";
  status: "ACTIVE" | "DELETED" | "PADDING" | "SUSPENDED";
  reason?: "VENDA" | "COMPRA" | "PERDA" | "DEVOLUCAO" | "AJUSTE" | "OUTRO" | null;
  quantity: number;
  unitPrice?: number | null;
  totalPrice?: number | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  product?: Product;
}
