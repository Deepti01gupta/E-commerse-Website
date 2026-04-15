import { memo } from "react";

function OrderSummary({ pricing, items }) {
  return (
    <section className="card-surface p-4">
      <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

      <div className="space-y-2 border-b border-slate-200 pb-4 dark:border-slate-700">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span className="font-medium">₹{item.subtotal}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 py-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
          <span>₹{pricing.subtotal}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Tax (18% GST)</span>
          <span>₹{pricing.tax}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Shipping</span>
          <span className={pricing.isFreeDelivery ? "text-green-600" : ""}>
            {pricing.isFreeDelivery ? "Free" : `₹${pricing.shippingCharge}`}
          </span>
        </div>

        {pricing.discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount {pricing.couponCode && `(${pricing.couponCode})`}</span>
            <span>-₹{pricing.discountAmount}</span>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>₹{pricing.total}</span>
        </div>
      </div>
    </section>
  );
}

export default memo(OrderSummary);
