# Warehouse Inventory Tracker
## Overview

The Warehouse Inventory Tracker is a browser-based inventory management system built entirely with HTML, CSS, and JavaScript.
It helps warehouse staff manage stock efficiently by providing tools for adding, updating, deleting, searching, and organizing items.
All data is stored in the browser using localStorage, meaning no backend server is required.

## Key Features 
1. Inventory Management   
Add new items with details like name, category, quantity, supplier, location, minimum stock level, and price.
Edit items directly to update quantities or information.
Delete items, permanently removing them from localStorage.

2.Real-Time Dashboard
Shows live statistics including:
Total number of items
Total inventory value (auto-calculated)
Low-stock alerts based on user-defined minimum stock levels

3.Search, Filter & Sort
Search across item names, categories, suppliers, and locations.
Filter by specific categories.
Sort items by name, quantity, or date added.
Toggle to show only low-stock items.

 4.Import / Export
Export current inventory as CSV or JSON for backup or sharing.
Import a JSON file to restore or load new inventory data.


## Technologies Used
HTML5 – structure and layout

CSS3 – styling, theming, responsive design

JavaScript  – app logic, DOM manipulation, localStorage handling

## How to Install & Run
Download or copy the project files.

Open index.html in any modern browser (Chrome, Edge, Firefox, Safari).

The system loads instantly—no setup or server required.

## Testing Guide (CRUD + Features)
1. Create
Add several items using the form.
Confirm they appear immediately in the inventory table.

2.Read
Use the search bar to find items.
Apply category filters.
Sort items by name, quantity, or date to verify correct ordering.

3.Update
Click Edit on any item.
Modify values and save.
Ensure the table and dashboard update instantly.

4.Delete
Remove an item.
Confirm it disappears and does NOT return after refreshing.

5.Import / Export
Export data as CSV or JSON.
Import a JSON file and verify items load correctly.

6. Data Persistence
Refresh the page.
All items should remain stored, thanks to localStorage.
