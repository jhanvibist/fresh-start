import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveGroup } from "@/hooks/useActiveGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Plus,
  Home,
  Droplet,
  Zap,
  Wifi,
  Flame,
  ShoppingBasket,
  Plane,
  Utensils,
  Receipt,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

type Roommate = {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
};

type Tx = {
  id: string;
  from_user: string;
  to_user: string;
  amount: number;
  kind: string;
  status: string;
  note: string | null;
  trip_date: string | null;
  items: any;
  category: string;
  created_at: string;
  roommate_profile_id: string | null;
  split_with: any;
};

const CATEGORIES = [
  { id: "rent", label: "Rent", icon: Home },
  { id: "electricity", label: "Electricity", icon: Zap },
  { id: "water", label: "Water", icon: Droplet },
  { id: "internet", label: "Wi-Fi", icon: Wifi },
  { id: "gas", label: "Gas", icon: Flame },
  { id: "groceries", label: "Groceries", icon: ShoppingBasket },
  { id: "food", label: "Food", icon: Utensils },
  { id: "trip", label: "Trip", icon: Plane },
  { id: "general", label: "Other", icon: Receipt },
];

const RoommateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { group } = useActiveGroup();
  const [rm, setRm] = useState<Roommate | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [filter, setFilter] = useState<string>("all");

  // form
  const [open, setOpen] = useState(false);
  const [paidBy, setPaidBy] = useState<"you" | "them">("you");
  const [category, setCategory] = useState("general");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [tripDate, setTripDate] = useState(new Date().toISOString().slice(0, 10));
  const [itemsText, setItemsText] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "full">("equal");
  const [busy, setBusy] = useState(false);

  // edit profile
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    if (!id || !group) return;
    (async () => {
      const { data: r } = await supabase
        .from("roommate_profiles")
        .select("id, name, email, avatar_url")
        .eq("id", id)
        .single();
      setRm(r as Roommate);
      setEditName(r?.name ?? "");
      setEditEmail(r?.email ?? "");

      const { data: t } = await supabase
        .from("money_requests")
        .select("*")
        .eq("group_id", group.id)
        .eq("roommate_profile_id", id)
        .order("created_at", { ascending: false });
      setTxs((t ?? []) as Tx[]);
    })();
  }, [id, group?.id]);

  const filtered = useMemo(
    () => (filter === "all" ? txs : txs.filter((t) => t.category === filter)),
    [txs, filter]
  );

  // balance: positive => roommate owes you; negative => you owe roommate
  const balance = useMemo(() => {
    let b = 0;
    for (const t of txs) {
      const half = splitTypeOf(t) === "full" ? Number(t.amount) : Number(t.amount) / 2;
      if (t.kind === "send" && t.from_user === user?.id) b -= Number(t.amount); // you sent them money
      else if (t.kind === "send" && t.to_user === user?.id) b += Number(t.amount);
      else if (t.kind === "request") {
        // request encodes: paid_by=you (their share owed to you) or paid_by=them
        if (t.from_user === user?.id) b += half; // you paid → they owe their share
        else b -= half;
      }
    }
    return b;
  }, [txs, user?.id]);

  function splitTypeOf(t: Tx): "equal" | "full" {
    return Array.isArray(t.split_with_meta) ? "equal" : "equal";
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !user || !rm) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const items = itemsText.split("\n").map((s) => s.trim()).filter(Boolean);
    setBusy(true);
    const payload = {
      group_id: group.id,
      from_user: paidBy === "you" ? user.id : user.id, // we always store from_user=auth user (the one with an account)
      to_user: user.id, // self-placeholder; we use roommate_profile_id to reference the other party
      amount: amt,
      kind: "request" as const,
      status: "pending",
      note: note || null,
      trip_date: tripDate || null,
      items,
      category,
      roommate_profile_id: rm.id,
      split_with: [{ type: splitType, payer: paidBy }],
    };
    const { error } = await supabase.from("money_requests").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setAmount("");
    setNote("");
    setItemsText("");
    setOpen(false);
    // reload
    const { data: t } = await supabase
      .from("money_requests")
      .select("*")
      .eq("group_id", group.id)
      .eq("roommate_profile_id", rm.id)
      .order("created_at", { ascending: false });
    setTxs((t ?? []) as Tx[]);
  };

  const deleteTx = async (txId: string) => {
    const { error } = await supabase.from("money_requests").delete().eq("id", txId);
    if (error) return toast.error(error.message);
    setTxs((arr) => arr.filter((t) => t.id !== txId));
    toast.success("Removed");
  };

  const saveProfile = async () => {
    if (!rm) return;
    const { error } = await supabase
      .from("roommate_profiles")
      .update({ name: editName.trim(), email: editEmail.trim() || null })
      .eq("id", rm.id);
    if (error) return toast.error(error.message);
    setRm({ ...rm, name: editName.trim(), email: editEmail.trim() || null });
    setEditOpen(false);
    toast.success("Updated");
  };

  const removeRoommate = async () => {
    if (!rm) return;
    if (!confirm(`Remove ${rm.name} from your household?`)) return;
    const { error } = await supabase.from("roommate_profiles").delete().eq("id", rm.id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    navigate("/app");
  };

  if (!rm) {
    return <div className="text-sm text-muted-foreground">Loading roommate…</div>;
  }

  const isPhoto = rm.avatar_url && (rm.avatar_url.startsWith("http") || rm.avatar_url.startsWith("blob:"));

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      {/* Header */}
      <div className="bg-gradient-brand rounded-3xl p-6 text-primary-foreground shadow-glow text-center">
        <div className="h-24 w-24 mx-auto rounded-full bg-background/20 ring-4 ring-background/30 overflow-hidden flex items-center justify-center text-5xl">
          {isPhoto ? (
            <img src={rm.avatar_url!} alt={rm.name} className="h-full w-full object-cover" />
          ) : (
            <span>{rm.avatar_url || "👤"}</span>
          )}
        </div>
        <h1 className="text-2xl font-bold mt-3">{rm.name}</h1>
        {rm.email && <p className="text-xs opacity-80">{rm.email}</p>}
        <div className="mt-4 flex justify-center gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="rounded-full bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader><DialogTitle>Edit roommate</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="rounded-xl" />
                </div>
                <Button onClick={saveProfile} variant="hero" className="rounded-full w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="outline" onClick={removeRoommate} className="rounded-full bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
            <Trash2 className="h-3 w-3" /> Remove
          </Button>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-soft text-center">
        <p className="text-xs text-muted-foreground">Net balance</p>
        <p className={`text-3xl font-bold mt-1 ${balance > 0 ? "text-emerald-600" : balance < 0 ? "text-amber-600" : ""}`}>
          ₹{Math.abs(balance).toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {balance > 0 ? `${rm.name} owes you` : balance < 0 ? `You owe ${rm.name}` : "All settled up"}
        </p>
      </div>

      {/* Add */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="hero" className="rounded-full w-full">
            <Plus className="h-4 w-4" /> Add trip / expense
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New shared expense</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={paidBy === "you" ? "hero" : "outline"} onClick={() => setPaidBy("you")} className="rounded-full">
                <ArrowUpRight className="h-4 w-4" /> You paid
              </Button>
              <Button type="button" variant={paidBy === "them" ? "hero" : "outline"} onClick={() => setPaidBy("them")} className="rounded-full">
                <ArrowDownLeft className="h-4 w-4" /> {rm.name} paid
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Amount (₹)</Label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Split</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={splitType === "equal" ? "hero" : "outline"} onClick={() => setSplitType("equal")} className="rounded-full">Equal 50/50</Button>
                <Button type="button" variant={splitType === "full" ? "hero" : "outline"} onClick={() => setSplitType("full")} className="rounded-full">Full amount</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>What's it for?</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Goa trip, Aug rent…" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Items (one per line)</Label>
              <Textarea value={itemsText} onChange={(e) => setItemsText(e.target.value)} placeholder={"Petrol\nDinner\nHotel"} className="rounded-xl min-h-20" />
            </div>
            <Button type="submit" variant="hero" className="rounded-full w-full" disabled={busy}>Save</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
            <c.icon className="h-3 w-3" /> {c.label}
          </Chip>
        ))}
      </div>

      {/* Tx list */}
      <section>
        <h2 className="font-bold mb-2">Trips & expenses</h2>
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-semibold">Nothing yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add a trip or shared bill to get started.</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border/60 divide-y divide-border/60 overflow-hidden">
            {filtered.map((t) => {
              const meta = Array.isArray(t.split_with) ? (t.split_with[0] as any) : null;
              const youPaid = meta?.payer === "you";
              const split = meta?.type ?? "equal";
              const cat = CATEGORIES.find((c) => c.id === t.category) ?? CATEGORIES[CATEGORIES.length - 1];
              const Icon = cat.icon;
              const yourShare = split === "full" ? Number(t.amount) : Number(t.amount) / 2;
              const owe = youPaid ? `${rm.name} owes ₹${yourShare.toFixed(2)}` : `You owe ₹${yourShare.toFixed(2)}`;
              return (
                <div key={t.id} className="p-4 flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{t.note || cat.label}</p>
                      <p className="text-sm font-bold text-primary shrink-0">₹{Number(t.amount).toFixed(2)}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {youPaid ? "You paid" : `${rm.name} paid`} · {t.trip_date ? new Date(t.trip_date).toLocaleDateString("en-IN") : new Date(t.created_at).toLocaleDateString("en-IN")} · {split === "full" ? "Full" : "Split 50/50"}
                    </p>
                    {Array.isArray(t.items) && t.items.length > 0 && (
                      <ul className="text-[11px] text-muted-foreground mt-1 list-disc pl-4">
                        {(t.items as string[]).slice(0, 4).map((it, i) => <li key={i}>{it}</li>)}
                      </ul>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[11px] font-semibold ${youPaid ? "text-emerald-600" : "text-amber-600"}`}>{owe}</span>
                      <button onClick={() => deleteTx(t.id)} className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
      active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/60 text-foreground hover:border-primary/40"
    }`}
  >
    {children}
  </button>
);

export default RoommateProfile;
