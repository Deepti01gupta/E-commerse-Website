import CartItemRow from "../components/cart/CartItemRow";
import RecommendedProducts from "../components/cart/RecommendedProducts";
import { useStore } from "../context/StoreContext";

export default function CartPage() {
  const {
    cartDetails,
    cartTotal,
    updateQuantity,
    removeFromCart,
    recommendedProducts
  } = useStore();

  return (
    <main className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-4 px-4 lg:grid-cols-[1fr,360px]">
      <section className="card-surface p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {cartDetails.length} unique items
          </span>
        </div>

        {cartDetails.length === 0 ? (
          <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Your cart is empty. Add products from the store.
          </p>
        ) : (
          <div className="space-y-3">
            {cartDetails.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <section className="card-surface p-4">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>Rs. {cartTotal}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>Shipping</span>
            <span>{cartTotal > 2500 ? "Free" : "Rs. 199"}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold dark:border-slate-700">
            <span>Total</span>
            <span>Rs. {cartTotal > 2500 ? cartTotal : cartTotal + 199}</span>
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Checkout
          </button>
        </section>

        <RecommendedProducts items={recommendedProducts} />
      </aside>
    </main>
  );
}
