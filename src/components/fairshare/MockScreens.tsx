import {
  Home,
  PlusCircle,
  ListChecks,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Zap,
  Wifi,
  Check,
  Users,
  Bell,
} from "lucide-react";

const NavBar = ({ active }: { active: number }) => {
  const items = [Home, ListChecks, PlusCircle, BarChart3, Wallet];
  return (
    <div className="absolute bottom-0 inset-x-0 bg-card border-t border-border px-4 py-3 flex justify-between items-center">
      {items.map((Icon, i) => (
        <div
          key={i}
          className={`p-2 rounded-full ${
            i === active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      ))}
    </div>
  );
};

const TopBar = ({ title }: { title: string }) => (
  <div className="flex items-center justify-between px-4 pt-5 pb-2 text-[10px] font-semibold text-foreground">
    <span>9:41</span>
    <span className="text-muted-foreground">{title}</span>
    <div className="flex gap-1 items-center">
      <Wifi className="h-2.5 w-2.5" />
      <div className="w-3 h-1.5 border border-foreground rounded-sm" />
    </div>
  </div>
);

/* 1. Dashboard */
export const DashboardScreen = () => (
  <div className="h-full w-full bg-gradient-soft flex flex-col">
    <TopBar title="Apt 4B" />
    <div className="px-4 py-2">
      <p className="text-[10px] text-muted-foreground">Welcome back,</p>
      <h3 className="text-sm font-bold text-foreground">Hey Alex 👋</h3>
    </div>

    <div className="mx-4 rounded-2xl bg-gradient-brand p-3 text-primary-foreground shadow-card">
      <p className="text-[9px] opacity-80">Your balance</p>
      <p className="text-xl font-bold">+₹4,820</p>
      <p className="text-[9px] opacity-80 mt-1">You're owed by 2 roommates</p>
    </div>

    <div className="px-4 mt-3">
      <div className="bg-card rounded-2xl p-3 shadow-soft border border-border/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold">Fairness Score</span>
          <span className="text-[10px] font-bold text-primary">87%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-brand rounded-full" style={{ width: "87%" }} />
        </div>
      </div>
    </div>

    <div className="px-4 mt-3 flex-1 overflow-hidden">
      <p className="text-[10px] font-semibold mb-2 text-muted-foreground">Recent activity</p>
      <div className="space-y-2">
        {[
          { icon: ShoppingCart, label: "Groceries", who: "Sam paid", amt: "₹1,250", up: true },
          { icon: Zap, label: "Electric bill", who: "You paid", amt: "₹2,400", up: false },
          { icon: Wifi, label: "Wifi", who: "Jamie paid", amt: "₹999", up: true },
        ].map((it, i) => (
          <div key={i} className="flex items-center gap-2 bg-card rounded-xl p-2 border border-border/60">
            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
              <it.icon className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold">{it.label}</p>
              <p className="text-[8px] text-muted-foreground">{it.who}</p>
            </div>
            <div className={`flex items-center gap-0.5 text-[10px] font-bold ${it.up ? "text-primary" : "text-foreground"}`}>
              {it.up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
              {it.amt}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="h-16" />
    <NavBar active={0} />
  </div>
);

/* 2. Add Expense */
export const ExpenseScreen = () => (
  <div className="h-full w-full bg-background flex flex-col">
    <TopBar title="Add Expense" />
    <div className="px-4 mt-2">
      <h3 className="text-sm font-bold">New expense</h3>
      <p className="text-[9px] text-muted-foreground">Split fairly with your group</p>
    </div>
    <div className="px-4 mt-4 text-center">
      <p className="text-[10px] text-muted-foreground">Amount</p>
      <p className="text-3xl font-bold text-foreground mt-1">
        <span className="text-primary">₹</span>1,250<span className="text-muted-foreground">.00</span>
      </p>
    </div>
    <div className="mx-4 mt-3 space-y-2">
      <div className="bg-secondary rounded-xl px-3 py-2 text-[10px] font-semibold flex items-center justify-between">
        <span>🛒 Groceries</span>
        <span className="text-muted-foreground">Category</span>
      </div>
      <div className="bg-secondary rounded-xl px-3 py-2 text-[10px] font-semibold flex items-center justify-between">
        <span>Paid by you</span>
        <div className="h-5 w-5 rounded-full bg-gradient-brand" />
      </div>
    </div>
    <div className="px-4 mt-4">
      <p className="text-[10px] font-semibold mb-2">Split equally between</p>
      <div className="flex gap-2">
        {["A", "S", "J", "K"].map((n, i) => (
          <div key={i} className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              {n}
            </div>
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
              <Check className="h-2 w-2 text-primary-foreground" strokeWidth={4} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground mt-2">₹312.50 each</p>
    </div>
    <div className="flex-1" />
    <div className="px-4 pb-20">
      <button className="w-full bg-gradient-brand text-primary-foreground rounded-full py-2.5 text-[11px] font-semibold shadow-glow">
        Save expense
      </button>
    </div>
    <NavBar active={2} />
  </div>
);

/* 3. Chore Board */
export const ChoresScreen = () => (
  <div className="h-full w-full bg-gradient-soft flex flex-col">
    <TopBar title="Chores" />
    <div className="px-4 py-2 flex items-center justify-between">
      <h3 className="text-sm font-bold">Chore board</h3>
      <Bell className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
    <div className="px-4 flex gap-2 text-[9px] font-semibold mb-2">
      <span className="px-2 py-1 rounded-full bg-foreground text-background">This week</span>
      <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">All</span>
    </div>
    <div className="px-4 space-y-2 flex-1">
      {[
        { task: "Dishes", who: "Sam", color: "bg-primary", done: true },
        { task: "Take out trash", who: "Jamie", color: "bg-brand-mint", done: false },
        { task: "Vacuum living room", who: "You", color: "bg-gradient-brand", done: false },
        { task: "Laundry", who: "Kai", color: "bg-secondary", done: true },
        { task: "Clean kitchen", who: "Sam", color: "bg-primary", done: false },
      ].map((c, i) => (
        <div key={i} className="bg-card rounded-xl p-2.5 border border-border/60 flex items-center gap-2 shadow-soft">
          <div className={`h-7 w-7 rounded-full ${c.color} flex items-center justify-center text-[10px] font-bold text-primary-foreground`}>
            {c.who[0]}
          </div>
          <div className="flex-1">
            <p className={`text-[10px] font-semibold ${c.done ? "line-through text-muted-foreground" : ""}`}>
              {c.task}
            </p>
            <p className="text-[8px] text-muted-foreground">{c.who}</p>
          </div>
          <div className={`h-4 w-4 rounded-full border-2 ${c.done ? "bg-primary border-primary" : "border-border"} flex items-center justify-center`}>
            {c.done && <Check className="h-2 w-2 text-primary-foreground" strokeWidth={4} />}
          </div>
        </div>
      ))}
    </div>
    <div className="h-16" />
    <NavBar active={1} />
  </div>
);

/* 4. Insights */
export const InsightsScreen = () => (
  <div className="h-full w-full bg-background flex flex-col">
    <TopBar title="Insights" />
    <div className="px-4 py-2">
      <h3 className="text-sm font-bold">This month</h3>
      <p className="text-[9px] text-muted-foreground">Your fairness breakdown</p>
    </div>

    <div className="mx-4 mt-2 rounded-2xl bg-gradient-brand p-3 text-primary-foreground">
      <p className="text-[9px] opacity-80">Total contribution</p>
      <p className="text-xl font-bold">₹32,480</p>
      <p className="text-[9px] opacity-80">+12% vs last month</p>
    </div>

    <div className="px-4 mt-3">
      <p className="text-[10px] font-semibold mb-2">Spending by category</p>
      <div className="flex items-end gap-2 h-20">
        {[
          { h: 70, c: "bg-primary", l: "Food" },
          { h: 45, c: "bg-brand-mint", l: "Bills" },
          { h: 90, c: "bg-primary", l: "Rent" },
          { h: 30, c: "bg-brand-mint", l: "Fun" },
          { h: 55, c: "bg-primary", l: "Misc" },
        ].map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full rounded-t-md ${b.c}`} style={{ height: `${b.h}%` }} />
            <span className="text-[8px] text-muted-foreground">{b.l}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="px-4 mt-3 space-y-2">
      <p className="text-[10px] font-semibold">Contribution split</p>
      {[
        { name: "You", pct: 28, color: "bg-primary" },
        { name: "Sam", pct: 26, color: "bg-brand-mint" },
        { name: "Jamie", pct: 24, color: "bg-primary/70" },
        { name: "Kai", pct: 22, color: "bg-brand-mint/70" },
      ].map((p, i) => (
        <div key={i}>
          <div className="flex justify-between text-[9px] font-semibold mb-1">
            <span>{p.name}</span>
            <span className="text-muted-foreground">{p.pct}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct * 3}%` }} />
          </div>
        </div>
      ))}
    </div>

    <div className="flex-1" />
    <NavBar active={3} />
  </div>
);

/* 5. Settlement */
export const SettleScreen = () => (
  <div className="h-full w-full bg-gradient-soft flex flex-col">
    <TopBar title="Settle" />
    <div className="px-4 py-2">
      <h3 className="text-sm font-bold">Settle up</h3>
      <p className="text-[9px] text-muted-foreground">Smart suggestions to balance</p>
    </div>

    <div className="px-4 mt-2 space-y-2 flex-1">
      {[
        { from: "Sam", to: "You", amt: "₹2,450", color: "bg-primary" },
        { from: "Jamie", to: "You", amt: "₹1,800", color: "bg-brand-mint" },
        { from: "You", to: "Kai", amt: "₹1,220", color: "bg-gradient-brand" },
      ].map((s, i) => (
        <div key={i} className="bg-card rounded-2xl p-3 border border-border/60 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-7 w-7 rounded-full ${s.color} flex items-center justify-center text-[10px] font-bold text-primary-foreground`}>
              {s.from[0]}
            </div>
            <span className="text-[10px] font-semibold">{s.from}</span>
            <ArrowUpRight className="h-3 w-3 text-muted-foreground rotate-45" />
            <span className="text-[10px] font-semibold">{s.to}</span>
            <span className="ml-auto text-[11px] font-bold text-primary">{s.amt}</span>
          </div>
          <button className="w-full bg-secondary text-secondary-foreground rounded-full py-1.5 text-[10px] font-semibold hover:bg-accent transition-smooth">
            Settle now
          </button>
        </div>
      ))}

      <div className="bg-gradient-brand rounded-2xl p-3 text-primary-foreground text-center">
        <Users className="h-4 w-4 mx-auto mb-1" />
        <p className="text-[10px] font-semibold">All settled? You'll get a fairness boost ✨</p>
      </div>
    </div>

    <NavBar active={4} />
  </div>
);
