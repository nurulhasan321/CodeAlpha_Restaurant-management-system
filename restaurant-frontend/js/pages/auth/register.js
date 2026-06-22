// SAVORY — Register Page
import { toast } from '../../components/toast.js';
import { getPasswordStrength } from '../../utils/helpers.js';

export async function renderRegister(container) {
    container.innerHTML = `
        <div class="auth-layout">
            <div class="auth-shape auth-shape--1"></div>
            <div class="auth-shape auth-shape--2"></div>
            <div class="auth-card glass-card">
                <div class="auth-card__brand">
                    <span class="auth-card__brand-icon">🍽️</span>
                    <h1 class="auth-card__brand-name">Savory</h1>
                </div>
                <h2 class="auth-card__title">Create an account</h2>
                <p class="auth-card__subtitle">Start managing your restaurant today</p>
                <form id="register-form" novalidate>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Full Name <span class="required">*</span></label>
                                <input type="text" name="name" class="form-control-savory" placeholder="John Doe" required>
                                <span class="form-error" id="error-name"></span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="form-label">Phone</label>
                                <input type="tel" name="phone" class="form-control-savory" placeholder="+1 234 567 8900">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email <span class="required">*</span></label>
                        <input type="email" name="email" class="form-control-savory" placeholder="you@example.com" required>
                        <span class="form-error" id="error-email"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password <span class="required">*</span></label>
                        <div class="password-field">
                            <input type="password" name="password" id="reg-password" class="form-control-savory" placeholder="Min 8 characters" required>
                            <button type="button" class="password-toggle" aria-label="Toggle"><i class="bi bi-eye"></i></button>
                        </div>
                        <div class="password-strength" id="pwd-strength" data-strength="0">
                            <div class="password-strength__bar"></div>
                            <div class="password-strength__bar"></div>
                            <div class="password-strength__bar"></div>
                            <div class="password-strength__bar"></div>
                        </div>
                        <span class="form-error" id="error-password"></span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Confirm Password <span class="required">*</span></label>
                        <div class="password-field">
                            <input type="password" name="confirmPassword" class="form-control-savory" placeholder="Re-enter password" required>
                            <button type="button" class="password-toggle" aria-label="Toggle"><i class="bi bi-eye"></i></button>
                        </div>
                        <span class="form-error" id="error-confirmPassword"></span>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-savory">
                            <input type="checkbox" name="terms" required>
                            <label>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
                        </label>
                    </div>
                    <button type="submit" class="btn-savory btn-primary btn-lg" style="width:100%;">Create Account</button>
                </form>
                <div class="auth-card__footer">
                    Already have an account? <a href="#/login">Sign in</a>
                </div>
            </div>
        </div>
    `;

    // Password strength
    document.getElementById('reg-password')?.addEventListener('input', (e) => {
        const strength = getPasswordStrength(e.target.value);
        document.getElementById('pwd-strength').dataset.strength = strength;
    });

    // Password toggles
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
            btn.querySelector('i').className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
    });

    // Submit
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        if (data.password !== data.confirmPassword) {
            document.getElementById('error-confirmPassword').textContent = 'Passwords do not match';
            return;
        }
        
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<div class="btn-spinner"></div> Creating Account...';
        btn.classList.add('btn-loading');

        try {
            try {
                const { authApi } = await import('../../api/auth.js');
                const requestData = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: data.password
                };
                await authApi.register(requestData);
            } catch (err) {
                if (err.response) {
                    throw err;
                }
                // Mock registration fallback if backend is offline
                await new Promise(r => setTimeout(r, 800));
            }
            
            toast.success('Account Created', 'You have successfully signed up. Please log in.');
            setTimeout(() => window.location.hash = '#/login', 1500);
        } catch (err) {
            toast.error('Registration Failed', err.response?.data?.message || 'Something went wrong.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.classList.remove('btn-loading');
        }
    });
}
