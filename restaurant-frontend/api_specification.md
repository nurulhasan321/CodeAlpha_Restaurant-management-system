# Savory Restaurant Management System — API Specification

Based on the frontend modules we've built, the backend will need to support approximately **40 REST API endpoints**. 

Below is a comprehensive blueprint of the required endpoints, including their HTTP methods, request payloads, and expected response structures. All responses should ideally be wrapped in a standard format (e.g., `{ success: true, data: {...}, message: "..." }`), but for brevity, only the `data` payload is shown below.

---

## 1. Authentication & User Profile (Auth)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user and get JWT token |
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset link |
| `POST` | `/api/v1/auth/reset-password` | Reset password using token |
| `GET` | `/api/v1/auth/verify-email?token=` | Verify user's email address |
| `GET` | `/api/v1/auth/me` | Get current user's profile |
| `PUT` | `/api/v1/auth/profile` | Update user profile |
| `PUT` | `/api/v1/auth/change-password`| Change current password |
| `POST` | `/api/v1/auth/logout` | Invalidate current token |

**Example: `POST /api/v1/auth/login`**
```json
// Request Body
{
  "email": "admin@savory.com",
  "password": "securepassword123"
}

// Response Body
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": "1",
    "name": "Admin User",
    "email": "admin@savory.com",
    "role": "ADMIN"
  }
}
```

---

## 2. Dashboard Analytics

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/summary` | Get high-level KPI metrics |
| `GET` | `/api/v1/dashboard/charts` | Get time-series data for revenue/orders |

**Example: `GET /api/v1/dashboard/summary`**
```json
// Response Body
{
  "totalRevenue": 15420.50,
  "totalOrders": 342,
  "activeStaff": 12,
  "lowStockItems": 3,
  "trends": {
    "revenue": "+12.5%",
    "orders": "-2.1%"
  },
  "recentActivity": [
    { "type": "ORDER", "message": "Order #1024 completed", "time": "2023-10-25T14:30:00Z" }
  ]
}
```

---

## 3. Order Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/orders` | List all orders (with pagination & filters) |
| `GET` | `/api/v1/orders/:id` | Get details of a specific order |
| `POST` | `/api/v1/orders` | Create a new order |
| `PUT` | `/api/v1/orders/:id/status` | Update order status (e.g., pending -> cooking) |
| `DELETE` | `/api/v1/orders/:id` | Cancel/Delete an order |

**Example: `POST /api/v1/orders`**
```json
// Request Body
{
  "customerId": "456",
  "tableNumber": "12",
  "type": "DINE_IN",
  "items": [
    { "menuItemId": "1", "quantity": 2, "notes": "No onions" },
    { "menuItemId": "4", "quantity": 1 }
  ]
}

// Response Body
{
  "id": "1025",
  "status": "PENDING",
  "totalAmount": 45.00,
  "createdAt": "2023-10-25T15:00:00Z"
}
```

---

## 4. Menu Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/menu` | List menu items |
| `POST` | `/api/v1/menu` | Add a new menu item |
| `PUT` | `/api/v1/menu/:id` | Update a menu item |
| `DELETE` | `/api/v1/menu/:id` | Delete a menu item |
| `GET` | `/api/v1/categories` | List menu categories |

**Example: `PUT /api/v1/menu/:id`**
```json
// Request Body
{
  "name": "Spicy Salmon Roll",
  "price": 14.99,
  "categoryId": "2",
  "ingredients": ["Salmon", "Rice", "Spicy Mayo"],
  "description": "Fresh salmon with spicy mayo.",
  "available": true
}

// Response Body
{
  "id": "8",
  "name": "Spicy Salmon Roll",
  "price": 14.99,
  "available": true,
  "updatedAt": "2023-10-25T15:30:00Z"
}
```

---

## 5. Staff Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/staff` | List all staff members |
| `POST` | `/api/v1/staff` | Add a new staff member |
| `PUT` | `/api/v1/staff/:id` | Update staff details |
| `PATCH`| `/api/v1/staff/:id/status`| Toggle staff active/inactive status |
| `DELETE` | `/api/v1/staff/:id` | Remove a staff member |

**Example: `POST /api/v1/staff`**
```json
// Request Body
{
  "name": "John Doe",
  "email": "john.doe@savory.com",
  "role": "WAITER"
}

// Response Body
{
  "id": "12",
  "name": "John Doe",
  "email": "john.doe@savory.com",
  "role": "WAITER",
  "active": true,
  "joinDate": "2023-10-25T00:00:00Z"
}
```

---

## 6. Inventory Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/inventory` | List inventory items and current stock |
| `POST` | `/api/v1/inventory` | Add a new inventory item |
| `PUT` | `/api/v1/inventory/:id` | Update inventory item details |
| `POST` | `/api/v1/inventory/:id/adjust`| Record stock-in or stock-out transaction |
| `DELETE` | `/api/v1/inventory/:id` | Delete an inventory item |

**Example: `POST /api/v1/inventory/:id/adjust`**
```json
// Request Body
{
  "quantity": 50,
  "type": "STOCK_IN",
  "notes": "Weekly supplier delivery"
}

// Response Body
{
  "itemId": "3",
  "newStockLevel": 150,
  "status": "IN_STOCK",
  "transactionId": "tx_992"
}
```

---

## 7. Customer Directory

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/customers` | List all customers |
| `GET` | `/api/v1/customers/:id` | Get customer details and order history |
| `POST` | `/api/v1/customers` | Add a new customer |
| `PUT` | `/api/v1/customers/:id` | Update customer details |

**Example: `GET /api/v1/customers/:id`**
```json
// Response Body
{
  "id": "1",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "555-0192",
  "totalOrders": 14,
  "lifetimeValue": 450.75,
  "lastVisit": "2023-10-20T19:00:00Z",
  "recentOrders": [
    { "orderId": "980", "amount": 35.00, "date": "2023-10-20T19:00:00Z" }
  ]
}
```

---

## 8. Reservations

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/reservations` | List reservations (filterable by date) |
| `POST` | `/api/v1/reservations` | Create a reservation |
| `PUT` | `/api/v1/reservations/:id` | Update a reservation |
| `PATCH`| `/api/v1/reservations/:id/status`| Update status (Confirmed, Cancelled, Seated) |

**Example: `POST /api/v1/reservations`**
```json
// Request Body
{
  "customerName": "Bob Johnson",
  "phone": "555-1234",
  "date": "2023-10-30",
  "time": "19:30",
  "guestCount": 4,
  "specialRequests": "Window seat preferred"
}

// Response Body
{
  "id": "45",
  "status": "CONFIRMED",
  "tableAssignment": null,
  "createdAt": "2023-10-25T16:00:00Z"
}
```


