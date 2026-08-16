import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Package, Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogPostsQuery, categoriesQuery, productsQuery } from "@/lib/data";
import { formatDate, formatPrice, toFa } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: products } = useQuery(productsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { data: posts } = useQuery(blogPostsQuery);

  const stats = [
    { label: "کل محصولات", value: toFa(products?.length ?? 0), icon: Package },
    { label: "دسته‌بندی‌ها", value: toFa(categories?.length ?? 0), icon: Tags },
    { label: "مقالات مجله", value: toFa(posts?.length ?? 0), icon: Newspaper },
  ];

  const recentProducts = (products ?? []).slice(0, 5);
  const recentPosts = (posts ?? []).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl">داشبورد مدیریت</h1>
        <p className="mt-2 text-sm text-muted-foreground">مدیریت محصولات، مجله و محتوای سایت ۲۰کام</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <stat.icon className="size-5 text-accent" />
            <div className="mt-3 text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild size="sm">
          <Link to="/admin/products">
            <Plus className="size-4" />
            مدیریت محصولات
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/blog">مدیریت مجله</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/settings">تنظیمات سایت</Link>
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold">آخرین محصولات</h2>
          <ul className="mt-4 space-y-3">
            {recentProducts.map((product) => (
              <li key={product.id} className="flex items-center gap-3">
                <img src={product.image_url || "/images/hero.jpg"} alt={product.name} className="size-10 rounded-lg object-cover" />
                <span className="flex-1 text-sm">{product.name}</span>
                <span className="text-xs text-muted-foreground">{formatPrice(product.price)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold">آخرین به‌روزرسانی مجله</h2>
          <ul className="mt-4 space-y-3">
            {recentPosts.map((post) => (
              <li key={post.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm">{post.title}</span>
                <span className="text-xs text-muted-foreground">{formatDate(post.published_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
