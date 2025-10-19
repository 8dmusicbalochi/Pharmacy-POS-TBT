export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  STOCK_MANAGER = 'Stock Manager',
  CASHIER = 'Cashier',
}

export enum PaymentMethod {
  CASH = 'Cash',
  CARD = 'Card',
}

export enum PurchaseOrderStatus {
  PENDING = 'Pending',
  SUBMITTED = 'Submitted',
  SHIPPED = 'Shipped',
  PARTIALLY_RECEIVED = 'Partially Received',
  RECEIVED = 'Received',
  CANCELLED = 'Cancelled',
}

export enum NotificationType {
  PO_SHIPPED = 'PO Shipped',
  PO_RECEIVED = 'PO Received',
  PO_OVERDUE = 'PO Overdue',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string; // e.g., '#/purchase-orders/po-1'
  isRead: boolean;
  timestamp: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  productSku: string;
  quantityOrdered: number;
  cost: number; // Cost per item
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  createdAt: string;
  submittedAt?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  subtotal: number;
  total: number;
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
    category: string;
    lowStockThreshold: number;
    manufacturer?: string;
    description?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  batchNumber: string;
  expiryDate?: string;
  addedDate: string;
  supplierId?: string;
  supplierName?: string;
  purchaseOrderId?: string;
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
  refundIds?: string[];
  refundedAmount?: number;
}

export interface Refund {
  id: string;
  originalSaleId: string;
  items: CartItem[];
  totalRefundAmount: number;
  totalRefundCost: number;
  reason: string;
  returnedToStock: boolean;
  timestamp: string;
  processedById: string;
  processedByName: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  quantityChange: number;
  newTotalStock: number;
  reason: string;
}

export interface AppSettings {
  appName: string;
  currencySymbol: string;
  appLogo?: string; // Base64 encoded image
  appIcon?: string; // Base64 encoded image
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
}
