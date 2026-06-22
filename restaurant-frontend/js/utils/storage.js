// ============================================
// SAVORY — Storage Utility
// Thin localStorage wrapper with namespacing
// ============================================

const NAMESPACE = 'savory_';

export const storage = {
    get(key, fallback = null) {
        try {
            const raw = localStorage.getItem(NAMESPACE + key);
            if (raw === null) return fallback;
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage set failed:', e);
        }
    },

    remove(key) {
        localStorage.removeItem(NAMESPACE + key);
    },

    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(NAMESPACE)) {
                localStorage.removeItem(key);
            }
        });
    },

    // Session storage variants
    sessionGet(key, fallback = null) {
        try {
            const raw = sessionStorage.getItem(NAMESPACE + key);
            if (raw === null) return fallback;
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    },

    sessionSet(key, value) {
        try {
            sessionStorage.setItem(NAMESPACE + key, JSON.stringify(value));
        } catch (e) {
            console.warn('Session storage set failed:', e);
        }
    },

    sessionRemove(key) {
        sessionStorage.removeItem(NAMESPACE + key);
    }
};
