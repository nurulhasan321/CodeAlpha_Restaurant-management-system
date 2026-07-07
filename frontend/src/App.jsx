import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppLoader from './components/AppLoader';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const Unauthorized = React.lazy(() => import('./pages/auth/Unauthorized'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));
const NotFound = React.lazy(() => import('./pages/auth/NotFound'));

// Customer Pages
const Home = React.lazy(() => import('./pages/customer/Home'));
const CustomerMenu = React.lazy(() => import('./pages/customer/Menu'));
const Cart = React.lazy(() => import('./pages/customer/Cart'));
const Checkout = React.lazy(() => import('./pages/customer/Checkout'));
const Reservation = React.lazy(() => import('./pages/customer/Reservation'));
const Orders = React.lazy(() => import('./pages/customer/Orders'));
const OrderConfirmation = React.lazy(() => import('./pages/customer/OrderConfirmation'));
const Profile = React.lazy(() => import('./pages/customer/Profile'));

// Admin Pages
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminMenu = React.lazy(() => import('./pages/admin/Menu'));
const AdminCategories = React.lazy(() => import('./pages/admin/Categories'));
const AdminTables = React.lazy(() => import('./pages/admin/Tables'));
const AdminOrders = React.lazy(() => import('./pages/admin/Orders'));
const AdminReservations = React.lazy(() => import('./pages/admin/Reservations'));
const AdminInventory = React.lazy(() => import('./pages/admin/Inventory'));
const AdminCustomers = React.lazy(() => import('./pages/admin/Customers'));
const AdminStaff = React.lazy(() => import('./pages/admin/Staff'));
const AdminReports = React.lazy(() => import('./pages/admin/Reports'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Suspense fallback={<AppLoader />}>
              <Routes>
                {/* Public / Landing Route */}
                <Route path="/" element={<CustomerLayout />}>
                  <Route index element={<Home />} />
                </Route>

                {/* Authentication Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Protected Customer Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<RoleGuard allowedRoles={['CUSTOMER']} />}>
                    <Route element={<CustomerLayout />}>
                      <Route path="/customer/menu" element={<CustomerMenu />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/reservation" element={<Reservation />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/customer/order-confirmation/:id" element={<OrderConfirmation />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                  </Route>
                </Route>

                {/* Protected Admin & Staff Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<RoleGuard allowedRoles={['ADMIN', 'STAFF']} />}>
                    <Route element={<AdminLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/admin/menu" element={<AdminMenu />} />
                      <Route path="/admin/categories" element={<AdminCategories />} />
                      <Route path="/admin/tables" element={<AdminTables />} />
                      <Route path="/admin/orders" element={<AdminOrders />} />
                      <Route path="/admin/reservations" element={<AdminReservations />} />
                      <Route path="/admin/inventory" element={<AdminInventory />} />
                      <Route path="/admin/customers" element={<AdminCustomers />} />
                      <Route path="/admin/reports" element={<AdminReports />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                    </Route>
                  </Route>

                  {/* ADMIN ONLY Routes */}
                  <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                    <Route element={<AdminLayout />}>
                      <Route path="/admin/staff" element={<AdminStaff />} />
                    </Route>
                  </Route>
                </Route>

                {/* 404 Catch-all — must be last */}
                <Route path="*" element={<NotFound />} />

              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
