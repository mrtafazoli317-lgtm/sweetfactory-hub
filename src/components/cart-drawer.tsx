import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { createOrder } from "@/lib/orders";
import { contentMap, siteContentQuery, useContentValue } from "@/lib/data";
import { formatPrice, whatsappLink } from "@/lib/format";

export function CartDrawer() {
  const { items, total, isOpen, closeCart, increment, decrement, removeItem, clear } = useCart();
  const { data } = useQuery(siteContentQuery);
  const whatsapp = useContentValue(contentMap(data), "contact_whatsapp");
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const onPlaceOrder = async () => {
    if (!session?.user) return;
    if (!phone.trim() || !address.trim()) {
      setOrderError("شماره تماس و آدرس را وارد کنید.");
      return;
    }
    setPlacing(true);
    setOrderError(null);
    try {
      await createOrder({
        userId: session.user.id,
        items,
        total,
        fullName: (session.user.user_metadata?.full_name as string) ?? "",
        phone: phone.trim(),
        address: address.trim(),
      });
      clear();
      setPlaced(true);
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch {
      setOrderError("ثبت سفارش انجام نشد، دوباره تلاش کنید.");
    } finally {
      setPlacing(false);
    }
  };


  const orderMessage = () => {
    const lines = items.map(
      (item) => `- ${item.name} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`,
    );
    return [
      "سلام، می‌خوام سفارش زیر رو از ۲۰کام ثبت کنم:",
      "",
      ...lines,
      "",
      `مبلغ کل: ${formatPrice(total)}`,
    ].join("\n");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="size-4.5" />
            سبد خرید
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            {placed ? (
              <>
                <CheckCircle2 className="size-10 text-accent" />
                <p className="text-sm text-muted-foreground">سفارش شما ثبت شد؛ در پنل کاربری قابل پیگیری است.</p>
                <Button asChild variant="secondary" onClick={() => closeCart()}>
                  <Link to="/account">مشاهده سفارش‌ها</Link>
                </Button>
              </>
            ) : (
              <>
                <ShoppingBag className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">سبد خرید شما خالی است.</p>
              </>
            )}
          </div>
        ) : (

          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <img
                      src={item.image_url || "/images/hero.jpg"}
                      alt={item.name}
                      className="size-16 shrink-0 rounded-xl border border-border object-cover"
                    />
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold leading-6">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label="حذف از سبد"
                          className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      {item.weight ? (
                        <span className="text-xs text-muted-foreground">وزن: {item.weight}</span>
                      ) : null}
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-border px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => decrement(item.id)}
                            aria-label="کم کردن تعداد"
                            className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-5 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increment(item.id)}
                            aria-label="زیاد کردن تعداد"
                            className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">جمع کل</span>
                <span className="text-lg font-bold text-foreground">{formatPrice(total)}</span>
              </div>

              <Button asChild size="lg" className="mt-4 w-full">
                <a
                  href={whatsappLink(whatsapp, orderMessage())}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => closeCart()}
                >
                  <MessageCircle className="size-4" />
                  تکمیل سفارش در واتساپ
                </a>
              </Button>
              <button
                type="button"
                onClick={clear}
                className="mt-3 w-full text-center text-xs text-muted-foreground transition-colors hover:text-destructive"
              >
                خالی کردن سبد خرید
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
