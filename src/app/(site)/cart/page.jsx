"use client";

import Link from "next/link";
import { useCartStore } from "../../../store/cartStore";

import ProductInCard from "../../../components/Card/ProductInCard";
import SubTotalComponent from "../../../components/Card/SubTotalComponent";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const totalQuantity = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 ">
        <h1 className="text-2xl font-semibold text-gray-900 mb-5">
          <span className="mr-1">{totalQuantity}</span>
          products in cart
        </h1>
      

      {items.length > 0 ? (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            {items.map((item) => (
              <ProductInCard key={item.cartItemId} item={item} />
            ))}
          </div>

          <SubTotalComponent />
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">Your cart is empty</p>
          <p className="mt-2 text-sm text-gray-500">Add products from the shop to see them here.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Go to shop
          </Link>
        </div>
      )}
    </section>
  );
}