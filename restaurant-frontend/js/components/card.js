// ============================================
// SAVORY — Card Components
// ============================================

export function renderStatCard({ label, value, icon, iconColor, trend, trendValue, trendLabel }) {
    const trendHtml = trend ? `
        <span class="stat-card__trend ${trend}">
            <i class="bi ${trend === 'up' ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}"></i>
            ${trendValue || ''}
        </span>
        ${trendLabel ? `<span style="font-size:var(--text-xs);color:var(--text-tertiary);margin-left:4px;">${trendLabel}</span>` : ''}
    ` : '';

    return `
        <div class="glass-stat stat-card animate-fade-in-up">
            <div class="stat-card__content">
                <div class="stat-card__label">${label}</div>
                <div class="stat-card__value">${value}</div>
                <div>${trendHtml}</div>
            </div>
            <div class="stat-card__icon ${iconColor || 'amber'}">
                <i class="bi ${icon}"></i>
            </div>
        </div>
    `;
}

export function renderContentCard({ title, subtitle, body, footer, headerActions, className }) {
    return `
        <div class="card-savory ${className || ''}">
            ${title || headerActions ? `
                <div class="card-savory__header">
                    <div>
                        ${title ? `<h3 class="card-savory__title">${title}</h3>` : ''}
                        ${subtitle ? `<p style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:2px;">${subtitle}</p>` : ''}
                    </div>
                    ${headerActions ? `<div>${headerActions}</div>` : ''}
                </div>
            ` : ''}
            <div class="card-savory__body">${body || ''}</div>
            ${footer ? `<div class="card-savory__footer">${footer}</div>` : ''}
        </div>
    `;
}

export function renderImageCard({ image, title, subtitle, badges, actions, onClick }) {
    return `
        <div class="card-savory hover-lift" ${onClick ? `style="cursor:pointer" onclick="${onClick}"` : ''}>
            ${image ? `
                <div style="height:180px;overflow:hidden;">
                    <img src="${image}" alt="${title || ''}" style="width:100%;height:100%;object-fit:cover;">
                </div>
            ` : ''}
            <div class="card-savory__body">
                ${title ? `<h4 style="font-size:var(--text-md);font-weight:var(--weight-semibold);margin-bottom:4px;">${title}</h4>` : ''}
                ${subtitle ? `<p style="font-size:var(--text-sm);color:var(--text-tertiary);margin-bottom:8px;">${subtitle}</p>` : ''}
                ${badges ? `<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">${badges}</div>` : ''}
            </div>
            ${actions ? `<div class="card-savory__footer">${actions}</div>` : ''}
        </div>
    `;
}

export function renderProfileCard({ name, role, email, avatar, initials, stats }) {
    return `
        <div class="card-savory" style="text-align:center;padding:var(--space-8) var(--space-6);">
            <div class="avatar avatar-xl" style="margin:0 auto var(--space-4);">${initials || '?'}</div>
            <h3 style="font-size:var(--text-lg);font-weight:var(--weight-semibold);margin-bottom:2px;">${name}</h3>
            <p style="font-size:var(--text-sm);color:var(--text-tertiary);margin-bottom:var(--space-4);">${role || ''}</p>
            ${email ? `<p style="font-size:var(--text-xs);color:var(--text-tertiary);">${email}</p>` : ''}
            ${stats ? `
                <div style="display:flex;justify-content:center;gap:var(--space-6);margin-top:var(--space-6);padding-top:var(--space-5);border-top:1px solid var(--border-secondary);">
                    ${stats.map(s => `
                        <div>
                            <div style="font-size:var(--text-xl);font-weight:var(--weight-bold);color:var(--text-primary);">${s.value}</div>
                            <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.label}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}
