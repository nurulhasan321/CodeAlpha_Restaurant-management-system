// ============================================
// SAVORY — Mock Data Layer
// Provides demo data when backend is unavailable
// ============================================

export const MOCK_USER = {
    id: 1,
    name: 'John Anderson',
    email: 'admin@savory.com',
    role: 'ADMIN',
    phone: '+1 234 567 8900',
    avatar: null,
    createdAt: '2024-01-15T10:00:00Z',
};

export const MOCK_CATEGORIES = [
    { id: 1, name: 'Appetizers', description: 'Light starters and small bites', active: true, itemCount: 8 },
    { id: 2, name: 'Main Course', description: 'Hearty and fulfilling entrees', active: true, itemCount: 15 },
    { id: 3, name: 'Desserts', description: 'Sweet treats and indulgences', active: true, itemCount: 6 },
    { id: 4, name: 'Beverages', description: 'Refreshing drinks and cocktails', active: true, itemCount: 12 },
    { id: 5, name: 'Salads', description: 'Fresh and healthy options', active: true, itemCount: 5 },
    { id: 6, name: 'Soups', description: 'Warm and comforting soups', active: false, itemCount: 4 },
];

export const MOCK_MENU_ITEMS = [
    { id: 1, name: 'Truffle Mushroom Bruschetta', description: 'Toasted ciabatta topped with wild mushrooms and truffle oil', price: 14.99, category: 'Appetizers', categoryId: 1, available: true, image: null, ingredients: ['Ciabatta', 'Mushrooms', 'Truffle Oil'] },
    { id: 2, name: 'Grilled Salmon Fillet', description: 'Atlantic salmon with lemon butter sauce and seasonal vegetables', price: 28.99, category: 'Main Course', categoryId: 2, available: true, image: null, ingredients: ['Salmon', 'Butter', 'Lemon', 'Asparagus'] },
    { id: 3, name: 'Wagyu Beef Steak', description: 'Premium wagyu beef with red wine reduction', price: 52.99, category: 'Main Course', categoryId: 2, available: true, image: null, ingredients: ['Wagyu Beef', 'Red Wine', 'Garlic'] },
    { id: 4, name: 'Crème Brûlée', description: 'Classic French vanilla custard with caramelized sugar', price: 12.99, category: 'Desserts', categoryId: 3, available: true, image: null, ingredients: ['Cream', 'Vanilla', 'Sugar', 'Eggs'] },
    { id: 5, name: 'Caesar Salad', description: 'Romaine lettuce with parmesan, croutons, and caesar dressing', price: 11.99, category: 'Salads', categoryId: 5, available: true, image: null, ingredients: ['Lettuce', 'Parmesan', 'Croutons'] },
    { id: 6, name: 'Tiramisu', description: 'Italian coffee-flavored dessert with mascarpone', price: 13.99, category: 'Desserts', categoryId: 3, available: true, image: null, ingredients: ['Mascarpone', 'Coffee', 'Ladyfingers'] },
    { id: 7, name: 'Lobster Bisque', description: 'Creamy lobster soup with a hint of sherry', price: 16.99, category: 'Soups', categoryId: 6, available: false, image: null, ingredients: ['Lobster', 'Cream', 'Sherry'] },
    { id: 8, name: 'Craft Cocktail', description: 'Signature house cocktail with premium spirits', price: 15.99, category: 'Beverages', categoryId: 4, available: true, image: null, ingredients: ['Spirits', 'Fresh Juice', 'Bitters'] },
    { id: 9, name: 'Pan-Seared Duck', description: 'Duck breast with cherry gastrique and roasted root vegetables', price: 36.99, category: 'Main Course', categoryId: 2, available: true, image: null, ingredients: ['Duck', 'Cherries', 'Root Vegetables'] },
    { id: 10, name: 'Margherita Pizza', description: 'San Marzano tomatoes, fresh mozzarella, basil on wood-fired dough', price: 18.99, category: 'Main Course', categoryId: 2, available: true, image: null, ingredients: ['Dough', 'Mozzarella', 'Tomatoes', 'Basil'] },
];

export const MOCK_TABLES = [
    { id: 1, tableNumber: 'T1', capacity: 2, location: 'Window', status: 'AVAILABLE' },
    { id: 2, tableNumber: 'T2', capacity: 4, location: 'Main Hall', status: 'OCCUPIED' },
    { id: 3, tableNumber: 'T3', capacity: 6, location: 'Main Hall', status: 'RESERVED' },
    { id: 4, tableNumber: 'T4', capacity: 2, location: 'Patio', status: 'AVAILABLE' },
    { id: 5, tableNumber: 'T5', capacity: 8, location: 'Private Room', status: 'OCCUPIED' },
    { id: 6, tableNumber: 'T6', capacity: 4, location: 'Window', status: 'AVAILABLE' },
    { id: 7, tableNumber: 'T7', capacity: 4, location: 'Main Hall', status: 'AVAILABLE' },
    { id: 8, tableNumber: 'T8', capacity: 6, location: 'Patio', status: 'RESERVED' },
    { id: 9, tableNumber: 'T9', capacity: 2, location: 'Bar Area', status: 'OCCUPIED' },
    { id: 10, tableNumber: 'T10', capacity: 10, location: 'Private Room', status: 'AVAILABLE' },
    { id: 11, tableNumber: 'T11', capacity: 4, location: 'Main Hall', status: 'AVAILABLE' },
    { id: 12, tableNumber: 'T12', capacity: 2, location: 'Window', status: 'RESERVED' },
];

export const MOCK_RESERVATIONS = [
    { id: 1, customer: 'Emily Parker', table: 'T3', tableId: 3, date: '2026-06-18', time: '19:00', guestCount: 4, specialRequest: 'Birthday celebration', status: 'CONFIRMED', phone: '+1 555 0101' },
    { id: 2, customer: 'Michael Chen', table: 'T8', tableId: 8, date: '2026-06-18', time: '20:00', guestCount: 6, specialRequest: 'Allergic to shellfish', status: 'PENDING', phone: '+1 555 0102' },
    { id: 3, customer: 'Sarah Wilson', table: 'T12', tableId: 12, date: '2026-06-17', time: '18:30', guestCount: 2, specialRequest: '', status: 'COMPLETED', phone: '+1 555 0103' },
    { id: 4, customer: 'David Brown', table: 'T5', tableId: 5, date: '2026-06-19', time: '19:30', guestCount: 8, specialRequest: 'Private dining preferred', status: 'CONFIRMED', phone: '+1 555 0104' },
    { id: 5, customer: 'Lisa Johnson', table: 'T1', tableId: 1, date: '2026-06-17', time: '21:00', guestCount: 2, specialRequest: '', status: 'CANCELLED', phone: '+1 555 0105' },
];

export const MOCK_ORDERS = [
    // --- Today's orders (2026-06-18) ---
    { id: 1006, customer: 'James Mitchell', waiter: 'Alex Thompson', table: 'T1', tableId: 1, status: 'PENDING', orderType: 'DINE_IN', totalAmount: 74.97, specialNotes: 'No onions on the steak', items: [
        { id: 14, menuItem: 'Wagyu Beef Steak', quantity: 1, unitPrice: 52.99, subtotal: 52.99 },
        { id: 15, menuItem: 'Caesar Salad', quantity: 1, unitPrice: 11.99, subtotal: 11.99 },
        { id: 16, menuItem: 'Craft Cocktail', quantity: 1, unitPrice: 15.99, subtotal: 15.99 },
    ], createdAt: '2026-06-18T09:15:00Z' },
    { id: 1007, customer: 'Sophia Martinez', waiter: 'Jessica Rivera', table: 'T6', tableId: 6, status: 'CONFIRMED', orderType: 'DINE_IN', totalAmount: 96.96, specialNotes: '', items: [
        { id: 17, menuItem: 'Truffle Mushroom Bruschetta', quantity: 2, unitPrice: 14.99, subtotal: 29.98 },
        { id: 18, menuItem: 'Pan-Seared Duck', quantity: 1, unitPrice: 36.99, subtotal: 36.99 },
        { id: 19, menuItem: 'Crème Brûlée', quantity: 1, unitPrice: 12.99, subtotal: 12.99 },
        { id: 20, menuItem: 'Lobster Bisque', quantity: 1, unitPrice: 16.99, subtotal: 16.99 },
    ], createdAt: '2026-06-18T09:45:00Z' },
    { id: 1008, customer: 'Oliver Anderson', waiter: 'Alex Thompson', table: 'T2', tableId: 2, status: 'PREPARING', orderType: 'DINE_IN', totalAmount: 57.97, specialNotes: 'Extra spicy', items: [
        { id: 21, menuItem: 'Margherita Pizza', quantity: 1, unitPrice: 18.99, subtotal: 18.99 },
        { id: 22, menuItem: 'Grilled Salmon Fillet', quantity: 1, unitPrice: 28.99, subtotal: 28.99 },
        { id: 23, menuItem: 'Tiramisu', quantity: 1, unitPrice: 13.99, subtotal: 13.99 },
    ], createdAt: '2026-06-18T10:00:00Z' },
    { id: 1009, customer: 'Emma Thompson', waiter: 'Jessica Rivera', table: null, tableId: null, status: 'READY', orderType: 'TAKEAWAY', totalAmount: 45.97, specialNotes: 'Pack separately', items: [
        { id: 24, menuItem: 'Caesar Salad', quantity: 1, unitPrice: 11.99, subtotal: 11.99 },
        { id: 25, menuItem: 'Truffle Mushroom Bruschetta', quantity: 1, unitPrice: 14.99, subtotal: 14.99 },
        { id: 26, menuItem: 'Margherita Pizza', quantity: 1, unitPrice: 18.99, subtotal: 18.99 },
    ], createdAt: '2026-06-18T10:30:00Z' },
    { id: 1010, customer: 'William Harris', waiter: 'Alex Thompson', table: 'T10', tableId: 10, status: 'SERVED', orderType: 'DINE_IN', totalAmount: 168.95, specialNotes: 'Anniversary dinner — please prepare something special', items: [
        { id: 27, menuItem: 'Wagyu Beef Steak', quantity: 2, unitPrice: 52.99, subtotal: 105.98 },
        { id: 28, menuItem: 'Lobster Bisque', quantity: 2, unitPrice: 16.99, subtotal: 33.98 },
        { id: 29, menuItem: 'Crème Brûlée', quantity: 2, unitPrice: 12.99, subtotal: 25.98 },
    ], createdAt: '2026-06-18T11:00:00Z' },
    { id: 1011, customer: 'Ava Rodriguez', waiter: 'Jessica Rivera', table: null, tableId: null, status: 'COMPLETED', orderType: 'DELIVERY', totalAmount: 33.98, specialNotes: 'Delivery to 42 Oak Street', items: [
        { id: 30, menuItem: 'Margherita Pizza', quantity: 1, unitPrice: 18.99, subtotal: 18.99 },
        { id: 31, menuItem: 'Truffle Mushroom Bruschetta', quantity: 1, unitPrice: 14.99, subtotal: 14.99 },
    ], createdAt: '2026-06-18T08:30:00Z' },
    { id: 1012, customer: 'Noah Baker', waiter: 'Alex Thompson', table: 'T4', tableId: 4, status: 'CANCELLED', orderType: 'DINE_IN', totalAmount: 52.99, specialNotes: 'Customer left before serving', items: [
        { id: 32, menuItem: 'Wagyu Beef Steak', quantity: 1, unitPrice: 52.99, subtotal: 52.99 },
    ], createdAt: '2026-06-18T09:00:00Z' },
    // --- Yesterday's orders (2026-06-17) ---
    { id: 1001, customer: 'Emily Parker', waiter: 'Alex Thompson', table: 'T3', tableId: 3, status: 'COMPLETED', orderType: 'DINE_IN', totalAmount: 89.96, specialNotes: '', items: [
        { id: 1, menuItem: 'Truffle Mushroom Bruschetta', quantity: 2, unitPrice: 14.99, subtotal: 29.98 },
        { id: 2, menuItem: 'Grilled Salmon Fillet', quantity: 1, unitPrice: 28.99, subtotal: 28.99 },
        { id: 3, menuItem: 'Crème Brûlée', quantity: 1, unitPrice: 12.99, subtotal: 12.99 },
        { id: 4, menuItem: 'Craft Cocktail', quantity: 1, unitPrice: 15.99, subtotal: 15.99 },
    ], createdAt: '2026-06-17T17:30:00Z' },
    { id: 1002, customer: 'Michael Chen', waiter: 'Jessica Rivera', table: 'T5', tableId: 5, status: 'COMPLETED', orderType: 'DINE_IN', totalAmount: 142.95, specialNotes: 'Allergic to shellfish', items: [
        { id: 5, menuItem: 'Wagyu Beef Steak', quantity: 2, unitPrice: 52.99, subtotal: 105.98 },
        { id: 6, menuItem: 'Caesar Salad', quantity: 2, unitPrice: 11.99, subtotal: 23.98 },
        { id: 7, menuItem: 'Tiramisu', quantity: 1, unitPrice: 13.99, subtotal: 13.99 },
    ], createdAt: '2026-06-17T18:00:00Z' },
    { id: 1003, customer: 'Sarah Wilson', waiter: 'Alex Thompson', table: 'T2', tableId: 2, status: 'COMPLETED', orderType: 'DINE_IN', totalAmount: 47.98, specialNotes: '', items: [
        { id: 8, menuItem: 'Caesar Salad', quantity: 1, unitPrice: 11.99, subtotal: 11.99 },
        { id: 9, menuItem: 'Pan-Seared Duck', quantity: 1, unitPrice: 36.99, subtotal: 36.99 },
    ], createdAt: '2026-06-17T12:00:00Z' },
    { id: 1004, customer: 'David Brown', waiter: 'Jessica Rivera', table: 'T9', tableId: 9, status: 'COMPLETED', orderType: 'DINE_IN', totalAmount: 67.97, specialNotes: '', items: [
        { id: 10, menuItem: 'Margherita Pizza', quantity: 2, unitPrice: 18.99, subtotal: 37.98 },
        { id: 11, menuItem: 'Craft Cocktail', quantity: 2, unitPrice: 15.99, subtotal: 31.98 },
    ], createdAt: '2026-06-17T18:30:00Z' },
    { id: 1005, customer: 'Lisa Johnson', waiter: 'Alex Thompson', table: 'T7', tableId: 7, status: 'CANCELLED', orderType: 'TAKEAWAY', totalAmount: 55.97, specialNotes: '', items: [
        { id: 12, menuItem: 'Lobster Bisque', quantity: 1, unitPrice: 16.99, subtotal: 16.99 },
        { id: 13, menuItem: 'Grilled Salmon Fillet', quantity: 1, unitPrice: 28.99, subtotal: 28.99 },
    ], createdAt: '2026-06-17T19:00:00Z' },
];



export const MOCK_INVENTORY = [
    { id: 1, name: 'Salmon Fillet', quantity: 12, unit: 'kg', minStock: 5, lastUpdated: '2026-06-17T10:00:00Z' },
    { id: 2, name: 'Wagyu Beef', quantity: 3, unit: 'kg', minStock: 5, lastUpdated: '2026-06-17T09:00:00Z' },
    { id: 3, name: 'Fresh Cream', quantity: 8, unit: 'liters', minStock: 3, lastUpdated: '2026-06-17T08:00:00Z' },
    { id: 4, name: 'Vanilla Extract', quantity: 2, unit: 'bottles', minStock: 3, lastUpdated: '2026-06-16T10:00:00Z' },
    { id: 5, name: 'Truffle Oil', quantity: 4, unit: 'bottles', minStock: 2, lastUpdated: '2026-06-17T11:00:00Z' },
    { id: 6, name: 'Mozzarella', quantity: 6, unit: 'kg', minStock: 3, lastUpdated: '2026-06-17T07:00:00Z' },
    { id: 7, name: 'Ciabatta Bread', quantity: 20, unit: 'loaves', minStock: 10, lastUpdated: '2026-06-17T06:00:00Z' },
    { id: 8, name: 'Red Wine', quantity: 1, unit: 'bottles', minStock: 5, lastUpdated: '2026-06-16T10:00:00Z' },
    { id: 9, name: 'Mascarpone', quantity: 4, unit: 'kg', minStock: 2, lastUpdated: '2026-06-17T10:00:00Z' },
    { id: 10, name: 'Duck Breast', quantity: 7, unit: 'kg', minStock: 4, lastUpdated: '2026-06-17T09:00:00Z' },
];

export const MOCK_STAFF = [
    { id: 1, name: 'John Anderson', email: 'admin@savory.com', role: 'ADMIN', active: true, joinDate: '2024-01-15' },
    { id: 2, name: 'Alex Thompson', email: 'alex@savory.com', role: 'WAITER', active: true, joinDate: '2024-03-01' },
    { id: 3, name: 'Jessica Rivera', email: 'jessica@savory.com', role: 'WAITER', active: true, joinDate: '2024-05-10' },
    { id: 4, name: 'Robert Kim', email: 'robert@savory.com', role: 'MANAGER', active: true, joinDate: '2024-02-20' },
    { id: 5, name: 'Amanda Foster', email: 'amanda@savory.com', role: 'WAITER', active: false, joinDate: '2024-06-01' },
];

export const MOCK_CUSTOMERS = [
    { id: 1, name: 'Emily Parker', email: 'emily@example.com', phone: '+1 555 0101', totalOrders: 12, totalSpent: 456.78 },
    { id: 2, name: 'Michael Chen', email: 'michael@example.com', phone: '+1 555 0102', totalOrders: 8, totalSpent: 892.40 },
    { id: 3, name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+1 555 0103', totalOrders: 5, totalSpent: 234.50 },
    { id: 4, name: 'David Brown', email: 'david@example.com', phone: '+1 555 0104', totalOrders: 15, totalSpent: 1250.00 },
    { id: 5, name: 'Lisa Johnson', email: 'lisa@example.com', phone: '+1 555 0105', totalOrders: 3, totalSpent: 167.94 },
];

// Dashboard summary mock
export const MOCK_DASHBOARD = {
    todayRevenue: 3485.50,
    activeOrders: 8,
    reservationsToday: 12,
    occupiedTables: 4,
    availableTables: 6,
    inventoryAlerts: 3,
    pendingPayments: 2,
    topSellingDishes: [
        { name: 'Wagyu Beef Steak', orders: 45, revenue: 2384.55 },
        { name: 'Grilled Salmon', orders: 38, revenue: 1101.62 },
        { name: 'Truffle Bruschetta', orders: 34, revenue: 509.66 },
        { name: 'Crème Brûlée', orders: 30, revenue: 389.70 },
        { name: 'Caesar Salad', orders: 28, revenue: 335.72 },
    ],
    dailySales: [
        { day: 'Mon', amount: 2800 },
        { day: 'Tue', amount: 3200 },
        { day: 'Wed', amount: 2950 },
        { day: 'Thu', amount: 3600 },
        { day: 'Fri', amount: 4200 },
        { day: 'Sat', amount: 5100 },
        { day: 'Sun', amount: 3485 },
    ],
    weeklyRevenue: [
        { week: 'W1', amount: 18500 },
        { week: 'W2', amount: 22300 },
        { week: 'W3', amount: 19800 },
        { week: 'W4', amount: 25335 },
    ],
    orderStatusDistribution: {
        PENDING: 3,
        CONFIRMED: 2,
        PREPARING: 4,
        READY: 1,
        SERVED: 5,
        COMPLETED: 28,
        CANCELLED: 2,
    },
    categorySales: [
        { category: 'Main Course', amount: 12500 },
        { category: 'Appetizers', amount: 4200 },
        { category: 'Desserts', amount: 3800 },
        { category: 'Beverages', amount: 5100 },
        { category: 'Salads', amount: 2300 },
    ],
    recentOrders: [
        { id: 1005, customer: 'Lisa Johnson', amount: 55.97, status: 'CONFIRMED', time: '2 min ago' },
        { id: 1004, customer: 'David Brown', amount: 67.97, status: 'PENDING', time: '12 min ago' },
        { id: 1002, customer: 'Michael Chen', amount: 142.95, status: 'PREPARING', time: '30 min ago' },
        { id: 1001, customer: 'Emily Parker', amount: 89.96, status: 'SERVED', time: '1h ago' },
    ],
    recentReservations: [
        { id: 2, customer: 'Michael Chen', date: '2026-06-18', time: '20:00', guests: 6, status: 'PENDING' },
        { id: 1, customer: 'Emily Parker', date: '2026-06-18', time: '19:00', guests: 4, status: 'CONFIRMED' },
        { id: 4, customer: 'David Brown', date: '2026-06-19', time: '19:30', guests: 8, status: 'CONFIRMED' },
    ],
    recentInventoryUpdates: [
        { item: 'Salmon Fillet', type: 'STOCK_IN', quantity: '+10 kg', time: '2h ago' },
        { item: 'Wagyu Beef', type: 'STOCK_OUT', quantity: '-2 kg', time: '45 min ago' },
        { item: 'Red Wine', type: 'LOW STOCK', quantity: '1 bottle', time: '1d ago' },
    ],
};
