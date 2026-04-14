"use client";

import Image from "next/image";

import { useCartStore } from "../../store/cartStore";

function formatVariant(value) {
  return value ? String(value) : "";
}

export default function ProductInCard({ item }) {
  const increaseItem = useCartStore((state) => state.increaseItem);
  const decreaseItem = useCartStore((state) => state.decreaseItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const lineTotal = Number(item.price ?? 0) * Number(item.quantity ?? 0);

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-gray-100 px-6 py-5 last:border-b-0">
      <div className="flex size-24 items-center justify-center rounded-2xl bg-gray-50">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={72}
            height={72}
            className="h-20 w-20 object-contain"
          />
        ) : null}
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-lg font-semibold text-gray-900">{item.name}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {formatVariant(item.selectedColor)} {item.selectedSize ? `· ${formatVariant(item.selectedSize)}` : ""}
        </p>
        <p className="mt-2 text-sm font-semibold text-gray-900">${Number(item.price ?? 0).toFixed(2)} each</p>
      </div>

      <div className="flex flex-col items-end gap-3 text-right">
        <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
          <button
            type="button"
            onClick={() => decreaseItem(item.cartItemId)}
            className="grid size-8 place-items-center rounded-full text-xl text-gray-600 transition hover:bg-white"
          >
            -
          </button>
          <span className="w-10 text-center text-lg font-semibold text-gray-900">{item.quantity}</span>
          <button
            type="button"
            onClick={() => increaseItem(item.cartItemId)}
            className="grid size-8 place-items-center rounded-full text-xl text-gray-600 transition hover:bg-white"
          >
            +
          </button>
        </div>

        <p className="text-lg font-semibold text-gray-900">${lineTotal.toFixed(2)}</p>
        <button
          type="button"
          onClick={() => removeItem(item.cartItemId)}
          className="text-sm font-medium text-red-500 transition hover:text-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  );
}