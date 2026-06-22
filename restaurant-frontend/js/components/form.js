// ============================================
// SAVORY — Reusable Form Builder
// ============================================

import { escapeHtml, getPasswordStrength } from '../utils/helpers.js';

/**
 * fields: [{
 *   name, label, type, placeholder, required, value, options (for select),
 *   hint, min, max, step, accept, rows, disabled, col, validators
 * }]
 */
export function renderForm(container, fields, options = {}) {
    const formId = options.id || 'form-' + Date.now();

    let html = `<form id="${formId}" class="savory-form" novalidate>`;

    // Group fields into rows (using col property)
    let currentRow = [];
    const rows = [];

    fields.forEach(field => {
        if (field.col) {
            currentRow.push(field);
            const totalCols = currentRow.reduce((sum, f) => sum + (f.col || 12), 0);
            if (totalCols >= 12) {
                rows.push([...currentRow]);
                currentRow = [];
            }
        } else {
            if (currentRow.length > 0) {
                rows.push([...currentRow]);
                currentRow = [];
            }
            rows.push([field]);
        }
    });
    if (currentRow.length > 0) rows.push(currentRow);

    rows.forEach(row => {
        if (row.length > 1) {
            html += `<div class="row g-3">`;
            row.forEach(field => {
                html += `<div class="col-md-${field.col || 6}">${_renderField(field)}</div>`;
            });
            html += `</div>`;
        } else {
            html += _renderField(row[0]);
        }
    });

    // Submit area
    html += `
        <div class="form-group" style="margin-top:var(--space-6); display:flex; gap:var(--space-3); justify-content:flex-end;">
            ${options.cancelBtn !== false ? `
                <button type="button" class="btn-savory btn-secondary" id="${formId}-cancel">
                    ${options.cancelText || 'Cancel'}
                </button>
            ` : ''}
            <button type="submit" class="btn-savory btn-primary" id="${formId}-submit">
                ${options.submitIcon ? `<i class="bi ${options.submitIcon}"></i>` : ''}
                ${options.submitText || 'Save'}
            </button>
        </div>
    </form>`;

    container.innerHTML = html;

    // Password visibility toggles
    container.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.innerHTML = `<i class="bi ${isPassword ? 'bi-eye-slash' : 'bi-eye'}"></i>`;
        });
    });

    // Password strength
    container.querySelectorAll('input[data-strength]').forEach(input => {
        input.addEventListener('input', () => {
            const strength = getPasswordStrength(input.value);
            const bar = document.getElementById(`${input.name}-strength`);
            if (bar) bar.dataset.strength = strength;
        });
    });

    // Form submission
    const form = document.getElementById(formId);
    if (form && options.onSubmit) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Client-side validation
            let valid = true;
            fields.forEach(field => {
                const error = _validateField(field, data[field.name]);
                _showFieldError(formId, field.name, error);
                if (error) valid = false;
            });

            if (!valid) return;

            // Loading state
            const submitBtn = document.getElementById(`${formId}-submit`);
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('btn-loading');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = `<div class="btn-spinner"></div> ${options.loadingText || 'Saving...'}`;

                try {
                    await options.onSubmit(data);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.innerHTML = originalText;
                }
            }
        });
    }

    // Cancel handler
    if (options.onCancel) {
        document.getElementById(`${formId}-cancel`)?.addEventListener('click', options.onCancel);
    }

    return form;
}

function _renderField(field) {
    const required = field.required ? '<span class="required">*</span>' : '';
    const value = field.value !== undefined ? escapeHtml(String(field.value)) : '';

    let input = '';

    switch (field.type) {
        case 'textarea':
            input = `
                <textarea name="${field.name}" class="form-control-savory"
                    placeholder="${field.placeholder || ''}" rows="${field.rows || 3}"
                    ${field.required ? 'required' : ''} ${field.disabled ? 'disabled' : ''}
                >${value}</textarea>
            `;
            break;

        case 'select':
            input = `
                <select name="${field.name}" class="form-control-savory form-select-savory"
                    ${field.required ? 'required' : ''} ${field.disabled ? 'disabled' : ''}>
                    <option value="">${field.placeholder || 'Select...'}</option>
                    ${(field.options || []).map(opt => {
                        const optVal = typeof opt === 'object' ? opt.value : opt;
                        const optLabel = typeof opt === 'object' ? opt.label : opt;
                        return `<option value="${optVal}" ${optVal == field.value ? 'selected' : ''}>${optLabel}</option>`;
                    }).join('')}
                </select>
            `;
            break;

        case 'password':
            input = `
                <div class="password-field">
                    <input type="password" name="${field.name}" class="form-control-savory"
                        placeholder="${field.placeholder || ''}" value="${value}"
                        ${field.required ? 'required' : ''} ${field.disabled ? 'disabled' : ''}
                        ${field.showStrength ? 'data-strength' : ''}>
                    <button type="button" class="password-toggle" aria-label="Toggle password visibility">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
                ${field.showStrength ? `
                    <div class="password-strength" id="${field.name}-strength" data-strength="0">
                        <div class="password-strength__bar"></div>
                        <div class="password-strength__bar"></div>
                        <div class="password-strength__bar"></div>
                        <div class="password-strength__bar"></div>
                    </div>
                ` : ''}
            `;
            break;

        case 'toggle':
            input = `
                <label class="toggle-switch">
                    <input type="checkbox" name="${field.name}" ${field.value ? 'checked' : ''}
                        ${field.disabled ? 'disabled' : ''}>
                    <span class="toggle-switch__slider"></span>
                    ${field.toggleLabel ? `<span class="toggle-switch__label">${field.toggleLabel}</span>` : ''}
                </label>
            `;
            break;

        case 'checkbox':
            input = `
                <label class="checkbox-savory">
                    <input type="checkbox" name="${field.name}" ${field.value ? 'checked' : ''}
                        ${field.disabled ? 'disabled' : ''}>
                    <label>${field.checkboxLabel || ''}</label>
                </label>
            `;
            break;

        case 'file':
            input = `
                <input type="file" name="${field.name}" class="form-control-savory"
                    ${field.accept ? `accept="${field.accept}"` : ''}
                    ${field.required ? 'required' : ''}>
            `;
            break;

        default:
            input = `
                <input type="${field.type || 'text'}" name="${field.name}" class="form-control-savory"
                    placeholder="${field.placeholder || ''}" value="${value}"
                    ${field.required ? 'required' : ''} ${field.disabled ? 'disabled' : ''}
                    ${field.min !== undefined ? `min="${field.min}"` : ''}
                    ${field.max !== undefined ? `max="${field.max}"` : ''}
                    ${field.step !== undefined ? `step="${field.step}"` : ''}>
            `;
    }

    return `
        <div class="form-group">
            ${field.type !== 'toggle' && field.type !== 'checkbox' ? `
                <label class="form-label" for="${field.name}">${field.label || field.name} ${required}</label>
            ` : ''}
            ${input}
            ${field.hint ? `<small class="form-hint">${field.hint}</small>` : ''}
            <span class="form-error" id="error-${field.name}"></span>
        </div>
    `;
}

function _validateField(field, value) {
    if (field.required && (!value || value.toString().trim() === '')) {
        return `${field.label || field.name} is required`;
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
    }
    if (field.minLength && value && value.length < field.minLength) {
        return `Must be at least ${field.minLength} characters`;
    }
    if (field.validators) {
        for (const validator of field.validators) {
            const error = validator(value);
            if (error) return error;
        }
    }
    return null;
}

function _showFieldError(formId, fieldName, error) {
    const el = document.getElementById(`error-${fieldName}`);
    const input = document.querySelector(`#${formId} [name="${fieldName}"]`);
    if (el) el.textContent = error || '';
    if (input) {
        input.classList.toggle('is-invalid', !!error);
    }
}
