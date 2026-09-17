"use client";

import { useSyncExternalStore } from "react";
import {
  displayPrice,
  hasBilling,
  isPhysical,
  type BillingModel,
  type Product,
  type ProductType,
} from "@/types/catalog";

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  type: ProductType;
  categorySlug: string;
  unitPrice: number;
  billingModel?: BillingModel;
  variant?: Record<string, string>;
  qty: number;
}

interface CartState {
  items: CartItem[];
  ready: boolean;
}

const STORAGE_KEY = "mh_cart_v1";
const SERVER_STATE: CartState = { items: [], ready: false };

let state: CartState = SERVER_STATE;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  } catch {
    // storage indisponível — ignora
  }
}

function ensureLoaded() {
  if (state.ready) return;
  let items: CartItem[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) items = JSON.parse(raw) as CartItem[];
  } catch {
    // ignora
  }
  state = { items, ready: true };
}

function setItems(items: CartItem[]) {
  state = { items, ready: true };
  persist();
  emit();
}

function itemKey(productId: string, variant?: Record<string, string>) {
  if (!variant || Object.keys(variant).length === 0) return productId;
  const suffix = Object.entries(variant)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return `${productId}#${suffix}`;
}

const cartStore = {
  subscribe(cb: () => void) {
    ensureLoaded();
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getSnapshot() {
    return state;
  },
  getServerSnapshot() {
    return SERVER_STATE;
  },
  addProduct(product: Product, variant?: Record<string, string>) {
    ensureLoaded();
    const key = itemKey(product.id, variant);
    const single = !isPhysical(product);
    const existing = state.items.find((i) => i.key === key);
    if (existing) {
      if (single) return;
      setItems(
        state.items.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i)),
      );
      return;
    }
    const item: CartItem = {
      key,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      type: product.type,
      categorySlug: product.categorySlug,
      unitPrice: displayPrice(product),
      billingModel: hasBilling(product) ? product.billingModel : undefined,
      variant,
      qty: 1,
    };
    setItems([...state.items, item]);
  },
  setQty(key: string, qty: number) {
    setItems(
      state.items
        .map((i) => (i.key === key ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    );
  },
  remove(key: string) {
    setItems(state.items.filter((i) => i.key !== key));
  },
  clear() {
    setItems([]);
  },
};

/** Mantido como passthrough — o estado vive num store externo (useSyncExternalStore). */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useCart() {
  const snapshot = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const { items, ready } = snapshot;
  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  return {
    items,
    ready,
    count,
    subtotal,
    addProduct: cartStore.addProduct,
    setQty: cartStore.setQty,
    remove: cartStore.remove,
    clear: cartStore.clear,
  };
}
