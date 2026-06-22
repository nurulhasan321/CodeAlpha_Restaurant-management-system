// ============================================
// SAVORY — Sidebar Navigation Component
// ============================================

import { NAV_ITEMS } from '../utils/constants.js';
import { auth } from '../utils/auth.js';
import { storage } from '../utils/storage.js';

export function renderSidebar(container) {
    const isCollapsed = storage.get('sidebar_collapsed', false);
    const currentPath = (window.location.hash.substring(1) || '/dashboard').split('?')[0];
    const userRole = auth.getRole();

    const filteredGroups = NAV_ITEMS.map(group => ({
        ...group,
        items: group.items.filter(item =>
            !item.roles || item.roles.length === 0 || (userRole && item.roles.includes(userRole))
        )
    })).filter(group => group.items.length > 0);

    const html = `
        <aside class="sidebar glass-sidebar" id="sidebar">
            <div class="sidebar__brand">
                <span class="sidebar__brand-icon">🍽️</span>
                <span class="sidebar__brand-text">Savory</span>
            </div>
            <nav class="sidebar__nav" role="navigation" aria-label="Main navigation">
                ${filteredGroups.map(group => `
                    <div class="sidebar__nav-group">
                        <div class="sidebar__nav-label">${group.group}</div>
                        ${group.items.map(item => {
                            const isActive = currentPath.startsWith(item.route);
                            return `
                                <a href="#${item.route}" class="sidebar__nav-item ${isActive ? 'active' : ''}"
                                   data-route="${item.route}" id="nav-${item.route.replace(/\//g, '')}">
                                    <i class="sidebar__nav-icon bi ${item.icon}"></i>
                                    <span class="sidebar__nav-text">${item.label}</span>
                                    <span class="sidebar__tooltip">${item.label}</span>
                                </a>
                            `;
                        }).join('')}
                    </div>
                `).join('')}
            </nav>
            <div class="sidebar__footer">
                <button class="sidebar__collapse-btn" id="sidebar-collapse-btn" aria-label="Toggle sidebar">
                    <i class="bi bi-chevron-bar-left"></i>
                    <span class="sidebar__nav-text">Collapse</span>
                </button>
            </div>
        </aside>
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;

    container.innerHTML = html;

    // Apply collapsed state
    const layout = document.querySelector('.app-layout');
    if (isCollapsed && layout) {
        layout.classList.add('sidebar-collapsed');
    }

    // Collapse button
    const collapseBtn = document.getElementById('sidebar-collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', toggleSidebar);
    }

    // Overlay click (mobile)
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobileSidebar);
    }

    // Listen for route changes to update active state
    window.addEventListener('hashchange', () => updateActiveNav());
}

export function toggleSidebar() {
    const layout = document.querySelector('.app-layout');
    if (layout) {
        layout.classList.toggle('sidebar-collapsed');
        storage.set('sidebar_collapsed', layout.classList.contains('sidebar-collapsed'));
    }
}

export function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('mobile-open');
    if (overlay) overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

export function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
}

export function updateActiveNav() {
    const currentPath = (window.location.hash.substring(1) || '/dashboard').split('?')[0];
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
        const route = item.dataset.route;
        if (route) {
            const isActive = currentPath === route || (route !== '/dashboard' && currentPath.startsWith(route + '/'));
            item.classList.toggle('active', isActive);
        }
    });
    // Auto-close mobile sidebar on navigation
    closeMobileSidebar();
}
