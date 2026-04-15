export default function CheckoutFailurePage() {
  return (
    <main className="mx-auto mt-12 max-w-2xl px-4">
      <div className="card-surface rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
          <span className="text-3xl">✗</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold">Payment Failed</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-300">
          Unfortunately, your payment could not be processed. Please try again with a different method or contact support.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/cart" className="rounded-lg bg-brand-500 px-6 py-2 font-semibold text-white hover:bg-brand-600">
            Back to Cart
          </a>
          <a href="/" className="rounded-lg border border-slate-300 px-6 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
            Home
          </a>
        </div>
      </div>
    </main>
  );
}
