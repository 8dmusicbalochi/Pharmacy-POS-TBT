export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  STOCK_MANAGER = 'Stock Manager',
  CASHIER = 'Cashier',
}

export enum PaymentMethod {
  CASH = 'Cash',
  CARD = 'Card',
}

export interface Category {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Product {
    id: string;
    sku: string;
    name: string;
    price: number;
    cost?: number;
    stock: number;
    category: string;
    lowStockThreshold: number;
    expiryDate?: string; // e.g., 'YYYY-MM-DD'
    supplierId?: string;
    supplierName?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  total: number;
  totalCost?: number;
  totalProfit?: number;
  timestamp: string;
  cashierId: string;
  cashierName: string;
  paymentMethod: PaymentMethod;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  oldStock: number;
  newStock: number;
  reason: string;
}

export interface AppSettings {
  appName: string;
  currencySymbol: string;
  appLogo?: string; // Base64 encoded image
  appIcon?: string; // Base64 encoded image
}