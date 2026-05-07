import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/fairshare/Logo";
import { Info, ArrowRight } from "lucide-react";

const Index = () => {
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
