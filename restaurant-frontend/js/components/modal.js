// ============================================
// SAVORY — Reusable Modal Component
// Uses native <dialog> element
// ============================================

export class Modal {
    constructor(options = {}) {
        this.size = options.size || ''; // sm, lg, xl, full
        this.title = options.title || '';
        this.id = options.id || 'modal-' + Date.now();
        this.closable = options.closable !== false;
        this.dialog = null;
    }

    open(bodyHtml, footerHtml = '') {
        this.close(); // Close any existing instance

        this.dialog = document.createElement('dialog');
        this.dialog.className = `modal-savory ${this.size ? 'modal-' + this.size : ''} glass-modal`;
        this.dialog.id = this.id;

        this.dialog.innerHTML = `
            <div class="modal-savory__header">
                <h3 class="modal-savory__title">${this.title}</h3>
                ${this.closable ? `
                    <button class="modal-savory__close" aria-label="Close modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                ` : ''}
            </div>
            <div class="modal-savory__body">${bodyHtml}</div>
            ${footerHtml ? `<div class="modal-savory__footer">${footerHtml}</div>` : ''}
        `;

        document.body.appendChild(this.dialog);

        // Close handlers
        if (this.closable) {
            this.dialog.querySelector('.modal-savory__close')?.addEventListener('click', () => this.close());
            this.dialog.addEventListener('click', (e) => {
                if (e.target === this.dialog) this.close();
            });
            this.dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.close();
            });
        }

        this.dialog.showModal();
        return this;
    }

    close() {
        if (this.dialog) {
            this.dialog.close();
            this.dialog.remove();
            this.dialog = null;
        }
    }

    getElement() {
        return this.dialog;
    }

    getBody() {
        return this.dialog?.querySelector('.modal-savory__body');
    }

    setTitle(title) {
        const el = this.dialog?.querySelector('.modal-savory__title');
        if (el) el.textContent = title;
    }
}

// Convenience function
export function openModal(options = {}) {
    const modal = new Modal(options);
    modal.open(options.body || '', options.footer || '');
    return modal;
}
