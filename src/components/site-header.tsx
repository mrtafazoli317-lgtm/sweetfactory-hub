import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contentMap, siteContentQuery, useContentValue } from "@/lib/data";
import { whatsappLink } from "@/lib/format";

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
  const brand = useContentValue(map, "brand_name");
  const tagline = useContentValue(map, "brand_tagline");
  const whatsapp = useContentValue(map, "contact_whatsapp");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-espresso text-sm font-bold text-gold">
            ۲۰
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold">{brand}</span>
            <span className="block text-[11px] text-muted-foreground">{tagline}</span>
          </span>
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
