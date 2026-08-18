import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/admin/image-field";
import { supabase } from "@/integrations/supabase/client";
import { siteContentQuery, type SiteContentRow } from "@/lib/data";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function isImageKey(row: SiteContentRow) {
  return row.key.includes("image") || row.key.includes("logo");
}

function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: rows } = useQuery(siteContentQuery);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!rows) return;
    setValues(Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""])));
  }, [rows]);

  const groups = useMemo(() => {
    const map = new Map<string, SiteContentRow[]>();
    for (const row of rows ?? []) {
      const list = map.get(row.group_name) ?? [];
      list.push(row);
      map.set(row.group_name, list);
    }
    return Array.from(map.entries());
  }, [rows]);

  const save = useMutation({
    mutationFn: async () => {
      const changed = (rows ?? []).filter((r) => (values[r.key] ?? "") !== (r.value ?? ""));
      for (const row of changed) {
        const { error } = await supabase
          .from("site_content")
          .update({ value: values[row.key] ?? "" })
          .eq("key", row.key);
        if (error) throw new Error(error.message);
      }
      return changed.length;
    },
    onSuccess: async (count) => {
      await queryClient.invalidateQueries({ queryKey: ["site_content"] });
      toast.success(count ? "تنظیمات ذخیره شد" : "تغییری برای ذخیره نبود");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">تنظیمات سایت</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            محتوای صفحه اصلی، اطلاعات شرکت و راه‌های ارتباطی
          </p>
        </div>
        <Button disabled={save.isPending} onClick={() => save.mutate()}>
          <Save className="size-4" />
          ذخیره تغییرات
        </Button>
      </div>

      <div className="space-y-6">
        {groups.map(([group, items]) => (
          <section key={group} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-bold">{group}</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {items.map((row) => (
                <div key={row.key} className={row.is_long ? "md:col-span-2" : ""}>
                  {isImageKey(row) ? (
                    <ImageField
                      label={row.label || row.key}
                      folder="site"
                      value={values[row.key] ?? ""}
                      onChange={(url) => setValues((v) => ({ ...v, [row.key]: url }))}
                    />
                  ) : (
                    <div className="space-y-2">
                      <Label>{row.label || row.key}</Label>
                      {row.is_long ? (
                        <Textarea
                          rows={5}
                          value={values[row.key] ?? ""}
                          onChange={(e) => setValues((v) => ({ ...v, [row.key]: e.target.value }))}
                        />
                      ) : (
                        <Input
                          value={values[row.key] ?? ""}
                          onChange={(e) => setValues((v) => ({ ...v, [row.key]: e.target.value }))}
                        />
                      )}
                      <p dir="ltr" className="text-[0.65rem] text-muted-foreground">{row.key}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
