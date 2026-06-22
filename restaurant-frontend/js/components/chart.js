// ============================================
// SAVORY — Chart.js Wrapper
// ============================================

import { CHART_COLORS, CHART_PALETTE, CHART_PALETTE_LIGHT } from '../utils/constants.js';
import { theme } from '../utils/theme.js';

const chartInstances = new Map();

function getGridColor() {
    return theme.isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
}

function getTextColor() {
    return theme.isDark() ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
}

function getDefaults() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    font: { family: "'Inter', sans-serif", size: 12 },
                    color: getTextColor(),
                },
            },
            tooltip: {
                backgroundColor: theme.isDark() ? 'rgba(30,30,46,0.95)' : 'rgba(255,255,255,0.95)',
                titleColor: theme.isDark() ? '#fff' : '#1E1E2E',
                bodyColor: theme.isDark() ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                borderColor: theme.isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                borderWidth: 1,
                cornerRadius: 12,
                padding: 12,
                titleFont: { family: "'Inter', sans-serif", weight: 600, size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 6,
                usePointStyle: true,
            },
        },
        scales: {
            x: {
                grid: { color: getGridColor(), drawBorder: false },
                ticks: { color: getTextColor(), font: { family: "'Inter', sans-serif", size: 11 } },
                border: { display: false },
            },
            y: {
                grid: { color: getGridColor(), drawBorder: false },
                ticks: { color: getTextColor(), font: { family: "'Inter', sans-serif", size: 11 } },
                border: { display: false },
                beginAtZero: true,
            },
        },
        animation: {
            duration: 800,
            easing: 'easeOutQuart',
        },
    };
}

export function createChart(canvasId, type, config) {
    // Destroy existing instance
    destroyChart(canvasId);

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const defaults = getDefaults();

    // Merge defaults with provided config
    const merged = {
        type,
        data: config.data,
        options: deepMerge(defaults, config.options || {}),
    };

    // For pie/doughnut, remove scales
    if (type === 'doughnut' || type === 'pie') {
        delete merged.options.scales;
    }

    const chart = new Chart(ctx, merged);
    chartInstances.set(canvasId, chart);
    return chart;
}

export function destroyChart(canvasId) {
    const chart = chartInstances.get(canvasId);
    if (chart) {
        chart.destroy();
        chartInstances.delete(canvasId);
    }
}

export function destroyAllCharts() {
    chartInstances.forEach((chart, id) => {
        chart.destroy();
    });
    chartInstances.clear();
}

// Re-render all charts on theme change
window.addEventListener('themechange', () => {
    chartInstances.forEach((chart, canvasId) => {
        const config = {
            type: chart.config.type,
            data: chart.data,
            options: chart.options,
        };
        destroyChart(canvasId);
        createChart(canvasId, config.type, { data: config.data, options: config.options });
    });
});

// Helper: create a gradient fill
export function createGradient(ctx, color1, color2, height = 300) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

// Deep merge utility
function deepMerge(target, source) {
    const output = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
            output[key] = deepMerge(target[key], source[key]);
        } else {
            output[key] = source[key];
        }
    }
    return output;
}

export { CHART_COLORS, CHART_PALETTE, CHART_PALETTE_LIGHT };
