import { Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, RefreshCw } from "lucide-react";
import { SEO } from "@/components/seo/SEO";

type BookingRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  meeting_format: string;
  message: string;
  source: string | null;
  created_at: string;
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("fi-FI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export default function AdminLeadsPage() {
  const { user, loading, isEditor, roleLoading, signOut } = useAuth();

  const { data: requests = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["booking_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as BookingRequest[];
    },
    enabled: !!user && isEditor,
  });

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Ei käyttöoikeutta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tililläsi ({user.email}) ei ole editori- tai admin-roolia. Pyydä pääkäyttäjää lisäämään rooli.
            </p>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Kirjaudu ulos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SEO title="Saapuneet yhteydenotot – KeudaPRO" description="Kartoitusten ja ajanvarausten hallinta." path="/admin/yhteydenotot" />
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Saapuneet yhteydenotot</h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/admin">Sisältöeditori</Link></Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Päivitä
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Kirjaudu ulos
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Ei vielä yhtään yhteydenottoa.
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{requests.length} yhteydenottoa</p>
            {requests.map((r) => (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{r.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {r.source && <Badge variant="secondary">{r.source}</Badge>}
                      <Badge variant="outline">{r.meeting_format}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                    <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>
                    {r.phone && <a className="underline" href={`tel:${r.phone}`}>{r.phone}</a>}
                    {r.organization && <span>{r.organization}</span>}
                  </div>
                  <p className="whitespace-pre-wrap">{r.message}</p>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
