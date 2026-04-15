import { memo, useEffect, useMemo, useState } from "react";
import { useStore } from "../../context/StoreContext";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

function SearchBar() {
  const { products, setSearchTerm } = useStore();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    setSearchTerm(debouncedQuery);
  }, [debouncedQuery, setSearchTerm]);

  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const normalized = debouncedQuery.toLowerCase();

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(normalized) ||
          product.brand.toLowerCase().includes(normalized) ||
          product.category.toLowerCase().includes(normalized)
      )
      .slice(0, 6);
  }, [debouncedQuery, products]);

  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <input
        id="product-search"
        type="search"
        value={query}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none ring-brand-500 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-500"
        placeholder="Search by name, category, or brand"
      />

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {suggestions.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onMouseDown={() => {
                  setQuery(product.name);
                  setSearchTerm(product.name);
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span>
                  {product.name}
                  <span className="ml-2 text-xs text-slate-500">{product.brand}</span>
                </span>
                <span className="text-xs text-brand-600">{product.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(SearchBar);
