// SAVORY — Error State Component
export function renderErrorState({ title, description, onRetry }) {
    return `
        <div class="error-state">
            <div class="error-state__icon"><i class="bi bi-exclamation-triangle"></i></div>
            <h3 class="error-state__title">${title || 'Something went wrong'}</h3>
            <p class="error-state__description">${description || 'An error occurred while loading this content. Please try again.'}</p>
            <button class="btn-savory btn-primary" id="error-retry-btn">
                <i class="bi bi-arrow-clockwise"></i> Try Again
            </button>
        </div>
    `;
}
