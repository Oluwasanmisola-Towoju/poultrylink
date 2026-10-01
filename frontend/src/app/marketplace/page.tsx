"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/use-categories";
import { useListings, type ListingFilters } from "@/hooks/use-listings";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS: { value: NonNullable<ListingFilters["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories } = useCategories();

  const categorySlug = searchParams.get("category") ?? "";
  const activeCategory = categories?.find((c) => c.slug === categorySlug);

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [state, setState] = useState(searchParams.get("state") ?? "");
  const sort = (searchParams.get("sort") as ListingFilters["sort"]) ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");

  const filters: ListingFilters = {
    q: searchParams.get("q") ?? undefined,
    categoryId: activeCategory?.id,
    state: searchParams.get("state") ?? undefined,
    sort,
    page,
  };

  const { data, isLoading, isFetching } = useListings(filters);

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!("page" in patch)) next.delete("page");
    router.push(`/marketplace?${next.toString()}`);
  }

  useEffect(() => setQ(searchParams.get("q") ?? ""), [searchParams]);
  useEffect(() => setState(searchParams.get("state") ?? ""), [searchParams]);

  return (
    <main className="px-6 md:px-10 lg:px-16 py-10 max-w-7xl mx-auto">
      <h1 className="font-head font-extrabold text-3xl md:text-4xl">Marketplace</h1>
      <p className="text-muted-foreground mt-1">
        {activeCategory ? `Browsing ${activeCategory.name}` : "Browse live birds, eggs, chicks, feed and more."}
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        <button
          onClick={() => updateParams({ category: undefined })}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 border-foreground transition ${
            !categorySlug ? "bg-foreground text-background" : "hover:bg-secondary"
          }`}
        >
          All
        </button>
        {categories?.map((c) => (
          <button
            key={c.id}
            onClick={() => updateParams({ category: c.slug })}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 border-foreground transition ${
              categorySlug === c.slug ? "bg-foreground text-background" : "hover:bg-secondary"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParams({ q, state });
        }}
        className="flex flex-wrap gap-3 mt-6"
      >
        <Input placeholder="Search listings…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Input placeholder="State (e.g. Oyo)" value={state} onChange={(e) => setState(e.target.value)} className="max-w-[10rem]" />
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="h-11 rounded-xl border-2 border-foreground/15 bg-background px-4 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-muted-foreground">Loading listings…</p>
        ) : !data?.data.length ? (
          <p className="text-muted-foreground">No listings match those filters yet.</p>
        ) : (
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${isFetching ? "opacity-60" : ""}`}>
            {data.data.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceContent />
    </Suspense>
  );
}