import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveGroup } from "@/hooks/useActiveGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "./Dashboard";

type Expense = {
  id: string;
  amount: number;
  description: string;
  category: string;
  paid_by: string;
  created_at: string;
};

const schema = z.object({
  description: z.string().trim().min(1).max(120),
  amount: z.coerce.number().positive().max(1_000_000),
  category: z.string().trim().min(1).max(40),
});

const Expenses = () => {
  const { user } = useAuth();
  const { group } = useActiveGroup();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("groceries");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!group) return;
    const { data } = await supabase
      .from("expenses")
      .select("id, amount, description, category, paid_by, created_at")
      .eq("group_id", group.id)
      .order("created_at", { ascending: false });
    setExpenses((data ?? []) as Expense[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !user) return;
    const parsed = schema.safeParse({ description, amount, category });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("expenses").insert({
      group_id: group.id,
      paid_by: user.id,
      amount: parsed.data.amount,
      description: parsed.data.description,
      category: parsed.data.category,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Expense added");
    setDescription("");
    setAmount("");
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Expense deleted");
    load();
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-sm text-muted-foreground">Track everything paid for the household.</p>
        </div>
        <Button variant="hero" className="rounded-full" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-2xl border border-border/60 p-6 shadow-soft space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Groceries at Trader Joe's" required className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amt">Amount (₹)</Label>
              <Input id="amt" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500.00" required className="rounded-xl" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cat">Category</Label>
              <Input id="cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="groceries" required className="rounded-xl" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="hero" className="rounded-full" disabled={busy}>Save expense</Button>
          </div>
        </form>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description="Add your first shared expense to start tracking."
          cta={<Button variant="hero" className="rounded-full" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add expense</Button>}
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
              {e.paid_by === user?.id && (
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-destructive transition-smooth">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Expenses;
