// ============================================
// SAVORY — Inventory List
// Admin view for stock tracking
// ============================================

import { MOCK_INVENTORY } from '../../mockData.js';
import { renderDataTable } from '../../components/dataTable.js';
import { renderStatCard } from '../../components/card.js';
import { openModal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';
import { formatDateTime, escapeHtml } from '../../utils/helpers.js';

let localInventory = [...MOCK_INVENTORY];

export function renderInventoryList(container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header__left">
                <h1 class="page-header__title">Inventory Stock</h1>
                <p class="page-header__subtitle">Manage ingredients and track low stock alerts</p>
            </div>
            <div class="page-header__actions">
                <button class="btn-savory btn-primary" id="btn-add-inventory">
                    <i class="bi bi-plus-lg me-2"></i>Add Item
                </button>
            </div>
        </div>

        <!-- Summary Stats -->
        <div id="inventory-stats-container" class="orders-stats-grid"></div>

        <!-- Inventory Data Table -->
        <div class="card glass-card">
            <div id="inventory-list-container"></div>
        </div>
    `;

    document.getElementById('btn-add-inventory')?.addEventListener('click', () => {
        showAddInventoryModal();
    });

    renderStats();
    renderTable();
}

// ---- Stats Cards ----

function renderStats() {
    const container = document.getElementById('inventory-stats-container');
    if (!container) return;

    const totalItems = localInventory.length;
    const lowStockItems = localInventory.filter(item => item.quantity <= item.minStock);
    const outOfStockItems = localInventory.filter(item => item.quantity === 0);
    const healthyItems = totalItems - lowStockItems.length;

    container.innerHTML = `
        ${renderStatCard({
            label: 'Total Ingredients',
            value: totalItems,
            icon: 'bi-box-seam',
            iconColor: 'info',
            trend: null,
            trendValue: 'Tracking',
            trendLabel: 'active items'
        })}
        ${renderStatCard({
            label: 'Healthy Stock',
            value: healthyItems,
            icon: 'bi-check-circle',
            iconColor: 'success',
            trend: null,
            trendValue: `${Math.round((healthyItems / totalItems) * 100)}%`,
            trendLabel: 'of inventory'
        })}
        ${renderStatCard({
            label: 'Low Stock Alerts',
            value: lowStockItems.length,
            icon: 'bi-exclamation-triangle',
            iconColor: 'warning',
            trend: lowStockItems.length > 0 ? 'down' : null,
            trendValue: 'Needs reorder',
            trendLabel: ''
        })}
        ${renderStatCard({
            label: 'Out of Stock',
            value: outOfStockItems.length,
            icon: 'bi-x-octagon',
            iconColor: 'danger',
            trend: outOfStockItems.length > 0 ? 'down' : null,
            trendValue: 'Critical',
            trendLabel: ''
        })}
    `;
}

// ---- Data Table ----

function renderTable() {
    const tableContainer = document.getElementById('inventory-list-container');
    if (!tableContainer) return;

    const columns = [
        {
            key: 'name',
            label: 'Ingredient Name',
            sortable: true,
            render: (val, row) => `
                <div class="d-flex align-items-center gap-3">
                    <div class="avatar-sm bg-tertiary text-secondary rounded-lg d-flex align-items-center justify-content-center">
                        <i class="bi bi-basket"></i>
                    </div>
                    <strong>${escapeHtml(val)}</strong>
                </div>
            `
        },
        {
            key: 'quantity',
            label: 'Current Stock',
            sortable: true,
            align: 'right',
            render: (val, row) => {
                const isLow = val <= row.minStock;
                const isOut = val === 0;
                let textColor = 'text-primary';
                if (isOut) textColor = 'text-danger';
                else if (isLow) textColor = 'text-warning';

                return `
                    <div class="d-flex flex-column align-items-end">
                        <span class="font-mono font-bold text-md ${textColor}">${val} <span class="text-xs text-tertiary font-sans fw-normal">${row.unit}</span></span>
                    </div>
                `;
            }
        },
        {
            key: 'minStock',
            label: 'Min Stock Level',
            sortable: true,
            align: 'right',
            render: (val, row) => `
                <span class="text-tertiary font-mono">${val} ${row.unit}</span>
            `
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            align: 'center',
            render: (_, row) => {
                if (row.quantity === 0) {
                    return '<span class="badge-savory badge-danger badge-dot">Out of Stock</span>';
                }
                if (row.quantity <= row.minStock) {
                    return '<span class="badge-savory badge-warning badge-dot">Low Stock</span>';
                }
                return '<span class="badge-savory badge-success badge-dot">In Stock</span>';
            }
        },
        {
            key: 'lastUpdated',
            label: 'Last Updated',
            sortable: true,
            align: 'right',
            render: (val) => `
                <span class="text-sm text-tertiary">${formatDateTime(val)}</span>
            `
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            width: '100px',
            render: (_, row) => `
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn-savory btn-icon text-info" aria-label="Update Stock" title="Update Stock">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    ${row.quantity <= row.minStock ? `
                        <button class="btn-savory btn-icon text-amber" aria-label="Reorder" title="Reorder Items">
                            <i class="bi bi-cart-plus"></i>
                        </button>
                    ` : ''}
                </div>
            `
        }
    ];

    // Calculate a derived status for sorting purposes
    const dataWithStatus = localInventory.map(item => ({
        ...item,
        status: item.quantity === 0 ? 'Out' : (item.quantity <= item.minStock ? 'Low' : 'OK')
    }));

    renderDataTable(tableContainer, columns, dataWithStatus, {
        id: 'inventory-list',
        searchable: true,
        searchPlaceholder: 'Search ingredients by name...',
        emptyIcon: 'bi-box-seam',
        emptyTitle: 'No Inventory Items',
        emptyMessage: 'Your inventory list is currently empty.'
    });

    // Setup action listeners
    document.querySelectorAll('#inventory-list-container .btn-icon').forEach(btn => {
        btn.addEventListener('click', () => {
            toast.info('Feature Coming Soon', 'Inventory updating is under development.');
        });
    });
}

// ---- Add Inventory Modal ----

function showAddInventoryModal() {
    const bodyHtml = `
        <form id="add-inventory-form" class="p-2">
            <div class="form-group">
                <label for="inv-name" class="form-label">Ingredient Name <span class="required">*</span></label>
                <input type="text" id="inv-name" class="form-control-savory" placeholder="e.g. Fresh Tomatoes" required>
            </div>
            
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inv-qty" class="form-label">Initial Quantity <span class="required">*</span></label>
                        <input type="number" id="inv-qty" class="form-control-savory" placeholder="0" min="0" step="0.1" required>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inv-min" class="form-label">Min Stock <span class="required">*</span></label>
                        <input type="number" id="inv-min" class="form-control-savory" placeholder="0" min="0" step="0.1" required>
                        <small class="form-hint">Alert threshold</small>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inv-unit" class="form-label">Unit <span class="required">*</span></label>
                        <select id="inv-unit" class="form-control-savory form-select-savory" required>
                            <option value="">Select unit</option>
                            <option value="kg">kg</option>
                            <option value="grams">grams</option>
                            <option value="liters">liters</option>
                            <option value="ml">ml</option>
                            <option value="pieces">pieces</option>
                            <option value="bottles">bottles</option>
                            <option value="loaves">loaves</option>
                        </select>
                    </div>
                </div>
            </div>
        </form>
    `;

    const footerHtml = `
        <button type="button" class="btn-savory btn-outline" id="btn-cancel-add-inv">Cancel</button>
        <button type="submit" form="add-inventory-form" class="btn-savory btn-primary">
            <i class="bi bi-check-lg me-1"></i>Add Item
        </button>
    `;

    const modal = openModal({
        title: 'Add Inventory Item',
        size: 'md',
        body: bodyHtml,
        footer: footerHtml
    });

    document.getElementById('btn-cancel-add-inv')?.addEventListener('click', () => modal.close());

    document.getElementById('add-inventory-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('inv-name').value.trim();
        const qty = parseFloat(document.getElementById('inv-qty').value);
        const minStock = parseFloat(document.getElementById('inv-min').value);
        const unit = document.getElementById('inv-unit').value;

        if (!name || isNaN(qty) || isNaN(minStock) || !unit) {
            toast.error('Validation Error', 'Please fill in all required fields correctly.');
            return;
        }

        const newItem = {
            id: Date.now(), // Mock ID
            name,
            quantity: qty,
            minStock,
            unit,
            lastUpdated: new Date().toISOString()
        };

        localInventory.unshift(newItem); // Add to top of list
        
        modal.close();
        toast.success('Item Added', `${escapeHtml(name)} has been added to inventory.`);
        
        renderStats();
        renderTable();
    });
}
