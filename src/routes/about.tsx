import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Factory, Leaf, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { contentMap, siteContentQuery, useContentValue } from "@/lib/data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "درباره کارخانه ۲۰کام | تولید کلوچه، کوکی و آرد بسته‌بندی" },
      {
        name: "description",
        content:
          "آشنایی با کارخانه ۲۰کام در اراک؛ بیش از ۱۰ سال تجربه تولید کلوچه، کوکی، شیرینی آردی و آرد بسته‌بندی با کنترل کیفیت مستمر.",
      },
      { property: "og:title", content: "درباره کارخانه ۲۰کام" },
      {
        property: "og:description",
        content: "تجربه، کیفیت و خط تولید مدرن کارخانه ۲۰کام در اراک.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: ShieldCheck, title: "کیفیت بالا", text: "کنترل کیفیت هر بچ تولید در آزمایشگاه داخلی" },
  { icon: Leaf, title: "مواد اولیه مرغوب", text: "آرد، خرما، گردو و روغن با گواهی آنالیز" },
  { icon: Factory, title: "بسته‌بندی استاندارد", text: "بسته‌بندی اتوماتیک، فلزیاب و تاریخ تولید" },
  { icon: Award, title: "تولید تازه روزانه", text: "برنامه تولید روزانه و ارسال سریع به بازار" },
];

function AboutPage() {
  const { data } = useQuery(siteContentQuery);
  const map = contentMap(data);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-16">
          <Reveal>
            <h1 className="text-3xl md:text-5xl">{useContentValue(map, "about_title")}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-9 text-muted-foreground md:text-base">
              {useContentValue(map, "about_short")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page grid items-center gap-10 py-16 lg:grid-cols-2">
        <Reveal>
          <div className="overflow-hidden rounded-3xl shadow-lift">
            <img
              src={useContentValue(map, "about_image") || "/images/factory-line.jpg"}
              alt="خط تولید کارخانه ۲۰کام"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div>
            <h2 className="text-2xl md:text-3xl">داستان کارخانه</h2>
            <p className="mt-5 text-sm leading-9 text-muted-foreground md:text-base">
              {useContentValue(map, "about_text")}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {values.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <item.icon className="size-5 text-accent" />
                  <div className="mt-3 text-sm font-bold">{item.title}</div>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
            <Button asChild className="mt-8">
              <Link to="/contact">تماس با تیم فروش</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
