import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, MessageCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contentMap, siteContentQuery, useContentValue } from "@/lib/data";
import { whatsappLink } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "@/components/cart-drawer";

const links = [
  { to: "/", label: "خانه" },
  { to: "/products", label: "محصولات" },
  { to: "/blog", label: "مجله" },
  { to: "/about", label: "درباره ما" },
  { to: "/contact", label: "تماس" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { data } = useQuery(siteContentQuery);
  const map = contentMap(data);
  const tagline = useContentValue(map, "brand_tagline");
  const whatsapp = useContentValue(map, "contact_whatsapp");
  const { count, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Link to="/" className="flex flex-col items-start leading-tight">
          <span className="text-gradient-gold text-xl font-bold tracking-[0.25em]">
            20K A M
          </span>
          <span className="block text-[11px] text-muted-foreground">{tagline}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="سبد خرید"
            onClick={openCart}
            className="relative inline-flex size-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-secondary"
          >
            <ShoppingBag className="size-4.5" />
            {count > 0 ? (
              <span className="absolute -top-1.5 -left-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            ) : null}
          </button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={whatsappLink(whatsapp, "سلام، برای سفارش محصولات ۲۰کام تماس گرفتم.")} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
              سفارش در واتساپ
            </a>
          </Button>
          <button
            type="button"
            aria-label="منو"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <CartDrawer />

      {open ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-page flex flex-col py-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: link.to === "/" }}
                activeProps={{ className: "text-foreground" }}
                className="border-b border-border/60 py-3 text-sm font-medium text-muted-foreground last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <a
              className="py-3 text-sm font-semibold text-accent-foreground"
              href={whatsappLink(whatsapp)}
              target="_blank"
              rel="noreferrer"
            >
              سفارش در واتساپ
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
