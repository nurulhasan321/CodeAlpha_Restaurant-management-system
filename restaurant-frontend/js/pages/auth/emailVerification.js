// ============================================
// SAVORY — Email Verification Page
// ============================================

import { toast } from '../../components/toast.js';

export async function renderEmailVerification(container) {
    // Determine token from URL if available, though here we just mock
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const token = params.get('token');

    container.innerHTML = `
        <div class="auth-layout">
            <div class="auth-shape auth-shape--1"></div>
            <div class="auth-shape auth-shape--3"></div>

            <div class="auth-card glass-card text-center" id="verify-card">
                <div class="auth-card__brand justify-content-center">
                    <span class="auth-card__brand-icon">✉️</span>
                </div>
                
                <div id="verify-state-loading">
                    <h2 class="auth-card__title">Verifying your email</h2>
                    <p class="auth-card__subtitle">Please wait while we confirm your email address...</p>
                    <div class="mt-4 mb-4">
                        <div class="spinner-ring mx-auto" style="width: 48px; height: 48px; border-width: 4px;"></div>
                    </div>
                </div>

                <div id="verify-state-success" style="display: none;">
                    <div class="text-success mb-3" style="font-size: 3.5rem;">
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <h2 class="auth-card__title">Email Verified!</h2>
                    <p class="auth-card__subtitle text-tertiary">Your account has been successfully verified.</p>
                    <a href="#/login" class="btn-savory btn-primary btn-lg mt-3" style="width:100%;">
                        Proceed to Login
                    </a>
                </div>

                <div id="verify-state-error" style="display: none;">
                    <div class="text-danger mb-3" style="font-size: 3.5rem;">
                        <i class="bi bi-x-circle-fill"></i>
                    </div>
                    <h2 class="auth-card__title">Verification Failed</h2>
                    <p class="auth-card__subtitle text-tertiary">The verification link is invalid or has expired.</p>
                    <button class="btn-savory btn-outline btn-lg mt-3" id="resend-btn" style="width:100%;">
                        Resend Verification Email
                    </button>
                    <div class="mt-3">
                        <a href="#/login" class="auth-form__forgot">Back to login</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Mock the verification process (Demo mode)
    setTimeout(() => {
        const loadingState = document.getElementById('verify-state-loading');
        const successState = document.getElementById('verify-state-success');
        const errorState = document.getElementById('verify-state-error');

        loadingState.style.display = 'none';

        if (token === 'expired') {
            errorState.style.display = 'block';
        } else {
            successState.style.display = 'block';
        }
    }, 1500);

    // Setup Resend Button
    document.getElementById('verify-card').addEventListener('click', (e) => {
        if (e.target.closest('#resend-btn')) {
            const btn = e.target.closest('#resend-btn');
            btn.innerHTML = '<div class="btn-spinner"></div> Sending...';
            btn.disabled = true;

            setTimeout(() => {
                toast.success('Email Sent', 'A new verification link has been sent to your email.');
                btn.innerHTML = 'Resend Verification Email';
                btn.disabled = false;
            }, 1000);
        }
    });
}
