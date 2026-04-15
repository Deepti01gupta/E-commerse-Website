import { memo, useState } from "react";

function ShippingCalculator({ pincode, onShippingChange, loading }) {
  const [localPincode, setLocalPincode] = useState(pincode || "");
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    if (!localPincode || localPincode.length !== 6) {
      setError("Invalid pincode");
      return;
    }

    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/delivery/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode: localPincode,
          cartTotal: 5000
        })
      });

      const data = await response.json();

      if (data.success) {
        onShippingChange({
          pincode: localPincode,
          charge: data.shippingCharge,
          isFree: data.isFreeDelivery,
          days: data.processingDays
        });
      } else {
        setError(data.message);
      }
    } catch (_err) {
      setError("Failed to calculate shipping");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={localPincode}
          onChange={(e) => setLocalPincode(e.target.value.slice(0, 6))}
          placeholder="Enter pincode"
          maxLength="6"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          {loading ? "..." : "Check"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export default memo(ShippingCalculator);
