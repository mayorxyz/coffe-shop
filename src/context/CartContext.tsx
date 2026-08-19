import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import productsData from "../data/products.json";
import type { Product } from "../lib/types";

const products = productsData as Product[];

const STORAGE_KEY = "roast-and-row.cart.v1";
const MAX_QTY = 99;

export interface CartLine {
  id: string;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  productOf: (id: string) => Product | undefined;
}

const CartContext = createContext<CartContextValue | null>(null);

function rehydrate(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is CartLine =>
          !!l &&
          typeof (l as CartLine).id === "string" &&
          typeof (l as CartLine).qty === "number" &&
          products.some((p) => p.id === (l as CartLine).id)
      )
      .map((l) => ({
        id: l.id,
        qty: Math.max(1, Math.min(MAX_QTY, Math.floor(l.qty))),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(rehydrate);
  const [isOpen, setIsOpen] = useState(false);

  // Serialize on every change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable — cart still works in memory */
    }
  }, [lines]);

  const add = useCallback((id: string) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) {
        return prev.map((l) =>
          l.id === id ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) } : l
        );
      }
      return [...prev, { id, qty: 1 }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.id !== id);
      return prev.map((l) =>
        l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l
      );
    });
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const productOf = useCallback(
    (id: string) => products.find((p) => p.id === id),
    []
  );

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const l of lines) {
      const p = products.find((pp) => pp.id === l.id);
      if (!p) continue;
      c += l.qty;
      s += l.qty * p.price;
    }
    return { count: c, subtotal: s };
  }, [lines]);

  const value: CartContextValue = {
    lines,
    count,
    subtotal,
    isOpen,
    openCart,
    closeCart,
    add,
    remove,
    setQty,
    productOf,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
