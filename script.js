// Warehouse Inventory Management System
// Storage key for localStorage
const STORAGE_KEY = 'warehouseInventoryItems';

// Global variables
let items = [];
let editingId = null;

// Cache DOM elements for better performance
const elements = {
  // Form fields
  itemId: document.getElementById('item-id'),
  itemName: document.getElementById('item-name'),
  itemQuantity: document.getElementById('item-quantity'),
  itemCategory: document.getElementById('item-category'),
  itemSupplier: document.getElementById('item-supplier'),
  itemLocation: document.getElementById('item-location'),
  itemMinStock: document.getElementById('item-minstock'),
  itemPrice: document.getElementById('item-price'),
  
  // Action buttons
  submitBtn: document.getElementById('submit-btn'),
  cancelBtn: document.getElementById('cancel-btn'),
  
  // Filters and search
  searchInput: document.getElementById('search-input'),
  categoryFilter: document.getElementById('category-filter'),
  sortSelect: document.getElementById('sort-select'),
  lowStockFilter: document.getElementById('low-stock-filter'),
  
  // UI elements
  formTitle: document.getElementById('form-title'),
  message: document.getElementById('message'),
  itemsTbody: document.getElementById('items-tbody'),
  emptyState: document.getElementById('empty-state'),
  emptySubtitle: document.getElementById('empty-subtitle'),
  itemsCount: document.getElementById('items-count'),
  
  // Statistics
  statTotal: document.getElementById('stat-total'),
  statValue: document.getElementById('stat-value'),
  statLow: document.getElementById('stat-low'),
  
  // File import
  importFile: document.getElementById('import-file')
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadItems();
  renderItems();
  setupEventListeners();
  updateStats();
});

// Setup all event listeners
function setupEventListeners() {
  // Search and filter listeners
  elements.searchInput.addEventListener('input', renderItems);
  elements.categoryFilter.addEventListener('change', renderItems);
  elements.sortSelect.addEventListener('change', renderItems);
  elements.lowStockFilter.addEventListener('change', renderItems);
  
  // File import listener
  elements.importFile.addEventListener('change', importFromJSON);
  
  // Allow Enter key to submit form
  const formInputs = [
    elements.itemName,
    elements.itemQuantity,
    elements.itemCategory,
    elements.itemSupplier,
    elements.itemLocation,
    elements.itemMinStock,
    elements.itemPrice
  ];
  
  formInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    });
  });
}

// Load items from localStorage
function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    items = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading items:', error);
    items = [];
    showMessage('Error loading inventory data', 'error');
  }
}

// Save items to localStorage
function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving items:', error);
    showMessage('Error saving inventory data', 'error');
  }
}

// Handle form submission (add or update item)
function handleSubmit() {
  const name = elements.itemName.value.trim();
  const quantity = parseInt(elements.itemQuantity.value);
  const category = elements.itemCategory.value.trim();
  const supplier = elements.itemSupplier.value.trim();
  const location = elements.itemLocation.value.trim();
  const minStock = parseInt(elements.itemMinStock.value) || 10;
  const price = parseFloat(elements.itemPrice.value) || 0;
  
  // Basic validation
  if (!name) {
    showMessage('Please enter an item name', 'error');
    elements.itemName.focus();
    return;
  }
  
  if (isNaN(quantity) || quantity < 0) {
    showMessage('Please enter a valid quantity', 'error');
    elements.itemQuantity.focus();
    return;
  }
  
  if (editingId) {
    // Update mode
    const index = items.findIndex(item => item.id === editingId);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        name,
        quantity,
        category,
        supplier,
        location,
        minStock,
        price,
        lastUpdated: new Date().toISOString()
      };
      showMessage('Item updated successfully');
    }
    editingId = null;
  } else {
    // Add mode - create new item
    const newItem = {
      id: Date.now().toString(),
      name,
      quantity,
      category,
      supplier,
      location,
      minStock,
      price,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    items.push(newItem);
    showMessage('Item added successfully');
  }
  
  saveItems();
  renderItems();
  updateStats();
  updateCategoryFilter();
  resetForm();
}

// Reset form to initial state
function resetForm() {
  elements.itemName.value = '';
  elements.itemQuantity.value = '';
  elements.itemCategory.value = '';
  elements.itemSupplier.value = '';
  elements.itemLocation.value = '';
  elements.itemMinStock.value = '10';
  elements.itemPrice.value = '';
  
  editingId = null;
  updateFormUI();
}

// Update form UI based on add/edit mode
function updateFormUI() {
  if (editingId) {
    elements.formTitle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      Edit Item
    `;
    elements.submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      Update Item
    `;
    elements.cancelBtn.style.display = 'inline-flex';
  } else {
    elements.formTitle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Add New Item
    `;
    elements.submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Add Item
    `;
    elements.cancelBtn.style.display = 'none';
  }
}

// Edit an existing item
function editItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  
  elements.itemName.value = item.name;
  elements.itemQuantity.value = item.quantity;
  elements.itemCategory.value = item.category || '';
  elements.itemSupplier.value = item.supplier || '';
  elements.itemLocation.value = item.location || '';
  elements.itemMinStock.value = item.minStock || 10;
  elements.itemPrice.value = item.price || '';
  
  editingId = id;
  updateFormUI();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete an item with confirmation
function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }
  
  items = items.filter(item => item.id !== id);
  saveItems();
  renderItems();
  updateStats();
  updateCategoryFilter();
  showMessage('Item deleted successfully');
}

// Render all items in the table
function renderItems() {
  const searchTerm = elements.searchInput.value.toLowerCase();
  const categoryFilter = elements.categoryFilter.value;
  const sortBy = elements.sortSelect.value;
  const lowStockOnly = elements.lowStockFilter.checked;
  
  // Apply filters
  let filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm) ||
      (item.category || '').toLowerCase().includes(searchTerm) ||
      (item.supplier || '').toLowerCase().includes(searchTerm) ||
      (item.location || '').toLowerCase().includes(searchTerm);
    
    const matchesCategory = 
      categoryFilter === 'all' || item.category === categoryFilter;
    
    const matchesLowStock = 
      !lowStockOnly || item.quantity <= (item.minStock || 10);
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });
  
  // Apply sorting
  filteredItems.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'quantity':
        return a.quantity - b.quantity;
      case 'date':
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      default:
        return 0;
    }
  });
  
  // Clear existing rows
  elements.itemsTbody.innerHTML = '';
  
  // Show/hide empty state
  if (filteredItems.length === 0) {
    elements.emptyState.style.display = 'block';
    elements.emptySubtitle.textContent = items.length === 0 
      ? 'Add your first item to get started'
      : 'Try adjusting your filters';
  } else {
    elements.emptyState.style.display = 'none';
    
    // Create rows for each item
    filteredItems.forEach((item, index) => {
      const row = createItemRow(item, index);
      elements.itemsTbody.appendChild(row);
    });
  }
  
  // Update item count display
  elements.itemsCount.textContent = `Showing ${filteredItems.length} of ${items.length} items`;
}

// Create a table row for an item
function createItemRow(item, index) {
  const tr = document.createElement('tr');
  const isLowStock = item.quantity <= (item.minStock || 10);
  const itemValue = item.quantity * (item.price || 0);
  
  tr.innerHTML = `
    <td>
      <div class="item-name">
        <span>${escapeHtml(item.name)}</span>
        ${isLowStock ? '<span class="badge-low-stock">Low Stock</span>' : ''}
      </div>
    </td>
    <td>
      <span class="${isLowStock ? 'quantity-low' : 'quantity-normal'}">
        ${item.quantity}
      </span>
    </td>
    <td>${escapeHtml(item.category || '-')}</td>
    <td>${escapeHtml(item.supplier || '-')}</td>
    <td>${escapeHtml(item.location || '-')}</td>
    <td class="item-value">$${itemValue.toFixed(2)}</td>
    <td>
      <div class="action-buttons">
        <button class="btn btn-edit" onclick="editItem('${item.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Edit
        </button>
        <button class="btn btn-delete" onclick="deleteItem('${item.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Delete
        </button>
      </div>
    </td>
  `;
  
  return tr;
}

// Update statistics cards
function updateStats() {
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
  const lowStockCount = items.filter(item => item.quantity <= (item.minStock || 10)).length;
  
  elements.statTotal.textContent = totalItems;
  elements.statValue.textContent = `$${totalValue.toFixed(2)}`;
  elements.statLow.textContent = lowStockCount;
}

// Update category dropdown options
function updateCategoryFilter() {
  const currentValue = elements.categoryFilter.value;
  const categories = ['all', ...new Set(items.filter(i => i.category).map(i => i.category))];
  
  elements.categoryFilter.innerHTML = categories.map(cat => 
    `<option value="${cat}" ${cat === currentValue ? 'selected' : ''}>
      ${cat === 'all' ? 'All Categories' : escapeHtml(cat)}
    </option>`
  ).join('');
}

// Export inventory to JSON file
function exportToJSON() {
  if (items.length === 0) {
    showMessage('No items to export', 'error');
    return;
  }
  
  const dataStr = JSON.stringify(items, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventory_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showMessage('Inventory exported successfully');
}

// Export inventory to CSV file
function exportToCSV() {
  if (items.length === 0) {
    showMessage('No items to export', 'error');
    return;
  }
  
  const headers = ['Name', 'Quantity', 'Category', 'Supplier', 'Location', 'Min Stock', 'Price', 'Date Added'];
  const rows = items.map(item => [
    item.name,
    item.quantity,
    item.category || '',
    item.supplier || '',
    item.location || '',
    item.minStock || '',
    item.price || '',
    new Date(item.dateAdded).toLocaleDateString()
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showMessage('CSV exported successfully');
}

// Import inventory from JSON file
function importFromJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        showMessage('Invalid file format', 'error');
        return;
      }
      
      // Validate imported data
      const valid = imported.every(item => 
        item.id && item.name && typeof item.quantity === 'number'
      );
      
      if (!valid) {
        showMessage('Invalid data structure in file', 'error');
        return;
      }
      
      items = imported;
      saveItems();
      renderItems();
      updateStats();
      updateCategoryFilter();
      showMessage('Inventory imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      showMessage('Error importing file', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// Show toast message
function showMessage(text, type = 'success') {
  elements.message.textContent = text;
  elements.message.className = `message ${type === 'error' ? 'error' : ''}`;
  elements.message.classList.remove('hidden');
  
  setTimeout(() => {
    elements.message.classList.add('hidden');
  }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions available globally for onclick handlers
window.handleSubmit = handleSubmit;
window.resetForm = resetForm;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.exportToJSON = exportToJSON;
window.exportToCSV = exportToCSV;