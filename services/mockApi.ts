import { User, UserRole, Product, Sale, AuditLog, AppSettings, Category, Supplier, CartItem, InventoryItem, Task } from '../types';

const USERS_KEY = 'pharmacy_users';
const PRODUCTS_KEY = 'pharmacy_products';
const INVENTORY_KEY = 'pharmacy_inventory';
const SALES_KEY = 'pharmacy_sales';
const AUDIT_LOGS_KEY = 'pharmacy_audit_logs';
const SETTINGS_KEY = 'pharmacy_settings';
const CATEGORIES_KEY = 'pharmacy_categories';
const SUPPLIERS_KEY = 'pharmacy_suppliers';
const TASKS_KEY = 'pharmacy_tasks';

const getInitialUsers = (): User[] => [
  { id: 'u1', username: 'admin', password: 'password', role: UserRole.SUPER_ADMIN, name: 'Admin User' },
  { id: 'u2', username: 'manager', password: 'password', role: UserRole.STOCK_MANAGER, name: 'Stock Manager' },
  { id: 'u3', username: 'cashier', password: 'password', role: UserRole.CASHIER, name: 'Cashier User' },
];

const getInitialCategories = (): Category[] => [
    { id: 'cat-1', name: 'Medicine' },
    { id: 'cat-2', name: 'Personal Care' },
    { id: 'cat-3', name: 'General' },
];

const getInitialSuppliers = (): Supplier[] => [
    { id: 'sup-1', name: 'PharmaCore Inc.', contactPerson: 'John Doe', email: 'john.doe@pharmacore.com', phone: '123-456-7890', address: '123 Health St, Medville' },
    { id: 'sup-2', name: 'Wellness Supplies Ltd.', contactPerson: 'Jane Smith', email: 'jane.s@wellnessltd.com', phone: '987-654-3210', address: '456 Wellness Ave, Caretown' },
];

const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

const getInitialProducts = (): Product[] => [
  { id: 'p1', sku: 'MED-001', name: 'Paracetamol 500mg', price: 5.99, cost: 2.50, category: 'Medicine', lowStockThreshold: 20, supplierId: 'sup-1', supplierName: 'PharmaCore Inc.', manufacturer: 'Global Pharma', description: '500mg tablets for pain relief.' },
  { id: 'p2', sku: 'MED-002', name: 'Ibuprofen 200mg', price: 8.50, cost: 4.00, category: 'Medicine', lowStockThreshold: 20, supplierId: 'sup-1', supplierName: 'PharmaCore Inc.', manufacturer: 'Global Pharma', description: '200mg anti-inflammatory tablets.' },
  { id: 'p3', sku: 'PC-001', name: 'Organic Shampoo', price: 3.25, cost: 1.10, category: 'Personal Care', lowStockThreshold: 10, supplierId: 'sup-2', supplierName: 'Wellness Supplies Ltd.', manufacturer: 'NatureWell' },
  { id: 'p4', sku: 'GEN-001', name: 'Hand Sanitizer', price: 4.00, cost: 1.50, category: 'General', lowStockThreshold: 30, supplierId: 'sup-2', supplierName: 'Wellness Supplies Ltd.', manufacturer: 'CleanHands Co.' },
  { id: 'p5', sku: 'MED-003', name: 'Aspirin 100mg', price: 15, cost: 7.20, category: 'Medicine', lowStockThreshold: 20, supplierId: 'sup-1', supplierName: 'PharmaCore Inc.', manufacturer: 'HealthCorp' },
  { id: 'p6', sku: 'GEN-002', name: 'Digital Thermometer', price: 15.00, cost: 5.00, category: 'General', lowStockThreshold: 10, manufacturer: 'MedTech' },
  { id: 'p7', sku: 'PC-002', name: 'Protein Bar', price: 2.50, cost: 0.80, category: 'Personal Care', lowStockThreshold: 50, supplierId: 'sup-2', supplierName: 'Wellness Supplies Ltd.', manufacturer: 'GoodFoods' },
];

const getInitialInventory = (): InventoryItem[] => [
    { id: 'inv1', productId: 'p1', quantity: 100, expiryDate: getFutureDate(365), addedDate: new Date().toISOString() },
    { id: 'inv2', productId: 'p1', quantity: 50, expiryDate: getFutureDate(180), addedDate: new Date().toISOString() },
    { id: 'inv3', productId: 'p2', quantity: 80, expiryDate: getFutureDate(25), addedDate: new Date().toISOString() },
    { id: 'inv4', productId: 'p3', quantity: 40, expiryDate: getFutureDate(-10), addedDate: new Date().toISOString() },
    { id: 'inv5', productId: 'p4', quantity: 120, expiryDate: getFutureDate(180), addedDate: new Date().toISOString() },
    { id: 'inv6', productId: 'p5', quantity: 100, expiryDate: getFutureDate(700), addedDate: new Date().toISOString() },
    { id: 'inv7', productId: 'p6', quantity: 50, addedDate: new Date().toISOString() },
    { id: 'inv8', productId: 'p7', quantity: 200, expiryDate: getFutureDate(90), addedDate: new Date().toISOString() },
];

const getInitialTasks = (): Task[] => [
    {
        id: 'task-1',
        title: 'Monthly stock count for Medicine category',
        description: 'Perform a full stock count for all products in the Medicine category. Report discrepancies.',
        dueDate: getFutureDate(10),
        isCompleted: false,
        assignedToId: 'u2',
        assignedToName: 'Stock Manager',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-2',
        title: 'Follow up with PharmaCore Inc. on backorder',
        description: 'Check the status of the delayed shipment of Aspirin 100mg.',
        dueDate: getFutureDate(2),
        isCompleted: false,
        assignedToId: 'u2',
        assignedToName: 'Stock Manager',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-3',
        title: 'Clear out expired products from shelf',
        description: '',
        dueDate: getFutureDate(-5), // Overdue
        isCompleted: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-4',
        title: 'Plan seasonal promotion for Personal Care items',
        description: 'Create a bundle offer for the upcoming holiday season.',
        dueDate: getFutureDate(25),
        isCompleted: true,
        createdAt: new Date().toISOString(),
    }
]

const getInitialSettings = (): AppSettings => ({
  appName: 'Pharmasist',
  currencySymbol: '$',
});

const seedData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(getInitialUsers()));
  }
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(getInitialCategories()));
  }
   if (!localStorage.getItem(SUPPLIERS_KEY)) {
    localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(getInitialSuppliers()));
  }
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(getInitialProducts()));
  }
  if (!localStorage.getItem(INVENTORY_KEY)) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(getInitialInventory()));
  }
  if (!localStorage.getItem(SALES_KEY)) {
    localStorage.setItem(SALES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(AUDIT_LOGS_KEY)) {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(getInitialSettings()));
  }
  if (!localStorage.getItem(TASKS_KEY)) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(getInitialTasks()));
  }
};

seedData();

// This function is for authentication and should not be exposed to the UI directly.
const getUsersWithPasswords = (): User[] => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

const api = {
  // USERS
  getUsers: (): Omit<User, 'password'>[] => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
    return users.map(({ password, ...user }) => user);
  },
  getUsersForAuth: getUsersWithPasswords,
  saveUser: (user: User): User => {
    const users = getUsersWithPasswords();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        if (!user.password) {
            user.password = users[index].password;
        }
        users[index] = user;
    } else {
        if(!user.password) throw new Error("Password is required for new users.");
        users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
  deleteUser: (userId: string): void => {
    let users = getUsersWithPasswords();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },


  // PRODUCTS
  getProducts: (): Product[] => {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]').sort((a: Product, b: Product) => a.name.localeCompare(b.name));
  },
  saveProduct: (product: Product): Product => {
    const products = api.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return product;
  },
  deleteProduct: (productId: string): void => {
    let products = api.getProducts();
    products = products.filter(p => p.id !== productId);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    // Also delete associated inventory items
    let inventory = api.getInventory();
    inventory = inventory.filter(i => i.productId !== productId);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  },
  bulkAddProducts: (newProducts: Omit<Product, 'id'>[]): { added: number, updated: number } => {
    const products = api.getProducts();
    let added = 0;
    let updated = 0;

    newProducts.forEach(newProduct => {
      const index = products.findIndex(p => p.sku.toLowerCase() === newProduct.sku.toLowerCase());
      if (index !== -1) {
        products[index] = { ...products[index], ...newProduct };
        updated++;
      } else {
        products.push({ ...newProduct, id: `prod-${Date.now()}-${Math.random()}` });
        added++;
      }
    });

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return { added, updated };
  },

  // INVENTORY
  getInventory: (): InventoryItem[] => {
    return JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');
  },
  saveInventoryItem: (item: InventoryItem): InventoryItem => {
    const inventory = api.getInventory();
    const index = inventory.findIndex(i => i.id === item.id);
     if (index !== -1) {
      inventory[index] = item;
    } else {
      inventory.push(item);
    }
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    return item;
  },

  // SALES
  getSales: (): Sale[] => {
    return JSON.parse(localStorage.getItem(SALES_KEY) || '[]').sort((a: Sale, b: Sale) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  addSale: (sale: Omit<Sale, 'id' | 'totalCost' | 'totalProfit'>): Sale => {
    const sales = api.getSales();
    const products = api.getProducts();
    let inventory = api.getInventory();

    const itemsWithCost: CartItem[] = sale.items.map(item => {
        const product = products.find(p => p.id === item.id);
        return { ...item, cost: product?.cost || 0 };
    });

    const totalCost = itemsWithCost.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0);
    const totalProfit = sale.total - totalCost;

    const newSale: Sale = {
        ...sale,
        id: `sale-${Date.now()}`,
        items: itemsWithCost,
        totalCost,
        totalProfit,
    };
    
    // Update inventory using FEFO (First-Expired, First-Out)
    newSale.items.forEach(item => {
        let quantityToDeduct = item.quantity;
        const productBatches = inventory
            .filter(i => i.productId === item.id && i.quantity > 0)
            .sort((a, b) => {
                const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
                const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
                if(dateA === dateB) {
                    return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime(); // FIFO for same expiry
                }
                return dateA - dateB; // FEFO
            });

        for (const batch of productBatches) {
            if (quantityToDeduct <= 0) break;

            const deductAmount = Math.min(quantityToDeduct, batch.quantity);
            batch.quantity -= deductAmount;
            quantityToDeduct -= deductAmount;
        }
    });

    const updatedInventory = inventory.filter(i => i.quantity > 0);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));

    sales.push(newSale);
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
    
    return newSale;
  },

  // AUDIT LOGS
  getAuditLogs: (): AuditLog[] => {
    return JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || '[]').sort((a: AuditLog, b: AuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  addAuditLog: (log: Omit<AuditLog, 'id'>): AuditLog => {
    const logs = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || '[]') as AuditLog[];
    const newLog: AuditLog = { ...log, id: `log-${Date.now()}` };
    logs.unshift(newLog);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
    return newLog;
  },

  // SETTINGS
  getSettings: (): AppSettings => {
    const settingsStr = localStorage.getItem(SETTINGS_KEY);
    return settingsStr ? JSON.parse(settingsStr) : getInitialSettings();
  },
  saveSettings: (settings: AppSettings): AppSettings => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  },

  // CATEGORIES
  getCategories: (): Category[] => {
      return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]').sort((a: Category, b: Category) => a.name.localeCompare(b.name));
  },
  saveCategory: (category: Category): Category => {
      const categories = api.getCategories();
      const index = categories.findIndex(c => c.id === category.id);
      
      if (index !== -1) {
          const oldCategoryName = categories[index].name;
          categories[index] = category;
          if (oldCategoryName !== category.name) {
              const products = api.getProducts();
              const updatedProducts = products.map(p => 
                  p.category === oldCategoryName ? { ...p, category: category.name } : p
              );
              localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
          }
      } else {
          categories.push(category);
      }
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      return category;
  },
  deleteCategory: (categoryId: string): void => {
      const categories = api.getCategories();
      const categoryToDelete = categories.find(c => c.id === categoryId);
      if (!categoryToDelete || categoryToDelete.name === 'General') {
        return;
      }

      const products = api.getProducts();
      const updatedProducts = products.map(p => 
          p.category === categoryToDelete.name ? { ...p, category: 'General' } : p
      );
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));

      const updatedCategories = categories.filter(c => c.id !== categoryId);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
  },
    // SUPPLIERS
    getSuppliers: (): Supplier[] => {
        return JSON.parse(localStorage.getItem(SUPPLIERS_KEY) || '[]').sort((a: Supplier, b: Supplier) => a.name.localeCompare(b.name));
    },
    saveSupplier: (supplier: Supplier): Supplier => {
        const suppliers = api.getSuppliers();
        const index = suppliers.findIndex(s => s.id === supplier.id);
        if (index !== -1) {
            const oldSupplierName = suppliers[index].name;
            suppliers[index] = supplier;
             if (oldSupplierName !== supplier.name) {
              const products = api.getProducts();
              const updatedProducts = products.map(p => 
                  p.supplierName === oldSupplierName ? { ...p, supplierName: supplier.name } : p
              );
              localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
          }
        } else {
            suppliers.push(supplier);
        }
        localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
        return supplier;
    },
    deleteSupplier: (supplierId: string): void => {
        const suppliers = api.getSuppliers();
        const updatedSuppliers = suppliers.filter(s => s.id !== supplierId);
        localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(updatedSuppliers));
        
        const products = api.getProducts();
        const updatedProducts = products.map(p => {
            if (p.supplierId === supplierId) {
                const { supplierId, supplierName, ...rest } = p;
                return rest;
            }
            return p;
        });
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
    },

    // TASKS
    getTasks: (): Task[] => {
        return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]').sort((a: Task, b: Task) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    },
    saveTask: (task: Task): Task => {
        const tasks = api.getTasks();
        const index = tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
            tasks[index] = task;
        } else {
            tasks.push(task);
        }
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        return task;
    },
    deleteTask: (taskId: string): void => {
        let tasks = api.getTasks();
        tasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    },
};

export default api;
