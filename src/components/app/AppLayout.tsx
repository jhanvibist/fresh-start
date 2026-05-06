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
  const location = useLocation();
  const initial = (user?.user_metadata?.display_name || user?.email || "?").toString()[0].toUpperCase();
  const isRoot = location.pathname === "/app";
  const currentLabel = items.find((i) => i.to === location.pathname)?.label || "FairShare";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-soft lg:bg-gradient-soft">
      {/* Mobile app shell */}
      <div className="lg:hidden mx-auto max-w-[480px] min-h-screen bg-background relative shadow-card">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/60">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2">
              {isRoot ? (
                <Logo className="h-6" />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="rounded-full -ml-2"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {!isRoot && <span className="font-semibold text-sm">{currentLabel}</span>}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-brand text-primary-foreground font-bold flex items-center justify-center text-xs">
                {initial}
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 pt-5 pb-28">{children}</main>
        <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[448px] bg-card border border-border/60 rounded-full shadow-card flex items-center justify-around py-2 z-40">
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

      {/* Desktop layout */}
      <div className="hidden lg:block">
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
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </header>
        <div className="container mx-auto py-8 grid grid-cols-[220px_1fr] gap-8">
          <aside>
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
      </div>
    </div>
  );
};
