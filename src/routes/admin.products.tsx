import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageField } from "@/components/admin/image-field";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, productsQuery, type Product } from "@/lib/data";
import { formatPrice, toFa } from "@/lib/format";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type Draft = {
  id?: string;
  name: string;
  slug: string;
  category_id: string;
  price: number;
  stock: number;
  weight: string;
  description: string;
  details: string;
  image_url: string;
  gallery: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

const emptyDraft: Draft = {
  name: "",
  slug: "",
  category_id: "",
  price: 0,
  stock: 0,
  weight: "",
  description: "",
  details: "",
  image_url: "",
  gallery: "",
  is_featured: false,
  is_active: true,
  sort_order: 0,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s/\\]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}

function toDraft(product: Product & { stock?: number }): Draft {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category_id: product.category_id ?? "",
    price: product.price,
    stock: product.stock ?? 0,
    weight: product.weight,
    description: product.description,
    details: product.details,
    image_url: product.image_url,
    gallery: (product.gallery ?? []).join("\n"),
    is_featured: product.is_featured,
    is_active: product.is_active,
    sort_order: product.sort_order,
  };
}

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products } = useQuery(productsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [search, setSearch] = useState("");

  const categoryName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories ?? []) map[c.id] = c.name;
    return map;
  }, [categories]);

  const rows = (products ?? []).filter((p) =>
    search.trim() ? p.name.includes(search.trim()) : true,
  );

  const save = useMutation({
    mutationFn: async (value: Draft) => {
      const payload = {
        name: value.name,
        slug: value.slug || slugify(value.name),
        category_id: value.category_id || null,
        price: Number(value.price) || 0,
        stock: Number(value.stock) || 0,
        weight: value.weight,
        description: value.description,
        details: value.details,
        image_url: value.image_url,
        gallery: value.gallery.split("\n").map((s) => s.trim()).filter(Boolean),
        is_featured: value.is_featured,
        is_active: value.is_active,
        sort_order: Number(value.sort_order) || 0,
      };
      const res = value.id
        ? await supabase.from("products").update(payload).eq("id", value.id)
        : await supabase.from("products").insert(payload);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("محصول ذخیره شد");
      setDraft(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("محصول حذف شد");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl">مدیریت محصولات</h1>
          <p className="mt-1 text-sm text-muted-foreground">{toFa(rows.length)} محصول</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی محصول…"
            className="w-44"
          />
          <Button size="sm" onClick={() => setDraft({ ...emptyDraft })}>
            <Plus className="size-4" />
            محصول جدید
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-right text-sm">
          <thead className="bg-secondary/60 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">محصول</th>
              <th className="p-3 font-medium">دسته</th>
              <th className="p-3 font-medium">قیمت</th>
              <th className="p-3 font-medium">موجودی</th>
              <th className="p-3 font-medium">وضعیت</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => (
              <tr key={product.id} className="border-t border-border/70">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url || "/images/hero.jpg"}
                      alt={product.name}
                      className="size-10 rounded-lg object-cover"
                    />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">
                  {product.category_id ? categoryName[product.category_id] ?? "—" : "—"}
                </td>
                <td className="p-3">{formatPrice(product.price)}</td>
                <td className="p-3">{toFa((product as Product & { stock?: number }).stock ?? 0)}</td>
                <td className="p-3">
                  <span
                    className={
                      product.is_active
                        ? "rounded-full bg-secondary px-2 py-1 text-xs"
                        : "rounded-full bg-destructive/10 px-2 py-1 text-xs text-destructive"
                    }
                  >
                    {product.is_active ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDraft(toDraft(product))}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm(`حذف «${product.name}»؟`)) remove.mutate(product.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                  محصولی یافت نشد.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => (open ? null : setDraft(null))}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "ویرایش محصول" : "محصول جدید"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(draft);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>نام محصول</Label>
                  <Input
                    required
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسلاگ (آدرس)</Label>
                  <Input
                    dir="ltr"
                    value={draft.slug}
                    placeholder={slugify(draft.name)}
                    onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>دسته‌بندی</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.category_id}
                    onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
                  >
                    <option value="">بدون دسته</option>
                    {(categories ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>وزن / بسته‌بندی</Label>
                  <Input
                    value={draft.weight}
                    onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>قیمت (تومان)</Label>
                  <Input
                    dir="ltr"
                    type="number"
                    min={0}
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>موجودی</Label>
                  <Input
                    dir="ltr"
                    type="number"
                    min={0}
                    value={draft.stock}
                    onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ترتیب نمایش</Label>
                  <Input
                    dir="ltr"
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
                  />
                </div>
              </div>

              <ImageField
                label="تصویر اصلی"
                value={draft.image_url}
                onChange={(url) => setDraft({ ...draft, image_url: url })}
                folder="products"
              />

              <div className="space-y-2">
                <Label>گالری (هر آدرس در یک خط)</Label>
                <Textarea
                  dir="ltr"
                  rows={3}
                  value={draft.gallery}
                  onChange={(e) => setDraft({ ...draft, gallery: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>توضیح کوتاه</Label>
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>مشخصات و جزئیات</Label>
                <Textarea
                  rows={5}
                  value={draft.details}
                  onChange={(e) => setDraft({ ...draft, details: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={draft.is_featured}
                    onCheckedChange={(v) => setDraft({ ...draft, is_featured: v })}
                  />
                  محصول ویژه
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={draft.is_active}
                    onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
                  />
                  نمایش در سایت
                </label>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                  انصراف
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  ذخیره
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
