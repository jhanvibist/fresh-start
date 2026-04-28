import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveGroup } from "@/hooks/useActiveGroup";
import { PieChart } from "lucide-react";
import { EmptyState } from "./Dashboard";

type Expense = { amount: number; category: string; paid_by: string };

const Insights = () => {
  const { group } = useActiveGroup();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<{ user_id: string; display_name: string | null }[]>([]);

  useEffect(() => {
    if (!group) return;
    (async () => {
      const [{ data: ex }, { data: mem }] = await Promise.all([
        supabase.from("expenses").select("amount, category, paid_by").eq("group_id", group.id),
        supabase.from("group_members").select("user_id").eq("group_id", group.id),
      ]);
      setExpenses((ex ?? []) as Expense[]);
      const userIds = (mem ?? []).map((m) => m.user_id);
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        setMembers(profs ?? []);
      }
    })();
  }, [group]);

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  // by category
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
    return acc;
  }, {});
  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(1, ...categoryEntries.map(([, v]) => v));

  // by member
  const byMember = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.paid_by] = (acc[e.paid_by] ?? 0) + Number(e.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <div>
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="text-sm text-muted-foreground">See how your household spends and contributes.</p>
      </div>

      {expenses.length === 0 ? (
        <EmptyState icon={PieChart} title="No data yet" description="Add some expenses to unlock insights." />
      ) : (
        <>
          <div className="bg-gradient-brand rounded-3xl p-6 text-primary-foreground shadow-glow">
            <p className="text-xs opacity-80">Total household spend</p>
            <p className="text-4xl font-bold mt-1">₹{total.toFixed(2)}</p>
          </div>

          <section className="bg-card rounded-2xl border border-border/60 p-6 shadow-soft">
            <h2 className="font-bold mb-4">Spending by category</h2>
            <div className="space-y-3">
              {categoryEntries.map(([cat, val]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="capitalize">{cat}</span>
                    <span className="text-muted-foreground">₹{val.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-brand rounded-full transition-all duration-700" style={{ width: `${(val / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border/60 p-6 shadow-soft">
            <h2 className="font-bold mb-4">Contribution by member</h2>
            <div className="space-y-3">
              {members.map((m) => {
                const v = byMember[m.user_id] ?? 0;
                const pct = total === 0 ? 0 : Math.round((v / total) * 100);
                return (
                  <div key={m.user_id}>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span>{m.display_name ?? "Member"}</span>
                      <span className="text-muted-foreground">₹{v.toFixed(2)} · {pct}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-brand rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Insights;
