import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export function ProductCard({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string | undefined;
}) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image_url || "/images/hero.jpg"}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {categoryName ? (
          <span className="absolute top-3 right-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur">
            {categoryName}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-base font-bold">{product.name}</h3>
        <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            جزئیات
            <ArrowLeft className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
