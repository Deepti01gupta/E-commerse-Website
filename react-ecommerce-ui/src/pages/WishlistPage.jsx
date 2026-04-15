import ProductGrid from "../components/products/ProductGrid";
import { useStore } from "../context/StoreContext";

export default function WishlistPage() {
  const { wishlistProducts } = useStore();

  return (
    <main className="mx-auto mt-6 max-w-7xl px-4">
      <section className="mb-4">
        <h2 className="text-2xl font-bold">Your Wishlist</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Saved products stay here using local storage.
        </p>
      </section>

      <ProductGrid products={wishlistProducts} />
    </main>
  );
}
