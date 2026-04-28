import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Group = {
  id: string;
  name: string;
  created_by: string;
};

export const useActiveGroup = () => {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Find any group the user is a member of
      const { data: members, error: memberErr } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .limit(1);

      if (memberErr) {
        console.error(memberErr);
        if (!cancelled) setLoading(false);
        return;
      }

      let activeGroupId = members?.[0]?.group_id;

      // None? Create a default one and add user
      if (!activeGroupId) {
        const defaultName = `${(user.user_metadata?.display_name as string) || "My"}'s Household`;
        const { data: created, error: createErr } = await supabase
          .from("groups")
          .insert({ name: defaultName, created_by: user.id })
          .select("id")
          .single();
        if (createErr || !created) {
          console.error(createErr);
          if (!cancelled) setLoading(false);
          return;
        }
        await supabase.from("group_members").insert({ group_id: created.id, user_id: user.id });
        activeGroupId = created.id;
      }

      const { data: g } = await supabase
        .from("groups")
        .select("id, name, created_by")
        .eq("id", activeGroupId)
        .single();

      if (!cancelled) {
        setGroup(g ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  return { group, loading, refresh: () => setRefreshKey((k) => k + 1) };
};
