DROP FUNCTION IF EXISTS public.create_profile_for_current_user(TEXT, TEXT);

REVOKE ALL ON FUNCTION public.is_group_member(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_group_member(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.is_group_member(UUID, UUID) FROM authenticated;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM authenticated;