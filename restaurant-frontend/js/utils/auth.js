// ============================================
// SAVORY — Auth Utility
// Role checks, user state
// ============================================

import { storage } from './storage.js';
import { ROLES } from './constants.js';

const USER_KEY = 'user';
const REMEMBER_KEY = 'remember';

export const auth = {
    getUser() {
        return storage.get(USER_KEY) || storage.sessionGet(USER_KEY);
    },

    setUser(user, remember = false) {
        if (remember || storage.get(REMEMBER_KEY)) {
            storage.set(USER_KEY, user);
            storage.set(REMEMBER_KEY, true);
        } else {
            storage.sessionSet(USER_KEY, user);
        }
    },

    removeUser() {
        storage.remove(USER_KEY);
        storage.sessionRemove(USER_KEY);
        storage.remove(REMEMBER_KEY);
    },

    isAuthenticated() {
        // Now relying on HttpOnly cookies, so we just check if we have a user session stored
        return !!this.getUser();
    },

    getRole() {
        const user = this.getUser();
        return user?.role || null;
    },

    hasRole(role) {
        const userRole = this.getRole();
        if (!userRole) return false;
        if (Array.isArray(role)) return role.includes(userRole);
        return userRole === role;
    },

    isAdmin() {
        return this.hasRole(ROLES.ADMIN);
    },

    isManager() {
        return this.hasRole([ROLES.ADMIN, ROLES.MANAGER]);
    },

    canAccess(allowedRoles) {
        if (!allowedRoles || allowedRoles.length === 0) return true;
        return this.hasRole(allowedRoles);
    },

    logout() {
        // Send a logout request to the backend to clear the HttpOnly cookie
        import('../../api/axios.js').then(({ default: api }) => {
            api.post('/auth/logout').catch(() => {});
        }).finally(() => {
            this.removeUser();
            window.location.hash = '#/login';
        });
    }
};
