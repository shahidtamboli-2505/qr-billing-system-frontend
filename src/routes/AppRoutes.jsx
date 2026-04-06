import { Routes, Route } from "react-router-dom";

// Customer Pages
import HomePage from "../pages/customer/HomePage";
import MenuPage from "../pages/customer/MenuPage";
import CartPage from "../pages/customer/CartPage";
import CheckoutPage from "../pages/customer/CheckoutPage";
import OrderSuccessPage from "../pages/customer/OrderSuccessPage";
import InvoicePage from "../pages/customer/InvoicePage";

// Admin Pages
import AdminLogin from "../pages/admin/AdminLogin";
import Dashboard from "../pages/admin/Dashboard";
import OrdersPage from "../pages/admin/OrdersPage";
import MenuManagement from "../pages/admin/MenuManagement";
import BillingPage from "../pages/admin/BillingPage";
import ReportsPage from "../pages/admin/ReportsPage";
import SettingsPage from "../pages/admin/SettingsPage";

// Route Guard
import AdminRoute from "./AdminRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/menu/:tableId" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/success" element={<OrderSuccessPage />} />
      <Route path="/invoice/:orderId" element={<InvoicePage />} />

      {/* Admin Open Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <OrdersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <AdminRoute>
            <MenuManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <AdminRoute>
            <BillingPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <ReportsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <SettingsPage />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;