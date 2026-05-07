import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveGroup } from "@/hooks/useActiveGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Plus, Camera, Users } from "lucide-react";
import { toast } from "sonner";

const EMOJI_AVATARS = ["👩", "👨", "🧑", "👧", "👦", "🦸", "🧕", "👩‍🎓", "👨‍🎓", "🐱", "🐶", "🦊"];

type Roommate = {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
};

export const RoommateSection = () => {
  const { user } = useAuth();
  const { group } = useActiveGroup();
  const navigate = useNavigate();
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string>("👩");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!group) return;
    const { data } = await supabase
      .from("roommate_profiles")
      .select("id, name, email, avatar_url")
      .eq("group_id", group.id)
      .order("created_at");
    setRoommates((data ?? []) as Roommate[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id]);

  useEffect(() => {
    if (!group) return;
    const ch = supabase
      .channel(`rmp-${group.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "roommate_profiles", filter: `group_id=eq.${group.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id]);

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setName("");
    setEmail("");
    setAvatar("👩");
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !user || !name.trim()) return;
    setBusy(true);
    let avatar_url: string | null = avatar;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("roommate-avatars").upload(path, photoFile);
      if (upErr) {
        setBusy(false);
        toast.error(upErr.message);
        return;
      }
      const { data: pub } = supabase.storage.from("roommate-avatars").getPublicUrl(path);
      avatar_url = pub.publicUrl;
    }
    const { data: inserted, error } = await supabase
      .from("roommate_profiles")
      .insert({
        group_id: group.id,
        created_by: user.id,
        name: name.trim(),
        email: email.trim() || null,
        avatar_url,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error || !inserted) {
      console.error(error);
      toast.error(error?.message || "Could not save roommate");
      return;
    }
    toast.success(`${name.trim()} added — opening their profile`);
    reset();
    setOpen(false);
    load();
    navigate(`/app/roommate/${inserted.id}`);
  };

  const isPhoto = (a: string | null) => !!a && (a.startsWith("http") || a.startsWith("blob:"));

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">My roommates</h2>
        <span className="text-xs text-muted-foreground">{roommates.length} added</span>
      </div>

      <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-soft">
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
          {/* You */}
          <div className="flex flex-col items-center shrink-0 w-16 snap-start">
            <div className="h-14 w-14 rounded-full bg-gradient-brand text-primary-foreground flex items-center justify-center font-bold ring-2 ring-primary/20">
              {(user?.user_metadata?.display_name as string)?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "Y"}
            </div>
            <span className="text-[11px] mt-1 font-medium">You</span>
          </div>

          {roommates.map((r) => (
            <Link
              key={r.id}
              to={`/app/roommate/${r.id}`}
              className="flex flex-col items-center shrink-0 w-16 snap-start group"
            >
              <div className="h-14 w-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-2xl ring-2 ring-transparent group-hover:ring-primary/40 transition">
                {isPhoto(r.avatar_url) ? (
                  <img src={r.avatar_url!} alt={r.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{r.avatar_url || "👤"}</span>
                )}
              </div>
              <span className="text-[11px] mt-1 font-medium truncate w-full text-center">{r.name}</span>
            </Link>
          ))}

          {/* Add */}
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
              <button className="flex flex-col items-center shrink-0 w-16 snap-start">
                <div className="h-14 w-14 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-[11px] mt-1 font-medium">Add</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a roommate</DialogTitle>
                <DialogDescription>Save them to your household. No verification needed.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                {/* Avatar picker */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="h-20 w-20 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-3xl relative group"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <span>{avatar}</span>
                    )}
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Camera className="h-5 w-5 text-white" />
                    </span>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} hidden />
                  <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
                    {EMOJI_AVATARS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => { setAvatar(e); setPhotoFile(null); setPhotoPreview(null); }}
                        className={`h-8 w-8 rounded-full text-lg flex items-center justify-center ${avatar === e && !photoPreview ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary"}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rname">Name</Label>
                  <Input id="rname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" required className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="remail">Email (optional)</Label>
                  <Input id="remail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="priya@example.com" className="rounded-xl" />
                </div>

                <Button type="submit" variant="hero" className="rounded-full w-full" disabled={busy || !name.trim()}>
                  <UserPlus className="h-4 w-4" /> Add roommate
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {roommates.length === 0 && (
          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>Add your roommates to start tracking trips, rent and shared bills together.</p>
          </div>
        )}
      </div>
    </section>
  );
};
