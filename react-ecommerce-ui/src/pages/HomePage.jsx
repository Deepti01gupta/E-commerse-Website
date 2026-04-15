import FiltersPanel from "../components/filters/FiltersPanel";
import ProductGrid from "../components/products/ProductGrid";
import { useStore } from "../context/StoreContext";

export default function HomePage() {
  const { filteredProducts } = useStore();

  return (
    <main className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-4 px-4 lg:grid-cols-[280px,1fr]">
      <FiltersPanel />

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Smart discovery</p>
            <h2 className="text-2xl font-bold">Products</h2>
          </div>
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
            {filteredProducts.length} items found
          </p>
        </div>

        <ProductGrid products={filteredProducts} />
      </section>
    </main>
  );
}
