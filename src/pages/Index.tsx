import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/fairshare/Logo";
import { Navbar } from "@/components/fairshare/Navbar";
import { PhoneFrame } from "@/components/fairshare/PhoneFrame";
import {
  DashboardScreen,
  ExpenseScreen,
  ChoresScreen,
  InsightsScreen,
  SettleScreen,
} from "@/components/fairshare/MockScreens";
import heroImg from "@/assets/hero-roommates.png";
import {
  ArrowRight,
  Sparkles,
  Receipt,
  ListChecks,
  Frown,
  Scale,
  Lightbulb,
  Bell,
  PieChart,
  Wallet,
  Calendar,
  Star,
  Check,
  X,
  Twitter,
  Instagram,
  Github,
  Linkedin,
  Download,
  Smartphone,
} from "lucide-react";

const Section = ({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) => (
  <section id={id} className={`py-20 md:py-28 ${className}`}>
    <div className="container mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-secondary px-3 py-1 rounded-full mb-4">
            <Sparkles className="h-3 w-3" /> {eyebrow}
          </span>
        )}
        <h2 className="text-3xl md:text-5xl font-bold text-foreground">{title}</h2>
        {subtitle && (
          <p className="mt-4 text-base md:text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  </section>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-hero">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-secondary px-3 py-1 rounded-full mb-5">
              <Sparkles className="h-3 w-3" /> Shared living, simplified
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-foreground">
              Shared living, <br />
              <span className="text-gradient-brand">made fair.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Track expenses, split chores, and maintain fairness effortlessly — all in one beautifully simple app.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl" className="group">
                <Link to="/auth?mode=signup">
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-smooth group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="soft" size="xl">
                <Link to="/auth">Try Demo</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["bg-gradient-brand", "bg-brand-mint", "bg-primary", "bg-secondary"].map((c, i) => (
                  <div key={i} className={`h-9 w-9 rounded-full ${c} border-2 border-background`} />
                ))}
              </div>
              <div>
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">10,000+ happy roommates</p>
              </div>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-brand opacity-20 blur-3xl rounded-full" />
            <div className="relative">
              <img
                src={heroImg}
                alt="Friendly roommates sharing living space"
                width={1024}
                height={1024}
                className="w-full h-auto max-w-md mx-auto block"
              />
              <div className="absolute bottom-6 left-0 bg-card rounded-2xl shadow-card p-3 flex items-center gap-2 border border-border/60 animate-float">
                <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center">
                  <Scale className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Fairness</p>
                  <p className="text-sm font-bold text-primary">87%</p>
                </div>
              </div>
              <div className="absolute top-6 right-0 bg-card rounded-2xl shadow-card p-3 flex items-center gap-2 border border-border/60 animate-float" style={{ animationDelay: "1.5s" }}>
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Settled</p>
                  <p className="text-sm font-bold text-foreground">All done!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <Section
        eyebrow="The problem"
        title="Roommate life is messy."
        subtitle="Splitting bills, chasing payments, and remembering whose turn it is — it adds up to friction."
      >
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Receipt, title: "Confusing expenses", text: "Who paid for what? Spreadsheets and screenshots only get you so far." },
            { icon: ListChecks, title: "Unfair chores", text: "One person ends up doing way more than their share — and resentment builds." },
            { icon: Frown, title: "Awkward conflicts", text: "Money + chores = the #1 cause of roommate drama. Don't let it ruin friendships." },
          ].map((p, i) => (
            <div
              key={i}
              className="bg-card rounded-3xl p-7 border border-border/60 shadow-soft hover:shadow-card hover:-translate-y-1 transition-bounce"
            >
              <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SOLUTION */}
      <Section
        id="how"
        eyebrow="How it works"
        title="One app. Total harmony."
        subtitle="FairShare brings expenses, chores, and contribution into a single, transparent system."
        className="bg-gradient-soft"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Wallet, title: "Smart expense tracking", text: "Split equally or by share — automatic math, zero arguments." },
            { icon: ListChecks, title: "Chore management", text: "Assign, rotate, and check off chores from one shared board." },
            { icon: Scale, title: "Fairness Score", text: "A live indicator of how balanced your household really is." },
            { icon: Lightbulb, title: "Settlement suggestions", text: "We'll tell you the simplest way to settle up. One tap, done." },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-card rounded-3xl p-6 border border-border/60 shadow-soft hover:shadow-card hover:-translate-y-1 transition-bounce"
            >
              <div className="h-11 w-11 rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 shadow-glow">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* USP - Fairness Score */}
      <Section
        eyebrow="Our secret sauce"
        title="The Fairness Score."
        subtitle="It's not just about money. We measure money, chores, and time — together — so everyone knows where they stand."
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="bg-gradient-brand rounded-[2rem] p-8 md:p-10 text-primary-foreground shadow-glow">
            <p className="text-sm opacity-80 mb-2">Apt 4B Fairness Score</p>
            <div className="flex items-end gap-2 mb-6">
              <p className="text-6xl md:text-7xl font-bold">87<span className="text-3xl">%</span></p>
              <span className="text-xs bg-primary-foreground/20 rounded-full px-2 py-1 mb-3">+4% this week</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "💰 Money", v: 92 },
                { label: "🧹 Chores", v: 84 },
                { label: "⏱️ Time", v: 85 },
              ].map((b, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span>{b.label}</span>
                    <span className="font-bold">{b.v}%</span>
                  </div>
                  <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-foreground rounded-full transition-all duration-700"
                      style={{ width: `${b.v}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {[
              { t: "See it at a glance", d: "One number summarizes how balanced your household is — no more guessing." },
              { t: "Stay accountable", d: "Each roommate sees their personal score. Transparent, never judgmental." },
              { t: "Build better habits", d: "Watch your score climb as everyone pitches in. Friendly nudges, never nagging." },
            ].map((it, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">{it.t}</h4>
                  <p className="text-sm text-muted-foreground">{it.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* KEY FEATURES GRID */}
      <Section
        id="features"
        eyebrow="Everything you need"
        title="Built for real shared living."
        subtitle="Powerful features wrapped in a simple, calm interface."
        className="bg-gradient-soft"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Wallet, title: "Expense splitting", text: "Equal, unequal, or by percentage — split however your group needs." },
            { icon: ListChecks, title: "Chore board", text: "Visual kanban-style board with rotation and reminders." },
            { icon: PieChart, title: "Real-time balances", text: "Always know who owes whom — updated the moment expenses change." },
            { icon: Sparkles, title: "Insights & analytics", text: "Monthly trends, top categories, and contribution breakdowns." },
            { icon: Bell, title: "Smart reminders", text: "Friendly nudges so nothing falls through the cracks." },
            { icon: Calendar, title: "Recurring bills", text: "Set rent, wifi, and utilities once. We'll handle the rest." },
          ].map((f, i) => (
            <div
              key={i}
              className="group bg-card rounded-3xl p-6 border border-border/60 hover:border-primary/40 hover:shadow-card transition-bounce"
            >
              <div className="h-12 w-12 rounded-2xl bg-secondary group-hover:bg-gradient-brand flex items-center justify-center mb-4 transition-smooth">
                <f.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-smooth" />
              </div>
              <h3 className="font-bold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* APP SCREENS SHOWCASE */}
      <Section
        eyebrow="Inside the app"
        title="Designed to feel calm."
        subtitle="Every screen is crafted for clarity. No clutter, just what you need."
      >
        <div className="flex gap-8 md:gap-10 overflow-x-auto overflow-y-visible pt-6 pb-10 px-2 -mx-2 snap-x snap-mandatory">
          {[
            { c: <DashboardScreen />, label: "Dashboard" },
            { c: <ExpenseScreen />, label: "Add Expense" },
            { c: <ChoresScreen />, label: "Chore Board" },
            { c: <InsightsScreen />, label: "Insights" },
            { c: <SettleScreen />, label: "Settlement" },
          ].map((s, i) => (
            <div key={i} className="flex-shrink-0 snap-center">
              <PhoneFrame className="hover:-translate-y-2 transition-bounce">{s.c}</PhoneFrame>
              <p className="text-center text-sm font-semibold mt-5 text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* USER JOURNEY */}
      <Section
        eyebrow="How to start"
        title="Up and running in minutes."
        className="bg-gradient-soft"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-6 relative">
            {[
              "Create your group",
              "Invite roommates",
              "Track expenses & chores",
              "Get fairness insights",
              "Settle effortlessly",
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="h-14 w-14 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-glow">
                  {i + 1}
                </div>
                <p className="text-sm font-semibold">{step}</p>
                {i < 4 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] right-[-1rem] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* WHY FAIRSHARE - COMPARISON */}
      <Section
        id="why"
        eyebrow="Why FairShare"
        title="More than a money app."
        subtitle="Other apps stop at expenses. We track the full picture of shared living."
      >
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl p-7 border border-border shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Other apps</p>
            <ul className="space-y-3">
              {["Tracks money only", "No chore management", "Manual settlement math", "No fairness measurement", "Generic UI"].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-destructive flex-shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-brand rounded-3xl p-7 text-primary-foreground shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-4">FairShare</p>
            <ul className="space-y-3">
              {["Money + chores + time", "Visual chore board", "Smart auto-settlement", "Live Fairness Score", "Calm, beautiful design"].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium">
                  <Check className="h-4 w-4 flex-shrink-0" strokeWidth={3} /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section
        id="reviews"
        eyebrow="Loved by roommates"
        title="Less drama. More chill."
        className="bg-gradient-soft"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Maya R.",
              role: "Grad student, NYU",
              text: "We went from passive-aggressive sticky notes to actually liking each other again. The Fairness Score is genius.",
              color: "bg-gradient-brand",
            },
            {
              name: "Jordan K.",
              role: "Software engineer",
              text: "Finally a roommate app that doesn't feel like a spreadsheet. Settling up is one tap and we never argue about chores anymore.",
              color: "bg-brand-mint",
            },
            {
              name: "Priya S.",
              role: "College senior",
              text: "Three roommates, zero conflicts this semester. FairShare is the unsung hero of our apartment.",
              color: "bg-primary",
            },
          ].map((t, i) => (
            <div key={i} className="bg-card rounded-3xl p-7 border border-border/60 shadow-soft hover:shadow-card transition-smooth">
              <div className="flex text-primary mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center text-primary-foreground font-bold`}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto">
          <div className="relative bg-gradient-brand rounded-[2.5rem] p-10 md:p-16 text-center text-primary-foreground shadow-glow overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Start living smarter <br className="hidden md:block" /> with FairShare.
              </h2>
              <p className="text-base md:text-lg opacity-90 max-w-xl mx-auto mb-8">
                Join thousands of roommates who've made shared living calmer, fairer, and friendlier.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="xl" className="rounded-full bg-background text-foreground hover:bg-background/90 shadow-card font-semibold">
                  <Link to="/auth?mode=signup"><Smartphone className="h-4 w-4" /> Sign up free</Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="rounded-full bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold">
                  <Link to="/auth"><Download className="h-4 w-4" /> Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto py-14">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <Logo className="h-8 mb-4" />
              <p className="text-sm text-muted-foreground max-w-xs">
                Shared living, made fair. Track expenses, split chores, stay friends.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "How it works", "Pricing", "Download"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Support", links: ["Help center", "Privacy", "Terms", "Status"] },
            ].map((col, i) => (
              <div key={i}>
                <p className="font-bold mb-4 text-sm">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row gap-4 items-center justify-between">
            <p className="text-xs text-muted-foreground">© 2025 FairShare. All rights reserved.</p>
            <div className="flex gap-2">
              {[Twitter, Instagram, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-full bg-secondary hover:bg-gradient-brand text-primary hover:text-primary-foreground flex items-center justify-center transition-smooth"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
