"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SortSelect } from "./SortSelect";

export function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "featured";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return <SortSelect currentSort={currentSort} onSortChange={handleSortChange} />;
}