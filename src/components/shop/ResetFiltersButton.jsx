"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ResetFiltersButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleReset = () => {
    const filterForm = document.querySelector("[data-shop-filter-form]");
    if (filterForm instanceof HTMLFormElement) {
      filterForm.reset();
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("categoryId");
    params.delete("price");

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      className="text-sm text-gray-800 px-3 py-1 rounded-full transition border border-gray-300 hover:bg-gray-100 cursor-pointer"
    >
      Reset Filters
    </button>
  );
}