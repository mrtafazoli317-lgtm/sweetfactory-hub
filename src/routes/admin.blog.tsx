import { useState } from "react";
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
import { blogCategoriesQuery, blogPostsQuery, type BlogPost } from "@/lib/data";
import { faDate } from "@/lib/format";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlog,
});

type Draft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category_id: string | null;
  is_published: boolean;
};

const empty: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category_id: null,
  is_published: true,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s/\\]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}

function AdminBlog() {
  const queryClient = useQueryClient();
  const { data: posts } = useQuery(blogPostsQuery);
  const { data: categories } = useQuery(blogCategoriesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);

  const save = useMutation({
    mutationFn: async (value: Draft) => {
      const payload = {
        title: value.title,
        slug: value.slug || slugify(value.title),
        excerpt: value.excerpt,
        content: value.content,
        cover_image: value.cover_image,
        category_id: value.category_id,
        is_published: value.is_published,
      };
      const res = value.id
        ? await supabase.from("blog_posts").update(payload).eq("id", value.id)
        : await supabase.from("blog_posts").insert(payload);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blog_posts"] });
      toast.success("مقاله ذخیره شد");
      setDraft(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blog_posts"] });
      toast.success("مقاله حذف شد");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const edit = (post: BlogPost) =>
    setDraft({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      cover_image: post.cover_image ?? "",
      category_id: post.category_id,
      is_published: post.is_published,
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">مدیریت مجله</h1>
          <p className="mt-1 text-sm text-muted-foreground">افزودن، ویرایش و حذف مقالات</p>
        </div>
        <Button onClick={() => setDraft({ ...empty })}>
          <Plus className="size-4" />
          مقاله جدید
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(posts ?? []).map((post) => (
          <div key={post.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-muted">
              {post.cover_image ? (
                <img src={post.cover_image} alt={post.title} className="size-full object-cover" />
              ) : null}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{categories?.find((c) => c.id === post.category_id)?.name ?? "بدون دسته"}</span>
              <span>•</span>
              <span>{faDate(post.published_at)}</span>
              {!post.is_published ? (
                <span className="rounded-full bg-secondary px-2 py-0.5">پیش‌نویس</span>
              ) : null}
            </div>
            <h3 className="mt-2 text-sm font-bold leading-7">{post.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground">{post.excerpt}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => edit(post)}>
                <Pencil className="size-3.5" />
                ویرایش
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm("این مقاله حذف شود؟")) remove.mutate(post.id);
                }}
              >
                <Trash2 className="size-3.5" />
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "ویرایش مقاله" : "مقاله جدید"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان</Label>
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>نشانی (slug)</Label>
                  <Input
                    dir="ltr"
                    value={draft.slug}
                    onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                    placeholder={slugify(draft.title)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>دسته</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.category_id ?? ""}
                    onChange={(e) => setDraft({ ...draft, category_id: e.target.value || null })}
                  >
                    <option value="">بدون دسته</option>
                    {(categories ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <ImageField
                label="تصویر شاخص"
                folder="blog"
                value={draft.cover_image}
                onChange={(url) => setDraft({ ...draft, cover_image: url })}
              />
              <div className="space-y-2">
                <Label>خلاصه</Label>
                <Textarea
                  rows={3}
                  value={draft.excerpt}
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>متن کامل</Label>
                <Textarea
                  rows={12}
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label>انتشار در سایت</Label>
                <Switch
                  checked={draft.is_published}
                  onCheckedChange={(v) => setDraft({ ...draft, is_published: v })}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              انصراف
            </Button>
            <Button disabled={save.isPending} onClick={() => draft && save.mutate(draft)}>
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
