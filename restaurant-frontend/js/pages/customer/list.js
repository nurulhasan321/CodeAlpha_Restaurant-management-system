// ============================================
// SAVORY — Customer List
// Admin view for customer database
// ============================================

import { MOCK_CUSTOMERS } from '../../mockData.js';
import { renderDataTable } from '../../components/dataTable.js';
import { renderStatCard } from '../../components/card.js';
import { formatCurrency, escapeHtml } from '../../utils/helpers.js';

let localCustomers = [...MOCK_CUSTOMERS];

export function renderCustomerList(container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header__left">
                <h1 class="page-header__title">Customers</h1>
                <p class="page-header__subtitle">View customer database and order history</p>
            </div>
        </div>

        <div id="customer-stats-container" class="orders-stats-grid"></div>

        <div class="card glass-card">
            <div id="customer-list-container"></div>
        </div>
    `;

    renderStats();
    renderTable();
}

function renderStats() {
    const container = document.getElementById('customer-stats-container');
    if (!container) return;

    const totalCustomers = localCustomers.length;
    const totalSpent = localCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = localCustomers.reduce((sum, c) => sum + c.totalOrders, 0);
    const avgSpent = totalCustomers ? (totalSpent / totalCustomers) : 0;

    container.innerHTML = `
        ${renderStatCard({
            label: 'Total Customers',
            value: totalCustomers,
            icon: 'bi-people',
            iconColor: 'info',
            trend: 'up',
            trendValue: '+15',
            trendLabel: 'this month'
        })}
        ${renderStatCard({
            label: 'Total Value',
            value: formatCurrency(totalSpent),
            icon: 'bi-cash-coin',
            iconColor: 'success',
            trend: null,
            trendValue: 'Lifetime',
            trendLabel: 'revenue'
        })}
        ${renderStatCard({
            label: 'Avg. Value / Customer',
            value: formatCurrency(avgSpent),
            icon: 'bi-graph-up-arrow',
            iconColor: 'amber',
            trend: null,
            trendValue: 'Average',
            trendLabel: 'spent'
        })}
        ${renderStatCard({
            label: 'Total Orders',
            value: totalOrders,
            icon: 'bi-bag-check',
            iconColor: 'purple',
            trend: null,
            trendValue: 'Completed',
            trendLabel: 'transactions'
        })}
    `;
}

function renderTable() {
    const tableContainer = document.getElementById('customer-list-container');
    if (!tableContainer) return;

    const columns = [
        {
            key: 'name',
            label: 'Customer',
            sortable: true,
            render: (val, row) => `
                <div class="d-flex align-items-center gap-3">
                    <div class="avatar-sm rounded-circle bg-tertiary text-secondary d-flex align-items-center justify-content-center fw-bold">
                        ${val.charAt(0)}
                    </div>
                    <div>
                        <div class="font-semibold text-sm">${escapeHtml(val)}</div>
                    </div>
                </div>
            `
        },
        {
            key: 'contact',
            label: 'Contact Info',
            sortable: false,
            render: (_, row) => `
                <div class="text-sm">
                    <div class="mb-1"><i class="bi bi-envelope text-tertiary me-2"></i>${escapeHtml(row.email)}</div>
                    <div><i class="bi bi-telephone text-tertiary me-2"></i>${escapeHtml(row.phone || 'N/A')}</div>
                </div>
            `
        },
        {
            key: 'totalOrders',
            label: 'Total Orders',
            sortable: true,
            align: 'right',
            render: (val) => `
                <span class="font-mono text-sm">${val}</span>
            `
        },
        {
            key: 'totalSpent',
            label: 'Total Spent',
            sortable: true,
            align: 'right',
            render: (val) => `
                <span class="font-bold text-success font-mono text-md">${formatCurrency(val)}</span>
            `
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            width: '80px',
            render: (_, row) => `
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn-savory btn-icon text-primary" aria-label="View Profile">
                        <i class="bi bi-person-lines-fill"></i>
                    </button>
                </div>
            `
        }
    ];

    renderDataTable(tableContainer, columns, localCustomers, {
        id: 'customer-list',
        searchable: true,
        searchPlaceholder: 'Search customers by name, email, or phone...',
        emptyIcon: 'bi-person-x',
        emptyTitle: 'No Customers Found',
        emptyMessage: 'No customer records match your search.'
    });
}
