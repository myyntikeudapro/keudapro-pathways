import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AiTalentRole } from "@/data/aiTalent";

export function useAiTalentMembership() {
  const { user, loading, signOut } = useAuth();
  const [role, setRole] = useState<AiTalentRole | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    if (loading) return;
    if (!user) { setRole(null); setChecking(false); return; }
    setChecking(true);
    (async () => {
      const [{ data: member }, { data: siteRoles }] = await Promise.all([
        supabase.from("ai_talent_members").select("role").maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (!active) return;
      const isSiteAdmin = (siteRoles ?? []).some((r: { role: string }) => r.role === "admin");
      setRole((member?.role as AiTalentRole | undefined) ?? (isSiteAdmin ? "admin" : null));
      setChecking(false);
    })();
    return () => { active = false; };
  }, [user, loading]);

  return { user, role, loading: loading || checking, signOut };
}
