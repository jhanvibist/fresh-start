
-- Invitations table for inviting roommates to a group
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  invited_by UUID NOT NULL,
  email TEXT,
  invitee_name TEXT,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_group ON public.invitations(group_id);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Group members can view invites for their group
CREATE POLICY "Members view invitations"
ON public.invitations FOR SELECT
TO authenticated
USING (public.is_group_member(group_id, auth.uid()) OR invited_by = auth.uid());

-- Anyone authenticated can look up an invite by token to accept it
CREATE POLICY "Anyone authed can view invitation by token"
ON public.invitations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Members create invitations"
ON public.invitations FOR INSERT
TO authenticated
WITH CHECK (public.is_group_member(group_id, auth.uid()) AND invited_by = auth.uid());

CREATE POLICY "Inviter or accepter updates invitation"
ON public.invitations FOR UPDATE
TO authenticated
USING (invited_by = auth.uid() OR auth.uid() = accepted_by OR status = 'pending');

CREATE POLICY "Inviter deletes invitation"
ON public.invitations FOR DELETE
TO authenticated
USING (invited_by = auth.uid());

-- Money requests / sends between roommates
CREATE TABLE public.money_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  from_user UUID NOT NULL,
  to_user UUID NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  kind TEXT NOT NULL DEFAULT 'request',
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  trip_date DATE,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_money_requests_group ON public.money_requests(group_id);

ALTER TABLE public.money_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view money requests"
ON public.money_requests FOR SELECT
TO authenticated
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Members create money requests"
ON public.money_requests FOR INSERT
TO authenticated
WITH CHECK (
  public.is_group_member(group_id, auth.uid())
  AND (auth.uid() = from_user OR auth.uid() = to_user)
);

CREATE POLICY "Counterparties update money requests"
ON public.money_requests FOR UPDATE
TO authenticated
USING (auth.uid() = from_user OR auth.uid() = to_user);

CREATE POLICY "Creator deletes money request"
ON public.money_requests FOR DELETE
TO authenticated
USING (auth.uid() = from_user OR auth.uid() = to_user);

CREATE TRIGGER trg_money_requests_updated
BEFORE UPDATE ON public.money_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
