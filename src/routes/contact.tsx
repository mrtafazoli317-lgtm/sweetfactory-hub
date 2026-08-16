import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Instagram, MapPin, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { contentMap, siteContentQuery, useContentValue } from "@/lib/data";
import { instagramLink, toFa, whatsappLink } from "@/lib/format";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با کارخانه ۲۰کام | سفارش عمده کلوچه و آرد" },
      {
        name: "description",
        content:
          "راه‌های ارتباط با کارخانه ۲۰کام در اراک؛ واتساپ، اینستاگرام، آدرس کارخانه و ساعات کاری برای سفارش عمده.",
      },
      { property: "og:title", content: "تماس با کارخانه ۲۰کام" },
      { property: "og:description", content: "واتساپ، اینستاگرام و آدرس کارخانه ۲۰کام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data } = useQuery(siteContentQuery);
  const map = contentMap(data);
  const address = useContentValue(map, "contact_address");
  const whatsapp = useContentValue(map, "contact_whatsapp");
  const instagram = useContentValue(map, "contact_instagram");
  const hours = useContentValue(map, "contact_hours");

  const items = [
    { icon: MapPin, title: "آدرس کارخانه", value: address },
    { icon: MessageCircle, title: "واتساپ", value: toFa(whatsapp), href: whatsappLink(whatsapp) },
    { icon: Instagram, title: "اینستاگرام", value: instagram, href: instagramLink(instagram) },
    { icon: Clock, title: "ساعات کاری", value: hours },
  ];

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-16">
          <Reveal>
            <h1 className="text-3xl md:text-5xl">تماس با ۲۰کام</h1>
            <p className="mt-4 max-w-xl text-sm leading-8 text-muted-foreground">
              برای دریافت لیست قیمت عمده، نمونه محصول یا سفارش باکس هدیه سازمانی در ارتباط باشید.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page grid gap-5 py-16 sm:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 80}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
              <item.icon className="size-5 text-accent" />
              <div className="mt-3 text-sm font-bold">{item.title}</div>
              {item.href ? (
                <a
                  className="mt-2 block text-sm leading-8 text-muted-foreground hover:text-foreground"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-2 text-sm leading-8 text-muted-foreground">{item.value}</p>
              )}
            </div>
          </Reveal>
        ))}
      </section>

      <section className="container-page pb-20">
        <Reveal>
          <div className="surface-dark rounded-3xl px-8 py-12 text-center shadow-lift">
            <h2 className="text-2xl text-cream md:text-3xl">سریع‌ترین راه سفارش</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-8 text-cream/75">
              پیام واتساپ بدهید تا کارشناس فروش لیست قیمت به‌روز را ارسال کند.
            </p>
            <Button asChild size="lg" className="mt-6">
              <a href={whatsappLink(whatsapp, "سلام، درخواست لیست قیمت ۲۰کام را دارم.")} target="_blank" rel="noreferrer">
                گفتگو در واتساپ
              </a>
            </Button>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
