import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveGroup } from "@/hooks/useActiveGroup";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Plus,
  Receipt,
  ListChecks,
  Wallet,
  Scale,
} from "lucide-react";

type Expense = {
  id: string;
  amount: number;
  description: string;
  category: string;
  paid_by: string;
  created_at: string;
};

type Chore = {
  id: string;
  title: string;
  done: boolean;
  assigned_to: string | null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { group, loading: groupLoading } = useActiveGroup();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [memberCount, setMemberCount] = useState(1);

  useEffect(() => {
    if (!group) return;
    (async () => {
      const [{ data: ex }, { data: ch }, { data: mem }] = await Promise.all([
        supabase
          .from("expenses")
          .select("id, amount, description, category, paid_by, created_at")
          .eq("group_id", group.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("chores")
          .select("id, title, done, assigned_to")
          .eq("group_id", group.id)
          .order("created_at", { ascending: false }),
        supabase.from("group_members").select("user_id").eq("group_id", group.id),
      ]);
      setExpenses((ex ?? []) as Expense[]);
      setChores((ch ?? []) as Chore[]);
      setMemberCount(mem?.length ?? 1);
    })();
  }, [group]);

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const yourSpent = expenses
    .filter((e) => e.paid_by === user?.id)
    .reduce((s, e) => s + Number(e.amount), 0);
  const choresDone = chores.filter((c) => c.done).length;
  const fairnessScore = chores.length === 0 ? 100 : Math.round((choresDone / chores.length) * 100);

  if (groupLoading) {
    return <div className="text-sm text-muted-foreground">Loading your household…</div>;
  }

  const greeting = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-8 pb-24 lg:pb-0">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-3xl font-bold">Hey {greeting} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {group?.name} · {memberCount} {memberCount === 1 ? "member" : "members"}
        </p>
      </div>

      {/* Hero balance card */}
      <div className="bg-gradient-brand rounded-3xl p-6 md:p-8 text-primary-foreground shadow-glow">
        <p className="text-xs opacity-80">Total spent this period</p>
        <p className="text-4xl md:text-5xl font-bold mt-1">₹{totalSpent.toFixed(2)}</p>
        <p className="text-xs opacity-80 mt-2">Your share: ₹{yourSpent.toFixed(2)}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-full bg-background text-foreground hover:bg-background/90">
            <Link to="/app/expenses"><Plus className="h-4 w-4" /> Add expense</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/app/settle">Settle up <ArrowUpRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Scale} label="Fairness Score" value={`${fairnessScore}%`} progress={fairnessScore} />
        <StatCard icon={Receipt} label="Recent expenses" value={String(expenses.length)} />
        <StatCard icon={ListChecks} label="Chores done" value={`${choresDone}/${chores.length}`} />
      </div>

      {/* Recent activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Recent activity</h2>
          <Link to="/app/expenses" className="text-xs font-semibold text-primary hover:underline">View all</Link>
        </div>
        {expenses.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No expenses yet"
            description="Add your first shared expense to get started."
            cta={<Button asChild variant="hero" size="sm" className="rounded-full"><Link to="/app/expenses">Add expense</Link></Button>}
          />
        ) : (
          <div className="bg-card rounded-2xl border border-border/60 divide-y divide-border/60 overflow-hidden">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{e.description}</p>
                  <p className="text-xs text-muted-foreground capitalize">{e.category} · {new Date(e.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-sm font-bold text-primary">₹{Number(e.amount).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  progress,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  progress?: number;
}) => (
  <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-soft">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {progress !== undefined && (
      <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-gradient-brand rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>
    )}
  </div>
);

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta?: React.ReactNode;
}) => (
  <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <p className="font-semibold">{title}</p>
    <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>
    {cta}
  </div>
);

export default Dashboard;
