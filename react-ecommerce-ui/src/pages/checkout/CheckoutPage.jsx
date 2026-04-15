import { useState } from "react";
import { useStore } from "../../context/StoreContext";
import OrderSummary from "../../components/checkout/OrderSummary";
import AddressForm from "../../components/checkout/AddressForm";
import PaymentMethodSelector from "../../components/checkout/PaymentMethodSelector";
import CouponApplier from "../../components/checkout/CouponApplier";
import ShippingCalculator from "../../components/checkout/ShippingCalculator";

export default function CheckoutPage() {
  const { cartDetails } = useStore();
  const [address, setAddress] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [pricing, setPricing] = useState({
    subtotal: cartDetails.reduce((sum, item) => sum + item.subtotal, 0),
    tax: 0,
    shippingCharge: 0,
    discountAmount: 0,
    couponCode: null,
    isFreeDelivery: false,
    total: 0
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (cartDetails.length === 0) {
    return (
      <main className="mx-auto mt-6 max-w-7xl px-4">
        <div className="card-surface p-6 text-center">
          <p className="mb-4 text-slate-600 dark:text-slate-300">Your cart is empty</p>
          <a href="/" className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600">
            Continue Shopping
          </a>
        </div>
      </main>
    );
  }

  const handleAddressChange = (newAddress) => {
    setAddress(newAddress);
  };

  const handleShippingChange = (shippingData) => {
    const subtotal = cartDetails.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total =
      subtotal +
      tax +
      shippingData.charge -
      pricing.discountAmount;

    setPricing({
      ...pricing,
      shippingCharge: shippingData.charge,
      isFreeDelivery: shippingData.isFree,
      tax,
      total
    });
  };

  const handleCouponApply = (code, discount) => {
    setAppliedCoupon(code);
    const newTotal =
      pricing.subtotal + pricing.tax + pricing.shippingCharge - discount;

    setPricing({
      ...pricing,
      discountAmount: discount,
      couponCode: code,
      total: newTotal
    });
  };

  const handleCheckout = async () => {
    if (!address.fullName || !address.email || !address.phone) {
      setError("Please fill in all address fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/checkout/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartDetails,
          shippingAddress: address,
          paymentMethod,
          couponCode: appliedCoupon
        })
      });

      const data = await response.json();

      if (data.success) {
        if (paymentMethod === "razorpay") {
          window.location.href = `/checkout/razorpay?orderId=${data.order.orderId}`;
        } else if (paymentMethod === "stripe") {
          window.location.href = `/checkout/stripe?orderId=${data.order.orderId}`;
        }
      } else {
        setError(data.message || "Checkout failed");
      }
    } catch (_err) {
      setError("Failed to initiate checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-4 px-4 lg:grid-cols-[1fr,360px]">
      <section className="space-y-4">
        <AddressForm onAddressChange={handleAddressChange} />
        <PaymentMethodSelector selectedMethod={paymentMethod} onMethodChange={setPaymentMethod} />
        <CouponApplier onCouponApply={handleCouponApply} appliedCoupon={appliedCoupon} discountAmount={pricing.discountAmount} />

        <div className="card-surface p-4">
          <h2 className="mb-4 text-lg font-semibold">Delivery Address</h2>
          <ShippingCalculator pincode={address.pincode} onShippingChange={handleShippingChange} loading={loading} />
        </div>

        {error && <div className="card-surface border-l-4 border-red-500 p-4 text-red-600">{error}</div>}

        <button
          onClick={handleCheckout}
          disabled={loading || !address.fullName}
          className="w-full rounded-lg bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Proceed to Payment"}
        </button>
      </section>

      <aside>
        <OrderSummary pricing={pricing} items={cartDetails} />
      </aside>
    </main>
  );
}
