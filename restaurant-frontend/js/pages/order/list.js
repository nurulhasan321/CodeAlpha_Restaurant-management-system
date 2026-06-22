// ============================================
// SAVORY — Orders List & Management
// Admin view for daily order tracking
// ============================================

import { MOCK_ORDERS } from '../../mockData.js';
import { renderDataTable } from '../../components/dataTable.js';
import { renderStatCard } from '../../components/card.js';
import { openModal } from '../../components/modal.js';
import { confirmDialog } from '../../components/confirmDialog.js';
import { toast } from '../../components/toast.js';
import {
    escapeHtml, formatCurrency, formatDateTime, formatRelativeTime, formatDate
} from '../../utils/helpers.js';
import {
    ORDER_STATUS, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, ORDER_STATUS_ICONS,
    ORDER_TYPE_LABELS, ORDER_TYPE_COLORS, ORDER_TYPE_ICONS
} from '../../utils/constants.js';

let localOrders = [...MOCK_ORDERS];
let currentDateFilter = new Date().toISOString().split('T')[0]; // Today
let currentStatusFilter = 'ALL';

export function renderOrderList(container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header__left">
                <h1 class="page-header__title">Orders</h1>
                <p class="page-header__subtitle">Track and manage all incoming orders</p>
            </div>
            <div class="page-header__actions">
                <div class="order-date-picker">
                    <label for="order-date-input" class="order-date-picker__label">
                        <i class="bi bi-calendar3"></i> Date:
                    </label>
                    <input type="date" id="order-date-input" class="form-control-savory" 
                           value="${currentDateFilter}">
                </div>
            </div>
        </div>

        <!-- Summary Stats -->
        <div id="order-stats-container" class="orders-stats-grid"></div>

        <!-- Status Filter Tabs -->
        <div class="order-status-tabs" id="order-status-tabs">
            <button class="order-status-tab active" data-status="ALL">
                <span class="order-status-tab__label">All Orders</span>
                <span class="order-status-tab__count" id="count-ALL">0</span>
            </button>
            ${Object.keys(ORDER_STATUS).map(status => `
                <button class="order-status-tab" data-status="${status}">
                    <i class="bi ${ORDER_STATUS_ICONS[status]}"></i>
                    <span class="order-status-tab__label">${ORDER_STATUS_LABELS[status]}</span>
                    <span class="order-status-tab__count" id="count-${status}">0</span>
                </button>
            `).join('')}
        </div>

        <!-- Orders Data Table -->
        <div class="card glass-card">
            <div id="orders-list-container"></div>
        </div>
    `;

    // Wire up date picker
    document.getElementById('order-date-input')?.addEventListener('change', (e) => {
        currentDateFilter = e.target.value;
        renderStats();
        renderStatusCounts();
        renderTable();
    });

    // Wire up status tabs
    document.getElementById('order-status-tabs')?.addEventListener('click', (e) => {
        const tab = e.target.closest('.order-status-tab');
        if (!tab) return;
        currentStatusFilter = tab.dataset.status;
        document.querySelectorAll('.order-status-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderTable();
    });

    renderStats();
    renderStatusCounts();
    renderTable();
}

// ---- Helpers ----

function getFilteredByDate() {
    return localOrders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === currentDateFilter;
    });
}

function getFilteredOrders() {
    let orders = getFilteredByDate();
    if (currentStatusFilter !== 'ALL') {
        orders = orders.filter(o => o.status === currentStatusFilter);
    }
    return orders;
}

// ---- Stats Cards ----

function renderStats() {
    const container = document.getElementById('order-stats-container');
    if (!container) return;

    const dayOrders = getFilteredByDate();
    const totalOrders = dayOrders.length;
    const totalRevenue = dayOrders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.totalAmount, 0);
    const activeOrders = dayOrders.filter(o =>
        ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'].includes(o.status)
    ).length;
    const completedOrders = dayOrders.filter(o => o.status === 'COMPLETED').length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / (totalOrders - dayOrders.filter(o => o.status === 'CANCELLED').length || 1) : 0;

    container.innerHTML = `
        ${renderStatCard({
            label: 'Total Orders',
            value: totalOrders,
            icon: 'bi-receipt',
            iconColor: 'amber',
            trend: totalOrders > 0 ? 'up' : null,
            trendValue: `${activeOrders} active`,
            trendLabel: 'right now'
        })}
        ${renderStatCard({
            label: "Day's Revenue",
            value: formatCurrency(totalRevenue),
            icon: 'bi-currency-dollar',
            iconColor: 'success',
            trend: totalRevenue > 0 ? 'up' : null,
            trendValue: `${completedOrders} paid`,
            trendLabel: 'completed'
        })}
        ${renderStatCard({
            label: 'Active Orders',
            value: activeOrders,
            icon: 'bi-lightning-charge-fill',
            iconColor: 'orange',
            trend: activeOrders > 0 ? 'up' : null,
            trendValue: 'In progress',
            trendLabel: ''
        })}
        ${renderStatCard({
            label: 'Avg. Order Value',
            value: formatCurrency(avgOrderValue),
            icon: 'bi-graph-up-arrow',
            iconColor: 'info',
            trend: avgOrderValue > 50 ? 'up' : 'down',
            trendValue: formatCurrency(avgOrderValue),
            trendLabel: 'per order'
        })}
    `;
}

// ---- Status Counts ----

function renderStatusCounts() {
    const dayOrders = getFilteredByDate();
    
    const countAll = document.getElementById('count-ALL');
    if (countAll) countAll.textContent = dayOrders.length;

    Object.keys(ORDER_STATUS).forEach(status => {
        const countEl = document.getElementById(`count-${status}`);
        if (countEl) {
            const count = dayOrders.filter(o => o.status === status).length;
            countEl.textContent = count;
        }
    });
}

// ---- Data Table ----

function renderTable() {
    const tableContainer = document.getElementById('orders-list-container');
    if (!tableContainer) return;

    const columns = [
        {
            key: 'id',
            label: 'Order #',
            sortable: true,
            width: '100px',
            render: (val) => `
                <span class="order-id-badge">#${val}</span>
            `
        },
        {
            key: 'customer',
            label: 'Customer',
            sortable: true,
            render: (val, row) => `
                <div class="d-flex flex-column">
                    <strong class="text-primary">${escapeHtml(val)}</strong>
                    <span class="text-xs text-tertiary">
                        <i class="bi bi-person me-1"></i>${escapeHtml(row.waiter)}
                    </span>
                </div>
            `
        },
        {
            key: 'orderType',
            label: 'Type',
            sortable: true,
            align: 'center',
            render: (val) => {
                const typeColor = ORDER_TYPE_COLORS[val] || 'neutral';
                const typeIcon = ORDER_TYPE_ICONS[val] || 'bi-question';
                const typeLabel = ORDER_TYPE_LABELS[val] || val;
                return `<span class="badge-savory badge-${typeColor}"><i class="bi ${typeIcon} me-1"></i>${typeLabel}</span>`;
            }
        },
        {
            key: 'table',
            label: 'Table',
            sortable: true,
            align: 'center',
            render: (val) => val
                ? `<span class="badge-savory bg-charcoal "><i class="bi bi-grid-3x3-gap me-1"></i>${escapeHtml(val)}</span>`
                : `<span class="text-tertiary text-xs">—</span>`
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            align: 'center',
            render: (val) => {
                const color = ORDER_STATUS_COLORS[val] || 'neutral';
                const icon = ORDER_STATUS_ICONS[val] || '';
                return `<span class="badge-savory badge-${color} badge-dot"><i class="bi ${icon} me-1"></i>${ORDER_STATUS_LABELS[val] || val}</span>`;
            }
        },
        {
            key: 'totalAmount',
            label: 'Amount',
            sortable: true,
            align: 'right',
            render: (val, row) => `
                <div class="d-flex flex-column align-items-end">
                    <strong class="${row.status === 'CANCELLED' ? 'text-danger text-decoration-line-through' : 'text-primary'}">${formatCurrency(val)}</strong>
                    <span class="text-xs text-tertiary">${row.items.length} item${row.items.length !== 1 ? 's' : ''}</span>
                </div>
            `
        },
        {
            key: 'createdAt',
            label: 'Time',
            sortable: true,
            align: 'center',
            render: (val) => `
                <span class="text-sm text-tertiary" title="${formatDateTime(val)}">${formatRelativeTime(val)}</span>
            `
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            width: '130px',
            render: (_, row) => `
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn-savory btn-icon text-info btn-view-order" data-id="${row.id}" aria-label="View Order" title="View Details">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${row.status !== 'COMPLETED' && row.status !== 'CANCELLED' ? `
                        <button class="btn-savory btn-icon text-amber btn-update-status" data-id="${row.id}" aria-label="Update Status" title="Update Status">
                            <i class="bi bi-arrow-right-circle"></i>
                        </button>
                    ` : ''}
                    ${row.status === 'PENDING' ? `
                        <button class="btn-savory btn-icon text-danger btn-cancel-order" data-id="${row.id}" aria-label="Cancel Order" title="Cancel Order">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    ` : ''}
                </div>
            `
        }
    ];

    const filteredOrders = getFilteredOrders();

    // Sort by createdAt descending (newest first)
    const sortedData = [...filteredOrders].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    renderDataTable(tableContainer, columns, sortedData, {
        id: 'orders-list',
        searchable: true,
        searchPlaceholder: 'Search by order #, customer, or waiter...',
        emptyIcon: 'bi-receipt-cutoff',
        emptyTitle: 'No Orders Found',
        emptyMessage: currentStatusFilter !== 'ALL'
            ? `No ${ORDER_STATUS_LABELS[currentStatusFilter]?.toLowerCase() || ''} orders for ${formatDate(currentDateFilter)}.`
            : `No orders recorded for ${formatDate(currentDateFilter)}.`
    });

    // Wire up action buttons
    document.querySelectorAll('.btn-view-order').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const order = localOrders.find(o => String(o.id) === String(id));
            if (order) showOrderDetail(order);
        });
    });

    document.querySelectorAll('.btn-update-status').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const order = localOrders.find(o => String(o.id) === String(id));
            if (order) showStatusUpdate(order);
        });
    });

    document.querySelectorAll('.btn-cancel-order').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            cancelOrder(id);
        });
    });
}

// ---- Order Detail Modal ----

function showOrderDetail(order) {
    const statusColor = ORDER_STATUS_COLORS[order.status] || 'neutral';
    const statusIcon = ORDER_STATUS_ICONS[order.status] || '';
    const typeColor = ORDER_TYPE_COLORS[order.orderType] || 'neutral';
    const typeIcon = ORDER_TYPE_ICONS[order.orderType] || 'bi-question';
    const typeLabel = ORDER_TYPE_LABELS[order.orderType] || order.orderType;

    const bodyHtml = `
        <div class="order-detail">
            <!-- Header Info Row -->
            <div class="order-detail__header">
                <div class="order-detail__meta">
                    <div class="order-detail__id">#${order.id}</div>
                    <span class="badge-savory badge-${statusColor} badge-dot">
                        <i class="bi ${statusIcon} me-1"></i>${ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span class="badge-savory badge-${typeColor}">
                        <i class="bi ${typeIcon} me-1"></i>${typeLabel}
                    </span>
                </div>
                <div class="order-detail__time">
                    <i class="bi bi-clock me-1"></i>${formatDateTime(order.createdAt)}
                </div>
            </div>

            <!-- Info Grid -->
            <div class="order-detail__info-grid">
                <div class="order-detail__info-item">
                    <span class="order-detail__info-label"><i class="bi bi-person me-1"></i>Customer</span>
                    <span class="order-detail__info-value">${escapeHtml(order.customer)}</span>
                </div>
                <div class="order-detail__info-item">
                    <span class="order-detail__info-label"><i class="bi bi-person-badge me-1"></i>Waiter</span>
                    <span class="order-detail__info-value">${escapeHtml(order.waiter)}</span>
                </div>
                <div class="order-detail__info-item">
                    <span class="order-detail__info-label"><i class="bi bi-grid-3x3-gap me-1"></i>Table</span>
                    <span class="order-detail__info-value">${order.table ? escapeHtml(order.table) : '—'}</span>
                </div>
            </div>

            ${order.specialNotes ? `
                <div class="order-detail__notes">
                    <i class="bi bi-sticky me-2"></i>
                    <span>${escapeHtml(order.specialNotes)}</span>
                </div>
            ` : ''}

            <!-- Items Table -->
            <div class="order-detail__items-section">
                <h4 class="order-detail__items-title">
                    <i class="bi bi-list-check me-2"></i>Order Items
                </h4>
                <table class="order-detail__items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th style="text-align:center;">Qty</th>
                            <th style="text-align:right;">Price</th>
                            <th style="text-align:right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((item, idx) => `
                            <tr class="animate-fade-in-up" style="animation-delay:${idx * 50}ms;">
                                <td>
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="order-item-number">${idx + 1}</span>
                                        <span>${escapeHtml(item.menuItem)}</span>
                                    </div>
                                </td>
                                <td style="text-align:center;">
                                    <span class="order-item-qty">×${item.quantity}</span>
                                </td>
                                <td style="text-align:right;" class="text-tertiary">${formatCurrency(item.unitPrice)}</td>
                                <td style="text-align:right;"><strong>${formatCurrency(item.subtotal)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <!-- Totals -->
                <div class="order-detail__totals">
                    <div class="order-detail__total-row">
                        <span>Subtotal</span>
                        <span>${formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div class="order-detail__total-row order-detail__total-row--tax">
                        <span>Tax (0%)</span>
                        <span>${formatCurrency(0)}</span>
                    </div>
                    <div class="order-detail__total-row order-detail__total-row--grand">
                        <span>Total</span>
                        <span>${formatCurrency(order.totalAmount)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const footerHtml = `
        <button class="btn-savory btn-outline" id="btn-close-order-detail">Close</button>
        ${order.status !== 'COMPLETED' && order.status !== 'CANCELLED' ? `
            <button class="btn-savory btn-primary" id="btn-advance-status-modal" data-id="${order.id}">
                <i class="bi bi-arrow-right-circle me-1"></i>Advance Status
            </button>
        ` : ''}
    `;

    const modal = openModal({
        title: `Order #${order.id}`,
        size: 'lg',
        body: bodyHtml,
        footer: footerHtml
    });

    document.getElementById('btn-close-order-detail')?.addEventListener('click', () => modal.close());

    document.getElementById('btn-advance-status-modal')?.addEventListener('click', () => {
        modal.close();
        showStatusUpdate(order);
    });
}

// ---- Status Update Modal ----

function showStatusUpdate(order) {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
    const currentIdx = statusFlow.indexOf(order.status);

    const bodyHtml = `
        <div class="status-update">
            <p class="mb-4 text-secondary">
                Update the status of order <strong>#${order.id}</strong> for <strong>${escapeHtml(order.customer)}</strong>.
            </p>

            <div class="status-timeline">
                ${statusFlow.map((status, idx) => {
                    const color = ORDER_STATUS_COLORS[status];
                    const icon = ORDER_STATUS_ICONS[status];
                    const label = ORDER_STATUS_LABELS[status];
                    const isPast = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isNext = idx === currentIdx + 1;
                    const isFuture = idx > currentIdx + 1;

                    let stateClass = '';
                    if (isPast) stateClass = 'completed';
                    else if (isCurrent) stateClass = 'current';
                    else if (isNext) stateClass = 'next';
                    else if (isFuture) stateClass = 'future';

                    return `
                        <div class="status-timeline__step ${stateClass}" data-status="${status}">
                            <div class="status-timeline__icon badge-${color}">
                                <i class="bi ${isPast ? 'bi-check-lg' : icon}"></i>
                            </div>
                            <div class="status-timeline__info">
                                <span class="status-timeline__label">${label}</span>
                                ${isCurrent ? '<span class="status-timeline__badge">Current</span>' : ''}
                                ${isNext ? '<span class="status-timeline__badge next-badge">Next</span>' : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            ${currentIdx < statusFlow.length - 1 ? `
                <div class="status-update__action">
                    <p class="text-sm text-tertiary mt-3 mb-0">
                        <i class="bi bi-info-circle me-1"></i>
                        Click <strong>Advance</strong> to move to 
                        <span class="badge-savory badge-${ORDER_STATUS_COLORS[statusFlow[currentIdx + 1]]} badge-sm">
                            ${ORDER_STATUS_LABELS[statusFlow[currentIdx + 1]]}
                        </span>
                    </p>
                </div>
            ` : ''}
        </div>
    `;

    const nextStatus = currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

    const footerHtml = `
        <button class="btn-savory btn-outline" id="btn-cancel-status">Cancel</button>
        ${nextStatus ? `
            <button class="btn-savory btn-primary" id="btn-confirm-advance">
                <i class="bi bi-arrow-right-circle me-1"></i>Advance to ${ORDER_STATUS_LABELS[nextStatus]}
            </button>
        ` : `
            <button class="btn-savory btn-outline" disabled>Order Complete</button>
        `}
    `;

    const modal = openModal({
        title: 'Update Order Status',
        size: 'md',
        body: bodyHtml,
        footer: footerHtml
    });

    document.getElementById('btn-cancel-status')?.addEventListener('click', () => modal.close());

    document.getElementById('btn-confirm-advance')?.addEventListener('click', () => {
        const btn = document.getElementById('btn-confirm-advance');
        btn.innerHTML = '<div class="btn-spinner"></div> Updating...';
        btn.disabled = true;

        setTimeout(() => {
            const idx = localOrders.findIndex(o => String(o.id) === String(order.id));
            if (idx !== -1) {
                localOrders[idx].status = nextStatus;
                toast.success('Status Updated', `Order #${order.id} moved to ${ORDER_STATUS_LABELS[nextStatus]}.`);
            }
            modal.close();
            renderStats();
            renderStatusCounts();
            renderTable();
        }, 500);
    });
}

// ---- Cancel Order ----

function cancelOrder(id) {
    const order = localOrders.find(o => String(o.id) === String(id));
    if (!order) return;

    confirmDialog({
        title: 'Cancel Order',
        message: `Are you sure you want to cancel order <strong>#${order.id}</strong> for "<strong>${escapeHtml(order.customer)}</strong>"? This action cannot be undone.`,
        type: 'danger',
        confirmText: 'Cancel Order',
        onConfirm: () => {
            setTimeout(() => {
                const idx = localOrders.findIndex(o => String(o.id) === String(id));
                if (idx !== -1) {
                    localOrders[idx].status = 'CANCELLED';
                    renderStats();
                    renderStatusCounts();
                    renderTable();
                    toast.success('Order Cancelled', `Order #${order.id} has been cancelled.`);
                }
            }, 400);
        }
    });
}
