import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, MapPin, MessageCircle, Clock } from "lucide-react";
import { contentMap, siteContentQuery, useContentValue } from "@/lib/data";
import { instagramLink, toFa, whatsappLink } from "@/lib/format";

export function SiteFooter() {
  const { data } = useQuery(siteContentQuery);
  const map = contentMap(data);
  const brand = useContentValue(map, "brand_name");
  const address = useContentValue(map, "contact_address");
  const whatsapp = useContentValue(map, "contact_whatsapp");
  const instagram = useContentValue(map, "contact_instagram");
  const hours = useContentValue(map, "contact_hours");
  const note = useContentValue(map, "footer_note");

  return (
    <footer className="surface-dark mt-24">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="text-lg font-bold tracking-[0.25em] text-gold">20K A M</span>
          <p className="mt-4 max-w-md text-sm leading-8 opacity-80">{note}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gold">دسترسی سریع</h3>
          <ul className="mt-4 space-y-2 text-sm opacity-85">
            <li><Link to="/products">محصولات</Link></li>
            <li><Link to="/blog">مجله ۲۰کام</Link></li>
            <li><Link to="/about">درباره کارخانه</Link></li>
            <li><Link to="/contact">تماس با ما</Link></li>
            <li><Link to="/auth">ورود مدیریت</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gold">ارتباط با ما</h3>
          <ul className="mt-4 space-y-3 text-sm opacity-85">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <span className="leading-7">{address}</span>
            </li>
            <li className="flex gap-2">
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href={whatsappLink(whatsapp)} target="_blank" rel="noreferrer">
                {toFa(whatsapp)}
              </a>
            </li>
            <li className="flex gap-2">
              <Instagram className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href={instagramLink(instagram)} target="_blank" rel="noreferrer">
                {instagram}
              </a>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>{hours}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-5 text-center text-xs opacity-70">
          © {toFa(new Date().getFullYear())} — تمامی حقوق برای کارخانه {brand} محفوظ است.
        </p>
      </div>
    </footer>
  );
}
