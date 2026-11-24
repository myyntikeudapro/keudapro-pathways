import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { SEO } from "@/components/seo/SEO";

type Mode = "signin" | "signup" | "forgot" | "reset" | "change";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const initialMode = (): Mode => {
    if (typeof window === "undefined") return "signin";
    const q = new URLSearchParams(window.location.search);
    if (window.location.hash.includes("type=recovery") || q.get("palautus") === "1") return "reset";
    if (q.get("vaihda") === "1") return "change";
    if (q.get("unohtunut") === "1") return "forgot";
    return "signin";
  };
  const [mode, setMode] = useState<Mode>(initialMode);
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!loading && user && mode !== "reset" && mode !== "change") return <Navigate to="/admin" replace />;
  if (!loading && !user && mode === "change") return <Navigate to="/admin/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/login?palautus=1`,
        });
        if (error) throw error;
        toast.success("Jos osoitteella on tili, palautuslinkki on lähetetty sähköpostiisi.");
        setMode("signin");
      } else if (mode === "reset" || mode === "change") {
        if (password !== confirm) throw new Error("Salasanat eivät täsmää.");
        const { error } = await supabase.auth.updateUser(
          mode === "change" ? ({ password, current_password: currentPassword } as never) : { password },
        );
        if (error) throw error;
        toast.success("Salasana vaihdettu");
        window.history.replaceState(null, "", "/admin/login");
        navigate("/admin");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Kirjautuminen onnistui");
        navigate("/admin");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Tili luotu. Tarkista sähköpostisi vahvistuslinkki.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tuntematon virhe";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SEO title="Työtilan kirjautuminen – KeudaPRO" description="Sisäänkirjautuminen KeudaPROn yhteiseen työtilaan." path="/admin/login" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>KeudaPRO – Työtila</CardTitle>
          <CardDescription>
            {{
              signin: "Kirjaudu sisään sähköpostillasi.",
              signup: "Luo uusi tili. Adminin on aktivoitava rooli erikseen.",
              forgot: "Anna sähköpostisi, niin lähetämme salasanan palautuslinkin.",
              reset: "Aseta uusi salasana palautuslinkin kautta.",
              change: "Vaihda salasanasi. Anna ensin nykyinen salasana.",
            }[mode]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(mode === "signin" || mode === "signup" || mode === "forgot") && (
              <div className="space-y-2">
                <Label htmlFor="email">Sähköposti</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}
            {mode === "change" && (
              <div className="space-y-2">
                <Label htmlFor="current">Nykyinen salasana</Label>
                <Input id="current" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
            )}
            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password">{mode === "reset" || mode === "change" ? "Uusi salasana" : "Salasana"}</Label>
                <Input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            {(mode === "reset" || mode === "change") && (
              <div className="space-y-2">
                <Label htmlFor="confirm">Uusi salasana uudelleen</Label>
                <Input id="confirm" type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Hetki..." : { signin: "Kirjaudu", signup: "Luo tili", forgot: "Lähetä palautuslinkki", reset: "Tallenna uusi salasana", change: "Vaihda salasana" }[mode]}
            </Button>
            {mode === "signin" && (
              <button type="button" className="w-full text-sm text-muted-foreground hover:underline" onClick={() => setMode("forgot")}>
                Unohditko salasanan?
              </button>
            )}
            {(mode === "signin" || mode === "signup") && (
              <button type="button" className="w-full text-sm text-muted-foreground hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
                {mode === "signin" ? "Ei vielä tiliä? Luo tili" : "Onko sinulla jo tili? Kirjaudu"}
              </button>
            )}
            {mode === "forgot" && (
              <button type="button" className="w-full text-sm text-muted-foreground hover:underline" onClick={() => setMode("signin")}>
                Takaisin kirjautumiseen
              </button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
