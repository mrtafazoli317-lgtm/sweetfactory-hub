import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/lib/media";

export function ImageField({
  label,
  value,
  onChange,
  folder = "uploads",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در بارگذاری تصویر");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {value ? (
            <img src={value} alt={label} className="size-full object-cover" />
          ) : null}
        </div>
        <div className="flex-1 space-y-2">
          <Input dir="ltr" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/... یا آدرس تصویر" />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            بارگذاری تصویر
          </Button>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
