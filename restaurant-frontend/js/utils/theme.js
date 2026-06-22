// ============================================
// SAVORY — Theme Manager
// Dark/Light mode with persistence
// ============================================

import { storage } from './storage.js';

const THEME_KEY = 'theme';

export const theme = {
    init() {
        const saved = storage.get(THEME_KEY);
        const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const current = saved || preferred;
        this.apply(current, false);

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!storage.get(THEME_KEY)) {
                this.apply(e.matches ? 'dark' : 'light', true);
            }
        });
    },

    apply(themeName, animate = true) {
        const html = document.documentElement;

        if (animate) {
            html.classList.add('theme-transitioning');
            setTimeout(() => html.classList.remove('theme-transitioning'), 500);
        }

        html.setAttribute('data-theme', themeName);
        html.style.colorScheme = themeName;

        // Update meta theme-color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.content = themeName === 'dark' ? '#0A0A14' : '#F59E0B';
        }

        storage.set(THEME_KEY, themeName);
        this._updateCharts(themeName);
    },

    toggle() {
        const current = this.get();
        const next = current === 'dark' ? 'light' : 'dark';
        this.apply(next, true);
        return next;
    },

    get() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    },

    isDark() {
        return this.get() === 'dark';
    },

    _updateCharts(themeName) {
        // Broadcast theme change for charts to re-render
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeName } }));
    }
};
