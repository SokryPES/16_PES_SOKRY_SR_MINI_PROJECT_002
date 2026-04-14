"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SearchProductByName({ initialValue = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(initialValue);

  useEffect(() => {
    setKeyword(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentQuery = searchParams.get("q") ?? "";
      const normalized = keyword.trim();

      if (normalized === currentQuery) return;

      const params = new URLSearchParams(searchParams.toString());
      if (normalized) {
        params.set("q", normalized);
      } else {
        params.delete("q");
      }

      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(target, { scroll: false });
      router.refresh();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [keyword, pathname, router, searchParams]);

  return (
    <div>
      <input
        type="text"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        className="border border-gray-300 rounded-xl py-1.5 px-4 focus:outline-none focus:ring-1 focus:ring-lime-500"
        placeholder="Search by products name"
      />
    </div>
  );
}
