// ============================================
// SAVORY — 404 Not Found Page
// ============================================

export async function renderNotFound(container) {
    container.innerHTML = `
        <div class="d-flex align-items-center justify-content-center" style="min-height: 80vh; width: 100%;">
            <div class="text-center" style="max-width: 500px;">
                <div class="text-amber mb-4 animate-float" style="font-size: 6rem; line-height: 1; text-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);">
                    <i class="bi bi-compass"></i>
                </div>
                
                <h1 class="mb-3" style="font-size: 3rem; font-weight: 800;">404</h1>
                <h3 class="mb-4">Page Not Found</h3>
                
                <p class="text-tertiary mb-5">
                    We couldn't find the page you're looking for. The link might be broken or the page may have been moved.
                </p>
                
                <div class="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                    <button onclick="window.history.back()" class="btn-savory btn-outline">
                        <i class="bi bi-arrow-left me-2"></i> Go Back
                    </button>
                    <a href="#/dashboard" class="btn-savory btn-primary">
                        <i class="bi bi-house-door me-2"></i> Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    `;
}
