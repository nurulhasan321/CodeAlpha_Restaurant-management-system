// SAVORY — Forgot Password Page
import { toast } from '../../components/toast.js';
export async function renderForgotPassword(container) {
    container.innerHTML = `
        <div class="auth-layout">
            <div class="auth-shape auth-shape--1"></div>
            <div class="auth-shape auth-shape--2"></div>
            <div class="auth-card glass-card">
                <div class="auth-card__brand">
                    <span class="auth-card__brand-icon">🔒</span>
                    <h1 class="auth-card__brand-name">Savory</h1>
                </div>
                <h2 class="auth-card__title">Forgot password?</h2>
                <p class="auth-card__subtitle">Enter your email and we'll send you a reset link</p>
                <form id="forgot-form" novalidate>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" name="email" class="form-control-savory" placeholder="Enter your email" required>
                        <span class="form-error" id="error-email"></span>
                    </div>
                    <button type="submit" class="btn-savory btn-primary btn-lg" style="width:100%;">Send Reset Link</button>
                </form>
                <div class="auth-card__footer">
                    Remember your password? <a href="#/login">Sign in</a>
                </div>
            </div>
        </div>
    `;
    document.getElementById('forgot-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        toast.success('Email Sent', 'Check your inbox for the password reset link.');
    });
}
