import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, LogOut, MailCheck, Package, ShieldCheck, User } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { myOrdersQuery, orderStatusLabel } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "پنل کاربری | ۲۰کام" },
      {
        name: "description",
        content: "ثبت‌نام و ورود به پنل کاربری ۲۰کام؛ تایید ایمیل با کد یکبار مصرف و مدیریت اطلاعات حساب.",
      },
      { property: "og:title", content: "پنل کاربری ۲۰کام" },
      { property: "og:description", content: "ساخت حساب کاربری، تایید ایمیل با کد و مدیریت پروفایل در سایت ۲۰کام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

type Mode = "login" | "signup" | "verify";

const message = (raw: string) => {
  const m = raw.toLowerCase();
  if (m.includes("invalid login")) return "ایمیل یا رمز عبور نادرست است.";
  if (m.includes("already registered")) return "این ایمیل قبلاً ثبت شده است. وارد شوید.";
  if (m.includes("email not confirmed")) return "ایمیل شما هنوز تایید نشده است. کد تایید را وارد کنید.";
  if (m.includes("token has expired") || m.includes("invalid")) return "کد وارد شده نادرست یا منقضی شده است.";
  if (m.includes("password")) return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
  if (m.includes("rate limit")) return "تعداد درخواست‌ها زیاد است، کمی بعد دوباره تلاش کنید.";
  return "خطایی رخ داد، دوباره تلاش کنید.";
};

function AccountPage() {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <SiteLayout>
        <div className="container-page flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-accent" />
        </div>
      </SiteLayout>
    );
  }
  return <SiteLayout>{session ? <Dashboard /> : <AuthCard />}</SiteLayout>;
}

function AuthCard() {
  const [mode, setMode] = useState<Mode>("login");
  const [usePasswordLogin, setUsePasswordLogin] = useState(false);
  const [verifyType, setVerifyType] = useState<"signup" | "email">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const reset = () => {
    setError(null);
    setInfo(null);
  };

  const onSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!email.trim()) {
      setError("ایمیل خود را وارد کنید.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/account` },
    });
    setBusy(false);
    if (err) {
      setError(message(err.message));
      return;
    }
    setCode("");
    setVerifyType("email");
    setMode("verify");
    setCooldown(45);
    setInfo("کد ورود ۶ رقمی به ایمیل شما ارسال شد.");
  };


  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setBusy(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: { full_name: fullName.trim() },
      },
    });
    setBusy(false);
    if (err) {
      setError(message(err.message));
      return;
    }
    if (data.session) {
      window.location.reload();
      return;
    }
    setCode("");
    setVerifyType("signup");
    setMode("verify");
    setCooldown(45);
    setInfo("کد تایید ۶ رقمی به ایمیل شما ارسال شد.");
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) {
      if (err.message.toLowerCase().includes("email not confirmed")) {
        setCode("");
        setVerifyType("signup");
        setMode("verify");
        setInfo("ایمیل شما تایید نشده است. کد تایید را وارد کنید یا ارسال مجدد بزنید.");
        return;
      }
      setError(message(err.message));
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (code.length !== 6) {
      setError("کد ۶ رقمی را کامل وارد کنید.");
      return;
    }
    setBusy(true);
    let { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: verifyType,
    });
    if (err) {
      // بعضی کدها با نوع دیگر صادر شده‌اند؛ حالت جایگزین را هم امتحان می‌کنیم.
      const fallback = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: verifyType === "email" ? "signup" : "email",
      });
      err = fallback.error;
    }
    setBusy(false);
    if (err) {
      setError(message(err.message));
      return;
    }
    window.location.reload();
  };

  const onResend = async () => {
    reset();
    setBusy(true);
    const { error: err } =
      verifyType === "signup"
        ? await supabase.auth.resend({
            type: "signup",
            email: email.trim(),
            options: { emailRedirectTo: `${window.location.origin}/account` },
          })
        : await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/account` },
          });
    setBusy(false);
    if (err) {
      setError(message(err.message));
      return;
    }
    setCooldown(45);
    setInfo("کد تایید دوباره ارسال شد.");
  };


  return (
    <section className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-lift">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
          {mode === "verify" ? (
            <MailCheck className="size-5 text-accent" />
          ) : (
            <User className="size-5 text-accent" />
          )}
        </span>

        {mode === "verify" ? (
          <>
            <h1 className="mt-5 text-2xl">تایید ایمیل</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              کد ۶ رقمی ارسال‌شده به <span dir="ltr" className="font-medium text-foreground">{email}</span> را وارد کنید.
            </p>
            <form className="mt-6 space-y-5" onSubmit={onVerify}>
              <div className="flex justify-center" dir="ltr">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {info ? <p className="text-sm text-accent">{info}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                تایید و ورود
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
                  onClick={onResend}
                  disabled={busy || cooldown > 0}
                >
                  {cooldown > 0 ? `ارسال مجدد کد (${cooldown})` : "ارسال مجدد کد"}
                </button>
                <button
                  type="button"
                  className="text-muted-foreground underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode("login");
                    reset();
                  }}
                >
                  بازگشت
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-2xl">{mode === "signup" ? "ساخت حساب کاربری" : "ورود به پنل کاربری"}</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {mode === "signup"
                ? "ایمیل و رمز عبور خود را وارد کنید؛ برای ورود اولیه یک کد تایید برایتان ارسال می‌شود."
                : usePasswordLogin
                  ? "با ایمیل و رمز عبور خود وارد شوید."
                  : "ایمیل خود را وارد کنید؛ یک کد ۶ رقمی برایتان ارسال می‌شود و بدون رمز عبور وارد می‌شوید."}
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={mode === "signup" ? onSignup : usePasswordLogin ? onLogin : onSendCode}
            >
              {mode === "signup" ? (
                <div className="space-y-2">
                  <Label htmlFor="fullName">نام و نام خانوادگی</Label>
                  <Input
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {mode === "signup" || usePasswordLogin ? (
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Input
                    id="password"
                    type="password"
                    dir="ltr"
                    required
                    minLength={6}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              ) : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {info ? <p className="text-sm text-accent">{info}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {mode === "signup" ? "ثبت‌نام" : usePasswordLogin ? "ورود" : "ارسال کد ورود به ایمیل"}
              </Button>
            </form>

            {mode === "login" ? (
              <button
                type="button"
                className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => {
                  setUsePasswordLogin((v) => !v);
                  reset();
                }}
              >
                {usePasswordLogin ? "ورود با کد ایمیل (بدون رمز)" : "ورود با رمز عبور"}
              </button>
            ) : null}

            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "signup" ? "قبلاً ثبت‌نام کرده‌اید؟" : "حساب کاربری ندارید؟"}{" "}
              <button
                type="button"
                className="font-semibold text-accent underline-offset-4 hover:underline"
                onClick={() => {
                  setMode(mode === "signup" ? "login" : "signup");
                  reset();
                }}
              >
                {mode === "signup" ? "ورود" : "ثبت‌نام"}
              </button>
            </p>

          </>
        )}
      </div>
    </section>
  );
}

function Dashboard() {
  const { session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    const { error: err } = await supabase
      .from("profiles")
      .upsert({ id: userId, full_name: fullName.trim(), phone: phone.trim() });
    setSaving(false);
    if (err) {
      setError("ذخیره اطلاعات انجام نشد.");
      return;
    }
    setSaved(true);
    void queryClient.invalidateQueries({ queryKey: ["profile", userId] });
  };

  const onSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/account", replace: true });
  };

  return (
    <section className="container-page py-14">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-7 shadow-soft">
          <div>
            <p className="text-sm text-muted-foreground">خوش آمدید</p>
            <h1 className="mt-1 text-2xl">{profile?.full_name || "کاربر ۲۰کام"}</h1>
            <p dir="ltr" className="mt-1 text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin ? (
              <Button asChild variant="secondary">
                <Link to="/admin">
                  <ShieldCheck className="size-4" />
                  پنل مدیریت
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" onClick={onSignOut}>
              <LogOut className="size-4" />
              خروج
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
          <h2 className="text-lg">اطلاعات حساب</h2>
          <p className="mt-1 text-sm text-muted-foreground">نام و شماره تماس خود را برای پیگیری سفارش‌ها کامل کنید.</p>
          {isLoading ? (
            <Loader2 className="mt-6 size-5 animate-spin text-accent" />
          ) : (
            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSave}>
              <div className="space-y-2">
                <Label htmlFor="pf-name">نام و نام خانوادگی</Label>
                <Input id="pf-name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-phone">شماره تماس</Label>
                <Input id="pf-phone" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  ذخیره تغییرات
                </Button>
                {saved ? <span className="text-sm text-accent">ذخیره شد.</span> : null}
                {error ? <span className="text-sm text-destructive">{error}</span> : null}
              </div>
            </form>
          )}
        </div>

        <OrdersCard userId={userId} />



        <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg">
            <KeyRound className="size-4 text-accent" />
            امنیت حساب
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            برای تغییر رمز عبور، از دکمهٔ زیر استفاده کنید؛ لینک بازیابی به ایمیل شما ارسال می‌شود.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={async () => {
              if (!session?.user?.email) return;
              await supabase.auth.resetPasswordForEmail(session.user.email, {
                redirectTo: `${window.location.origin}/account`,
              });
              setSaved(false);
              setError(null);
              window.alert("لینک تغییر رمز عبور به ایمیل شما ارسال شد.");
            }}
          >
            ارسال لینک تغییر رمز
          </Button>
        </div>
      </div>
    </section>
  );
}

function OrdersCard({ userId }: { userId: string | undefined }) {
  const { data: orders, isLoading } = useQuery(myOrdersQuery(userId));

  return (
    <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
      <h2 className="flex items-center gap-2 text-lg">
        <Package className="size-4 text-accent" />
        سفارش‌های من
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">فهرست سفارش‌های ثبت‌شده و وضعیت پیگیری آن‌ها.</p>

      {isLoading ? (
        <Loader2 className="mt-6 size-5 animate-spin text-accent" />
      ) : !orders || orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
          <Button asChild variant="secondary" className="mt-4">
            <Link to="/products">مشاهده محصولات</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">سفارش #{order.id.slice(0, 8)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  {orderStatusLabel[order.status] ?? order.status}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="size-10 rounded-lg border border-border object-cover"
                      />
                    ) : null}
                    <span className="flex-1">{item.name}</span>
                    <span className="text-muted-foreground">× {item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">مبلغ کل</span>
                <span className="font-bold">{formatPrice(order.total)}</span>
              </div>
              {order.address ? (
                <p className="mt-2 text-xs leading-6 text-muted-foreground">آدرس: {order.address}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
