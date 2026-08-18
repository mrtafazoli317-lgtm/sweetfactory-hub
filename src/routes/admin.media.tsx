import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { listMedia, removeMedia, uploadMedia } from "@/lib/media";

export const Route = createFileRoute("/admin/media")({
  component: AdminMedia,
});

const FOLDERS = [
  { key: "uploads", label: "عمومی" },
  { key: "products", label: "محصولات" },
  { key: "blog", label: "مجله" },
  { key: "site", label: "سایت" },
];

function AdminMedia() {
  const queryClient = useQueryClient();
  const [folder, setFolder] = useState("uploads");
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const { data: files, isLoading } = useQuery({
    queryKey: ["media", folder],
    queryFn: () => listMedia(folder),
  });

  const remove = useMutation({
    mutationFn: (path: string) => removeMedia(path),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["media", folder] });
      toast.success("فایل حذف شد");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(list)) await uploadMedia(file, folder);
      await queryClient.invalidateQueries({ queryKey: ["media", folder] });
      toast.success("بارگذاری انجام شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در بارگذاری");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">کتابخانه رسانه</h1>
          <p className="mt-1 text-sm text-muted-foreground">بارگذاری و مدیریت تصاویر سایت</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void onFiles(e.target.files)}
          />
          <Button disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            بارگذاری تصویر
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FOLDERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={folder === f.key ? "default" : "outline"}
            onClick={() => setFolder(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">در حال بارگذاری…</p>
      ) : (files ?? []).length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          هنوز تصویری در این پوشه نیست.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(files ?? []).map((file) => (
            <div key={file.path} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="aspect-square bg-muted">
                <img src={file.url} alt={file.name} loading="lazy" className="size-full object-cover" />
              </div>
              <div className="space-y-2 p-3">
                <p dir="ltr" className="truncate text-xs text-muted-foreground">{file.name}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(file.url);
                      toast.success("آدرس تصویر کپی شد");
                    }}
                  >
                    <Copy className="size-3.5" />
                    کپی لینک
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("این فایل حذف شود؟")) remove.mutate(file.path);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
