import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LockKeyhole } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود مدیریت | ۲۰کام" },
      { name: "description", content: "ورود مدیران کارخانه ۲۰کام به پنل مدیریت محتوا و محصولات." },
      { property: "og:title", content: "ورود مدیریت ۲۰کام" },
      { property: "og:description", content: "دسترسی مدیران به پنل مدیریت سایت ۲۰کام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/admin", replace: true });
  }, [loading, session, navigate]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError("ایمیل یا رمز عبور نادرست است.");
      return;
    }
    void navigate({ to: "/admin", replace: true });
  };

  return (
    <SiteLayout>
      <section className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-lift">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
            <LockKeyhole className="size-5 text-accent" />
          </span>
          <h1 className="mt-5 text-2xl">ورود مدیریت</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            این بخش مخصوص مدیران کارخانه ۲۰کام است.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              ورود
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
