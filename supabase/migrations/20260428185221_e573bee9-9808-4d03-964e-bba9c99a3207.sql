CREATE OR REPLACE FUNCTION public.is_group_creator(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = _group_id AND created_by = _user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_group_creator(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_group_creator(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.is_group_creator(UUID, UUID) FROM authenticated;

DROP POLICY IF EXISTS "Members view their groups" ON public.groups;
CREATE POLICY "Members and creators view their groups"
ON public.groups FOR SELECT TO authenticated
USING (public.is_group_member(id, auth.uid()) OR created_by = auth.uid());

DROP POLICY IF EXISTS "Users add themselves or creator adds" ON public.group_members;
CREATE POLICY "Users add themselves or creator adds"
ON public.group_members FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR public.is_group_creator(group_id, auth.uid())
);