import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";

const HomePage = lazy(() => import("./pages/HomePage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CartPage = lazy(() => import("./pages/CartPage"));

const LoadingScreen = () => (
  <div className="mx-auto mt-10 max-w-7xl px-4">
    <div className="card-surface p-8 text-center text-slate-500 dark:text-slate-300">
      Loading experience...
    </div>
  </div>
);

export default function App() {
  return (
    <div className="pb-10">
      <Header />

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
