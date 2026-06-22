const MOCK_CATEGORIES = [
    { id: 1, name: 'Appetizers', description: 'Light starters and small bites', active: true, itemCount: 8 }
];
let localCategories = [...MOCK_CATEGORIES];

function escapeHtml(str) {
    return str ? String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

function showCategoryForm(existingCategory = null) {
    const isEdit = !!existingCategory;
    console.log("isEdit:", isEdit);
    try {
        const value1 = isEdit ? escapeHtml(existingCategory.name) : '';
        const value2 = isEdit ? escapeHtml(existingCategory.description) : '';
        console.log("value1:", value1, "value2:", value2);
    } catch(e) {
        console.error("Error:", e);
    }
}

showCategoryForm();
showCategoryForm(localCategories[0]);
