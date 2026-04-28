import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveGroup } from "@/hooks/useActiveGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ListChecks, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "./Dashboard";

type Chore = {
  id: string;
  title: string;
  done: boolean;
  assigned_to: string | null;
  due_date: string | null;
  created_by: string;
};

const schema = z.object({
  title: z.string().trim().min(1).max(120),
});

const Chores = () => {
  const { user } = useAuth();
  const { group } = useActiveGroup();
  const [chores, setChores] = useState<Chore[]>([]);
  const [title, setTitle] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    if (!group) return;
    const { data } = await supabase
      .from("chores")
      .select("id, title, done, assigned_to, due_date, created_by")
      .eq("group_id", group.id)
      .order("done", { ascending: true })
      .order("created_at", { ascending: false });
    setChores((data ?? []) as Chore[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !user) return;
    const parsed = schema.safeParse({ title });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    const { error } = await supabase.from("chores").insert({
      group_id: group.id,
      title: parsed.data.title,
      created_by: user.id,
      assigned_to: user.id,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setTitle("");
    setShowForm(false);
    load();
  };

  const toggle = async (c: Chore) => {
    const { error } = await supabase.from("chores").update({ done: !c.done }).eq("id", c.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("chores").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Chore removed");
    load();
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chores</h1>
          <p className="text-sm text-muted-foreground">Keep your household running smoothly.</p>
        </div>
        <Button variant="hero" className="rounded-full" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-2xl border border-border/60 p-6 shadow-soft space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Chore</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Take out the trash" required className="rounded-xl" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="hero" className="rounded-full">Add chore</Button>
          </div>
        </form>
      )}

      {chores.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No chores yet"
          description="Add chores to track who's doing what."
          cta={<Button variant="hero" className="rounded-full" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add chore</Button>}
        />
      ) : (
        <div className="space-y-2">
          {chores.map((c) => (
            <div key={c.id} className="bg-card rounded-2xl border border-border/60 p-4 flex items-center gap-3 shadow-soft">
              <button
                onClick={() => toggle(c)}
                aria-label={c.done ? "Mark as not done" : "Mark as done"}
                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-smooth ${
                  c.done ? "bg-primary border-primary" : "border-border hover:border-primary"
                }`}
              >
                {c.done && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={4} />}
              </button>
              <p className={`flex-1 text-sm font-semibold ${c.done ? "line-through text-muted-foreground" : ""}`}>
                {c.title}
              </p>
              <button onClick={() => remove(c.id)} className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-destructive transition-smooth">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chores;
