"use client";

import { Button } from "@heroui/react";
import React from "react";
import { toast } from "sonner";

import { useCartStore } from "../store/cartStore";

export default function ButtonAddComponent({ product, selectedColor, selectedSize, quantity = 1 }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    addItem(product, {
      selectedColor,
      selectedSize,
      quantity,
    });

    const productName = product?.name ?? product?.productName ?? "Product";
    toast.success(`${productName} added to cart`);
  };

  return (
    <Button
      isIconOnly
      aria-label="Add to cart"
      onPress={handleAddToCart}
      className="size-11 rounded-full bg-lime-400 text-xl font-light text-gray-900 shadow-sm transition hover:bg-lime-300 active:scale-95"
    >
      +
    </Button>
  );
}
