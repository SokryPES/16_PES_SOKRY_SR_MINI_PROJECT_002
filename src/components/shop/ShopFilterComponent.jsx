import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { getAllCategories, getAllProducts } from "../../service/shop.service";
import ResetFiltersButton from "./ResetFiltersButton";
import CategoryFilterList from "./CategoryFilterList";
import QuickPriceFilter from "./QuickPriceFilter";
import PriceRangeFilter from "./PriceRangeFilter";

export default async function ShopFilterComponent() {
  const session = await getServerSession(authOptions);
  const categories = await getAllCategories(session?.accessToken);
  const products = await getAllProducts(session?.accessToken);

  const productCountByCategory = products.reduce((acc, product) => {
    const key = String(product?.categoryId ?? "");
    if (!key) return acc;

    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <form data-shop-filter-form>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          <ResetFiltersButton />
        </div>
        <div>
          <h3 className="uppercase font-medium text-gray-700 mt-4 text-sm my-2">
          Price range
        </h3>
        <PriceRangeFilter min={0} max={300} />
        </div>

        <h3 className="uppercase font-medium text-gray-700 mt-4 text-sm my-2">
          Quick Select
        </h3>
        <QuickPriceFilter />

        <h3 className="uppercase font-medium text-gray-700 mt-4 text-sm my-2">
          categories
        </h3>
        <CategoryFilterList
          categories={categories}
          productCountByCategory={productCountByCategory}
        />
      </form>
    </div>
  );
}
