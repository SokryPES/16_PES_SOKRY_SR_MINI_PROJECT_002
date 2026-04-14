"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { label: "Under $50", value: "50" },
  { label: "Under $100", value: "100" },
  { label: "Under $150", value: "150" },
  { label: "All product", value: "" },
];

export default function QuickPriceFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedPrice = searchParams.get("price") ?? "";

  const onSelectPrice = (value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("price", value);
    } else {
      params.delete("price");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
    router.refresh();
  };

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-2">
      {OPTIONS.map((option) => {
        const id = option.value ? `price-${option.value}` : "price-all";
        const checked = selectedPrice === option.value;

        return (
          <label key={id} className="cursor-pointer">
            <input
              id={id}
              type="radio"
              name="quick-select"
              checked={checked}
              onChange={() => onSelectPrice(option.value)}
              className="peer sr-only"
            />
            <span className="block text-center py-1 rounded-xl text-sm border border-gray-600 duration-300 peer-checked:bg-black peer-checked:text-white hover:bg-black hover:text-white uppercase">
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
