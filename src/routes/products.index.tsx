import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import { categoriesQuery, productsQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

type ProductSearch = { category?: string };

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    category: typeof search['category'] === "string" ? search['category'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "محصولات ۲۰کام | کلوچه، شیرینی آردی، آرد بسته‌بندی و جعبه هدیه" },
      {
        name: "description",
        content:
          "کاتالوگ کامل محصولات کارخانه ۲۰کام شامل کلوچه نرم، شیرینی سنتی آردی، آرد بسته‌بندی ۹۰۰ گرمی و باکس هدیه سازمانی.",
      },
      { property: "og:title", content: "محصولات کارخانه ۲۰کام" },
      { property: "og:description", content: "کاتالوگ محصولات کلوچه، شیرینی آردی و آرد بسته‌بندی." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { category } = Route.useSearch();
  const { data: categories } = useQuery(categoriesQuery);
  const { data: products, isLoading } = useQuery(productsQuery);

  const active = (categories ?? []).find((c) => c.slug === category);
  const list = (products ?? [])
    .filter((p) => p.is_active)
    .filter((p) => (active ? p.category_id === active.id : true));

  return (
    <SiteLayout>
      <section className="surface-dark py-16">
        <div className="container-page">
          <h1 className="text-3xl text-cream md:text-4xl">محصولات کارخانه ۲۰کام</h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-cream/75">
            تمام محصولات با مواد اولیه درجه یک و تحت نظارت واحد کنترل کیفیت تولید می‌شوند.
          </p>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            to="/products"
            search={{}}
            className={cn(
              "rounded-full border border-border px-4 py-2 text-sm transition-colors",
              !active ? "bg-espresso text-cream" : "bg-card hover:bg-secondary",
            )}
          >
            همه محصولات
          </Link>
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className={cn(
                "rounded-full border border-border px-4 py-2 text-sm transition-colors",
                active?.id === c.id ? "bg-espresso text-cream" : "bg-card hover:bg-secondary",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            محصولی در این دسته‌بندی ثبت نشده است.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 70}>
                <ProductCard
                  product={product}
                  categoryName={categories?.find((c) => c.id === product.category_id)?.name}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
