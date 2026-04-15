export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto mt-12 max-w-2xl px-4">
      <div className="card-surface rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold">Payment Successful!</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-300">
          Your order has been confirmed. You will receive an email with order details and invoice.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/orders" className="rounded-lg bg-brand-500 px-6 py-2 font-semibold text-white hover:bg-brand-600">
            View Orders
          </a>
          <a href="/" className="rounded-lg border border-brand-500 px-6 py-2 font-semibold text-brand-600 hover:bg-brand-50">
            Continue Shopping
          </a>
        </div>
      </div>
    </main>
  );
}
