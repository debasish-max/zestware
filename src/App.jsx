import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminOrders from "./pages/Admin/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Toast from "./components/Toast";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AdminProducts from "./pages/Admin/Products";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import { useState, useEffect } from "react";

function AppContent() {
  const [toast, setToast] = useState("");
  const { user, role, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setToast("");
  }, [location.pathname]);

  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <>
      <Navbar />
      <Routes>
        {/* Dynamic Home Route */}
        <Route
          path="/"
          element={
            loading ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) :
              role === 'admin' ?
                <Navigate to="/admin" replace /> :
                <Home setToast={setToast} />
          }
        />

        <Route path="/cart" element={<Cart setToast={setToast} />} />
        <Route path="/login" element={<Login setToast={setToast} />} />
        <Route path="/signup" element={<Signup setToast={setToast} />} />
        <Route path="/orders" element={<Orders setToast={setToast} />} />
        <Route path="/checkout" element={<Checkout setToast={setToast} />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/product/:id" element={<ProductDetails setToast={setToast} />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard setToast={setToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminOrders setToast={setToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <AdminProducts setToast={setToast} />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!isAdminPath && <Footer />}
      <Toast message={toast} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
