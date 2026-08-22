import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Factory, Leaf, ShieldCheck, Truck } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Reveal } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import {
  blogCategoriesQuery,
  blogPostsQuery,
  categoriesQuery,
  contentMap,
  productsQuery,
  siteContentQuery,
  useContentValue,
} from "@/lib/data";
import { whatsappLink } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "۲۰کام | کارخانه تولید کلوچه، شیرینی آردی و آرد بسته‌بندی" },
      {
        name: "description",
        content:
          "کارخانه ۲۰کام با بیش از ۱۰ سال تجربه، تولیدکننده کلوچه، شیرینی سنتی آردی، آرد بسته‌بندی ۹۰۰ گرمی و جعبه هدیه در اراک.",
      },
      { property: "og:title", content: "۲۰کام | کارخانه کلوچه و شیرینی سنتی" },
      {
        property: "og:description",
        content: "تولید کلوچه، شیرینی آردی و آرد بسته‌بندی با استانداردهای کیفی کارخانه‌ای.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const trustItems = [
  { icon: ShieldCheck, title: "کنترل کیفیت مستمر", text: "پایش هر بچ تولید در آزمایشگاه داخلی کارخانه" },
  { icon: Leaf, title: "مواد اولیه درجه یک", text: "آرد، خرما، گردو و روغن با گواهی آنالیز" },
  { icon: Factory, title: "خط تولید مدرن", text: "فر تونلی، بسته‌بندی اتوماتیک و فلزیاب" },
  { icon: Truck, title: "ارسال به سراسر کشور", text: "همکاری با باربری‌های طرف قرارداد" },
];

function HomePage() {
  const { data: content } = useQuery(siteContentQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { data: products } = useQuery(productsQuery);
  const { data: posts } = useQuery(blogPostsQuery);
  const { data: blogCats } = useQuery(blogCategoriesQuery);

  const map = contentMap(content);
  const heroImage = useContentValue(map, "hero_image");
  const whatsapp = useContentValue(map, "contact_whatsapp");
  const catName = (id: string | null) => categories?.find((c) => c.id === id)?.name;
  const blogCatName = (id: string | null) => blogCats?.find((c) => c.id === id)?.name;

  const featured = (products ?? []).filter((p) => p.is_active && p.is_featured).slice(0, 4);
  const latestPosts = (posts ?? []).filter((p) => p.is_published).slice(0, 3);

  const categoryImage = (categoryId: string) => {
    const match = (products ?? []).find((p) => p.category_id === categoryId && p.image_url);
    return match?.image_url || "/images/hero.jpg";
  };
  const categoryCount = (categoryId: string) =>
    (products ?? []).filter((p) => p.category_id === categoryId && p.is_active).length;

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage || "/images/hero.jpg"}
            alt="محصولات کارخانه ۲۰کام"
            width={1600}
            height={1000}
            className="animate-slow-zoom size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-espresso/95 via-espresso/80 to-espresso/40" />
        </div>

        <div className="container-page relative flex min-h-[86vh] flex-col justify-center py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-espresso/40 px-4 py-1.5 text-xs font-medium text-gold backdrop-blur">
              <BadgeCheck className="size-4" />
              {useContentValue(map, "brand_tagline")}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.35] text-cream md:text-6xl md:leading-[1.3]">
              {useContentValue(map, "hero_title")}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-xl text-base leading-9 text-cream/80 md:text-lg">
              {useContentValue(map, "hero_subtitle")}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/products">
                  مشاهده محصولات
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cream/40 bg-transparent text-cream hover:bg-cream/10 hover:text-cream">
                <a href={whatsappLink(whatsapp, "سلام، درخواست همکاری و قیمت عمده دارم.")} target="_blank" rel="noreferrer">
                  دریافت قیمت عمده
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-card">
        <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {[
            { value: useContentValue(map, "stat_years"), label: "سال تجربه تولید" },
            { value: useContentValue(map, "stat_products"), label: "تنوع محصول" },
            { value: useContentValue(map, "stat_clients"), label: "مشتری عمده" },
            { value: useContentValue(map, "stat_cities"), label: "شهر تحت پوشش" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient-gold md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-20">
        <Reveal>
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl">دسته‌بندی محصولات</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-muted-foreground">
              چهار خانواده محصول ۲۰کام؛ از کلوچه‌های نرم تا آرد بسته‌بندی و باکس‌های هدیه.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(categories ?? []).map((category, i) => (
            <Reveal key={category.id} delay={i * 80}>
              <Link
                to="/products"
                search={{ category: category.slug }}
                className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-2xl shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
              >
                <img
                  src={categoryImage(category.id)}
                  alt={category.name}
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/55 to-espresso/10 transition-colors duration-500 group-hover:from-espresso/95" />

                <span className="absolute top-5 right-5 flex size-11 items-center justify-center rounded-xl border border-gold/30 bg-espresso/50 text-lg font-bold text-gold backdrop-blur">
                  {category.name.slice(0, 1)}
                </span>

                {categoryCount(category.id) > 0 ? (
                  <span className="absolute top-5 left-5 rounded-full border border-cream/20 bg-espresso/50 px-3 py-1 text-[11px] font-medium text-cream backdrop-blur">
                    {categoryCount(category.id)} محصول
                  </span>
                ) : null}

                <div className="relative z-10 p-6">
                  <h3 className="text-lg font-bold text-cream">{category.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-cream/75">
                    {category.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gold">
                    مشاهده محصولات
                    <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-secondary/40 py-20">
        <div className="container-page">
          <Reveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl">محصولات منتخب</h2>
                <p className="mt-3 text-sm text-muted-foreground">پرفروش‌ترین محصولات کارخانه ۲۰کام</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/products">همه محصولات</Link>
              </Button>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, i) => (
              <Reveal key={product.id} delay={i * 80}>
                <ProductCard product={product} categoryName={catName(product.category_id)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="container-page py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
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
              <h2 className="text-3xl md:text-4xl">{useContentValue(map, "about_title")}</h2>
              <p className="mt-5 text-sm leading-9 text-muted-foreground md:text-base">
                {useContentValue(map, "about_text")}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {trustItems.map((item) => (
                  <div key={item.title} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                    <item.icon className="mt-0.5 size-5 shrink-0 text-accent" />
                    <div>
                      <div className="text-sm font-bold">{item.title}</div>
                      <div className="mt-1 text-xs leading-6 text-muted-foreground">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-8">
                <Link to="/about">
                  بیشتر درباره کارخانه
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* BLOG */}
      <section className="bg-secondary/40 py-20">
        <div className="container-page">
          <Reveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl">مجله ۲۰کام</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  دانستنی‌های تولید، کیفیت و صنعت شیرینی
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/blog">همه مقالات</Link>
              </Button>
            </div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {latestPosts.map((post, i) => (
              <Reveal key={post.id} delay={i * 80}>
                <PostCard post={post} categoryName={blogCatName(post.category_id)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="container-page py-20">
        <Reveal>
          <div className="surface-dark overflow-hidden rounded-3xl px-8 py-14 text-center shadow-lift">
            <h2 className="text-3xl text-cream md:text-4xl">آماده همکاری با شما هستیم</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-cream/75">
              برای دریافت لیست قیمت عمده، نمونه محصول یا سفارش باکس هدیه سازمانی با تیم فروش
              کارخانه در ارتباط باشید.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <a href={whatsappLink(whatsapp, "سلام، درخواست لیست قیمت ۲۰کام را دارم.")} target="_blank" rel="noreferrer">
                  گفتگو در واتساپ
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cream/40 bg-transparent text-cream hover:bg-cream/10 hover:text-cream">
                <Link to="/contact">راه‌های تماس</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
