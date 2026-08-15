import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, MessageCircle, Package, Scale, Tag } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import {
  categoriesQuery,
  contentMap,
  productsQuery,
  siteContentQuery,
  useContentValue,
} from "@/lib/data";
import { formatPrice, whatsappLink } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `محصول ${params.slug} | کارخانه ۲۰کام` },
      {
        name: "description",
        content: "مشخصات کامل، قیمت و توضیحات محصول تولیدی کارخانه ۲۰کام.",
      },
      { property: "og:title", content: "محصولات کارخانه ۲۰کام" },
      { property: "og:description", content: "مشخصات کامل و قیمت محصول کارخانه ۲۰کام." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: products, isLoading } = useQuery(productsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { data: content } = useQuery(siteContentQuery);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const whatsapp = useContentValue(contentMap(content), "contact_whatsapp");
  const product = (products ?? []).find((p) => p.slug === slug);
  const category = categories?.find((c) => c.id === product?.category_id);
  const related = (products ?? [])
    .filter((p) => p.is_active && p.id !== product?.id && p.category_id === product?.category_id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-page py-24">
          <div className="h-96 animate-pulse rounded-3xl bg-muted" />
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="container-page py-24 text-center">
          <h1 className="text-2xl">محصول یافت نشد</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            این محصول حذف شده یا آدرس اشتباه است.
          </p>
          <Button asChild className="mt-6">
            <Link to="/products">بازگشت به محصولات</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const gallery = [product.image_url, ...(product.gallery ?? [])].filter(
    (src, i, arr) => Boolean(src) && arr.indexOf(src) === i,
  );
  const mainImage = activeImage ?? gallery[0] ?? "/images/hero.jpg";

  return (
    <SiteLayout>
      <div className="container-page py-10">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          بازگشت به محصولات
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
              <img
                src={mainImage}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            {gallery.length > 1 ? (
              <div className="mt-4 flex gap-3">
                {gallery.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(src)}
                    className={cn(
                      "size-20 overflow-hidden rounded-xl border-2 transition-colors",
                      mainImage === src ? "border-accent" : "border-border",
                    )}
                  >
                    <img src={src} alt={product.name} loading="lazy" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            {category ? (
              <Link
                to="/products"
                search={{ category: category.slug }}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
              >
                <Tag className="size-3.5" />
                {category.name}
              </Link>
            ) : null}
            <h1 className="mt-4 text-3xl md:text-4xl">{product.name}</h1>
            <p className="mt-4 text-sm leading-9 text-muted-foreground md:text-base">
              {product.description}
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <div className="text-xs text-muted-foreground">قیمت مصرف‌کننده</div>
              <div className="mt-1 text-2xl font-bold">{formatPrice(product.price)}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Scale className="size-4 text-accent" />
                  وزن: {product.weight || "—"}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="size-4 text-accent" />
                  دسته: {category?.name ?? "—"}
                </div>
              </div>
              <Button asChild size="lg" className="mt-6 w-full">
                <a
                  href={whatsappLink(whatsapp, `سلام، برای سفارش «${product.name}» تماس گرفتم.`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" />
                  ثبت سفارش و استعلام قیمت
                </a>
              </Button>
            </div>

            {product.details ? (
              <div className="mt-8">
                <h2 className="text-lg font-bold">مشخصات محصول</h2>
                <ul className="mt-3 space-y-2">
                  {product.details
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => (
                      <li
                        key={line}
                        className="flex gap-2 rounded-lg bg-secondary/50 px-4 py-3 text-sm leading-7 text-muted-foreground"
                      >
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                        {line}
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-20">
            <h2 className="mb-6 text-2xl">محصولات مرتبط</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} categoryName={category?.name} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </SiteLayout>
  );
}
