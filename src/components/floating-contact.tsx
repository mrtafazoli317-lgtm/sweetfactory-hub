import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Instagram, MessageCircle, Plus, X } from "lucide-react";
import { contentMap, siteContentQuery, useContentValue } from "@/lib/data";
import { instagramLink, whatsappLink } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const { data } = useQuery(siteContentQuery);
  const map = contentMap(data);
  const whatsapp = useContentValue(map, "contact_whatsapp");
  const instagram = useContentValue(map, "contact_instagram");

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-center gap-3 print:hidden">
      <a
        href={instagramLink(instagram)}
        target="_blank"
        rel="noreferrer"
        aria-label="اینستاگرام ۲۰کام"
        className={cn(
          "group flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lift transition-all duration-300",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-75 opacity-0",
        )}
      >
        <Instagram className="size-5" />
      </a>
      <a
        href={whatsappLink(whatsapp, "سلام، برای سفارش محصولات ۲۰کام تماس گرفتم.")}
        target="_blank"
        rel="noreferrer"
        aria-label="واتساپ ۲۰کام"
        className={cn(
          "flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-all duration-300 delay-75",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-75 opacity-0",
        )}
      >
        <MessageCircle className="size-5" />
      </a>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "بستن راه‌های ارتباط" : "راه‌های ارتباط"}
        aria-expanded={open}
        className="relative flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-accent text-espresso shadow-lift transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" />
        {open ? <X className="relative size-6" /> : <Plus className="relative size-6" />}
      </button>
    </div>
  );
}
