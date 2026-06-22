// ============================================
// SAVORY — Unauthorized Access Page (403)
// ============================================

import { auth } from '../../utils/auth.js';

export async function renderUnauthorized(container) {
    container.innerHTML = `
        <div class="auth-layout">
            <div class="auth-shape auth-shape--2"></div>
            
            <div class="auth-card glass-card text-center">
                <div class="text-danger mb-4" style="font-size: 4rem; line-height: 1;">
                    <i class="bi bi-shield-lock-fill"></i>
                </div>
                
                <h2 class="auth-card__title">Access Denied</h2>
                <p class="auth-card__subtitle text-tertiary mb-4">
                    You don't have the required permissions to view this page. Please contact your administrator if you believe this is a mistake.
                </p>
                
                <div class="d-flex flex-column gap-3">
                    <a href="#/dashboard" class="btn-savory btn-primary btn-lg">
                        <i class="bi bi-house-door me-2"></i> Return to Dashboard
                    </a>
                    
                    <button id="unauth-logout-btn" class="btn-savory btn-outline btn-lg text-danger">
                        <i class="bi bi-box-arrow-right me-2"></i> Log Out
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('unauth-logout-btn')?.addEventListener('click', () => {
        auth.logout();
    });
}
