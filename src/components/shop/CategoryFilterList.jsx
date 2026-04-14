"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CategoryFilterList({ categories = [], productCountByCategory = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategoryIds = searchParams.getAll("categoryId");
  const selectedSet = new Set(selectedCategoryIds);

  const toggleCategory = (categoryId, checked) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextSet = new Set(selectedCategoryIds);

    if (checked) {
      nextSet.add(categoryId);
    } else {
      nextSet.delete(categoryId);
    }

    params.delete("categoryId");
    Array.from(nextSet).forEach((id) => params.append("categoryId", id));

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
    router.refresh();
  };

  return (
    <>
      {categories.map((c) => {
        const categoryId = String(c.categoryId);
        const inputId = `category-${categoryId}`;

        return (
          <div key={c.categoryId} className="mb-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={selectedSet.has(categoryId)}
                  onChange={(event) => toggleCategory(categoryId, event.target.checked)}
                />
                <label htmlFor={inputId} className="text-gray-700">
                  {c.categoryName}
                </label>
              </div>
              <p className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                {productCountByCategory[categoryId] ?? 0}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
}