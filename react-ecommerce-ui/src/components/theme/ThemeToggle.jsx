import { useStore } from "../../context/StoreContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useStore();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      aria-label="Toggle theme"
    >
      {theme === "light" ? "Dark" : "Light"} mode
    </button>
  );
}
