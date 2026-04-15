import { memo } from "react";
import { useStore } from "../../context/StoreContext";
import RatingStars from "../common/RatingStars";

function ProductCard({ product }) {
  const { addToCart, wishlistIds, toggleWishlist } = useStore();
  const isSaved = wishlistIds.includes(product.id);

  return (
    <article className="card-surface group overflow-hidden">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow hover:bg-white dark:bg-slate-900/90 dark:text-slate-100"
        >
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-brand-600">{product.brand}</p>
          <h3 className="text-base font-semibold">{product.name}</h3>
        </div>

        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <RatingStars rating={product.rating} />
          <span className="text-lg font-bold">Rs. {product.price}</span>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product.id)}
          className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default memo(ProductCard);
