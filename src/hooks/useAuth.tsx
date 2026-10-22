import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isEditor: boolean;
  roleLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditor, setIsEditor] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleUserId, setRoleUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      setIsEditor(false);
      setRoleUserId(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active) return;
        const roles = (data ?? []).map((r: { role: string }) => r.role);
        setIsEditor(roles.includes("admin") || roles.includes("editor"));
        setRoleUserId(user.id);
        setRoleLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isEditor: isEditor && roleUserId === user?.id, roleLoading: roleLoading || (!!user && roleUserId !== user.id), signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
