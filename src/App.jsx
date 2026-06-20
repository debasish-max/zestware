import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useState, useEffect, Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Toast from "./components/Toast";

const Home = lazy(() => import("./pages/Home"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Orders = lazy(() => import("./pages/Orders"));
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const AdminOrders = lazy(() => import("./pages/Admin/Orders"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const AdminProducts = lazy(() => import("./pages/Admin/Products"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Terms = lazy(() => import("./pages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Contact = lazy(() => import("./pages/Contact"));

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
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
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
      </Suspense>

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
