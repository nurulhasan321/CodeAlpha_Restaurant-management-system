// ============================================
// SAVORY — Toast Notification System
// ============================================

import { generateId } from '../utils/helpers.js';

const TOAST_DURATION = 4000;

const ICONS = {
    success: 'bi-check-lg',
    error: 'bi-x-lg',
    warning: 'bi-exclamation-lg',
    info: 'bi-info-lg',
};

class ToastManager {
    constructor() {
        this.container = null;
    }

    _getContainer() {
        if (!this.container) {
            this.container = document.getElementById('toast-container');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toast-container';
                this.container.className = 'toast-container';
                this.container.setAttribute('aria-live', 'polite');
                document.body.appendChild(this.container);
            }
        }
        return this.container;
    }

    show(type, title, message, duration = TOAST_DURATION) {
        const container = this._getContainer();
        const id = generateId();

        const toastEl = document.createElement('div');
        toastEl.className = `toast-savory ${type}`;
        toastEl.id = `toast-${id}`;
        toastEl.style.setProperty('--toast-duration', `${duration}ms`);

        toastEl.innerHTML = `
            <div class="toast-savory__icon">
                <i class="bi ${ICONS[type] || ICONS.info}"></i>
            </div>
            <div class="toast-savory__content">
                <div class="toast-savory__title">${title}</div>
                ${message ? `<div class="toast-savory__message">${message}</div>` : ''}
            </div>
            <button class="toast-savory__close" aria-label="Close notification">
                <i class="bi bi-x"></i>
            </button>
            <div class="toast-savory__progress"></div>
        `;

        // Close button handler
        toastEl.querySelector('.toast-savory__close').addEventListener('click', () => {
            this._dismiss(toastEl);
        });

        container.appendChild(toastEl);

        // Auto dismiss
        const timer = setTimeout(() => this._dismiss(toastEl), duration);

        // Pause on hover
        toastEl.addEventListener('mouseenter', () => {
            clearTimeout(timer);
            const progress = toastEl.querySelector('.toast-savory__progress');
            if (progress) progress.style.animationPlayState = 'paused';
        });

        toastEl.addEventListener('mouseleave', () => {
            const newTimer = setTimeout(() => this._dismiss(toastEl), 2000);
            const progress = toastEl.querySelector('.toast-savory__progress');
            if (progress) progress.style.animationPlayState = 'running';
        });

        return id;
    }

    _dismiss(el) {
        el.classList.add('removing');
        setTimeout(() => el.remove(), 200);
    }

    success(title, message) {
        return this.show('success', title, message);
    }

    error(title, message) {
        return this.show('error', title, message, 6000);
    }

    warning(title, message) {
        return this.show('warning', title, message, 5000);
    }

    info(title, message) {
        return this.show('info', title, message);
    }
}

export const toast = new ToastManager();
