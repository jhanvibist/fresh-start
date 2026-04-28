import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveGroup } from "@/hooks/useActiveGroup";
import { Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EmptyState } from "./Dashboard";

type Expense = { amount: number; paid_by: string };
type Member = { user_id: string; display_name: string | null };

const Settle = () => {
  const { user } = useAuth();
  const { group } = useActiveGroup();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const load = async () => {
    if (!group) return;
    const [{ data: ex }, { data: mem }] = await Promise.all([
      supabase.from("expenses").select("amount, paid_by").eq("group_id", group.id),
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
    } else {
      setMembers([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id]);

  // Compute net balances assuming equal split among all current members
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const memberCount = Math.max(1, members.length);
  const fairShare = total / memberCount;

  const paidBy = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.paid_by] = (acc[e.paid_by] ?? 0) + Number(e.amount);
    return acc;
  }, {});

  // Net = paid - share. Positive = is owed; negative = owes.
  const balances = members.map((m) => ({
    ...m,
    net: (paidBy[m.user_id] ?? 0) - fairShare,
  }));

  // Greedy settlement: largest debtor pays largest creditor
  const settlements: { from: Member; to: Member; amount: number }[] = [];
  const debtors = balances.filter((b) => b.net < -0.01).map((b) => ({ ...b, net: -b.net })).sort((a, b) => b.net - a.net);
  const creditors = balances.filter((b) => b.net > 0.01).sort((a, b) => b.net - a.net);

  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].net, creditors[j].net);
    settlements.push({ from: debtors[i], to: creditors[j], amount: pay });
    debtors[i].net -= pay;
    creditors[j].net -= pay;
    if (debtors[i].net < 0.01) i++;
    if (creditors[j].net < 0.01) j++;
  }

  const handleSettle = async (from: string, to: string, amount: number) => {
    if (!group) return;
    const { error } = await supabase.from("settlements").insert({
      group_id: group.id,
      from_user: from,
      to_user: to,
      amount,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settlement recorded");
    load();
  };

  const userBalance = balances.find((b) => b.user_id === user?.id)?.net ?? 0;

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <div>
        <h1 className="text-3xl font-bold">Settle up</h1>
        <p className="text-sm text-muted-foreground">Smart suggestions to balance everyone fairly.</p>
      </div>

      <div className="bg-gradient-brand rounded-3xl p-6 text-primary-foreground shadow-glow">
        <p className="text-xs opacity-80">Your balance</p>
        <p className="text-4xl font-bold mt-1">
          {userBalance >= 0 ? "+" : "-"}₹{Math.abs(userBalance).toFixed(2)}
        </p>
        <p className="text-xs opacity-80 mt-2">
          {userBalance >= 0.01
            ? "You're owed this amount"
            : userBalance <= -0.01
              ? "You owe this amount"
              : "All settled — nice!"}
        </p>
      </div>

      {settlements.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Everyone's even ✨"
          description="No payments needed right now. Add some expenses or invite roommates."
        />
      ) : (
        <div className="space-y-3">
          {settlements.map((s, idx) => (
            <div key={idx} className="bg-card rounded-2xl border border-border/60 p-5 shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-sm">
                  {(s.from.display_name ?? "?")[0].toUpperCase()}
                </div>
                <span className="font-semibold text-sm">{s.from.display_name ?? "Member"}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {(s.to.display_name ?? "?")[0].toUpperCase()}
                </div>
                <span className="font-semibold text-sm">{s.to.display_name ?? "Member"}</span>
                <span className="ml-auto font-bold text-primary">₹{s.amount.toFixed(2)}</span>
              </div>
              {(s.from.user_id === user?.id || s.to.user_id === user?.id) && (
                <Button
                  size="sm"
                  variant="soft"
                  className="w-full rounded-full"
                  onClick={() => handleSettle(s.from.user_id, s.to.user_id, s.amount)}
                >
                  Mark as settled
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Settle;
