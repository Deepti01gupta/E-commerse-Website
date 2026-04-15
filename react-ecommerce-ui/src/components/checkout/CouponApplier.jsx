import { memo, useState } from "react";

function CouponApplier({ onCouponApply, appliedCoupon, discountAmount }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5001/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartTotal: 5000 })
      });

      const data = await response.json();

      if (data.success) {
        onCouponApply(code, data.discountAmount);
        setMessage(`✓ Discount of ₹${data.discountAmount} applied!`);
      } else {
        setMessage(`✗ ${data.message}`);
      }
    } catch (error) {
      setMessage("Error applying coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card-surface p-4">
      <h2 className="mb-4 text-lg font-semibold">Promo Code</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={appliedCoupon}
          placeholder="Enter coupon code"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900 disabled:opacity-50"
        />
        <button
          onClick={handleApply}
          disabled={loading || appliedCoupon}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "..." : "Apply"}
        </button>
      </div>

      {message && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
      )}

      {appliedCoupon && discountAmount > 0 && (
        <div className="mt-3 rounded-lg bg-green-50 p-2 text-sm text-green-700 dark:bg-green-950/50 dark:text-green-400">
          ✓ {appliedCoupon}: ₹{discountAmount} off
        </div>
      )}
    </section>
  );
}

export default memo(CouponApplier);
