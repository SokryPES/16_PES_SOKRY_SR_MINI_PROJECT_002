"use client";

import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import ProductCardComponent from "../ProductCardComponent";

export default function LandingEssentialsGrid({ products = [], categories = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categoryOptions = useMemo(() => {
    const names = categories.map((category) => category?.categoryName).filter(Boolean);
    return ["All", ...new Set(names)];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }

    const matchedCategoryIds = categories
      .filter((category) => category.categoryName === selectedCategory)
      .map((category) => String(category.categoryId));

    return products.filter((product) => matchedCategoryIds.includes(String(product.categoryId)));
  }, [selectedCategory, products, categories]);

  return (
    <section id="shop" className="mx-auto w-full max-w-7xl py-16 lg:py-20">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Our skincare essentials
        </h2>
        <p className="mt-2 max-w-lg text-gray-500">
          Filter by category name — same fetched catalog, organized for quick discovery.
        </p>
      </div>

      <div
        className="mt-10 flex flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="Product categories"
      >
        {categoryOptions.map((label) => {
          const on = selectedCategory === label;
          return (
            <Button
              key={label}
              role="tab"
              aria-selected={on}
              onPress={() => {
                setSelectedCategory(label);
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                on
                  ? "bg-lime-400 text-gray-900 shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </Button>
          );
        })}
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {filteredProducts.map((product) => (
          <ProductCardComponent product={product} key={product.productId} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="mt-12 text-center text-gray-500">No products found for this category.</p>
      )}
    </section>
  );
}
