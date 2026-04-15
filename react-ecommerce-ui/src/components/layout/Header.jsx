import { NavLink } from "react-router-dom";
import SearchBar from "../search/SearchBar";
import ThemeToggle from "../theme/ThemeToggle";
import { useStore } from "../../context/StoreContext";

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-100"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

export default function Header() {
  const { wishlistIds, cartDetails } = useStore();
  const cartCount = cartDetails.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black tracking-tight text-brand-600">ShopSphere</h1>
          <nav className="flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>
              Store
            </NavLink>
            <NavLink to="/wishlist" className={navLinkClass}>
              Wishlist ({wishlistIds.length})
            </NavLink>
            <NavLink to="/cart" className={navLinkClass}>
              Cart ({cartCount})
            </NavLink>
          </nav>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
