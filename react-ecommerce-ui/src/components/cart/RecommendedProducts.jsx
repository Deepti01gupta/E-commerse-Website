import { memo } from "react";
import { useStore } from "../../context/StoreContext";

function RecommendedProducts({ items }) {
  const { addToCart } = useStore();

  if (items.length === 0) return null;

  return (
    <section className="card-surface p-4">
      <h2 className="mb-3 text-lg font-semibold">Recommended for you</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((product) => (
          <article
            key={product.id}
            className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
          >
            <div className="flex gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{product.name}</h3>
                <p className="text-xs text-slate-500">{product.brand}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">Rs. {product.price}</span>
                  <button
                    type="button"
                    onClick={() => addToCart(product.id)}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default memo(RecommendedProducts);
