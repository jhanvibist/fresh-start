import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/fairshare/Logo";
import { Info, ArrowRight, UserPlus, X, Users } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [name, setName] = useState("");
  const [roommates, setRoommates] = useState<string[]>([]);

  const addRoommate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (roommates.includes(trimmed)) {
      toast.error(`${trimmed} is already added`);
      return;
    }
    setRoommates((r) => [...r, trimmed]);
    setName("");
    toast.success(`${trimmed} added`);
  };

  const remove = (n: string) => setRoommates((r) => r.filter((x) => x !== n));

  return (
    <main className="min-h-screen bg-gradient-hero flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center">
        {/* Logo centered */}
        <div className="mb-10 mt-4 animate-scale-in">
          <Logo className="h-24 mx-auto" />
        </div>

        {/* Welcome card */}
        <div className="w-full bg-card rounded-3xl shadow-card border border-border/60 p-7 animate-fade-up">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome to FairShare
          </h1>
          <p className="text-sm text-muted-foreground mb-7">
            Namaste! Split expenses fairly with your roommates and friends.
          </p>

          <div className="flex flex-col gap-3">
            <Button asChild variant="hero" size="lg" className="w-full rounded-full">
              <Link to="/auth?mode=signup">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="soft" size="lg" className="w-full rounded-full">
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>

        {/* Add my roommate section */}
        <div className="w-full mt-6 bg-card rounded-3xl shadow-card border border-border/60 p-6 text-left animate-fade-up">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Add my roommate
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Quickly list flatmates to split finances with. Sign up to save them.
          </p>

          <form onSubmit={addRoommate} className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav"
              className="rounded-full"
              maxLength={30}
            />
            <Button
              type="submit"
              variant="hero"
              size="icon"
              className="rounded-full flex-shrink-0"
              aria-label="Add roommate"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </form>

          {roommates.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {roommates.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-secondary border border-border/60 text-xs font-medium text-foreground"
                >
                  {r}
                  <button
                    type="button"
                    onClick={() => remove(r)}
                    className="h-5 w-5 rounded-full hover:bg-background flex items-center justify-center"
                    aria-label={`Remove ${r}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {roommates.length >= 2 && (
            <p className="mt-4 text-[11px] text-muted-foreground">
              Splitting equally between <span className="font-semibold text-foreground">{roommates.length}</span> people — sign up to start tracking expenses.
            </p>
          )}
        </div>

        {/* Settlement info note */}
        <div className="w-full mt-6 bg-secondary/60 border border-border/60 rounded-2xl p-4 flex gap-3 text-left animate-fade-up">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">
              How group settlements work
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All amounts are tracked in <span className="font-semibold text-foreground">₹ (INR)</span>.
              Expenses are split equally by default — say Aarav pays ₹900 for three friends,
              each owes ₹300. We auto-calculate balances so settling up is just one tap.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-6">
          Made for sharing — Aarav, Priya, Rohan & you.
        </p>
      </div>
    </main>
  );
};

export default Index;
