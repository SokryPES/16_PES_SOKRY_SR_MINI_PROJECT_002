"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function PriceRangeFilter({ min = 0, max = 300 }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const parsed = Number(searchParams.get("price"));
  const queryMax = Number.isFinite(parsed) && parsed > min ? Math.min(parsed, max) : max;
  const [currentMax, setCurrentMax] = useState(queryMax);
  const isNoLimit = currentMax >= max;

  useEffect(() => {
    setCurrentMax(queryMax);
  }, [queryMax]);

  const updatePrice = useCallback((value) => {
    const normalizedValue = Math.min(max, Math.max(min, value));
    const params = new URLSearchParams(searchParams.toString());

    if (normalizedValue >= max) {
      params.delete("price");
    } else {
      params.set("price", String(normalizedValue));
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [max, min, pathname, router, searchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentMax !== queryMax) {
        updatePrice(currentMax);
      }
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [currentMax, queryMax, updatePrice]);

  const handleWheel = (event) => {
    event.preventDefault();

    const step = 5;
    const direction = event.deltaY > 0 ? -1 : 1;
    const nextValue = Math.min(max, Math.max(min, currentMax + direction * step));
    setCurrentMax(nextValue);
  };

  return (
    <div>
      <p className="text-gray-800 mt-1">
        ${min} - ${currentMax} {isNoLimit ? <span className="text-gray-600">(No limit)</span> : null}
      </p>
      <input
        type="range"
        min={min}
        max={max}
        value={currentMax}
        onInput={(event) => setCurrentMax(Number(event.currentTarget.value))}
        onWheel={handleWheel}
        className="w-full mt-2 cursor-pointer accent-black"
      />
      <div className="flex justify-between text-sm text-gray-600 mt-1">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    </div>
  );
}
