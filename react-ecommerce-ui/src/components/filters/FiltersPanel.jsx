import { memo } from "react";
import { useStore } from "../../context/StoreContext";

function FiltersPanel() {
  const { filters, setFilters, categories, brands, resetFilters } = useStore();

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <aside className="card-surface h-fit p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="field-label" htmlFor="min-price">
            Min Price
          </label>
          <input
            id="min-price"
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", Number(e.target.value || 0))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="max-price">
            Max Price
          </label>
          <input
            id="max-price"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", Number(e.target.value || 0))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="rating-filter">
            Minimum Rating
          </label>
          <select
            id="rating-filter"
            value={filters.rating}
            onChange={(e) => updateFilter("rating", Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="0">All ratings</option>
            <option value="3">3★ and above</option>
            <option value="4">4★ and above</option>
            <option value="4.5">4.5★ and above</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="category-filter">
            Category
          </label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="brand-filter">
            Brand
          </label>
          <select
            id="brand-filter"
            value={filters.brand}
            onChange={(e) => updateFilter("brand", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
}

export default memo(FiltersPanel);
