import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function getCartItemId(productId, selectedColor = "", selectedSize = "") {
  return `${productId ?? ""}__${normalizeText(selectedColor).toLowerCase()}__${normalizeText(selectedSize).toLowerCase()}`;
}

export function buildCartItem(product, options = {}) {
  const productId = product?.productId ?? product?.id ?? "";
  const selectedColor = normalizeText(options.selectedColor ?? product?.colors?.[0] ?? "");
  const selectedSize = normalizeText(options.selectedSize ?? product?.sizes?.[0] ?? "");
  const quantity = Math.max(1, Number(options.quantity ?? 1) || 1);

  return {
    cartItemId: getCartItemId(productId, selectedColor, selectedSize),
    productId,
    name: product?.name ?? product?.productName ?? "Untitled product",
    imageUrl: product?.imageUrl ?? product?.image ?? null,
    price: Number(product?.price ?? 0),
    selectedColor,
    selectedSize,
    quantity,
  };
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, options = {}) =>
        set((state) => {
          const nextItem = buildCartItem(product, options);
          const existingIndex = state.items.findIndex(
            (item) => item.cartItemId === nextItem.cartItemId,
          );

          if (existingIndex >= 0) {
            const items = [...state.items];
            items[existingIndex] = {
              ...items[existingIndex],
              quantity: items[existingIndex].quantity + nextItem.quantity,
            };
            return { items };
          }

          return { items: [...state.items, nextItem] };
        }),
      increaseItem: (cartItemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        })),
      decreaseItem: (cartItemId) =>
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.cartItemId !== cartItemId) {
                return item;
              }

              const nextQuantity = item.quantity - 1;
              if (nextQuantity <= 0) {
                return null;
              }

              return { ...item, quantity: nextQuantity };
            })
            .filter(Boolean),
        })),
      setQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: Math.max(1, Number(quantity) || 1) }
              : item,
          ),
        })),
      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        })),
      clearCart: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce((sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0), 0),
      totalQuantity: () =>
        get().items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
    }),
    {
      name: "purelystore-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);