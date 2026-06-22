// SAVORY — Confirm Dialog Component
export function confirmDialog({ title, message, confirmText, cancelText, type, onConfirm, onCancel }) {
    const dialog = document.getElementById('confirm-dialog') || document.createElement('dialog');
    dialog.id = 'confirm-dialog';
    dialog.className = 'confirm-dialog';

    const iconClass = type === 'danger' ? 'bi-trash' : 'bi-exclamation-triangle';
    const iconType = type === 'danger' ? 'danger' : 'warning';
    const btnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';

    dialog.innerHTML = `
        <div class="confirm-dialog__body">
            <div class="confirm-dialog__icon ${iconType}">
                <i class="bi ${iconClass}"></i>
            </div>
            <h3 class="confirm-dialog__title">${title || 'Are you sure?'}</h3>
            <p class="confirm-dialog__message">${message || 'This action cannot be undone.'}</p>
        </div>
        <div class="confirm-dialog__actions">
            <button class="btn-savory btn-secondary" id="confirm-cancel">${cancelText || 'Cancel'}</button>
            <button class="btn-savory ${btnClass}" id="confirm-ok">${confirmText || 'Confirm'}</button>
        </div>
    `;

    if (!dialog.parentElement) document.body.appendChild(dialog);
    dialog.showModal();

    document.getElementById('confirm-cancel').onclick = () => {
        dialog.close();
        onCancel?.();
    };

    document.getElementById('confirm-ok').onclick = () => {
        dialog.close();
        onConfirm?.();
    };

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.close();
            onCancel?.();
        }
    });
}
