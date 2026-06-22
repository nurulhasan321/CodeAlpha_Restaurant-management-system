# Database Architecture & API Summary

Based on the frontend modules we have built, here is the complete blueprint for the backend database architecture and the APIs required to power it.

## 1. Entity-Relationship (ER) Diagram

The system relies on **9 core entities**. The relationships between them handle everything from a customer making a reservation to a waiter processing an order.

lmermaid
erDiagram
    CUSTOMER {
        int id PK
        string name
        string email
        string phone
        float total_spent
    }

    ROLE {
        int id PK
        string name "ADMIN, MANAGER, WAITER"
    }

    USER {
        int id PK
        string name
        string email
        string password_hash
        int role_id FK
        boolean is_active
    }

    TABLE {
        int id PK
        string table_number
        int capacity
        string status "AVAILABLE, OCCUPIED"
    }

    CATEGORY {
        int id PK
        string name
        string description
    }

    MENU_ITEM {
        int id PK
        string name
        float price
        int category_id FK
        boolean is_available
    }

    INVENTORY_ITEM {
        int id PK
        string name
        int quantity
        int min_stock
        string unit
    }

    ORDER {
        int id PK
        int customer_id FK
        int waiter_id FK "References USER"
        int table_id FK "Nullable"
        string order_type "DINE_IN, TAKEAWAY, DELIVERY"
        string status "PENDING, PREPARING, SERVED"
        float total_amount
    }

    ORDER_ITEM {
        int id PK
        int order_id FK
        int menu_item_id FK
        int quantity
        string special_notes
    }

    RESERVATION {
        int id PK
        int customer_id FK
        int table_id FK "Nullable"
        date reservation_date
        time reservation_time
        int guest_count
        string status "CONFIRMED, CANCELLED"
    }

    %% Core Relationships
    ROLE ||--o{ USER : "assigned to"
    
    CUSTOMER ||--o{ ORDER : "places"
    USER ||--o{ ORDER : "handles"
    TABLE ||--o{ ORDER : "hosts"
    
    ORDER ||--|{ ORDER_ITEM : "contains"
    MENU_ITEM ||--o{ ORDER_ITEM : "is ordered as"
    
    CATEGORY ||--|{ MENU_ITEM : "categorizes"
    
    CUSTOMER ||--o{ RESERVATION : "makes"
    TABLE ||--o{ RESERVATION : "is booked for"
```

### Key Relationships Explained:
* **Orders:** An `ORDER` is the central transactional piece. It belongs to a `CUSTOMER`, is handled by a `USER` (Waiter/Admin), and is associated with a `TABLE` (unless it's takeout).
* **Order Items:** An `ORDER` contains multiple `ORDER_ITEM` rows. Each row references a specific `MENU_ITEM` so you know exactly what was ordered and how much it cost.
* **Menu:** Every `MENU_ITEM` belongs to a specific `CATEGORY` (e.g., Starters, Main Course, Desserts).
* **Reservations:** A `CUSTOMER` can make a `RESERVATION`, which gets tied to a specific physical `TABLE`.

---

## 2. API Endpoints Required

To support all the frontend views (Auth, Dashboard, Staff, Customers, Menu, Orders, Inventory, Tables, Reservations), the backend needs approximately **37 REST API Endpoints**.

Here is the breakdown by module:

### Auth & Staff (13 APIs)
* **Auth (8):** Login, Register, Forgot Password, Reset Password, Verify Email, Get Profile, Update Profile, Logout.
* **Staff (5):** Get all staff, Add staff, Update staff details, Toggle active status, Delete staff member.

### Orders & Menu (9 APIs)
* **Orders (5):** Get all orders, Get single order details, Create new order, Update order status, Delete/Cancel order.
* **Menu (4):** Get all items (with categories), Add menu item, Update menu item, Delete menu item.

### Customers & Reservations (8 APIs)
* **Customers (4):** Get all customers, Get customer details (including order history), Add customer, Update customer.
* **Reservations (4):** Get reservations by date, Create reservation, Update reservation, Change reservation status (e.g., Seated).

### Inventory & Dashboard (7 APIs)
* **Inventory (5):** Get stock levels, Add new inventory item, Update inventory item, Adjust stock (stock-in/out), Delete item.
* **Dashboard (2):** Get high-level summary KPIs (revenue, active orders), Get time-series data for the charts.

> [!NOTE]
> Since we completely removed the Payments module, you **do not** need to build any APIs for payment processing or ledger tracking. 

For the exact JSON payloads and HTTP methods for these 37 endpoints, you can view the full [API Specification Document](file:///Users/nurulhasan/.gemini/antigravity-ide/brain/3c05667d-718a-41cb-b028-ca894761a831/api_specification.md).
