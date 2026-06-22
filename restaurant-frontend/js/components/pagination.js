// SAVORY — Pagination Component
export function renderPagination(currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) return '';

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    let html = `<div class="pagination-savory">`;
    html += `<button class="pagination-savory__btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>
        <i class="bi bi-chevron-left"></i></button>`;

    if (start > 1) {
        html += `<button class="pagination-savory__btn" data-page="1">1</button>`;
        if (start > 2) html += `<span class="pagination-savory__ellipsis">…</span>`;
    }

    for (let i = start; i <= end; i++) {
        html += `<button class="pagination-savory__btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    if (end < totalPages) {
        if (end < totalPages - 1) html += `<span class="pagination-savory__ellipsis">…</span>`;
        html += `<button class="pagination-savory__btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `<button class="pagination-savory__btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>
        <i class="bi bi-chevron-right"></i></button>`;
    html += `</div>`;

    // After rendering, attach events
    setTimeout(() => {
        document.querySelectorAll('.pagination-savory__btn[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page >= 1 && page <= totalPages && page !== currentPage) {
                    onPageChange?.(page);
                }
            });
        });
    }, 0);

    return html;
}
