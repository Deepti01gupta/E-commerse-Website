import { memo } from "react";

function CartItemRow({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:flex-row sm:items-center">
      <img
        src={item.image}
        alt={item.name}
        className="h-20 w-full rounded-lg object-cover sm:w-24"
      />

      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-brand-600">{item.brand}</p>
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Rs. {item.price}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-600"
        >
          -
        </button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-600"
        >
          +
        </button>
      </div>

      <p className="text-sm font-semibold">Rs. {item.subtotal}</p>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50"
      >
        Remove
      </button>
    </div>
  );
}

export default memo(CartItemRow);
