// ============================================
// SAVORY — Hash-Based SPA Router
// Path matching, params, guards, transitions
// ============================================

import { auth } from './utils/auth.js';

class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.beforeHooks = [];
        this.afterHooks = [];
        this.contentEl = null;
    }

    init(contentSelector = '#main-content') {
        this.contentEl = document.querySelector(contentSelector);
        window.addEventListener('hashchange', () => this._handleRoute());
        // Handle initial route
        if (!window.location.hash) {
            window.location.hash = '#/login';
        } else {
            this._handleRoute();
        }
    }

    addRoute(path, handler, options = {}) {
        this.routes.push({
            path,
            handler,
            regex: this._pathToRegex(path),
            paramNames: this._extractParamNames(path),
            ...options, // auth, roles, title
        });
    }

    beforeEach(hook) {
        this.beforeHooks.push(hook);
    }

    afterEach(hook) {
        this.afterHooks.push(hook);
    }

    navigate(path) {
        window.location.hash = '#' + path;
    }

    getParams() {
        return this.currentRoute?.params || {};
    }

    getQuery() {
        const hash = window.location.hash.substring(1);
        const queryIndex = hash.indexOf('?');
        if (queryIndex === -1) return {};
        const params = new URLSearchParams(hash.substring(queryIndex));
        return Object.fromEntries(params);
    }

    async _handleRoute() {
        const hash = window.location.hash.substring(1) || '/login';
        const path = hash.split('?')[0]; // Strip query params

        // Find matching route
        let matched = null;
        let params = {};

        for (const route of this.routes) {
            const match = path.match(route.regex);
            if (match) {
                matched = route;
                params = {};
                route.paramNames.forEach((name, i) => {
                    params[name] = match[i + 1];
                });
                break;
            }
        }

        // 404 fallback
        if (!matched) {
            matched = this.routes.find(r => r.path === '*');
            if (!matched) return;
        }

        // Auth guard
        if (matched.auth !== false && matched.path !== '/login' && matched.path !== '/register'
            && matched.path !== '/forgot-password' && matched.path !== '/reset-password'
            && matched.path !== '/verify-email') {
            if (!auth.isAuthenticated()) {
                this.navigate('/login');
                return;
            }
        }

        // Role guard
        if (matched.roles && matched.roles.length > 0) {
            if (!auth.canAccess(matched.roles)) {
                this.navigate('/unauthorized');
                return;
            }
        }

        // Before hooks
        for (const hook of this.beforeHooks) {
            const result = await hook(matched, this.currentRoute);
            if (result === false) return;
        }

        // Store current
        const previousRoute = this.currentRoute;
        this.currentRoute = { ...matched, params, path };

        // Update page title
        if (matched.title) {
            document.title = `${matched.title} — Savory`;
        }

        // Render page
        if (this.contentEl && matched.handler) {
            // Exit animation
            if (previousRoute) {
                this.contentEl.classList.remove('page-enter');
            }

            // Render content
            try {
                if (typeof matched.handler === 'function') {
                    await matched.handler(this.contentEl, params);
                }
            } catch (err) {
                console.error('Route handler error:', err);
                this.contentEl.innerHTML = `
                    <div class="error-state">
                        <div class="error-state__icon"><i class="bi bi-exclamation-triangle"></i></div>
                        <h3 class="error-state__title">Something went wrong</h3>
                        <p class="error-state__description">${err.message || 'An error occurred while loading this page.'}</p>
                        <button class="btn-savory btn-primary" onclick="location.reload()">
                            <i class="bi bi-arrow-clockwise"></i> Reload
                        </button>
                    </div>
                `;
            }

            // Enter animation
            this.contentEl.classList.add('page-enter');
        }

        // After hooks
        for (const hook of this.afterHooks) {
            await hook(this.currentRoute, previousRoute);
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    _pathToRegex(path) {
        if (path === '*') return /.*/;
        const pattern = path
            .replace(/\//g, '\\/')
            .replace(/:([^/]+)/g, '([^/]+)');
        return new RegExp(`^${pattern}$`);
    }

    _extractParamNames(path) {
        const names = [];
        const regex = /:([^/]+)/g;
        let match;
        while ((match = regex.exec(path)) !== null) {
            names.push(match[1]);
        }
        return names;
    }
}

export const router = new Router();
