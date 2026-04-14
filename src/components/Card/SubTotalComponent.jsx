"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { createOrder } from "../../service/order.service";
import { useCartStore } from "../../store/cartStore";

export default function SubTotalComponent() {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.subtotal());
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!session?.user) {
      setError("Checkout failed. Sign in and try again.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const orderDetailRequests = items.map((item) => ({
        productId: item.productId,
        orderQty: item.quantity,
      }));

      await createOrder(orderDetailRequests);
      clearCart();
      router.push("/orders");
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Failed to create order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xl font-medium text-gray-600">Subtotal</p>
          <p className="mt-2 text-sm text-gray-500">Tax and shipping calculated at checkout (demo).</p>
        </div>
        <p className="text-2xl font-semibold text-gray-900">${subtotal.toFixed(2)}</p>
      </div>

      {error ? <p className="mt-6 text-sm font-medium text-red-500">{error}</p> : null}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={isSubmitting}
        className="mt-6 flex w-full items-center justify-center rounded-full bg-slate-800 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
      >
        Checkout
      </button>

      <button
        type="button"
        onClick={clearCart}
        className="mt-3 flex w-full items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
      >
        Clear cart
      </button>
    </div>
  );
}