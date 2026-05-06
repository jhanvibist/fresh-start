import { ReactNode } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/fairshare/Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Receipt,
  ListChecks,
  PieChart,
  Wallet,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

const items = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/expenses", label: "Expenses", icon: Receipt, end: false },
  { to: "/app/chores", label: "Chores", icon: ListChecks, end: false },
  { to: "/app/insights", label: "Insights", icon: PieChart, end: false },
  { to: "/app/settle", label: "Settle", icon: Wallet, end: false },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.user_metadata?.display_name || user?.email || "?").toString()[0].toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="container mx-auto flex items-center justify-between h-16">
          <Link to="/app" className="flex items-center gap-2">
            <Logo className="h-7" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-brand text-primary-foreground font-bold flex items-center justify-center text-sm">
              {initial}
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-full">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-card shadow-soft text-foreground"
                      : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                  }`
                }
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-4 inset-x-4 bg-card border border-border/60 rounded-full shadow-card flex items-center justify-around py-2 z-40">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `p-2.5 rounded-full transition-smooth ${
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`
            }
          >
            <it.icon className="h-4 w-4" />
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
