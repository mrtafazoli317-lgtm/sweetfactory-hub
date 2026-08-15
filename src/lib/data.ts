import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  price: number;
  weight: string;
  description: string;
  details: string;
  image_url: string;
  gallery: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export type BlogCategory = { id: string; slug: string; name: string };

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category_id: string | null;
  is_published: boolean;
  published_at: string;
};

export type SiteContentRow = {
  key: string;
  value: string;
  label: string;
  group_name: string;
  is_long: boolean;
  sort_order: number;
};

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () =>
    unwrap<Category[]>(
      await supabase.from("categories").select("*").order("sort_order"),
    ),
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () =>
    unwrap<Product[]>(await supabase.from("products").select("*").order("sort_order")),
});

export const blogCategoriesQuery = queryOptions({
  queryKey: ["blog_categories"],
  queryFn: async () =>
    unwrap<BlogCategory[]>(
      await supabase.from("blog_categories").select("*").order("name"),
    ),
});

export const blogPostsQuery = queryOptions({
  queryKey: ["blog_posts"],
  queryFn: async () =>
    unwrap<BlogPost[]>(
      await supabase.from("blog_posts").select("*").order("published_at", { ascending: false }),
    ),
});

export const siteContentQuery = queryOptions({
  queryKey: ["site_content"],
  queryFn: async () =>
    unwrap<SiteContentRow[]>(
      await supabase.from("site_content").select("*").order("sort_order"),
    ),
});

export function contentMap(rows: SiteContentRow[] | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  for (const row of rows ?? []) map[row.key] = row.value;
  return map;
}

export const FALLBACK_CONTENT: Record<string, string> = {
  brand_name: "۲۰کام",
  brand_tagline: "کارخانه کلوچه و شیرینی سنتی",
  hero_title: "طعم اصیل سنتی، با کیفیت صنعتی",
  hero_subtitle: "بیش از ده سال تجربه در تولید کلوچه، شیرینی آردی و آرد بسته‌بندی",
  hero_image: "/images/hero.jpg",
  about_title: "درباره کارخانه ۲۰کام",
  about_text: "",
  about_image: "/images/factory-line.jpg",
  contact_address: "ایران، اراک، شهرک صنعتی شماره ۱، خیابان نوآوران، پلاک ۲۷۹۷",
  contact_whatsapp: "09965169232",
  contact_instagram: "20KAM_FACTORY",
  contact_hours: "",
  footer_note: "",
  stat_years: "۱۰+",
  stat_products: "۱۰",
  stat_clients: "۲۵۰+",
  stat_cities: "۲۰+",
};

export function useContentValue(map: Record<string, string>, key: string): string {
  return map[key] ?? FALLBACK_CONTENT[key] ?? "";
}
