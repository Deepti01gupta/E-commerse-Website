import { memo } from "react";

function PaymentMethodSelector({ selectedMethod, onMethodChange }) {
  const methods = [
    { id: "razorpay", label: "Razorpay (UPI, Cards, Net Banking)", icon: "💳" },
    { id: "stripe", label: "Stripe (International Cards)", icon: "💰" },
    { id: "upi", label: "Direct UPI", icon: "📱" },
    { id: "wallet", label: "Digital Wallet", icon: "👛" }
  ];

  return (
    <section className="card-surface p-4">
      <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>

      <div className="space-y-3">
        {methods.map((method) => (
          <label key={method.id} className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-slate-200 p-3 transition-colors hover:border-brand-500 dark:border-slate-700 dark:hover:border-brand-600">
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => onMethodChange(method.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{method.label}</p>
              <span className="inline-block text-lg">{method.icon}</span>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

export default memo(PaymentMethodSelector);
