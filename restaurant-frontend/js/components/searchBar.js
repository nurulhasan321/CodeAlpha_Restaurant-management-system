// SAVORY — Search Bar Component
import { debounce } from '../utils/helpers.js';

export function renderSearchBar(container, options = {}) {
    container.innerHTML = `
        <div class="data-table-search" style="max-width:${options.width || '320px'}">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="${options.placeholder || 'Search...'}"
                   id="${options.id || 'search-bar'}" aria-label="Search"
                   value="${options.value || ''}">
        </div>
    `;

    if (options.onSearch) {
        const input = container.querySelector('input');
        input.addEventListener('input', debounce((e) => {
            options.onSearch(e.target.value);
        }, options.debounce || 300));
    }
}
