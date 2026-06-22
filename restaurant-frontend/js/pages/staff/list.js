// ============================================
// SAVORY — Staff List
// Admin view for managing employees
// ============================================

import { MOCK_STAFF } from '../../mockData.js';
import { renderDataTable } from '../../components/dataTable.js';
import { renderStatCard } from '../../components/card.js';
import { ROLE_LABELS, ROLE_COLORS, ROLES } from '../../utils/constants.js';
import { formatDateTime, escapeHtml } from '../../utils/helpers.js';
import { openModal } from '../../components/modal.js';
import { toast } from '../../components/toast.js';
import { confirmDialog } from '../../components/confirmDialog.js';

let localStaff = [...MOCK_STAFF];

export function renderStaffList(container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header__left">
                <h1 class="page-header__title">Staff Management</h1>
                <p class="page-header__subtitle">Manage roles, permissions, and employee accounts</p>
            </div>
            <div class="page-header__actions">
                <button class="btn-savory btn-primary" onclick="window.StaffActions.showModal()">
                    <i class="bi bi-person-plus me-2"></i>Add Staff
                </button>
            </div>
        </div>

        <div id="staff-stats-container" class="orders-stats-grid"></div>

        <div class="card glass-card">
            <div id="staff-list-container"></div>
        </div>
    `;

    renderStats();
    renderTable();
}

function renderStats() {
    const container = document.getElementById('staff-stats-container');
    if (!container) return;

    const totalStaff = localStaff.length;
    const activeStaff = localStaff.filter(s => s.active).length;
    const admins = localStaff.filter(s => s.role === 'ADMIN').length;
    const managers = localStaff.filter(s => s.role === 'MANAGER').length;
    const waiters = localStaff.filter(s => s.role === 'WAITER').length;

    container.innerHTML = `
        ${renderStatCard({
            label: 'Total Staff',
            value: totalStaff,
            icon: 'bi-people',
            iconColor: 'info',
            trend: null,
            trendValue: `${activeStaff} Active`,
            trendLabel: 'accounts'
        })}
        ${renderStatCard({
            label: 'Administrators',
            value: admins,
            icon: 'bi-shield-lock',
            iconColor: 'danger',
            trend: null,
            trendValue: 'Full',
            trendLabel: 'access'
        })}
        ${renderStatCard({
            label: 'Managers',
            value: managers,
            icon: 'bi-briefcase',
            iconColor: 'amber',
            trend: null,
            trendValue: 'Operations',
            trendLabel: 'access'
        })}
        ${renderStatCard({
            label: 'Waitstaff',
            value: waiters,
            icon: 'bi-person-badge',
            iconColor: 'success',
            trend: null,
            trendValue: 'Service',
            trendLabel: 'roles'
        })}
    `;
}

function renderTable() {
    const tableContainer = document.getElementById('staff-list-container');
    if (!tableContainer) return;

    const columns = [
        {
            key: 'name',
            label: 'Staff Member',
            sortable: true,
            render: (val, row) => `
                <div class="d-flex align-items-center gap-3">
                    <div class="avatar-sm rounded-circle bg-secondary text-primary d-flex align-items-center justify-content-center fw-bold">
                        ${val.charAt(0)}
                    </div>
                    <div>
                        <div class="font-semibold text-sm">${escapeHtml(val)}</div>
                        <div class="text-xs text-tertiary">${escapeHtml(row.email)}</div>
                    </div>
                </div>
            `
        },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (val) => `
                <span class="badge-savory badge-${ROLE_COLORS[val] || 'neutral'} badge-sm">
                    ${ROLE_LABELS[val] || val}
                </span>
            `
        },
        {
            key: 'active',
            label: 'Status',
            sortable: true,
            render: (val) => {
                if (val) {
                    return '<span class="badge-savory badge-success badge-dot">Active</span>';
                }
                return '<span class="badge-savory badge-neutral badge-dot">Inactive</span>';
            }
        },
        {
            key: 'joinDate',
            label: 'Joined',
            sortable: true,
            render: (val) => `
                <span class="text-sm text-tertiary">${formatDateTime(val).split(',')[0]}</span>
            `
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            width: '100px',
            render: (_, row) => `
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn-savory btn-icon text-info" aria-label="Edit Staff" onclick="window.StaffActions.showModal(${row.id})">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn-savory btn-icon ${row.active ? 'text-amber' : 'text-success'}" aria-label="${row.active ? 'Deactivate' : 'Activate'}" onclick="window.StaffActions.toggleActive(${row.id})">
                        <i class="bi ${row.active ? 'bi-person-dash' : 'bi-person-check'}"></i>
                    </button>
                    <button class="btn-savory btn-icon text-danger" aria-label="Delete" onclick="window.StaffActions.deleteStaff(${row.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `
        }
    ];

    renderDataTable(tableContainer, columns, localStaff, {
        id: 'staff-list',
        searchable: true,
        searchPlaceholder: 'Search staff by name or email...',
        emptyIcon: 'bi-people',
        emptyTitle: 'No Staff Found',
        emptyMessage: 'Add staff members to manage your restaurant.'
    });
}

// ---- Staff Actions ----

window.StaffActions = {
    toggleActive(id) {
        const staff = localStaff.find(s => s.id === id);
        if (!staff) return;
        
        staff.active = !staff.active;
        toast.success('Status Updated', `${staff.name} is now ${staff.active ? 'Active' : 'Inactive'}.`);
        
        renderStats();
        renderTable();
    },

    deleteStaff(id) {
        const staff = localStaff.find(s => s.id === id);
        if (!staff) return;
        
        confirmDialog({
            title: 'Delete Staff',
            message: `Are you sure you want to delete "<strong>${escapeHtml(staff.name)}</strong>"? This action cannot be undone.`,
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: () => {
                localStaff = localStaff.filter(s => s.id !== id);
                toast.success('Staff Deleted', `${staff.name} has been removed.`);
                renderStats();
                renderTable();
            }
        });
    },

    showModal(id = null) {
        const isEdit = id !== null;
        const staff = isEdit ? localStaff.find(s => s.id === id) : { name: '', email: '', role: 'WAITER' };

        if (isEdit && !staff) return;

        const roleOptions = Object.keys(ROLES).map(role => 
            `<option value="${role}" ${staff.role === role ? 'selected' : ''}>${ROLE_LABELS[role]}</option>`
        ).join('');

        const bodyHtml = `
            <form id="staff-form" class="p-2">
                <div class="form-group">
                    <label class="form-label">Full Name <span class="required">*</span></label>
                    <input type="text" id="staff-name" class="form-control-savory" value="${escapeHtml(staff.name)}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email Address <span class="required">*</span></label>
                    <input type="email" id="staff-email" class="form-control-savory" value="${escapeHtml(staff.email)}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Role <span class="required">*</span></label>
                    <select id="staff-role" class="form-control-savory form-select-savory" required>
                        ${roleOptions}
                    </select>
                </div>
            </form>
        `;

        const footerHtml = `
            <button type="button" class="btn-savory btn-outline" id="btn-cancel-staff">Cancel</button>
            <button type="submit" form="staff-form" class="btn-savory btn-primary">
                <i class="bi ${isEdit ? 'bi-check-lg' : 'bi-plus-lg'} me-1"></i>${isEdit ? 'Save Changes' : 'Add Staff'}
            </button>
        `;

        const modal = openModal({
            title: isEdit ? 'Edit Staff Details' : 'Add New Staff',
            size: 'sm',
            body: bodyHtml,
            footer: footerHtml
        });

        document.getElementById('btn-cancel-staff')?.addEventListener('click', () => modal.close());

        document.getElementById('staff-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('staff-name').value.trim();
            const email = document.getElementById('staff-email').value.trim();
            const role = document.getElementById('staff-role').value;

            if (!name || !email || !role) {
                toast.error('Validation Error', 'All fields are required.');
                return;
            }

            if (isEdit) {
                staff.name = name;
                staff.email = email;
                staff.role = role;
                toast.success('Staff Updated', 'Staff details have been updated successfully.');
            } else {
                localStaff.unshift({
                    id: Date.now(),
                    name,
                    email,
                    role,
                    active: true,
                    joinDate: new Date().toISOString()
                });
                toast.success('Staff Added', 'New staff member has been added.');
            }

            modal.close();
            renderStats();
            renderTable();
        });
    }
};

