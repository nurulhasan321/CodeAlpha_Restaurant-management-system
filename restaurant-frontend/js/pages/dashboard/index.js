// ============================================
// SAVORY — Dashboard
// Admin overview with charts and summaries
// ============================================

import { MOCK_DASHBOARD } from '../../mockData.js';
import { renderStatCard } from '../../components/card.js';
import { formatCurrency, formatRelativeTime, escapeHtml } from '../../utils/helpers.js';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, CHART_PALETTE, CHART_COLORS } from '../../utils/constants.js';

export function renderDashboard(container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header__left">
                <h1 class="page-header__title">Dashboard</h1>
                <p class="page-header__subtitle">Welcome back! Here's what's happening today.</p>
            </div>
            <div class="page-header__actions">
                <span class="text-sm text-tertiary">
                    <i class="bi bi-clock me-1"></i>Last updated: Just now
                </span>
            </div>
        </div>

        <!-- Summary Stats Grid -->
        <div class="dashboard-grid">
            ${renderStatCard({
                label: "Today's Revenue",
                value: formatCurrency(MOCK_DASHBOARD.todayRevenue),
                icon: 'bi-currency-dollar',
                iconColor: 'success',
                trend: 'up',
                trendValue: '+12.5%',
                trendLabel: 'vs yesterday'
            })}
            ${renderStatCard({
                label: 'Active Orders',
                value: MOCK_DASHBOARD.activeOrders,
                icon: 'bi-lightning-charge',
                iconColor: 'orange',
                trend: 'up',
                trendValue: 'Busy',
                trendLabel: 'right now'
            })}
            ${renderStatCard({
                label: 'Reservations',
                value: MOCK_DASHBOARD.reservationsToday,
                icon: 'bi-calendar-check',
                iconColor: 'info',
                trend: null,
                trendValue: 'Scheduled',
                trendLabel: 'for today'
            })}
            ${renderStatCard({
                label: 'Table Availability',
                value: `${MOCK_DASHBOARD.availableTables} / ${MOCK_DASHBOARD.availableTables + MOCK_DASHBOARD.occupiedTables}`,
                icon: 'bi-grid-3x3-gap',
                iconColor: 'purple',
                trend: null,
                trendValue: `${MOCK_DASHBOARD.occupiedTables} occupied`,
                trendLabel: 'tables'
            })}
        </div>

        <!-- Charts Grid -->
        <div class="dashboard-charts">
            <div class="card-savory">
                <div class="card-savory__header">
                    <h3 class="card-savory__title">Weekly Revenue</h3>
                    <div class="text-sm text-tertiary"><i class="bi bi-graph-up text-success me-1"></i>Last 7 days</div>
                </div>
                <div class="card-savory__body">
                    <canvas id="revenueChart" height="250"></canvas>
                </div>
            </div>
            <div class="card-savory">
                <div class="card-savory__header">
                    <h3 class="card-savory__title">Order Status</h3>
                    <div class="text-sm text-tertiary">Current Distribution</div>
                </div>
                <div class="card-savory__body d-flex justify-content-center">
                    <div style="width: 250px; height: 250px;">
                        <canvas id="orderStatusChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activity Grid -->
        <div class="dashboard-recent" style="grid-template-columns: repeat(3, 1fr); display: grid; gap: var(--space-5);">
            
            <!-- Recent Orders -->
            <div class="card-savory">
                <div class="card-savory__header">
                    <h3 class="card-savory__title">Recent Orders</h3>
                    <a href="#/orders" class="text-xs font-semibold text-primary text-decoration-none">View All</a>
                </div>
                <div class="card-savory__body p-0">
                    <div class="list-group list-group-flush border-0">
                        ${MOCK_DASHBOARD.recentOrders.map(order => `
                            <div class="list-group-item bg-transparent px-4 py-3 d-flex justify-content-between align-items-center" style="border-color: var(--border-secondary) !important;">
                                <div>
                                    <div class="font-semibold text-primary">#${order.id} - ${escapeHtml(order.customer)}</div>
                                    <div class="text-xs text-primary mt-1">
                                        <i class="bi bi-clock me-1"></i>${order.time}
                                    </div>
                                </div>
                                <div class="text-end">
                                    <div class="font-semibold text-primary">${formatCurrency(order.amount)}</div>
                                    <span class="badge-savory badge-${ORDER_STATUS_COLORS[order.status] || 'neutral'} badge-sm mt-1">
                                        ${ORDER_STATUS_LABELS[order.status] || order.status}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Top Selling -->
            <div class="card-savory">
                <div class="card-savory__header">
                    <h3 class="card-savory__title">Top Dishes</h3>
                    <a href="#/menu" class="text-xs font-semibold text-primary text-decoration-none">Menu</a>
                </div>
                <div class="card-savory__body p-0">
                    <div class="list-group list-group-flush border-0">
                        ${MOCK_DASHBOARD.topSellingDishes.slice(0, 4).map((dish, idx) => `
                            <div class="list-group-item bg-transparent px-4 py-3 d-flex justify-content-between align-items-center" style="border-color: var(--border-secondary) !important;">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="avatar-sm rounded-circle stat-card__icon amber d-flex align-items-center justify-content-center font-bold text-xs" style="width:32px; height:32px;">
                                        #${idx + 1}
                                    </div>
                                    <div>
                                        <div class="font-semibold text-primary">${escapeHtml(dish.name)}</div>
                                        <div class="text-xs text-primary mt-1">${dish.orders} orders</div>
                                    </div>
                                </div>
                                <div class="font-bold text-primary">
                                    ${formatCurrency(dish.revenue)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Alerts -->
            <div class="card-savory">
                <div class="card-savory__header">
                    <h3 class="card-savory__title">Alerts</h3>
                    <a href="#/inventory" class="text-xs font-semibold text-warning text-decoration-none">Check</a>
                </div>
                <div class="card-savory__body p-0">
                    <div class="list-group list-group-flush border-0">
                        ${MOCK_DASHBOARD.recentInventoryUpdates.map(alert => `
                            <div class="list-group-item bg-transparent px-4 py-3 d-flex justify-content-between align-items-center" style="border-color: var(--border-secondary) !important;">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="avatar-sm rounded-circle stat-card__icon ${alert.type === 'STOCK_IN' ? 'success' : (alert.type === 'LOW STOCK' ? 'warning' : 'danger')} d-flex align-items-center justify-content-center" style="width:32px; height:32px;">
                                        <i class="bi ${alert.type === 'STOCK_IN' ? 'bi-arrow-down-left' : (alert.type === 'LOW STOCK' ? 'bi-exclamation-triangle' : 'bi-arrow-up-right')}"></i>
                                    </div>
                                    <div>
                                        <div class="font-semibold text-primary">${escapeHtml(alert.item)}</div>
                                        <div class="text-xs text-primary mt-1">${alert.time}</div>
                                    </div>
                                </div>
                                <div class="font-mono font-bold ${alert.type === 'STOCK_IN' ? 'text-success' : (alert.type === 'LOW STOCK' ? 'text-warning' : 'text-danger')}">
                                    ${alert.quantity}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

        </div>
    `;

    // Wait for DOM to insert canvas elements before rendering charts
    setTimeout(() => {
        renderCharts();
    }, 50);
}

function renderCharts() {
    // We assume Chart.js is loaded globally via CDN in index.html
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded.');
        return;
    }

    // Chart global defaults for dark mode / themes
    Chart.defaults.color = 'rgba(124, 124, 150, 0.8)';
    Chart.defaults.font.family = 'Inter, sans-serif';

    // 1. Revenue Line Chart
    const revCtx = document.getElementById('revenueChart');
    if (revCtx) {
        new Chart(revCtx, {
            type: 'line',
            data: {
                labels: MOCK_DASHBOARD.dailySales.map(d => d.day),
                datasets: [{
                    label: 'Revenue ($)',
                    data: MOCK_DASHBOARD.dailySales.map(d => d.amount),
                    borderColor: CHART_COLORS.amber,
                    backgroundColor: CHART_COLORS.amberLight,
                    borderWidth: 3,
                    pointBackgroundColor: CHART_COLORS.amber,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: CHART_COLORS.amber,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4 // smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        padding: 12,
                        backgroundColor: 'rgba(30, 30, 46, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) {
                                    label += formatCurrency(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(124, 124, 150, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    },
                    x: {
                        grid: { display: false, drawBorder: false }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // 2. Order Status Doughnut Chart
    const statusCtx = document.getElementById('orderStatusChart');
    if (statusCtx) {
        // Filter out statuses with 0 count
        const labels = [];
        const data = [];
        const bgColors = [];

        Object.entries(MOCK_DASHBOARD.orderStatusDistribution).forEach(([status, count]) => {
            if (count > 0) {
                labels.push(ORDER_STATUS_LABELS[status] || status);
                data.push(count);
                // Map status to semantic colors or palette fallback
                let colorKey = ORDER_STATUS_COLORS[status] || 'neutral';
                // Need actual rgba values for Chart.js
                const colorMap = {
                    'warning': CHART_COLORS.orange,
                    'info': CHART_COLORS.info,
                    'amber': CHART_COLORS.amber,
                    'purple': CHART_COLORS.purple,
                    'success': CHART_COLORS.success,
                    'danger': CHART_COLORS.danger,
                    'neutral': CHART_COLORS.charcoal
                };
                bgColors.push(colorMap[colorKey] || CHART_COLORS.charcoal);
            }
        });

        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: bgColors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        padding: 12,
                        backgroundColor: 'rgba(30, 30, 46, 0.9)',
                        bodyFont: { size: 14 }
                    }
                }
            }
        });
    }
}
