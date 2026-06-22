// ============================================
// SAVORY — Skeleton Loaders
// ============================================

export function renderSkeleton(type = 'card', count = 1) {
    const templates = {
        card: `
            <div class="glass-stat stat-card" style="min-height:120px;">
                <div class="stat-card__content">
                    <div class="skeleton skeleton-text w-50" style="margin-bottom:12px;"></div>
                    <div class="skeleton skeleton-title" style="width:80px;height:32px;"></div>
                    <div class="skeleton skeleton-text w-25" style="margin-top:8px;"></div>
                </div>
                <div class="skeleton skeleton-avatar" style="width:48px;height:48px;border-radius:var(--radius-xl);"></div>
            </div>
        `,
        table: `
            <div class="data-table-wrapper">
                <div style="padding:var(--space-4) var(--space-5);">
                    <div class="skeleton skeleton-text" style="width:200px;height:36px;border-radius:var(--radius-md);"></div>
                </div>
                ${Array(5).fill('').map(() => `
                    <div style="display:flex;gap:var(--space-4);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-secondary);">
                        <div class="skeleton skeleton-text" style="flex:2;"></div>
                        <div class="skeleton skeleton-text" style="flex:1;"></div>
                        <div class="skeleton skeleton-text" style="flex:1;"></div>
                        <div class="skeleton skeleton-text w-75" style="flex:1;"></div>
                    </div>
                `).join('')}
            </div>
        `,
        chart: `
            <div class="card-savory">
                <div class="card-savory__header">
                    <div class="skeleton skeleton-text" style="width:120px;height:20px;"></div>
                </div>
                <div class="card-savory__body">
                    <div class="skeleton skeleton-chart" style="border-radius:var(--radius-lg);"></div>
                </div>
            </div>
        `,
        list: `
            <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) 0;">
                <div class="skeleton skeleton-avatar"></div>
                <div style="flex:1;">
                    <div class="skeleton skeleton-text w-75"></div>
                    <div class="skeleton skeleton-text w-50"></div>
                </div>
            </div>
        `,
        form: `
            <div class="form-group">
                <div class="skeleton skeleton-text w-25" style="height:16px;margin-bottom:8px;"></div>
                <div class="skeleton" style="height:42px;border-radius:var(--radius-lg);"></div>
            </div>
        `,
    };

    return Array(count).fill(templates[type] || templates.card).join('');
}

export function renderDashboardSkeleton() {
    return `
        <div class="dashboard-grid">
            ${renderSkeleton('card', 4)}
        </div>
        <div class="dashboard-charts">
            ${renderSkeleton('chart', 2)}
        </div>
    `;
}

export function renderTableSkeleton() {
    return renderSkeleton('table', 1);
}
