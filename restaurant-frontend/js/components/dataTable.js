// ============================================
// SAVORY — Reusable Data Table Component
// ============================================

import { escapeHtml, generateId } from '../utils/helpers.js';

/**
 * columns: [{ key, label, sortable, render, width, align }]
 * options: { searchable, searchPlaceholder, selectable, actions, emptyMessage, emptyIcon }
 */
export function renderDataTable(container, columns, data, options = {}) {
    const tableId = options.id || 'table-' + generateId();
    const searchable = options.searchable !== false;
    const selectable = options.selectable || false;

    const html = `
        <div class="data-table-wrapper" id="${tableId}">
            <div class="data-table-toolbar">
                <div class="data-table-toolbar__left">
                    ${searchable ? `
                        <div class="data-table-search">
                            <i class="bi bi-search"></i>
                            <input type="text" placeholder="${options.searchPlaceholder || 'Search...'}"
                                   id="${tableId}-search" aria-label="Search table">
                        </div>
                    ` : ''}
                    ${options.filters ? options.filters : ''}
                </div>
                <div class="data-table-toolbar__right">
                    ${options.actions || ''}
                </div>
            </div>
            ${selectable && data.length > 0 ? `
                <div class="bulk-actions-bar" id="${tableId}-bulk" style="display:none;">
                    <span class="bulk-actions-bar__count"><span id="${tableId}-selected-count">0</span> selected</span>
                    ${options.bulkActions || ''}
                </div>
            ` : ''}
            <div style="overflow-x:auto;">
                <table class="data-table" id="${tableId}-table">
                    <thead>
                        <tr>
                            ${selectable ? `
                                <th style="width:40px;">
                                    <label class="checkbox-savory">
                                        <input type="checkbox" id="${tableId}-select-all">
                                    </label>
                                </th>
                            ` : ''}
                            ${columns.map(col => `
                                <th class="${col.sortable ? 'sortable' : ''}"
                                    ${col.width ? `style="width:${col.width}"` : ''}
                                    ${col.align ? `style="text-align:${col.align}"` : ''}
                                    data-key="${col.key}">
                                    ${col.label}
                                    ${col.sortable ? '<i class="bi bi-chevron-expand sort-icon"></i>' : ''}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.length === 0 ? `
                            <tr>
                                <td colspan="${columns.length + (selectable ? 1 : 0)}">
                                    <div class="empty-state" style="padding:var(--space-10) var(--space-6)">
                                        <div class="empty-state__icon">
                                            <i class="bi ${options.emptyIcon || 'bi-inbox'}"></i>
                                        </div>
                                        <h4 class="empty-state__title">${options.emptyTitle || 'No data found'}</h4>
                                        <p class="empty-state__description">${options.emptyMessage || 'There are no records to display.'}</p>
                                    </div>
                                </td>
                            </tr>
                        ` : data.map((row, idx) => `
                            <tr data-id="${row.id || idx}">
                                ${selectable ? `
                                    <td>
                                        <label class="checkbox-savory">
                                            <input type="checkbox" class="row-checkbox" data-id="${row.id || idx}">
                                        </label>
                                    </td>
                                ` : ''}
                                ${columns.map(col => `
                                    <td ${col.align ? `style="text-align:${col.align}"` : ''}>
                                        ${col.render ? col.render(row[col.key], row) : escapeHtml(String(row[col.key] ?? '—'))}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${options.pagination ? `
                <div class="data-table-footer" id="${tableId}-footer">
                    ${options.pagination}
                </div>
            ` : ''}
        </div>
    `;

    container.innerHTML = html;

    // Search filtering
    if (searchable) {
        const searchInput = document.getElementById(`${tableId}-search`);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const rows = document.querySelectorAll(`#${tableId}-table tbody tr`);
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            });
        }
    }

    // Select all
    if (selectable) {
        const selectAll = document.getElementById(`${tableId}-select-all`);
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll(`#${tableId}-table .row-checkbox`);
                checkboxes.forEach(cb => cb.checked = e.target.checked);
                _updateBulkBar(tableId);
            });
        }

        // Individual checkboxes
        document.querySelectorAll(`#${tableId}-table .row-checkbox`).forEach(cb => {
            cb.addEventListener('change', () => _updateBulkBar(tableId));
        });
    }

    // Sorting
    document.querySelectorAll(`#${tableId}-table th.sortable`).forEach(th => {
        th.addEventListener('click', () => {
            if (options.onSort) {
                options.onSort(th.dataset.key);
            }
        });
    });
}

function _updateBulkBar(tableId) {
    const checked = document.querySelectorAll(`#${tableId}-table .row-checkbox:checked`);
    const bulk = document.getElementById(`${tableId}-bulk`);
    const count = document.getElementById(`${tableId}-selected-count`);
    if (bulk) bulk.style.display = checked.length > 0 ? 'flex' : 'none';
    if (count) count.textContent = checked.length;
}

export function getSelectedIds(tableId) {
    return Array.from(document.querySelectorAll(`#${tableId}-table .row-checkbox:checked`))
        .map(cb => cb.dataset.id);
}
