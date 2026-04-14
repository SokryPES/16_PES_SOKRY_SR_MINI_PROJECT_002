"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { getOrders } from "../../../service/order.service";

function formatOrderDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadOrders = async () => {
      if (status !== "authenticated") {
        if (alive) {
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getOrders();
        if (!alive) return;
        setOrders(data);
      } catch (loadError) {
        if (!alive) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load orders.");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      alive = false;
    };
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="mx-auto w-full max-w-7xl px-4 py-10 text-sm text-gray-500">Loading orders...</div>;
  }

  if (!session?.user) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">Sign in to view orders</p>
          <p className="mt-2 text-sm text-gray-500">Your orders are fetched from the live API.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-slate-800 px-6 py-3 text-sm font-semibold text-white">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-6 ">
          <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500"> {orders.length} Orders From your Account.</p>
      </div>

      {error ? <p className="mb-4 text-sm font-medium text-red-500">{error}</p> : null}

      {orders.length > 0 ? (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.orderId ?? order.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Order</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">#{order.orderId ?? order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Total</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">${Number(order.totalAmount ?? order.total ?? 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-b border-gray-100 pb-4 grid-cols-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">User ID</p>
                  <p className="mt-1 break-all text-sm font-medium text-gray-700">{order.appUserId ?? order.userId ?? "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-center text-gray-400">Order date</p>
                  <p className="mt-1 text-sm font-semibold text-center text-gray-700">{formatOrderDate(order.orderDate)}</p>
                </div>
                <div className="text-end">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Line items</p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {(order.orderDetailsResponse ?? order.orderDetails ?? []).length}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Order details</p>
                <div className="mt-2 space-y-2">
                  {(order.orderDetailsResponse ?? order.orderDetails ?? []).map((detail) => (
                    <div
                      key={`${order.orderId ?? order.id}-${detail.productId}`}
                      className="grid grid-cols-3 items-center gap-3 text-sm"
                    >
                    <div>
                        <p className="font-semibold text-gray-800 ">
                          Product {detail.productName ?? detail.name ?? detail.productId}
                        </p>
                    </div>
                      <p className="font-semibold text-gray-600 text-center">Qty {detail.orderQty ?? detail.quantity ?? 0}</p>
                      <p className="font-semibold text-gray-900 text-end">${Number(detail.orderTotal ?? detail.lineTotal ?? 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">No orders yet</p>
          <p className="mt-2 text-sm text-gray-500">Place a cart checkout to see the order list here.</p>
        </div>
      )}
    </section>
  );
}