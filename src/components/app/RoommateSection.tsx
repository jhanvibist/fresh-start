import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveGroup } from "@/hooks/useActiveGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  Copy,
  Share2,
  IndianRupee,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  X,
  Users,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

type Member = {
  user_id: string;
  display_name: string | null;
};

type MoneyRequest = {
  id: string;
  from_user: string;
  to_user: string;
  amount: number;
  kind: string;
  status: string;
  note: string | null;
  trip_date: string | null;
  items: any;
  created_at: string;
};

export const RoommateSection = () => {
  const { user } = useAuth();
  const { group } = useActiveGroup();
  const [members, setMembers] = useState<Member[]>([]);
  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [moneyOpen, setMoneyOpen] = useState(false);

  // Invite form
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [busy, setBusy] = useState(false);

  // Money form
  const [kind, setKind] = useState<"request" | "send">("request");
  const [toUser, setToUser] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [itemsText, setItemsText] = useState("");

  const load = async () => {
    if (!group) return;
    const { data: mem } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", group.id);
    const ids = (mem ?? []).map((m) => m.user_id);
    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    setMembers(
      ids.map((id) => ({
        user_id: id,
        display_name: profs?.find((p) => p.user_id === id)?.display_name ?? null,
      }))
    );

    const { data: mr } = await supabase
      .from("money_requests")
      .select("*")
      .eq("group_id", group.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setRequests((mr ?? []) as MoneyRequest[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id]);

  // Realtime updates
  useEffect(() => {
    if (!group) return;
    const ch = supabase
      .channel(`group-${group.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "money_requests", filter: `group_id=eq.${group.id}` },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_members", filter: `group_id=eq.${group.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !user) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        group_id: group.id,
        invited_by: user.id,
        invitee_name: inviteName.trim() || null,
        email: inviteEmail.trim() || null,
      })
      .select("token")
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message || "Could not create invite");
      return;
    }
    const link = `${window.location.origin}/join/${data.token}`;
    setInviteLink(link);
    toast.success("Invite link ready — share it with your roommate");
  };

  const shareInvite = async () => {
    const inviterName =
      (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "Your roommate";
    const text = `${inviterName} invited you to share expenses on FairShare. Tap to join: ${inviteLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join my FairShare household", text, url: inviteLink });
        return;
      } catch {
        /* user cancelled */
      }
    }
    // Fallback: WhatsApp
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Link copied");
  };

  const emailInvite = () => {
    const inviterName =
      (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "Your roommate";
    const subject = encodeURIComponent(`${inviterName} invited you to FairShare`);
    const body = encodeURIComponent(
      `Hi${inviteName ? " " + inviteName : ""},\n\n${inviterName} invited you to share household expenses on FairShare.\n\nTap this link to join:\n${inviteLink}\n\nSee you there!`
    );
    const to = inviteEmail ? encodeURIComponent(inviteEmail) : "";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const handleMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !user) return;
    const amt = Number(amount);
    if (!toUser || !amt || amt <= 0) {
      toast.error("Pick a roommate and enter a valid amount");
      return;
    }
    const items = itemsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setBusy(true);
    const payload =
      kind === "request"
        ? { group_id: group.id, from_user: toUser, to_user: user.id, amount: amt, kind, note: note || null, trip_date: tripDate || null, items }
        : { group_id: group.id, from_user: user.id, to_user: toUser, amount: amt, kind, status: "completed", note: note || null, trip_date: tripDate || null, items };
    const { error } = await supabase.from("money_requests").insert(payload);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(kind === "request" ? "Request sent to your roommate" : "Payment recorded");
    setAmount("");
    setNote("");
    setTripDate("");
    setItemsText("");
    setMoneyOpen(false);
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("money_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  const nameOf = (uid: string) => {
    if (uid === user?.id) return "You";
    const m = members.find((x) => x.user_id === uid);
    return m?.display_name || "Roommate";
  };

  const otherMembers = members.filter((m) => m.user_id !== user?.id);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Roommates & money</h2>
        <span className="text-xs text-muted-foreground">{members.length} in household</span>
      </div>

      {/* Members chips */}
      <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-soft">
        <div className="flex items-center gap-2 flex-wrap">
          {members.map((m) => (
            <div
              key={m.user_id}
              className="flex items-center gap-2 bg-secondary rounded-full pl-1 pr-3 py-1"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-brand text-primary-foreground text-xs font-bold flex items-center justify-center">
                {(m.display_name || "?")[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-medium">
                {m.user_id === user?.id ? "You" : m.display_name || "Roommate"}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Dialog open={inviteOpen} onOpenChange={(v) => { setInviteOpen(v); if (!v) setInviteLink(""); }}>
            <DialogTrigger asChild>
              <Button variant="hero" className="rounded-full w-full">
                <UserPlus className="h-4 w-4" /> Add roommate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite a roommate</DialogTitle>
                <DialogDescription>
                  They'll join your household and can add expenses, request or send money.
                </DialogDescription>
              </DialogHeader>
              {!inviteLink ? (
                <form onSubmit={handleInvite} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="iname">Roommate's name (optional)</Label>
                    <Input id="iname" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Priya Sharma" className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="iemail">Email (optional)</Label>
                    <Input id="iemail" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="priya@example.com" className="rounded-xl" />
                  </div>
                  <Button type="submit" variant="hero" className="rounded-full w-full" disabled={busy}>
                    Generate invite link
                  </Button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="bg-secondary rounded-xl p-3 text-xs break-all font-mono">{inviteLink}</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button onClick={copyLink} variant="outline" className="rounded-full">
                      <Copy className="h-4 w-4" /> Copy
                    </Button>
                    <Button onClick={shareInvite} variant="outline" className="rounded-full">
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                    <Button onClick={emailInvite} variant="outline" className="rounded-full">
                      <Mail className="h-4 w-4" /> Email
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Once your roommate opens the link and signs up, they'll appear on your dashboard automatically.
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={moneyOpen} onOpenChange={setMoneyOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full w-full" disabled={otherMembers.length === 0}>
                <IndianRupee className="h-4 w-4" /> Request / Send
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request or send money</DialogTitle>
                <DialogDescription>Log a trip, shopping, or any shared spend.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMoney} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant={kind === "request" ? "hero" : "outline"} className="rounded-full" onClick={() => setKind("request")}>
                    <ArrowDownLeft className="h-4 w-4" /> Request
                  </Button>
                  <Button type="button" variant={kind === "send" ? "hero" : "outline"} className="rounded-full" onClick={() => setKind("send")}>
                    <ArrowUpRight className="h-4 w-4" /> Send
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label>{kind === "request" ? "Request from" : "Send to"}</Label>
                  <Select value={toUser} onValueChange={setToUser}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose roommate" /></SelectTrigger>
                    <SelectContent>
                      {otherMembers.map((m) => (
                        <SelectItem key={m.user_id} value={m.user_id}>{m.display_name || "Roommate"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="amt">Amount (₹)</Label>
                    <Input id="amt" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" required className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="td">Date</Label>
                    <Input id="td" type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="note">What's it for?</Label>
                  <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Goa trip, weekly groceries…" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="items">Items (one per line)</Label>
                  <Textarea id="items" value={itemsText} onChange={(e) => setItemsText(e.target.value)} placeholder={"Petrol\nDinner at Cafe\nHotel night 1"} className="rounded-xl min-h-20" />
                </div>
                <Button type="submit" variant="hero" className="rounded-full w-full" disabled={busy}>
                  {kind === "request" ? "Send request" : "Record payment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Money requests list */}
      {requests.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/60 divide-y divide-border/60 overflow-hidden">
          {requests.map((r) => {
            const incomingRequest = r.kind === "request" && r.from_user === user?.id && r.status === "pending";
            const outgoingRequest = r.kind === "request" && r.to_user === user?.id && r.status === "pending";
            return (
              <div key={r.id} className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${r.kind === "send" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {r.kind === "send" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {r.kind === "send"
                        ? `${nameOf(r.from_user)} paid ${nameOf(r.to_user)}`
                        : `${nameOf(r.to_user)} requested from ${nameOf(r.from_user)}`}
                    </p>
                    {r.note && <p className="text-xs text-muted-foreground truncate">{r.note}</p>}
                    {r.trip_date && <p className="text-[11px] text-muted-foreground">{new Date(r.trip_date).toLocaleDateString("en-IN")}</p>}
                    {Array.isArray(r.items) && r.items.length > 0 && (
                      <ul className="text-[11px] text-muted-foreground mt-1 list-disc pl-4">
                        {r.items.slice(0, 3).map((it: string, i: number) => <li key={i}>{it}</li>)}
                      </ul>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">₹{Number(r.amount).toFixed(2)}</p>
                    <p className={`text-[10px] uppercase font-semibold ${r.status === "pending" ? "text-amber-600" : r.status === "approved" || r.status === "completed" ? "text-emerald-600" : "text-muted-foreground"}`}>{r.status}</p>
                  </div>
                </div>
                {incomingRequest && (
                  <p className="text-xs text-muted-foreground">Waiting for {nameOf(r.to_user)} to confirm.</p>
                )}
                {outgoingRequest && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="hero" className="rounded-full" onClick={() => updateStatus(r.id, "approved")}>
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateStatus(r.id, "declined")}>
                      <X className="h-4 w-4" /> Decline
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {requests.length === 0 && otherMembers.length > 0 && (
        <div className="bg-card rounded-2xl border border-dashed border-border p-6 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-sm font-semibold">No money activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">Plan a trip or split a bill — request or send money to your roommate.</p>
        </div>
      )}
    </section>
  );
};
