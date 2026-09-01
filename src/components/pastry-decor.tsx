import { Candy, Cookie, Croissant, Donut, IceCreamCone, Wheat } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = [Cookie, Wheat, Croissant, Donut, Candy, IceCreamCone];

/** Soft sprinkle of pastry icons floating behind a section. */
export function PastrySprinkles({ className }: { className?: string }) {
  const items = [
    { top: "8%", right: "6%", size: "size-8", delay: "0s", opacity: "opacity-25" },
    { top: "26%", left: "4%", size: "size-6", delay: "1.4s", opacity: "opacity-20" },
    { bottom: "14%", right: "12%", size: "size-7", delay: "2.6s", opacity: "opacity-20" },
    { bottom: "8%", left: "10%", size: "size-9", delay: "0.8s", opacity: "opacity-15" },
  ];

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {items.map((item, i) => {
        const Icon = ICONS[i % ICONS.length]!;
        return (
          <Icon
            key={i}
            className={cn("animate-float-soft absolute text-gold", item.size, item.opacity)}
            style={{
              top: item.top,
              bottom: item.bottom,
              left: item.left,
              right: item.right,
              animationDelay: item.delay,
            }}
          />
        );
      })}
    </div>
  );
}

/** Thin divider with a centered pastry icon and gold hairlines. */
export function PastryDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-center justify-center gap-4 py-2", className)}>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60 md:w-28" />
      <Cookie className="size-5 text-gold" />
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60 md:w-28" />
    </div>
  );
}

/** Infinite scrolling brand strip with pastry keywords. */
export function PastryMarquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-gold/20 bg-espresso py-4">
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {row.map((label, i) => {
          const Icon = ICONS[i % ICONS.length]!;
          return (
            <span key={`${label}-${i}`} className="flex items-center gap-3 text-sm text-cream/70">
              <Icon className="size-4 text-gold" />
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
