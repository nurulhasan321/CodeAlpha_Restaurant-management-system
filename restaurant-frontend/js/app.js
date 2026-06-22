// ============================================
// SAVORY — Root App Bootstrapper
// Initializes theme, auth, routing, and layout
// ============================================

import { theme } from './utils/theme.js';
import { auth } from './utils/auth.js';
import { router } from './router.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar, updateBreadcrumb } from './components/navbar.js';
import { toast } from './components/toast.js';

// ---- Auth Pages ----
import { renderLogin } from './pages/auth/login.js';
import { renderRegister } from './pages/auth/register.js';
import { renderForgotPassword } from './pages/auth/forgotPassword.js';
import { renderResetPassword } from './pages/auth/resetPassword.js';
import { renderEmailVerification } from './pages/auth/emailVerification.js';
import { renderUnauthorized } from './pages/auth/unauthorized.js';

// ---- App Pages ----
import { renderCategoryList } from './pages/category/list.js';
import { renderMenuList } from './pages/menu/list.js';
import { renderTableList } from './pages/table/list.js';
import { renderDashboard } from './pages/dashboard/index.js';
import { renderReservationList } from './pages/reservation/list.js';
import { renderOrderList } from './pages/order/list.js';
import { renderInventoryList } from './pages/inventory/list.js';
import { renderStaffList } from './pages/staff/list.js';
import { renderCustomerList } from './pages/customer/list.js';
import { renderNotFound } from './pages/notFound.js';

// Placeholder/Skeleton for un-implemented pages
async function renderComingSoon(container, title, icon = 'bi-cone-striped') {
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header__left">
                <h1 class="page-header__title">${title}</h1>
                <p class="page-header__subtitle">Savory Restaurant Management</p>
            </div>
        </div>
        <div class="card glass-card p-5 text-center mt-4">
            <div class="text-amber mb-4" style="font-size: 3rem;">
                <i class="bi ${icon} animate-pulse"></i>
            </div>
            <h3 class="mb-3">Feature Coming Soon</h3>
            <p class="text-tertiary mb-4">The <strong>${title}</strong> module is currently under development.</p>
            <div class="mx-auto" style="max-width: 500px;">
                <div class="skeleton-line mb-2 w-100"></div>
                <div class="skeleton-line mb-2 w-75 mx-auto"></div>
                <div class="skeleton-line w-50 mx-auto"></div>
            </div>
        </div>
    `;
    updateBreadcrumb([{ label: title, path: window.location.hash.substring(1) }]);
}

// ---- Layout Manager ----
const appContainer = document.getElementById('app');

function setupLayout(isAuthRoute) {
    const hasMainContent = !!document.getElementById('main-content');
    const currentLayout = appContainer.querySelector('.app-layout') ? 'dashboard' : 'auth';
    const targetLayout = isAuthRoute ? 'auth' : 'dashboard';

    if (currentLayout !== targetLayout || !hasMainContent) {
        if (targetLayout === 'dashboard') {
            appContainer.innerHTML = `
                <div class="app-layout">
                    <div id="sidebar-container"></div>
                    <div class="app-layout__main">
                        <div id="navbar-container"></div>
                        <main class="main-content" id="main-content"></main>
                    </div>
                </div>
            `;
            // Render shell components
            renderSidebar(document.getElementById('sidebar-container'));
            renderNavbar(document.getElementById('navbar-container'));
        } else {
            // Auth shell (blank)
            appContainer.innerHTML = `
                <main id="main-content"></main>
            `;
        }
        // Update router's target element
        router.contentEl = document.getElementById('main-content');
    }
}

// ---- Bootstrapper ----
function initApp() {
    // 1. Init Theme
    theme.init();

    // 2. Setup initial layout based on URL
    const hash = window.location.hash || '#/login';
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/unauthorized'];
    const currentPath = hash.substring(1).split('?')[0];
    setupLayout(authRoutes.includes(currentPath));

    // 3. Setup Route Guard & Layout hook
    router.beforeEach(async (to, from) => {
        const isAuthRoute = authRoutes.includes(to.path);
        setupLayout(isAuthRoute);
        return true;
    });

    // Auto-update breadcrumb on every route change
    router.afterEach((to, from) => {
        if (to.title && !authRoutes.includes(to.path)) {
            updateBreadcrumb([{ label: to.title, path: to.path }]);
        }
    });

    // 4. Register Routes
    // Auth Routes
    router.addRoute('/login', renderLogin, { auth: false, title: 'Sign In' });
    router.addRoute('/register', renderRegister, { auth: false, title: 'Create Account' });
    router.addRoute('/forgot-password', renderForgotPassword, { auth: false, title: 'Forgot Password' });
    router.addRoute('/reset-password', renderResetPassword, { auth: false, title: 'Reset Password' });
    router.addRoute('/verify-email', renderEmailVerification, { auth: false, title: 'Verify Email' });
    router.addRoute('/unauthorized', renderUnauthorized, { auth: false, title: 'Unauthorized' });

    // App Routes
    router.addRoute('/dashboard', renderDashboard, { title: 'Dashboard' });
    router.addRoute('/menu', renderMenuList, { title: 'Menu Items' });
    router.addRoute('/categories', renderCategoryList, { title: 'Categories' });
    router.addRoute('/tables', renderTableList, { title: 'Tables' });
    router.addRoute('/reservations', renderReservationList, { title: 'Reservations' });
    router.addRoute('/orders', renderOrderList, { title: 'Order Management' });
    router.addRoute('/inventory', renderInventoryList, { title: 'Inventory Stock' });
    router.addRoute('/customers', renderCustomerList, { title: 'Customers' });
    router.addRoute('/staff', renderStaffList, { title: 'Staff Management', roles: ['ADMIN'] });
    router.addRoute('/reports', (c) => renderComingSoon(c, 'Analytics & Reports', 'bi-bar-chart-line'), { title: 'Reports' });
    router.addRoute('/settings', (c) => renderComingSoon(c, 'System Settings', 'bi-gear'), { title: 'Settings' });

    // 404 Route
    router.addRoute('*', renderNotFound, { auth: false, title: 'Page Not Found' });

    // 5. Start Router
    router.init('#main-content');

    // Hide App Loader
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 500);
    }
}

// Run app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
