import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/layout/Navbar";
import BottomNav from "./components/layout/BottomNav";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Orders = lazy(() => import("./pages/Orders"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AuthenticatedLayout({ children }) {
  return (
    /* Força o layout a ocupar 100% da largura da tela sem travar as páginas internas */
    <div className="min-h-screen w-full flex flex-col bg-[var(--bg-base)]">
      {/* Navbar livre na raiz para expandir seus max-w-7xl internos */}
      <Navbar />

      {/* Área útil da página: cresce e centraliza os elementos filhos */}
      <div className="flex-1 w-full flex flex-col items-center">{children}</div>

      <BottomNav />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <ProductDetail />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <Cart />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <Checkout />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />

        {/* New success page */}
        <Route
          path="/order-success"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <OrderSuccess />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />

        {/* Legacy confirmation (kept for direct order detail links) */}
        <Route
          path="/order/:id"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <OrderConfirmation />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <Orders />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Login />} />
      </Routes>
    </Suspense>
  );
}
