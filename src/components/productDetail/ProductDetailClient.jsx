"use client";

import { useMemo, useState } from "react";

import ProductInfo from "./ProductInfo";
import SwitchProduct from "./SwitchProduct";

function buildGallery(product) {
  if (Array.isArray(product?.imageGallery) && product.imageGallery.length > 0) {
    return product.imageGallery.slice(0, 3);
  }

  if (product?.imageUrl) {
    return [product.imageUrl];
  }

  return [];
}

function getPreviewProducts(products, currentIndex) {
  if (products.length <= 3) {
    return products;
  }

  let start = Math.max(currentIndex - 1, 0);
  let end = start + 3;

  if (end > products.length) {
    end = products.length;
    start = end - 3;
  }

  return products.slice(start, end);
}

function getPrimaryImage(product) {
  if (Array.isArray(product?.imageGallery) && product.imageGallery.length > 0) {
    return product.imageGallery[0];
  }

  return product?.imageUrl ?? null;
}

export default function ProductDetailClient({ products = [], initialProductId }) {
  const initialIndex = useMemo(() => {
    const idx = products.findIndex((item) => String(item?.productId) === String(initialProductId));
    return idx >= 0 ? idx : 0;
  }, [products, initialProductId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [ratingByProductId, setRatingByProductId] = useState({});

  const currentProduct = products[currentIndex];
  const currentProductWithRating = currentProduct
    ? {
        ...currentProduct,
        star:
          ratingByProductId[currentProduct.productId] ??
          currentProduct.star,
      }
    : null;
  const previewProducts = getPreviewProducts(products, currentIndex).map((product) => ({
    productId: product?.productId,
    productName: product?.productName ?? product?.name ?? "Product",
    imageSrc: getPrimaryImage(product),
    isActive: String(product?.productId) === String(currentProduct?.productId),
  }));

  const canGoPrevProduct = currentIndex > 0;
  const canGoNextProduct = currentIndex < products.length - 1;

  const handlePrevProduct = () => {
    if (!canGoPrevProduct) return;
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextProduct = () => {
    if (!canGoNextProduct) return;
    setCurrentIndex((prev) => Math.min(prev + 1, products.length - 1));
  };

  const handleSelectProduct = (productId) => {
    if (!productId || String(productId) === String(currentProduct?.productId)) return;
    const nextIndex = products.findIndex((item) => String(item?.productId) === String(productId));
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
    }
  };

  const handleRatingChange = (productId, nextRating) => {
    if (!productId || !Number.isFinite(Number(nextRating))) return;

    setRatingByProductId((prev) => ({
      ...prev,
      [productId]: Number(nextRating),
    }));
  };

  if (!currentProductWithRating) {
    return null;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <SwitchProduct
        key={`gallery-${currentProductWithRating?.productId}`}
        productName={currentProductWithRating?.productName ?? currentProductWithRating?.name}
        images={buildGallery(currentProductWithRating)}
        onPrevProduct={handlePrevProduct}
        onNextProduct={handleNextProduct}
        canGoPrevProduct={canGoPrevProduct}
        canGoNextProduct={canGoNextProduct}
        productThumbnails={previewProducts}
        onSelectProduct={handleSelectProduct}
      />
      <ProductInfo
        key={`info-${currentProductWithRating?.productId}`}
        product={currentProductWithRating}
        onRatingChange={handleRatingChange}
      />
    </div>
  );
}