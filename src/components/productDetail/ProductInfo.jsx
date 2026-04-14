"use client";

import { Undo2, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

import { getProductRating, updateProductRating } from "../../service/shop.service";
import { useCartStore } from "../../store/cartStore";

function toOptionList(value, fallback) {
  if (!value) return fallback;

  if (Array.isArray(value) && value.length > 0) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const options = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return options.length > 0 ? options : fallback;
  }

  return fallback;
}

const COLOR_STYLE_MAP = {
  red: "border-red-500 bg-red-100 text-red-900",
  blue: "border-blue-500 bg-blue-100 text-blue-900",
  green: "border-green-500 bg-green-100 text-green-900",
  yellow: "border-yellow-500 bg-yellow-100 text-yellow-900",
  purple: "border-purple-500 bg-purple-100 text-purple-900",
  pink: "border-pink-500 bg-pink-100 text-pink-900",
  indigo: "border-indigo-500 bg-indigo-100 text-indigo-900",
  orange: "border-orange-500 bg-orange-100 text-orange-900",
  teal: "border-teal-500 bg-teal-100 text-teal-900",
  cyan: "border-cyan-500 bg-cyan-100 text-cyan-900",
  lime: "border-lime-500 bg-lime-100 text-lime-900",
  emerald: "border-emerald-500 bg-emerald-100 text-emerald-900",
  sky: "border-sky-500 bg-sky-100 text-sky-900",
  slate: "border-slate-500 bg-slate-100 text-slate-900",
  gray: "border-gray-500 bg-gray-100 text-gray-900",
};

function getColorClasses(color) {
  if (!color) {
    return "border-gray-500 bg-gray-100 text-gray-900";
  }

  const normalizedColor = String(color).trim().toLowerCase();
  return (
    COLOR_STYLE_MAP[normalizedColor] ?? "border-gray-500 bg-gray-100 text-gray-900"
  );
}

function StarView({ rating = 0, onRate, disabled = false }) {
  const numericRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const activeRating = Math.max(0, Math.min(5, Math.floor(numericRating)));

  return (
    <div
      className="flex items-center gap-1 text-amber-400"
      aria-label={`${activeRating} stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <button
          key={`star-${index + 1}`}
          type="button"
          disabled={disabled}
          onClick={() => onRate?.(index + 1)}
          className="rounded-sm transition hover:scale-105 disabled:cursor-not-allowed"
          aria-label={`Set rating to ${index + 1}`}
        >
          <Star
            className={`size-5 transition ${index < activeRating ? "fill-current text-amber-400" : "text-gray-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductInfo({ product, onRatingChange }) {
  const { data: session } = useSession();
  const addItem = useCartStore((state) => state.addItem);
  const ratingProductId = product?.productId;
  const colors = useMemo(
    () => toOptionList(product?.colors, []),
    [product?.colors],
  );
  const sizes = useMemo(
    () => toOptionList(product?.sizes, []),
    [product?.sizes],
  );

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(product?.star ?? 0);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [showAddedBanner, setShowAddedBanner] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadRating = async () => {
      const fetchedRating = await getProductRating(
        ratingProductId,
        session?.accessToken,
      );

      if (!isActive || fetchedRating === null || isSavingRating) {
        return;
      }

      setRating(fetchedRating);
      onRatingChange?.(ratingProductId, fetchedRating);
    };

    loadRating();
    const pollId = setInterval(loadRating, 3000);

    return () => {
      isActive = false;
      clearInterval(pollId);
    };
  }, [ratingProductId, session?.accessToken, isSavingRating, onRatingChange]);

  const handleRate = async (nextRating) => {
    if (!ratingProductId || isSavingRating) {
      return;
    }

    const previousRating = rating;
    setRating(nextRating);
    setIsSavingRating(true);

    const updatedRating = await updateProductRating(
      ratingProductId,
      nextRating,
      session?.accessToken,
    );

    if (updatedRating !== null) {
      setRating(updatedRating);
      onRatingChange?.(ratingProductId, updatedRating);
    } else {
      setRating(previousRating);
    }

    setIsSavingRating(false);
  };

  const productName =
    product?.name ?? product?.productName ?? "Untitled Product";
  const description =
    product?.description ??
    "A gentle daily formula that helps refresh skin while keeping a smooth finish.";
  const price = Number(product?.price ?? 0);
  const handleAddToCart = () => {
    addItem(product, {
      selectedColor,
      selectedSize,
      quantity,
    });

    setShowAddedBanner(true);
  };

  useEffect(() => {
    if (!showAddedBanner) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowAddedBanner(false);
    }, 2500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [showAddedBanner]);

  return (
    <div className="space-y-7">
      <div>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-semibold leading-tight text-gray-900">
            {productName}
          </h1>
          <StarView
            rating={rating ?? product?.star ?? 0}
            onRate={handleRate}
            disabled={isSavingRating}
          />
        </div>

        <div className="mt-3 flex items-end gap-3">
          <p className="text-3xl font-semibold text-blue-900">
            ${price.toFixed(2)}
          </p>
          <p className="text-xl text-gray-400 line-through">
            ${(price + 10).toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Choose a color</h2>
        {colors.length > 0 ? (
          <>
            <div className="mt-3 flex flex-wrap gap-3">
              {colors.map((color) => {
                const active = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-full border px-5 py-2 text-sm font-medium capitalize cursor-pointer transition ${
                      active
                        ? getColorClasses(color)
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Selected: {selectedColor}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            No color options from API.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Choose a size</h2>
        {sizes.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-3">
            {sizes.map((size) => {
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full border px-6 py-2 text-sm font-semibold cursor-pointer uppercase transition ${
                    active
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            No size options from API.
          </p>
        )}
      </div>

      <p className="max-w-xl text-lg leading-relaxed text-gray-600">
        {description}
      </p>

      {showAddedBanner ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Added to cart - <Link href="/cart" className="font-semibold underline">view cart</Link>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 shadow-2xl">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-full text-xl text-gray-600 cursor-pointer hover:bg-white"
            onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
          >
            -
          </button>
          <span className="w-10 text-center text-lg font-semibold text-gray-900">
            {quantity}
          </span>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-full text-xl text-gray-600 cursor-pointer hover:bg-white"
            onClick={() => setQuantity((prev) => prev + 1)}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="inline-flex min-w-64 items-center justify-center rounded-full bg-blue-950 px-8 py-2.5 text-sm font-semibold text-white transition cursor-pointer hover:bg-blue-900"
        >
          <Image
            src="/image/addToCard.png"
            alt="Add to cart"
            width={20}
            height={20}
            className="mr-2"
          />
          Add to cart
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-6 text-gray-700">
        <Undo2 />
        <div>
          <p className="text-gray-800 text-2xl font-semibold">
          Free 30-day returns
        </p>
        <p className="text-gray-600">
          See return policy details in Card.
        </p>
        </div>
      </div>
    </div>
  );
}
