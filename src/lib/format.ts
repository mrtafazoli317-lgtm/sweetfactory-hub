const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => faDigits[Number(d)]!);
}

export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n <= 0) return "تماس بگیرید";
  return `${toFa(n.toLocaleString("en-US"))} تومان`;
}

export function formatDate(iso: string): string {
  try {
    return toFa(
      new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(iso)),
    );
  } catch {
    return "";
  }
}

export function whatsappLink(phone: string, text?: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `98${digits.slice(1)}` : digits;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${intl}${q}`;
}

export function instagramLink(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}
