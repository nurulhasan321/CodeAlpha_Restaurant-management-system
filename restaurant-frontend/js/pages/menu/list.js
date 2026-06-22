// ============================================
// SAVORY — Menu Items List & Form
// ============================================

import { MOCK_MENU_ITEMS, MOCK_CATEGORIES } from '../../mockData.js';
import { renderDataTable } from '../../components/dataTable.js';
import { openModal } from '../../components/modal.js';
import { confirmDialog } from '../../components/confirmDialog.js';
import { toast } from '../../components/toast.js';
import { generateId, escapeHtml, formatCurrency, truncateText } from '../../utils/helpers.js';

let localMenuItems = [...MOCK_MENU_ITEMS];

export function renderMenuList(container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header__left">
                <h1 class="page-header__title">Menu Items</h1>
                <p class="page-header__subtitle">Manage your restaurant offerings</p>
            </div>
            <div class="page-header__actions">
                <button class="btn-savory btn-primary" id="btn-add-menu">
                    <i class="bi bi-plus-lg"></i> Add Menu Item
                </button>
            </div>
        </div>
        <div class="card glass-card">
            <div id="menu-table-container"></div>
        </div>
    `;

    renderTable();

    document.getElementById('btn-add-menu')?.addEventListener('click', () => {
        showMenuForm();
    });
}

function renderTable() {
    const tableContainer = document.getElementById('menu-table-container');
    if (!tableContainer) return;

    const columns = [
        { 
            key: 'name', 
            label: 'Item', 
            sortable: true, 
            render: (val, row) => `
                <div>
                    <strong class="text-primary">${escapeHtml(val)}</strong>
                    <div class="text-tertiary" style="font-size: 0.85rem; margin-top: 2px;">
                        ${escapeHtml(truncateText(row.description, 60))}
                    </div>
                </div>
            ` 
        },
        { 
            key: 'category', 
            label: 'Category', 
            sortable: true,
            render: (val) => `<span class="badge-savory bg-surface text-secondary">${escapeHtml(val)}</span>` 
        },
        { 
            key: 'price', 
            label: 'Price', 
            sortable: true,
            align: 'right',
            render: (val) => `<strong>${formatCurrency(val)}</strong>` 
        },
        { 
            key: 'available', 
            label: 'Availability', 
            sortable: true,
            align: 'center',
            render: (val) => val 
                ? '<span class="badge-savory bg-success-light text-success">Available</span>' 
                : '<span class="badge-savory bg-danger-light text-danger">Sold Out</span>' 
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            width: '100px',
            render: (_, row) => `
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn-savory btn-icon text-info btn-edit-menu" data-id="${row.id}" aria-label="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-savory btn-icon text-danger btn-delete-menu" data-id="${row.id}" aria-label="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `
        }
    ];

    renderDataTable(tableContainer, columns, localMenuItems, {
        id: 'menu-items',
        searchable: true,
        searchPlaceholder: 'Search dishes, ingredients...',
        emptyIcon: 'bi-journal-richtext',
        emptyTitle: 'No Menu Items Found',
        emptyMessage: 'You haven\'t added any dishes to your menu yet.'
    });

    // Attach event listeners to action buttons
    document.querySelectorAll('.btn-edit-menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const item = localMenuItems.find(m => String(m.id) === String(id));
            if (item) showMenuForm(item);
        });
    });

    document.querySelectorAll('.btn-delete-menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            confirmDelete(id);
        });
    });
}

function showMenuForm(existingItem = null) {
    const isEdit = !!existingItem;
    
    // Generate category options dynamically
    const categoryOptions = MOCK_CATEGORIES.map(c => 
        `<option value="${c.id}" ${isEdit && existingItem.categoryId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
    ).join('');

    const bodyHtml = `
        <form id="menu-form">
            <div class="row">
                <div class="col-md-8 form-group">
                    <label class="form-label">Dish Name <span class="text-danger">*</span></label>
                    <input type="text" name="name" class="form-control-savory" 
                           value="${isEdit ? escapeHtml(existingItem.name) : ''}" required>
                </div>
                <div class="col-md-4 form-group">
                    <label class="form-label">Price ($) <span class="text-danger">*</span></label>
                    <input type="number" name="price" class="form-control-savory" step="0.01" min="0" 
                           value="${isEdit ? existingItem.price : ''}" required>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 form-group">
                    <label class="form-label">Category <span class="text-danger">*</span></label>
                    <select name="categoryId" class="form-control-savory" required>
                        <option value="" disabled ${!isEdit ? 'selected' : ''}>Select a category...</option>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="col-md-6 form-group">
                    <label class="form-label">Ingredients (comma separated)</label>
                    <input type="text" name="ingredients" class="form-control-savory" 
                           placeholder="e.g. Flour, Sugar, Eggs"
                           value="${isEdit && existingItem.ingredients ? escapeHtml(existingItem.ingredients.join(', ')) : ''}">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea name="description" class="form-control-savory" rows="3">${isEdit ? escapeHtml(existingItem.description) : ''}</textarea>
            </div>
            
            <div class="form-group mb-0">
                <label class="checkbox-savory">
                    <input type="checkbox" name="available" ${(!isEdit || existingItem.available) ? 'checked' : ''}>
                    <label>Currently Available</label>
                </label>
            </div>
        </form>
    `;

    const footerHtml = `
        <button class="btn-savory btn-outline" id="btn-cancel-menu-form">Cancel</button>
        <button class="btn-savory btn-primary" id="btn-submit-menu-form" form="menu-form">
            ${isEdit ? 'Save Changes' : 'Add Item'}
        </button>
    `;

    const modal = openModal({
        title: isEdit ? 'Edit Menu Item' : 'Add New Menu Item',
        size: 'lg',
        body: bodyHtml,
        footer: footerHtml
    });

    document.getElementById('btn-cancel-menu-form').addEventListener('click', () => modal.close());
    
    document.getElementById('menu-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('btn-submit-menu-form');
        btn.innerHTML = '<div class="btn-spinner"></div> Saving...';
        btn.disabled = true;
        
        const formData = new FormData(e.target);
        
        // Find category name based on selected category ID
        const selectedCatId = parseInt(formData.get('categoryId'));
        const selectedCat = MOCK_CATEGORIES.find(c => c.id === selectedCatId);
        
        // Process ingredients string into array
        const ingredientsStr = formData.get('ingredients');
        const ingredientsArr = ingredientsStr ? ingredientsStr.split(',').map(i => i.trim()).filter(i => i) : [];

        const newItem = {
            id: isEdit ? existingItem.id : generateId(),
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            categoryId: selectedCatId,
            category: selectedCat ? selectedCat.name : 'Unknown',
            ingredients: ingredientsArr,
            available: formData.get('available') === 'on',
            image: isEdit ? existingItem.image : null
        };

        // Simulate API latency
        setTimeout(() => {
            if (isEdit) {
                const idx = localMenuItems.findIndex(m => String(m.id) === String(existingItem.id));
                if (idx !== -1) localMenuItems[idx] = newItem;
                toast.success('Item Updated', `${newItem.name} was updated successfully.`);
            } else {
                localMenuItems.unshift(newItem);
                toast.success('Item Added', `${newItem.name} was added successfully.`);
            }
            
            modal.close();
            renderTable();
            
            // Sync mock data array if desired
            if (!isEdit) MOCK_MENU_ITEMS.unshift(newItem);
        }, 600);
    });
}

function confirmDelete(id) {
    const item = localMenuItems.find(m => String(m.id) === String(id));
    if (!item) return;

    confirmDialog({
        title: 'Delete Menu Item',
        message: `Are you sure you want to delete "<strong>${escapeHtml(item.name)}</strong>"? This action cannot be undone.`,
        type: 'danger',
        confirmText: 'Delete',
        onConfirm: () => {
            // Simulate API request
            setTimeout(() => {
                localMenuItems = localMenuItems.filter(m => String(m.id) !== String(id));
                renderTable();
                toast.success('Item Deleted', 'The menu item has been removed.');
            }, 400);
        }
    });
}
