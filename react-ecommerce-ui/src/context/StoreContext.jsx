import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import productsData from "../data/products.json";
import { readStorage, writeStorage } from "../utils/storage";

const StoreContext = createContext(null);

const STORAGE_KEYS = {
  cart: "shop_cart_items",
  wishlist: "shop_wishlist_ids",
  theme: "shop_theme"
};

const defaultFilters = {
  minPrice: 0,
  maxPrice: 10000,
  rating: 0,
  category: "all",
  brand: "all"
};

export const StoreProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [wishlistIds, setWishlistIds] = useState(() =>
    readStorage(STORAGE_KEYS.wishlist, [])
  );
  const [cartItems, setCartItems] = useState(() =>
    readStorage(STORAGE_KEYS.cart, {})
  );
  const [theme, setTheme] = useState(() => readStorage(STORAGE_KEYS.theme, "light"));

  const products = productsData;

  useEffect(() => {
    writeStorage(STORAGE_KEYS.wishlist, wishlistIds);
  }, [wishlistIds]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cart, cartItems);
  }, [cartItems]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.theme, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const categories = useMemo(
    () => ["all", ...new Set(products.map((product) => product.category))],
    [products]
  );

  const brands = useMemo(
    () => ["all", ...new Set(products.map((product) => product.brand))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch) ||
        product.brand.toLowerCase().includes(normalizedSearch);

      const matchesPrice =
        product.price >= Number(filters.minPrice) &&
        product.price <= Number(filters.maxPrice);

      const matchesRating = product.rating >= Number(filters.rating);
      const matchesCategory =
        filters.category === "all" || product.category === filters.category;
      const matchesBrand = filters.brand === "all" || product.brand === filters.brand;

      return (
        matchesSearch &&
        matchesPrice &&
        matchesRating &&
        matchesCategory &&
        matchesBrand
      );
    });
  }, [filters, products, searchTerm]);

  const wishlistProducts = useMemo(
    () => products.filter((product) => wishlistIds.includes(product.id)),
    [products, wishlistIds]
  );

  const cartDetails = useMemo(() => {
    return Object.entries(cartItems)
      .map(([id, qty]) => {
        const product = products.find((item) => item.id === Number(id));
        if (!product) return null;
        return {
          ...product,
          quantity: qty,
          subtotal: qty * product.price
        };
      })
      .filter(Boolean);
  }, [cartItems, products]);

  const cartTotal = useMemo(
    () => cartDetails.reduce((sum, item) => sum + item.subtotal, 0),
    [cartDetails]
  );

  const recommendedProducts = useMemo(() => {
    if (cartDetails.length === 0) {
      return products
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);
    }

    const cartIds = new Set(cartDetails.map((item) => item.id));
    const frequentCategories = new Set(cartDetails.map((item) => item.category));

    return products
      .filter(
        (product) =>
          !cartIds.has(product.id) && frequentCategories.has(product.category)
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [cartDetails, products]);

  const toggleWishlist = useCallback((productId) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const addToCart = useCallback((productId) => {
    setCartItems((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const normalizedQuantity = Number(quantity);
    setCartItems((prev) => {
      if (normalizedQuantity <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: normalizedQuantity
      };
    });
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const contextValue = useMemo(
    () => ({
      products,
      categories,
      brands,
      searchTerm,
      setSearchTerm,
      filters,
      setFilters,
      resetFilters,
      filteredProducts,
      wishlistIds,
      wishlistProducts,
      toggleWishlist,
      cartItems,
      cartDetails,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      recommendedProducts,
      theme,
      setTheme
    }),
    [
      addToCart,
      brands,
      cartDetails,
      cartItems,
      cartTotal,
      categories,
      filteredProducts,
      filters,
      products,
      recommendedProducts,
      removeFromCart,
      resetFilters,
      searchTerm,
      theme,
      toggleWishlist,
      updateQuantity,
      wishlistIds,
      wishlistProducts
    ]
  );

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
};
