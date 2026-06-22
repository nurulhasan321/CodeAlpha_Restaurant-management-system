// ============================================
// SAVORY — Category List & Form
// ============================================

import { MOCK_CATEGORIES } from '../../mockData.js';
import { renderDataTable } from '../../components/dataTable.js';
import { openModal } from '../../components/modal.js';
import { confirmDialog } from '../../components/confirmDialog.js';
import { toast } from '../../components/toast.js';
import { generateId, escapeHtml } from '../../utils/helpers.js';

let localCategories = [...MOCK_CATEGORIES];

export function renderCategoryList(container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header__left">
                <h1 class="page-header__title">Categories</h1>
                <p class="page-header__subtitle">Manage your menu categories</p>
            </div>
            <div class="page-header__actions">
                <button class="btn-savory btn-primary" id="btn-add-category">
                    <i class="bi bi-plus-lg"></i> Add Category
                </button>
            </div>
        </div>
        <div class="card glass-card">
            <div id="category-table-container"></div>
        </div>
    `;

    renderTable();

    document.getElementById('btn-add-category')?.addEventListener('click', () => {
        showCategoryForm();
    });
}

function renderTable() {
    const tableContainer = document.getElementById('category-table-container');
    if (!tableContainer) return;

    const columns = [
        { key: 'name', label: 'Name', sortable: true, render: (val) => `<strong class="text-primary">${escapeHtml(val)}</strong>` },
        { key: 'description', label: 'Description', sortable: false },
        { 
            key: 'itemCount', 
            label: 'Items', 
            sortable: true,
            render: (val) => `<span class="badge-savory bg-charcoal">${val} items</span>` 
        },
        { 
            key: 'active', 
            label: 'Status', 
            sortable: true,
            render: (val) => val 
                ? '<span class="badge-savory bg-success-light text-success">Active</span>' 
                : '<span class="badge-savory bg-danger-light text-danger">Inactive</span>' 
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            width: '100px',
            render: (_, row) => `
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn-savory btn-icon text-info btn-edit" data-id="${row.id}" aria-label="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-savory btn-icon text-danger btn-delete" data-id="${row.id}" aria-label="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `
        }
    ];

    renderDataTable(tableContainer, columns, localCategories, {
        id: 'categories',
        searchable: true,
        searchPlaceholder: 'Search categories...',
        emptyIcon: 'bi-tag',
        emptyTitle: 'No Categories Found',
        emptyMessage: 'You haven\'t added any menu categories yet.'
    });

    // Attach event listeners to action buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const category = localCategories.find(c => String(c.id) === String(id));
            if (category) showCategoryForm(category);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            confirmDelete(id);
        });
    });
}

function showCategoryForm(existingCategory = null) {
    const isEdit = !!existingCategory;
    
    const bodyHtml = `
        <form id="category-form">
            <div class="form-group">
                <label class="form-label">Category Name <span class="text-danger">*</span></label>
                <input type="text" name="name" class="form-control-savory" 
                       value="${isEdit ? escapeHtml(existingCategory.name) : ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea name="description" class="form-control-savory" rows="3">${isEdit ? escapeHtml(existingCategory.description) : ''}</textarea>
            </div>
            <div class="form-group mb-0">
                <label class="checkbox-savory">
                    <input type="checkbox" name="active" ${(!isEdit || existingCategory.active) ? 'checked' : ''}>
                    <label>Active (visible to customers)</label>
                </label>
            </div>
        </form>
    `;

    const footerHtml = `
        <button class="btn-savory btn-outline" id="btn-cancel-form">Cancel</button>
        <button class="btn-savory btn-primary" id="btn-submit-form" form="category-form">
            ${isEdit ? 'Save Changes' : 'Add Category'}
        </button>
    `;

    const modal = openModal({
        title: isEdit ? 'Edit Category' : 'Add New Category',
        size: 'sm',
        body: bodyHtml,
        footer: footerHtml
    });

    document.getElementById('btn-cancel-form').addEventListener('click', () => modal.close());
    
    document.getElementById('category-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('btn-submit-form');
        btn.innerHTML = '<div class="btn-spinner"></div> Saving...';
        btn.disabled = true;
        
        const formData = new FormData(e.target);
        const newCat = {
            id: isEdit ? existingCategory.id : generateId(),
            name: formData.get('name'),
            description: formData.get('description'),
            active: formData.get('active') === 'on',
            itemCount: isEdit ? existingCategory.itemCount : 0
        };

        // Simulate API latency
        setTimeout(() => {
            if (isEdit) {
                const idx = localCategories.findIndex(c => String(c.id) === String(existingCategory.id));
                if (idx !== -1) localCategories[idx] = newCat;
                toast.success('Category Updated', `${newCat.name} was updated successfully.`);
            } else {
                localCategories.unshift(newCat);
                toast.success('Category Added', `${newCat.name} was added successfully.`);
            }
            
            modal.close();
            renderTable();
            
            // Sync mock data array if desired
            if (!isEdit) MOCK_CATEGORIES.unshift(newCat);
        }, 600);
    });
}

function confirmDelete(id) {
    const category = localCategories.find(c => String(c.id) === String(id));
    if (!category) return;

    confirmDialog({
        title: 'Delete Category',
        message: `Are you sure you want to delete the category "<strong>${escapeHtml(category.name)}</strong>"? This will not delete the menu items within it, but they will become uncategorized.`,
        type: 'danger',
        confirmText: 'Delete',
        onConfirm: () => {
            // Simulate API request
            setTimeout(() => {
                localCategories = localCategories.filter(c => String(c.id) !== String(id));
                renderTable();
                toast.success('Category Deleted', 'The category has been removed.');
            }, 400);
        }
    });
}
