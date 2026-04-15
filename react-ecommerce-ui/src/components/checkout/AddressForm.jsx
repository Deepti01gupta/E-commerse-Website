import { memo, useState } from "react";

function AddressForm({ onAddressChange, initialValues }) {
  const [address, setAddress] = useState(initialValues || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...address, [name]: value };
    setAddress(updated);
    onAddressChange(updated);
  };

  return (
    <section className="card-surface p-4">
      <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>

      <div className="space-y-3">
        <div>
          <label className="field-label">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={address.fullName || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="John Doe"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              name="email"
              value={address.email || ""}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="field-label">Phone</label>
            <input
              type="tel"
              name="phone"
              value={address.phone || ""}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              placeholder="9876543210"
              maxLength="10"
            />
          </div>
        </div>

        <div>
          <label className="field-label">Street Address</label>
          <input
            type="text"
            name="street"
            value={address.street || ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="123 Main St, Apt 4"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="field-label">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={address.pincode || ""}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              placeholder="110001"
              maxLength="6"
            />
          </div>

          <div>
            <label className="field-label">City</label>
            <input
              type="text"
              name="city"
              value={address.city || ""}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Delhi"
            />
          </div>

          <div>
            <label className="field-label">State</label>
            <input
              type="text"
              name="state"
              value={address.state || ""}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Delhi"
            />
          </div>
        </div>

        <div>
          <label className="field-label">Country</label>
          <input
            type="text"
            name="country"
            value={address.country || "India"}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="India"
          />
        </div>
      </div>
    </section>
  );
}

export default memo(AddressForm);
