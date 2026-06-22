// ============================================
// SAVORY — Login Page
// ============================================

import { auth } from '../../utils/auth.js';
import { toast } from '../../components/toast.js';
import { MOCK_USER } from '../../mockData.js';

export async function renderLogin(container) {
    container.innerHTML = `
        <div class="auth-layout">
            <div class="auth-shape auth-shape--1"></div>
            <div class="auth-shape auth-shape--2"></div>
            <div class="auth-shape auth-shape--3"></div>

            <div class="auth-card glass-card">
                <div class="auth-card__brand">
                    <span class="auth-card__brand-icon">🍽️</span>
                    <h1 class="auth-card__brand-name">Savory</h1>
                    <p class="auth-card__brand-tagline">Smart Restaurant Management System</p>
                </div>

                <h2 class="auth-card__title">Welcome back</h2>
                <p class="auth-card__subtitle">Sign in to your account to continue</p>

                <form id="login-form" novalidate>
                    <div class="form-group">
                        <label class="form-label" for="login-email">Email Address</label>
                        <input type="email" id="login-email" name="email" class="form-control-savory"
                               placeholder="Enter your email" required>
                        <span class="form-error" id="error-email"></span>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="login-password">Password</label>
                        <div class="password-field">
                            <input type="password" id="login-password" name="password" class="form-control-savory"
                                   placeholder="Enter your password" required>
                            <button type="button" class="password-toggle" id="pwd-toggle" aria-label="Toggle password visibility">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                        <span class="form-error" id="error-password"></span>
                    </div>

                    <div class="auth-form__row">
                        <label class="checkbox-savory">
                            <input type="checkbox" name="remember" id="login-remember" checked>
                            <label for="login-remember">Remember me</label>
                        </label>
                        <a href="#/forgot-password" class="auth-form__forgot">Forgot password?</a>
                    </div>

                    <button type="submit" class="btn-savory btn-primary btn-lg" id="login-submit" style="width:100%;">
                        Sign In
                    </button>
                </form>

                <div class="auth-card__footer">
                    Don't have an account? <a href="#/register">Create one</a>
                </div>
            </div>
        </div>
    `;

    // Password toggle
    document.getElementById('pwd-toggle')?.addEventListener('click', () => {
        const input = document.getElementById('login-password');
        const icon = document.querySelector('#pwd-toggle i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'bi bi-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'bi bi-eye';
        }
    });

    // Form submission
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const remember = document.getElementById('login-remember').checked;

        // Validate
        let valid = true;
        if (!email) {
            document.getElementById('error-email').textContent = 'Email is required';
            valid = false;
        } else {
            document.getElementById('error-email').textContent = '';
        }
        if (!password) {
            document.getElementById('error-password').textContent = 'Password is required';
            valid = false;
        } else {
            document.getElementById('error-password').textContent = '';
        }
        if (!valid) return;

        // Loading state
        const btn = document.getElementById('login-submit');
        btn.disabled = true;
        btn.innerHTML = '<div class="btn-spinner"></div> Signing in...';
        btn.classList.add('btn-loading');

        try {
            const { authApi } = await import('../../api/auth.js');
            const response = await authApi.login({ email, password });
            const user = {
                name: response.data.name,
                email: response.data.email,
                role: response.data.role
            };
            auth.setUser(user, remember);

            toast.success('Welcome back!', 'You have been successfully logged in.');
            window.location.hash = '#/dashboard';
        } catch (err) {
            toast.error('Login Failed', err.response?.data?.message || 'Invalid email or password.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Sign In';
            btn.classList.remove('btn-loading');
        }
    });
}
