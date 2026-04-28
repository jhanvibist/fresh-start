-- FairShare core schema
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  paid_by UUID NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.expense_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.chores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assigned_to UUID,
  due_date DATE,
  done BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  from_user UUID NOT NULL,
  to_user UUID NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.create_profile_for_current_user(_display_name TEXT DEFAULT NULL, _avatar_url TEXT DEFAULT NULL)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile public.profiles;
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    auth.uid(),
    COALESCE(NULLIF(trim(_display_name), ''), split_part(COALESCE(auth.email(), 'user'), '@', 1)),
    _avatar_url
  )
  ON CONFLICT (user_id) DO UPDATE
    SET display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = now()
  RETURNING * INTO _profile;

  RETURN _profile;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_groups_updated ON public.groups;
CREATE TRIGGER trg_groups_updated
BEFORE UPDATE ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_expenses_updated ON public.expenses;
CREATE TRIGGER trg_expenses_updated
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_chores_updated ON public.chores;
CREATE TRIGGER trg_chores_updated
BEFORE UPDATE ON public.chores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members view their groups" ON public.groups;
CREATE POLICY "Members view their groups"
ON public.groups FOR SELECT TO authenticated
USING (public.is_group_member(id, auth.uid()));

DROP POLICY IF EXISTS "Users create groups" ON public.groups;
CREATE POLICY "Users create groups"
ON public.groups FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators update groups" ON public.groups;
CREATE POLICY "Creators update groups"
ON public.groups FOR UPDATE TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Members view group_members" ON public.group_members;
CREATE POLICY "Members view group_members"
ON public.group_members FOR SELECT TO authenticated
USING (public.is_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "Users add themselves or creator adds" ON public.group_members;
CREATE POLICY "Users add themselves or creator adds"
ON public.group_members FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.created_by = auth.uid())
);

DROP POLICY IF EXISTS "Users remove themselves" ON public.group_members;
CREATE POLICY "Users remove themselves"
ON public.group_members FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members view expenses" ON public.expenses;
CREATE POLICY "Members view expenses"
ON public.expenses FOR SELECT TO authenticated
USING (public.is_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "Members add expenses" ON public.expenses;
CREATE POLICY "Members add expenses"
ON public.expenses FOR INSERT TO authenticated
WITH CHECK (public.is_group_member(group_id, auth.uid()) AND auth.uid() = paid_by);

DROP POLICY IF EXISTS "Payer updates own expense" ON public.expenses;
CREATE POLICY "Payer updates own expense"
ON public.expenses FOR UPDATE TO authenticated
USING (auth.uid() = paid_by);

DROP POLICY IF EXISTS "Payer deletes own expense" ON public.expenses;
CREATE POLICY "Payer deletes own expense"
ON public.expenses FOR DELETE TO authenticated
USING (auth.uid() = paid_by);

DROP POLICY IF EXISTS "Members view splits" ON public.expense_splits;
CREATE POLICY "Members view splits"
ON public.expense_splits FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.expenses e
  WHERE e.id = expense_id AND public.is_group_member(e.group_id, auth.uid())
));

DROP POLICY IF EXISTS "Members create splits" ON public.expense_splits;
CREATE POLICY "Members create splits"
ON public.expense_splits FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.expenses e
  WHERE e.id = expense_id AND public.is_group_member(e.group_id, auth.uid())
));

DROP POLICY IF EXISTS "Payer deletes splits" ON public.expense_splits;
CREATE POLICY "Payer deletes splits"
ON public.expense_splits FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.expenses e
  WHERE e.id = expense_id AND e.paid_by = auth.uid()
));

DROP POLICY IF EXISTS "Members view chores" ON public.chores;
CREATE POLICY "Members view chores"
ON public.chores FOR SELECT TO authenticated
USING (public.is_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "Members add chores" ON public.chores;
CREATE POLICY "Members add chores"
ON public.chores FOR INSERT TO authenticated
WITH CHECK (public.is_group_member(group_id, auth.uid()) AND auth.uid() = created_by);

DROP POLICY IF EXISTS "Members update chores" ON public.chores;
CREATE POLICY "Members update chores"
ON public.chores FOR UPDATE TO authenticated
USING (public.is_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "Members delete chores" ON public.chores;
CREATE POLICY "Members delete chores"
ON public.chores FOR DELETE TO authenticated
USING (public.is_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "Members view settlements" ON public.settlements;
CREATE POLICY "Members view settlements"
ON public.settlements FOR SELECT TO authenticated
USING (public.is_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "Members add settlements" ON public.settlements;
CREATE POLICY "Members add settlements"
ON public.settlements FOR INSERT TO authenticated
WITH CHECK (public.is_group_member(group_id, auth.uid()) AND (auth.uid() = from_user OR auth.uid() = to_user));

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON public.expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_chores_group_id ON public.chores(group_id);
CREATE INDEX IF NOT EXISTS idx_settlements_group_id ON public.settlements(group_id);