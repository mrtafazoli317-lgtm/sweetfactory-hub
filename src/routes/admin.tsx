import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Image, LayoutDashboard, LogOut, Newspaper, Package, Settings, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "محصولات", icon: Package, exact: false },
  { to: "/admin/categories", label: "دسته‌بندی‌ها", icon: Tags, exact: false },
  { to: "/admin/blog", label: "مجله", icon: Newspaper, exact: false },
  { to: "/admin/media", label: "رسانه", icon: Image, exact: false },
  { to: "/admin/settings", label: "تنظیمات", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const { session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (loading) return;
    if (!session || !isAdmin) void navigate({ to: "/auth", replace: true });
  }, [loading, session, isAdmin, navigate]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  if (loading || !session || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        در حال بررسی دسترسی…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30 lg:flex-row">
      <aside className="surface-dark lg:min-h-screen lg:w-64">
        <div className="flex items-center justify-between p-5">
          <Link to="/" className="text-lg font-bold tracking-[0.3em] text-gold">
            20K A M
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              activeProps={{ className: "bg-cream/15 text-cream" }}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-cream/75 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3">
          <Button variant="outline" size="sm" className="w-full border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream" onClick={signOut}>
            <LogOut className="size-4" />
            خروج
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
