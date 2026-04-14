import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { authOptions } from "../../../../auth";
import ProductDetailClient from "../../../../components/productDetail/ProductDetailClient";
import { getBestSellers } from "../../../../service/products.service";
import { getAllCategories, getAllProducts } from "../../../../service/shop.service";

function mergeProducts(primaryProducts = [], secondaryProducts = []) {
  const merged = new Map();

  [...secondaryProducts, ...primaryProducts].forEach((item) => {
    const normalizedItem = {
      ...item,
      productId: item?.productId ?? item?.id ?? item?.uuid,
      productName: item?.productName ?? item?.name ?? item?.title,
      name: item?.name ?? item?.productName ?? item?.title,
      description: item?.description ?? "",
      colors: Array.isArray(item?.colors) ? item.colors : item?.color ?? [],
      sizes: Array.isArray(item?.sizes) ? item.sizes : item?.size ?? [],
      star: item?.star ?? item?.rating ?? null,
      imageUrl: item?.imageUrl ?? item?.image ?? null,
      price: item?.price ?? 0,
      categoryId: item?.categoryId,
    };
    const key = normalizedItem.productId;

    if (key === undefined || key === null || key === "") {
      return;
    }

    merged.set(String(key), normalizedItem);
  });

  return Array.from(merged.values());
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const productId = resolvedParams?.id;

  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  const [categories, products, bestSellers] = await Promise.all([
    getAllCategories(accessToken),
    getAllProducts(accessToken),
    getBestSellers(accessToken),
  ]);

  const productsForDetail = mergeProducts(products, bestSellers);
  const selectedProduct = productsForDetail.find(
    (item) => String(item?.productId) === String(productId),
  );
  if (!selectedProduct) {
    notFound();
  }

  const categoryMap = new Map(categories.map((category) => [category.categoryId, category.categoryName]));
  const productsWithCategory = productsForDetail.map((product) => ({
    ...product,
    categoryName: categoryMap.get(product.categoryId) ?? "Uncategorized",
  }));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <ProductDetailClient products={productsWithCategory} initialProductId={productId} />
    </section>
  );
}
