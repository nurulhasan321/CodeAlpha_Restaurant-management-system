// SAVORY — Reset Password Page
import { toast } from '../../components/toast.js';
export async function renderResetPassword(container) {
    container.innerHTML = `
        <div class="auth-layout">
            <div class="auth-shape auth-shape--1"></div>
            <div class="auth-card glass-card">
                <div class="auth-card__brand"><span class="auth-card__brand-icon">🔑</span><h1 class="auth-card__brand-name">Savory</h1></div>
                <h2 class="auth-card__title">Reset your password</h2>
                <p class="auth-card__subtitle">Enter your new password below</p>
                <form id="reset-form" novalidate>
                    <div class="form-group"><label class="form-label">New Password</label>
                        <div class="password-field"><input type="password" name="password" class="form-control-savory" placeholder="Min 8 characters" required>
                        <button type="button" class="password-toggle" aria-label="Toggle"><i class="bi bi-eye"></i></button></div></div>
                    <div class="form-group"><label class="form-label">Confirm Password</label>
                        <div class="password-field"><input type="password" name="confirmPassword" class="form-control-savory" placeholder="Re-enter password" required>
                        <button type="button" class="password-toggle" aria-label="Toggle"><i class="bi bi-eye"></i></button></div>
                        <span class="form-error" id="error-confirm"></span></div>
                    <button type="submit" class="btn-savory btn-primary btn-lg" style="width:100%;">Reset Password</button>
                </form>
                <div class="auth-card__footer"><a href="#/login">Back to login</a></div>
            </div>
        </div>
    `;
    document.querySelectorAll('.password-toggle').forEach(b => b.addEventListener('click', () => { const i = b.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; }));
    document.getElementById('reset-form')?.addEventListener('submit', (e) => { e.preventDefault(); toast.success('Password Reset', 'Your password has been updated.'); setTimeout(() => window.location.hash = '#/login', 1500); });
}
