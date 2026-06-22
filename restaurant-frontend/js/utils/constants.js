// ============================================
// SAVORY — Constants
// Enums, API URL, Status Maps, Roles
// ============================================

export const API_BASE_URL = 'http://localhost:8080/api';

// User Roles
export const ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    WAITER: 'WAITER',
    CUSTOMER: 'CUSTOMER'
};

export const ROLE_LABELS = {
    ADMIN: 'Administrator',
    MANAGER: 'Manager',
    WAITER: 'Waiter',
    CUSTOMER: 'Customer'
};

export const ROLE_COLORS = {
    ADMIN: 'danger',
    MANAGER: 'info',
    WAITER: 'amber',
    CUSTOMER: 'success'
};

// Order Statuses
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    SERVED: 'SERVED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

export const ORDER_STATUS_LABELS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PREPARING: 'Preparing',
    READY: 'Ready',
    SERVED: 'Served',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
};

export const ORDER_STATUS_COLORS = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    PREPARING: 'amber',
    READY: 'orange',
    SERVED: 'success',
    COMPLETED: 'success',
    CANCELLED: 'danger'
};

export const ORDER_STATUS_ICONS = {
    PENDING: 'bi-hourglass-split',
    CONFIRMED: 'bi-check-circle',
    PREPARING: 'bi-fire',
    READY: 'bi-bell',
    SERVED: 'bi-cup-straw',
    COMPLETED: 'bi-check-all',
    CANCELLED: 'bi-x-octagon'
};

export const ORDER_TYPE = {
    DINE_IN: 'DINE_IN',
    TAKEAWAY: 'TAKEAWAY',
    DELIVERY: 'DELIVERY'
};

export const ORDER_TYPE_LABELS = {
    DINE_IN: 'Dine In',
    TAKEAWAY: 'Takeaway',
    DELIVERY: 'Delivery'
};

export const ORDER_TYPE_COLORS = {
    DINE_IN: 'info',
    TAKEAWAY: 'amber',
    DELIVERY: 'purple'
};

export const ORDER_TYPE_ICONS = {
    DINE_IN: 'bi-shop',
    TAKEAWAY: 'bi-bag',
    DELIVERY: 'bi-truck'
};

// Reservation Statuses
export const RESERVATION_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED'
};

export const RESERVATION_STATUS_COLORS = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    CANCELLED: 'danger',
    COMPLETED: 'success'
};

// Table Statuses
export const TABLE_STATUS = {
    AVAILABLE: 'AVAILABLE',
    RESERVED: 'RESERVED',
    OCCUPIED: 'OCCUPIED'
};

export const TABLE_STATUS_COLORS = {
    AVAILABLE: 'success',
    RESERVED: 'warning',
    OCCUPIED: 'danger'
};



// Sidebar Navigation Config
export const NAV_ITEMS = [
    {
        group: 'Main',
        items: [
            { label: 'Dashboard', icon: 'bi-grid-1x2-fill', route: '/dashboard', roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER] },
        ]
    },
    {
        group: 'Restaurant',
        items: [
            { label: 'Menu', icon: 'bi-book', route: '/menu', roles: [ROLES.ADMIN, ROLES.MANAGER] },
            { label: 'Categories', icon: 'bi-tag', route: '/categories', roles: [ROLES.ADMIN, ROLES.MANAGER] },
            { label: 'Tables', icon: 'bi-grid-3x3-gap', route: '/tables', roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER] },
            { label: 'Reservations', icon: 'bi-calendar-check', route: '/reservations', roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER, ROLES.CUSTOMER] },
        ]
    },
    {
        group: 'Operations',
        items: [
            { label: 'Orders', icon: 'bi-receipt', route: '/orders', roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER, ROLES.CUSTOMER] },
        ]
    },
    {
        group: 'Inventory',
        items: [
            { label: 'Inventory', icon: 'bi-box-seam', route: '/inventory', roles: [ROLES.ADMIN, ROLES.MANAGER] },
        ]
    },
    {
        group: 'People',
        items: [
            { label: 'Customers', icon: 'bi-people', route: '/customers', roles: [ROLES.ADMIN, ROLES.MANAGER] },
            { label: 'Staff', icon: 'bi-person-badge', route: '/staff', roles: [ROLES.ADMIN] },
        ]
    },
    {
        group: 'Analytics',
        items: [
            { label: 'Reports', icon: 'bi-bar-chart-line', route: '/reports', roles: [ROLES.ADMIN, ROLES.MANAGER] },
        ]
    },
    {
        group: 'System',
        items: [
            { label: 'Settings', icon: 'bi-gear', route: '/settings', roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER, ROLES.CUSTOMER] },
        ]
    }
];

// Chart Colors
export const CHART_COLORS = {
    amber: 'rgba(245, 158, 11, 1)',
    amberLight: 'rgba(245, 158, 11, 0.15)',
    orange: 'rgba(249, 115, 22, 1)',
    orangeLight: 'rgba(249, 115, 22, 0.15)',
    success: 'rgba(34, 197, 94, 1)',
    successLight: 'rgba(34, 197, 94, 0.15)',
    danger: 'rgba(239, 68, 68, 1)',
    dangerLight: 'rgba(239, 68, 68, 0.15)',
    info: 'rgba(59, 130, 246, 1)',
    infoLight: 'rgba(59, 130, 246, 0.15)',
    purple: 'rgba(147, 51, 234, 1)',
    purpleLight: 'rgba(147, 51, 234, 0.15)',
    teal: 'rgba(20, 184, 166, 1)',
    tealLight: 'rgba(20, 184, 166, 0.15)',
    charcoal: 'rgba(30, 30, 46, 1)',
    charcoalLight: 'rgba(30, 30, 46, 0.15)',
};

export const CHART_PALETTE = [
    CHART_COLORS.amber,
    CHART_COLORS.orange,
    CHART_COLORS.info,
    CHART_COLORS.success,
    CHART_COLORS.purple,
    CHART_COLORS.teal,
    CHART_COLORS.danger,
];

export const CHART_PALETTE_LIGHT = [
    CHART_COLORS.amberLight,
    CHART_COLORS.orangeLight,
    CHART_COLORS.infoLight,
    CHART_COLORS.successLight,
    CHART_COLORS.purpleLight,
    CHART_COLORS.tealLight,
    CHART_COLORS.dangerLight,
];
