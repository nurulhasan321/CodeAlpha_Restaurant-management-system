// ============================================
// SAVORY — Tables List & Form
// ============================================

import { MOCK_TABLES } from '../../mockData.js';
import { renderDataTable } from '../../components/dataTable.js';
import { openModal } from '../../components/modal.js';
import { confirmDialog } from '../../components/confirmDialog.js';
import { toast } from '../../components/toast.js';
import { generateId, escapeHtml } from '../../utils/helpers.js';
import { TABLE_STATUS_COLORS } from '../../utils/constants.js';

let localTables = [];

export async function renderTableList(container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header__left">
                <h1 class="page-header__title">Tables</h1>
                <p class="page-header__subtitle">Manage restaurant seating and layout</p>
            </div>
            <div class="page-header__actions">
                <button class="btn-savory btn-primary" id="btn-add-table">
                    <i class="bi bi-plus-lg"></i> Add Table
                </button>
            </div>
        </div>
        <div class="card glass-card">
            <div id="table-list-container">
                <div class="text-center p-5"><div class="btn-spinner"></div> Loading tables...</div>
            </div>
        </div>
    `;

    try {
        const { tableApi } = await import('../../api/table.js');
        const response = await tableApi.getAll();
        localTables = response.data || [];
    } catch (error) {
        toast.error('Load Failed', 'Could not load tables from server.');
        localTables = [];
    }

    renderTable();

    document.getElementById('btn-add-table')?.addEventListener('click', () => {
        showTableForm();
    });
}

function renderTable() {
    const tableContainer = document.getElementById('table-list-container');
    if (!tableContainer) return;

    const columns = [
        {
            key: 'tableNumber',
            label: 'Table #',
            sortable: true,
            render: (val) => `<strong>${escapeHtml(val)}</strong>`
        },
        {
            key: 'capacity',
            label: 'Capacity',
            sortable: true,
            align: 'center',
            render: (val) => `<span><i class="bi bi-people me-1 text-tertiary"></i> ${val}</span>`
        },
        {
            key: 'location',
            label: 'Location',
            sortable: true,
            render: (val) => `<span class="text-secondary">${escapeHtml(val)}</span>`
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            align: 'center',
            render: (val) => {
                const color = TABLE_STATUS_COLORS[val] || 'neutral';
                return `<span class="badge-savory badge-${color} badge-dot">${escapeHtml(val)}</span>`;
            }
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            width: '100px',
            render: (_, row) => `
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn-savory btn-icon text-info btn-edit-table" data-id="${row.id}" aria-label="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-savory btn-icon text-danger btn-delete-table" data-id="${row.id}" aria-label="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `
        }
    ];

    renderDataTable(tableContainer, columns, localTables, {
        id: 'tables-list',
        searchable: true,
        searchPlaceholder: 'Search by table number or location...',
        emptyIcon: 'bi-grid-3x3-gap',
        emptyTitle: 'No Tables Found',
        emptyMessage: 'You haven\'t added any tables to the restaurant layout yet.'
    });

    // Attach event listeners to action buttons
    document.querySelectorAll('.btn-edit-table').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const tableObj = localTables.find(t => String(t.id) === String(id));
            if (tableObj) showTableForm(tableObj);
        });
    });

    document.querySelectorAll('.btn-delete-table').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            confirmDelete(id);
        });
    });
}

function showTableForm(existingTable = null) {
    const isEdit = !!existingTable;

    const locations = ['Main Hall', 'Window', 'Patio', 'Private Room', 'Bar Area'];
    const locationOptions = locations.map(loc =>
        `<option value="${loc}" ${isEdit && existingTable.location === loc ? 'selected' : ''}>${loc}</option>`
    ).join('');

    const statuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED'];
    const statusOptions = statuses.map(st =>
        `<option value="${st}" ${isEdit && existingTable.status === st ? 'selected' : ''}>${st}</option>`
    ).join('');

    const bodyHtml = `
        <form id="table-form">
            <div class="row">
                <div class="col-md-6 form-group">
                    <label class="form-label">Table Number <span class="text-danger">*</span></label>
                    <input type="text" name="tableNumber" class="form-control-savory" 
                           placeholder="e.g. T1"
                           value="${isEdit ? escapeHtml(existingTable.tableNumber) : ''}" required>
                </div>
                <div class="col-md-6 form-group">
                    <label class="form-label">Capacity (Guests) <span class="text-danger">*</span></label>
                    <input type="number" name="capacity" class="form-control-savory" min="1" max="20" 
                           value="${isEdit ? existingTable.capacity : '2'}" required>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 form-group">
                    <label class="form-label">Location <span class="text-danger">*</span></label>
                    <select name="location" class="form-control-savory" required>
                        <option value="" disabled ${!isEdit ? 'selected' : ''}>Select location...</option>
                        ${locationOptions}
                    </select>
                </div>
                <div class="col-md-6 form-group">
                    <label class="form-label">Current Status</label>
                    <select name="status" class="form-control-savory" required>
                        ${!isEdit ? '<option value="AVAILABLE" selected>AVAILABLE</option><option value="OCCUPIED">OCCUPIED</option><option value="RESERVED">RESERVED</option>' : statusOptions}
                    </select>
                </div>
            </div>
        </form>
    `;

    const footerHtml = `
        <button class="btn-savory btn-outline" id="btn-cancel-table-form">Cancel</button>
        <button class="btn-savory btn-primary" id="btn-submit-table-form" form="table-form">
            ${isEdit ? 'Save Changes' : 'Add Table'}
        </button>
    `;

    const modal = openModal({
        title: isEdit ? 'Edit Table' : 'Add New Table',
        size: 'md',
        body: bodyHtml,
        footer: footerHtml
    });

    document.getElementById('btn-cancel-table-form').addEventListener('click', () => modal.close());

    document.getElementById('table-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('btn-submit-table-form');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<div class="btn-spinner"></div> Saving...';
        btn.disabled = true;

        const formData = new FormData(e.target);

        const requestData = {
            tableNumber: formData.get('tableNumber'),
            capacity: parseInt(formData.get('capacity')),
            location: formData.get('location'),
            status: formData.get('status')
        };

        try {
            const { tableApi } = await import('../../api/table.js');

            if (isEdit) {
                await tableApi.update(existingTable.id, requestData);
                toast.success('Table Updated', `Table ${requestData.tableNumber} was updated successfully.`);
            } else {
                await tableApi.create(requestData);
                toast.success('Table Added', `Table ${requestData.tableNumber} was added successfully.`);
            }

            modal.close();

            // Refetch all tables to ensure sync with backend
            const response = await tableApi.getAll();
            localTables = response.data || [];
            renderTable();
        } catch (error) {
            // Error toast is already handled globally by axios.js interceptor
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

function confirmDelete(id) {
    const tableObj = localTables.find(t => String(t.id) === String(id));
    if (!tableObj) return;

    confirmDialog({
        title: 'Delete Table',
        message: `Are you sure you want to delete Table "<strong>${escapeHtml(tableObj.tableNumber)}</strong>"?`,
        type: 'danger',
        confirmText: 'Delete',
        onConfirm: async () => {
            try {
                const { tableApi } = await import('../../api/table.js');
                const response = await tableApi.delete(id);
                localTables = localTables.filter(t => String(t.id) !== String(id));
                renderTable();

                const message = typeof response.data === 'string'
                    ? response.data
                    : 'The table has been removed from the layout.';
                toast.success('Table Deleted', message);
            } catch (error) {
                toast.error('Delete Failed', error.response?.data?.message || 'Could not delete table.');
            }
        }
    });
}
