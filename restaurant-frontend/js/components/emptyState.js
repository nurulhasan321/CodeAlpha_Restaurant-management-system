// SAVORY — Empty State Component
export function renderEmptyState({ icon, title, description, actionText, actionHref, onAction }) {
    const actionHtml = actionText ? `
        <a href="${actionHref || '#'}" class="btn-savory btn-primary"
           ${onAction ? `id="empty-action-btn"` : ''}>
            <i class="bi bi-plus-lg"></i> ${actionText}
        </a>
    ` : '';

    return `
        <div class="empty-state">
            <div class="empty-state__icon"><i class="bi ${icon || 'bi-inbox'}"></i></div>
            <h3 class="empty-state__title">${title || 'Nothing here yet'}</h3>
            <p class="empty-state__description">${description || 'Get started by creating your first record.'}</p>
            ${actionHtml}
        </div>
    `;
}
