// ============================================
// SAVORY — Navbar Component
// ============================================

import { auth } from '../utils/auth.js';
import { theme } from '../utils/theme.js';
import { getInitials } from '../utils/helpers.js';
import { openMobileSidebar } from './sidebar.js';

export function renderNavbar(container) {
    const user = auth.getUser() || { name: 'User', role: 'ADMIN', email: 'user@savory.com' };
    const initials = getInitials(user.name || user.email);
    const isDark = theme.isDark();

    container.innerHTML = `
        <nav class="navbar glass-navbar" id="navbar" role="navigation" aria-label="Top navigation">
            <div class="navbar__left">
                <button class="navbar__hamburger" id="hamburger-btn" aria-label="Open menu">
                    <i class="bi bi-list"></i>
                </button>
                <div class="navbar__breadcrumb" id="breadcrumb">
                    <a href="#/dashboard" class="navbar__breadcrumb-item"><i class="bi bi-house-door"></i></a>
                    <span class="navbar__breadcrumb-separator"><i class="bi bi-chevron-right"></i></span>
                    <span class="navbar__breadcrumb-item active" id="breadcrumb-current">Dashboard</span>
                </div>
                <div class="navbar__search">
                    <i class="bi bi-search navbar__search-icon"></i>
                    <input type="search" class="navbar__search-input" placeholder="Search anything..."
                           id="global-search" aria-label="Search">
                    <span class="navbar__search-shortcut">⌘K</span>
                </div>
            </div>
            <div class="navbar__right">
                <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
                    <i class="bi bi-sun-fill"></i>
                    <i class="bi bi-moon-stars-fill"></i>
                </button>
                <button class="navbar__icon-btn" id="notifications-btn" aria-label="Notifications">
                    <i class="bi bi-bell"></i>
                    <span class="badge-dot"></span>
                </button>
                <div class="navbar__user" id="user-menu-trigger" style="position:relative;">
                    <div class="navbar__user-avatar">${initials}</div>
                    <div class="navbar__user-info">
                        <div class="navbar__user-name">${user.name || 'User'}</div>
                        <div class="navbar__user-role">${user.role || 'Admin'}</div>
                    </div>
                    <div class="navbar__user-dropdown" id="user-dropdown">
                        <a href="#/settings" class="navbar__user-dropdown-item">
                            <i class="bi bi-person"></i> Profile
                        </a>
                        <a href="#/settings" class="navbar__user-dropdown-item">
                            <i class="bi bi-gear"></i> Settings
                        </a>
                        <div class="navbar__user-dropdown-divider"></div>
                        <button class="navbar__user-dropdown-item danger" id="logout-btn">
                            <i class="bi bi-box-arrow-right"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    `;

    // Event listeners
    document.getElementById('hamburger-btn')?.addEventListener('click', openMobileSidebar);
    document.getElementById('theme-toggle')?.addEventListener('click', () => theme.toggle());
    document.getElementById('logout-btn')?.addEventListener('click', () => auth.logout());

    // User dropdown toggle
    const trigger = document.getElementById('user-menu-trigger');
    const dropdown = document.getElementById('user-dropdown');
    if (trigger && dropdown) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
        document.addEventListener('click', () => dropdown.classList.remove('open'));
    }

    // Keyboard shortcut for search (Cmd+K)
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('global-search')?.focus();
        }
    });
}

export function updateBreadcrumb(items) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;

    let html = `
        <a href="#/dashboard" class="navbar__breadcrumb-item"><i class="bi bi-house-door"></i></a>
    `;

    items.forEach((item, index) => {
        html += `<span class="navbar__breadcrumb-separator"><i class="bi bi-chevron-right"></i></span>`;
        if (index === items.length - 1) {
            html += `<span class="navbar__breadcrumb-item active">${item.label}</span>`;
        } else {
            html += `<a href="#${item.path}" class="navbar__breadcrumb-item">${item.label}</a>`;
        }
    });

    breadcrumb.innerHTML = html;
}
