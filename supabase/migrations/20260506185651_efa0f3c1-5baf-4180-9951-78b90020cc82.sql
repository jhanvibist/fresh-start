
CREATE TABLE public.roommate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  created_by uuid NOT NULL,
  name text NOT NULL,
  email text,
  avatar_url text,
  color text DEFAULT 'primary',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.roommate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view roommate_profiles" ON public.roommate_profiles
  FOR SELECT TO authenticated USING (public.is_group_member(group_id, auth.uid()));
CREATE POLICY "Members insert roommate_profiles" ON public.roommate_profiles
  FOR INSERT TO authenticated WITH CHECK (public.is_group_member(group_id, auth.uid()) AND created_by = auth.uid());
CREATE POLICY "Members update roommate_profiles" ON public.roommate_profiles
  FOR UPDATE TO authenticated USING (public.is_group_member(group_id, auth.uid()));
CREATE POLICY "Members delete roommate_profiles" ON public.roommate_profiles
  FOR DELETE TO authenticated USING (public.is_group_member(group_id, auth.uid()));

CREATE TRIGGER update_roommate_profiles_updated_at
  BEFORE UPDATE ON public.roommate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.money_requests
  ADD COLUMN roommate_profile_id uuid,
  ADD COLUMN split_with jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN category text NOT NULL DEFAULT 'general';

INSERT INTO storage.buckets (id, name, public)
VALUES ('roommate-avatars', 'roommate-avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Roommate avatars are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'roommate-avatars');
CREATE POLICY "Authed users upload roommate avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'roommate-avatars');
CREATE POLICY "Authed users update roommate avatars" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'roommate-avatars');
CREATE POLICY "Authed users delete roommate avatars" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'roommate-avatars');
