import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { PostCard } from "@/components/post-card";
import { Input } from "@/components/ui/input";
import { blogCategoriesQuery, blogPostsQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "مجله ۲۰کام | دانستنی‌های تولید کلوچه، آرد و شیرینی سنتی" },
      {
        name: "description",
        content:
          "مقالات تخصصی کارخانه ۲۰کام درباره تولید کلوچه، انتخاب آرد، کنترل کیفیت و بسته‌بندی شیرینی سنتی.",
      },
      { property: "og:title", content: "مجله ۲۰کام" },
      { property: "og:description", content: "مقالات تخصصی درباره تولید و کیفیت محصولات آردی." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { data: posts, isLoading } = useQuery(blogPostsQuery);
  const { data: cats } = useQuery(blogCategoriesQuery);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (posts ?? [])
      .filter((p) => p.is_published)
      .filter((p) => (categoryId ? p.category_id === categoryId : true))
      .filter((p) =>
        q
          ? `${p.title} ${p.excerpt} ${p.content}`.toLowerCase().includes(q)
          : true,
      );
  }, [posts, query, categoryId]);

  return (
    <SiteLayout>
      <section className="surface-dark py-16">
        <div className="container-page">
          <h1 className="text-3xl text-cream md:text-4xl">مجله ۲۰کام</h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-cream/75">
            تجربه‌های کارخانه‌ای، دانش فنی تولید و نکات کاربردی درباره محصولات آردی.
          </p>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در مقالات…"
              className="pr-9"
              maxLength={80}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryId(null)}
              className={cn(
                "rounded-full border border-border px-4 py-2 text-sm transition-colors",
                !categoryId ? "bg-espresso text-cream" : "bg-card hover:bg-secondary",
              )}
            >
              همه
            </button>
            {(cats ?? []).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  "rounded-full border border-border px-4 py-2 text-sm transition-colors",
                  categoryId === c.id ? "bg-espresso text-cream" : "bg-card hover:bg-secondary",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              مقاله‌ای با این مشخصات پیدا نشد.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {list.map((post, i) => (
                <Reveal key={post.id} delay={(i % 3) * 80}>
                  <PostCard
                    post={post}
                    categoryName={cats?.find((c) => c.id === post.category_id)?.name}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
