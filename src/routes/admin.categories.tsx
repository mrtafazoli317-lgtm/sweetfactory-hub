import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { blogCategoriesQuery, categoriesQuery, productsQuery } from "@/lib/data";
import { toFa } from "@/lib/format";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
};

const empty: Draft = { name: "", slug: "", description: "", sort_order: 0 };

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s/\\]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}

function AdminCategories() {
  const queryClient = useQueryClient();
  const { data: categories } = useQuery(categoriesQuery);
  const { data: products } = useQuery(productsQuery);
  const { data: blogCategories } = useQuery(blogCategoriesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [blogDraft, setBlogDraft] = useState<{ id?: string; name: string; slug: string } | null>(
    null,
  );

  const countFor = (id: string) => (products ?? []).filter((p) => p.category_id === id).length;

  const saveCategory = useMutation({
    mutationFn: async (value: Draft) => {
      const payload = {
        name: value.name,
        slug: value.slug || slugify(value.name),
        description: value.description,
        sort_order: Number(value.sort_order) || 0,
      };
      const res = value.id
        ? await supabase.from("categories").update(payload).eq("id", value.id)
        : await supabase.from("categories").insert(payload);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("دسته‌بندی ذخیره شد");
      setDraft(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("دسته‌بندی حذف شد");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveBlogCategory = useMutation({
    mutationFn: async (value: { id?: string; name: string; slug: string }) => {
      const payload = { name: value.name, slug: value.slug || slugify(value.name) };
      const res = value.id
        ? await supabase.from("blog_categories").update(payload).eq("id", value.id)
        : await supabase.from("blog_categories").insert(payload);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blog_categories"] });
      toast.success("دسته مجله ذخیره شد");
      setBlogDraft(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeBlogCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blog_categories"] });
      toast.success("دسته مجله حذف شد");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl">دسته‌بندی‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">مدیریت دسته‌های محصولات و مجله</p>
        </div>
        <Button size="sm" onClick={() => setDraft({ ...empty })}>
          <Plus className="size-4" />
          دسته محصول جدید
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(categories ?? []).map((category) => (
          <div key={category.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">{category.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                  /{category.slug}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setDraft({
                      id: category.id,
                      name: category.name,
                      slug: category.slug,
                      description: category.description,
                      sort_order: category.sort_order,
                    })
                  }
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm(`حذف «${category.name}»؟`)) removeCategory.mutate(category.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{category.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {toFa(countFor(category.id))} محصول در این دسته
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">دسته‌های مجله</h2>
          <Button size="sm" variant="outline" onClick={() => setBlogDraft({ name: "", slug: "" })}>
            <Plus className="size-4" />
            دسته جدید
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-border/70">
          {(blogCategories ?? []).map((category) => (
            <li key={category.id} className="flex items-center gap-3 py-3">
              <span className="flex-1 text-sm">{category.name}</span>
              <span className="text-xs text-muted-foreground" dir="ltr">
                {category.slug}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setBlogDraft({ id: category.id, name: category.name, slug: category.slug })
                }
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => {
                  if (confirm(`حذف «${category.name}»؟`)) removeBlogCategory.mutate(category.id);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => (open ? null : setDraft(null))}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "ویرایش دسته" : "دسته جدید"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveCategory.mutate(draft);
              }}
            >
              <div className="space-y-2">
                <Label>نام دسته</Label>
                <Input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>اسلاگ</Label>
                <Input
                  dir="ltr"
                  value={draft.slug}
                  placeholder={slugify(draft.name)}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>توضیح</Label>
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
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
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                  انصراف
                </Button>
                <Button type="submit" disabled={saveCategory.isPending}>
                  ذخیره
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={blogDraft !== null} onOpenChange={(open) => (open ? null : setBlogDraft(null))}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{blogDraft?.id ? "ویرایش دسته مجله" : "دسته مجله جدید"}</DialogTitle>
          </DialogHeader>
          {blogDraft ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveBlogCategory.mutate(blogDraft);
              }}
            >
              <div className="space-y-2">
                <Label>نام</Label>
                <Input
                  required
                  value={blogDraft.name}
                  onChange={(e) => setBlogDraft({ ...blogDraft, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>اسلاگ</Label>
                <Input
                  dir="ltr"
                  value={blogDraft.slug}
                  placeholder={slugify(blogDraft.name)}
                  onChange={(e) => setBlogDraft({ ...blogDraft, slug: e.target.value })}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setBlogDraft(null)}>
                  انصراف
                </Button>
                <Button type="submit" disabled={saveBlogCategory.isPending}>
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
