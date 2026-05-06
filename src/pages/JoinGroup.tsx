import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/fairshare/Logo";
import { Loader2, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const JoinGroup = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [invite, setInvite] = useState<any>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [inviterName, setInviterName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Stash token then send to /auth
      sessionStorage.setItem("pendingInviteToken", token || "");
      navigate(`/auth?next=/join/${token}`);
      return;
    }
    (async () => {
      const { data: inv } = await supabase
        .from("invitations")
        .select("id, group_id, invited_by, invitee_name, status, expires_at")
        .eq("token", token)
        .maybeSingle();
      if (!inv) {
        setLoading(false);
        return;
      }
      setInvite(inv);
      const [{ data: g }, { data: p }] = await Promise.all([
        supabase.from("groups").select("name").eq("id", inv.group_id).maybeSingle(),
        supabase.from("profiles").select("display_name").eq("user_id", inv.invited_by).maybeSingle(),
      ]);
      setGroupName(g?.name || "your roommate's household");
      setInviterName(p?.display_name || "Your roommate");
      setLoading(false);
    })();
  }, [token, user, authLoading, navigate]);

  const accept = async () => {
    if (!invite || !user) return;
    setJoining(true);
    // Already a member?
    const { data: existing } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", invite.group_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!existing) {
      const { error } = await supabase
        .from("group_members")
        .insert({ group_id: invite.group_id, user_id: user.id });
      if (error) {
        toast.error(error.message);
        setJoining(false);
        return;
      }
    }
    await supabase
      .from("invitations")
      .update({ status: "accepted", accepted_by: user.id, accepted_at: new Date().toISOString() })
      .eq("id", invite.id);
    setDone(true);
    setJoining(false);
    setTimeout(() => navigate("/app"), 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-card rounded-3xl border border-border/60 shadow-card p-6 text-center space-y-5">
        <Logo className="h-8 mx-auto" />
        {!invite ? (
          <>
            <p className="text-sm">This invite link is invalid or has expired.</p>
            <Button onClick={() => navigate("/")} variant="hero" className="rounded-full w-full">
              Go home
            </Button>
          </>
        ) : done ? (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="font-semibold">You're in! Taking you to the dashboard…</p>
          </>
        ) : (
          <>
            <div className="h-14 w-14 rounded-2xl bg-gradient-brand mx-auto flex items-center justify-center">
              <Users className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Join {groupName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {inviterName} invited you to share expenses, split bills, and request money together.
              </p>
            </div>
            <Button onClick={accept} disabled={joining} variant="hero" className="rounded-full w-full">
              {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept invite"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinGroup;
