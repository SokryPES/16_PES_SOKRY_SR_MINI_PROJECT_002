"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { getProductRating } from "../service/shop.service";
import ButtonAddComponent from "./ButtonAddComponent";

function normalizeImageSrc(src) {
  if (typeof src !== "string") return null;

  const value = src.trim();
  if (!value || value === "null" || value === "undefined") return null;

  if (value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return value;
    }
  } catch {
    return null;
  }

  return null;
}

export function StarRow({ productId, rating = null }) {
  const [currentRating, setCurrentRating] = useState(rating);

  useEffect(() => {
    let isActive = true;

    const loadRating = async () => {
      if (!productId) {
        setCurrentRating(rating);
        return;
      }

      const fetchedRating = await getProductRating(productId);

      if (!isActive) {
        return;
      }

      if (fetchedRating === null || fetchedRating === undefined) {
        return;
      }

      setCurrentRating(fetchedRating);
    };

    loadRating();

    return () => {
      isActive = false;
    };
  }, [productId, rating]);

  const hasRating = currentRating !== null && currentRating !== undefined && currentRating !== "";
  const numericRating = Number.isFinite(Number(currentRating)) ? Number(currentRating) : 0;
  const filledStars = hasRating ? Math.max(0, Math.min(5, Math.round(numericRating))) : 0;

  return (
    <p
      className="flex items-center gap-0.5"
      aria-label={hasRating ? `${numericRating} stars` : "Not Rating"}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={`star-${index + 1}`}
          className={`text-sm ${index < filledStars ? "text-amber-400" : "text-gray-500"}`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs tabular-nums text-gray-500">
        {hasRating ? numericRating.toFixed(1) : "—"}
      </span>
    </p>
  );
}

export default function ProductCardComponent({ product }) {
  const productId = product?.productId ?? product?.id;
  const productName = product?.productName ?? product?.name ?? "Untitled product";
  const price = product?.price ?? 0;
  const imageSrc = normalizeImageSrc(product?.imageUrl ?? product?.image);

  return (
    <article className="group relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link href={productId ? `/products/${productId}` : "/products"} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-gray-100 to-lime-50/30 text-gray-400">
              ◇
            </div>
          )}
        </div>
      </Link>
      <div className="relative mt-4 pr-14">
        <StarRow productId={productId} rating={product?.star ?? product?.rating ?? null} />
        <Link href={productId ? `/products/${productId}` : "/products"}>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 hover:text-lime-700">
            {productName}
          </h3>
        </Link>
        <p className="mt-2 text-base font-semibold tabular-nums text-gray-900">${price}</p>
        
      </div>
      <div className="absolute bottom-4 right-4">
        <ButtonAddComponent product={product} />
      </div>
    </article>
  );
}
