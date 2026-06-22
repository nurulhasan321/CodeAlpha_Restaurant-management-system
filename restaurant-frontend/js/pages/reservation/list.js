// ============================================
// SAVORY — Reservations List & Form
// ============================================

import { MOCK_RESERVATIONS, MOCK_TABLES } from '../../mockData.js';
import { renderDataTable } from '../../components/dataTable.js';
import { openModal } from '../../components/modal.js';
import { confirmDialog } from '../../components/confirmDialog.js';
import { toast } from '../../components/toast.js';
import { generateId, escapeHtml, formatDate, formatTime } from '../../utils/helpers.js';
import { RESERVATION_STATUS_COLORS } from '../../utils/constants.js';

let localReservations = [...MOCK_RESERVATIONS];

export function renderReservationList(container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header__left">
                <h1 class="page-header__title">Reservations</h1>
                <p class="page-header__subtitle">Manage table bookings and guest requests</p>
            </div>
            <div class="page-header__actions">
                <button class="btn-savory btn-primary" id="btn-add-reservation">
                    <i class="bi bi-plus-lg"></i> New Reservation
                </button>
            </div>
        </div>
        <div class="card glass-card">
            <div id="reservation-list-container"></div>
        </div>
    `;

    renderTable();

    document.getElementById('btn-add-reservation')?.addEventListener('click', () => {
        showReservationForm();
    });
}

function renderTable() {
    const tableContainer = document.getElementById('reservation-list-container');
    if (!tableContainer) return;

    const columns = [
        { 
            key: 'customer', 
            label: 'Customer', 
            sortable: true,
            render: (val, row) => `
                <div class="d-flex flex-column">
                    <strong class="text-primary">${escapeHtml(val)}</strong>
                    <span class="text-xs text-tertiary">${escapeHtml(row.phone)}</span>
                </div>
            `
        },
        { 
            key: 'date', 
            label: 'Date & Time', 
            sortable: true,
            render: (val, row) => `
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-calendar text-tertiary"></i>
                    <span>${formatDate(val)} <span class="text-tertiary mx-1">•</span> ${formatTime(`${val}T${row.time}:00`)}</span>
                </div>
            `
        },
        { 
            key: 'table', 
            label: 'Table', 
            sortable: true,
            render: (val, row) => `
                <span class="badge-savory bg-charcoal "><i class="bi bi-grid-3x3-gap me-1"></i> ${escapeHtml(val)}</span>
                <span class="text-xs ms-2 text-tertiary"><i class="bi bi-people"></i> ${row.guestCount}</span>
            `
        },
        { 
            key: 'status', 
            label: 'Status', 
            sortable: true,
            align: 'center',
            render: (val) => {
                const color = RESERVATION_STATUS_COLORS[val] || 'neutral';
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
                    <button class="btn-savory btn-icon text-info btn-edit-reservation" data-id="${row.id}" aria-label="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-savory btn-icon text-danger btn-delete-reservation" data-id="${row.id}" aria-label="Cancel">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            `
        }
    ];

    // Sort by date/time ascending by default
    const sortedData = [...localReservations].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    renderDataTable(tableContainer, columns, sortedData, {
        id: 'reservations-list',
        searchable: true,
        searchPlaceholder: 'Search customer name or phone...',
        emptyIcon: 'bi-calendar-x',
        emptyTitle: 'No Reservations',
        emptyMessage: 'There are no active reservations matching your criteria.'
    });

    document.querySelectorAll('.btn-edit-reservation').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const resObj = localReservations.find(r => String(r.id) === String(id));
            if (resObj) showReservationForm(resObj);
        });
    });

    document.querySelectorAll('.btn-delete-reservation').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            confirmCancel(id);
        });
    });
}

function showReservationForm(existingRes = null) {
    const isEdit = !!existingRes;
    
    // Generate Table Options from MOCK_TABLES
    const tableOptions = MOCK_TABLES.map(t => 
        `<option value="${t.id}" ${isEdit && String(existingRes.tableId) === String(t.id) ? 'selected' : ''}>
            ${escapeHtml(t.tableNumber)} (${t.capacity} Guests) - ${escapeHtml(t.location)}
        </option>`
    ).join('');

    const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    const statusOptions = statuses.map(st => 
        `<option value="${st}" ${isEdit && existingRes.status === st ? 'selected' : ''}>${st}</option>`
    ).join('');

    const today = new Date().toISOString().split('T')[0];

    const bodyHtml = `
        <form id="reservation-form">
            <div class="row">
                <div class="col-md-6 form-group">
                    <label class="form-label">Customer Name <span class="text-danger">*</span></label>
                    <input type="text" name="customer" class="form-control-savory" 
                           placeholder="John Doe"
                           value="${isEdit ? escapeHtml(existingRes.customer) : ''}" required>
                </div>
                <div class="col-md-6 form-group">
                    <label class="form-label">Phone Number <span class="text-danger">*</span></label>
                    <input type="tel" name="phone" class="form-control-savory" 
                           placeholder="+1 555-0100"
                           value="${isEdit ? escapeHtml(existingRes.phone) : ''}" required>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-4 form-group">
                    <label class="form-label">Date <span class="text-danger">*</span></label>
                    <input type="date" name="date" class="form-control-savory" min="${today}"
                           value="${isEdit ? existingRes.date : today}" required>
                </div>
                <div class="col-md-4 form-group">
                    <label class="form-label">Time <span class="text-danger">*</span></label>
                    <input type="time" name="time" class="form-control-savory" 
                           value="${isEdit ? existingRes.time : '19:00'}" required>
                </div>
                <div class="col-md-4 form-group">
                    <label class="form-label">Guests <span class="text-danger">*</span></label>
                    <input type="number" name="guestCount" class="form-control-savory" min="1" max="20"
                           value="${isEdit ? existingRes.guestCount : '2'}" required>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 form-group">
                    <label class="form-label">Table Assignment <span class="text-danger">*</span></label>
                    <select name="tableId" class="form-control-savory" required>
                        <option value="" disabled ${!isEdit ? 'selected' : ''}>Select a table...</option>
                        ${tableOptions}
                    </select>
                </div>
                <div class="col-md-6 form-group">
                    <label class="form-label">Status</label>
                    <select name="status" class="form-control-savory" required>
                        ${!isEdit ? '<option value="PENDING" selected>PENDING</option><option value="CONFIRMED">CONFIRMED</option>' : statusOptions}
                    </select>
                </div>
            </div>

            <div class="form-group mb-0">
                <label class="form-label">Special Requests / Notes</label>
                <textarea name="specialRequest" class="form-control-savory" rows="2" placeholder="e.g. Birthday, allergy info...">${isEdit ? escapeHtml(existingRes.specialRequest) : ''}</textarea>
            </div>
        </form>
    `;

    const footerHtml = `
        <button class="btn-savory btn-outline" id="btn-cancel-res-form">Close</button>
        <button class="btn-savory btn-primary" id="btn-submit-res-form" form="reservation-form">
            ${isEdit ? 'Save Changes' : 'Book Table'}
        </button>
    `;

    const modal = openModal({
        title: isEdit ? 'Edit Reservation' : 'New Reservation',
        size: 'lg',
        body: bodyHtml,
        footer: footerHtml
    });

    document.getElementById('btn-cancel-res-form').addEventListener('click', () => modal.close());
    
    document.getElementById('reservation-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('btn-submit-res-form');
        btn.innerHTML = '<div class="btn-spinner"></div> Processing...';
        btn.disabled = true;
        
        const formData = new FormData(e.target);
        const selectedTableId = parseInt(formData.get('tableId'));
        const tableObj = MOCK_TABLES.find(t => t.id === selectedTableId);

        const newRes = {
            id: isEdit ? existingRes.id : generateId(),
            customer: formData.get('customer'),
            phone: formData.get('phone'),
            tableId: selectedTableId,
            table: tableObj ? tableObj.tableNumber : 'T?',
            date: formData.get('date'),
            time: formData.get('time'),
            guestCount: parseInt(formData.get('guestCount')),
            specialRequest: formData.get('specialRequest'),
            status: formData.get('status')
        };

        setTimeout(() => {
            if (isEdit) {
                const idx = localReservations.findIndex(r => String(r.id) === String(existingRes.id));
                if (idx !== -1) localReservations[idx] = newRes;
                toast.success('Reservation Updated', `Booking for ${newRes.customer} updated.`);
            } else {
                localReservations.push(newRes);
                toast.success('Reservation Confirmed', `Table booked for ${newRes.customer}.`);
            }
            
            modal.close();
            renderTable();
        }, 600);
    });
}

function confirmCancel(id) {
    const resObj = localReservations.find(r => String(r.id) === String(id));
    if (!resObj) return;

    confirmDialog({
        title: 'Cancel Reservation',
        message: `Are you sure you want to cancel the reservation for "<strong>${escapeHtml(resObj.customer)}</strong>" on ${formatDate(resObj.date)}?`,
        type: 'danger',
        confirmText: 'Cancel Booking',
        onConfirm: () => {
            setTimeout(() => {
                const idx = localReservations.findIndex(r => String(r.id) === String(id));
                if (idx !== -1) {
                    localReservations[idx].status = 'CANCELLED';
                    renderTable();
                    toast.success('Reservation Cancelled', 'The booking has been successfully cancelled.');
                }
            }, 400);
        }
    });
}
