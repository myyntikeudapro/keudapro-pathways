import { useState, FormEvent } from "react";
import { Search, Loader2, ArrowRight, Sparkles, MessageCircle, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { searchIndex, type SearchEntry } from "@/data/searchIndex";
import { useWizard } from "@/contexts/WizardContext";
import { useCoachPanel } from "@/contexts/CoachPanelContext";
import { Link } from "react-router-dom";

type Match = SearchEntry & { reason?: string };

const exampleQueries = [
  "tulityökortti",
  "AI johdolle",
  "muutosturva",
  "hygieniapassi",
  "kasvukartoitus",
];

export function SmartSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { openWizard } = useWizard();
  const { openChat } = useCoachPanel();

  const runSearch = async (q: string) => {
    setLoading(true);
    setError(null);
    setMatches(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("smart-search", {
        body: { query: q, index: searchIndex },
      });
      if (fnError) throw fnError;
      const ms: Match[] = (data?.matches as Match[]) ?? [];
      setMatches(ms);
      if (ms.length === 0) setError("Emme löytäneet sopivaa kohdetta — kokeile toisin sanoin tai kysy AI-valmentajalta.");
    } catch (e) {
      console.error(e);
      setError("Haku epäonnistui. Yritä hetken kuluttua uudelleen.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    runSearch(q);
  };

  const onExample = (q: string) => {
    setQuery(q);
    runSearch(q);
  };

  const isExternal = (href: string) => /^https?:\/\//.test(href);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-background border border-border shadow-sm p-5 md:p-7">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Älykäs haku</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Mitä etsit?
        </h2>
        <p className="text-muted-foreground mb-5">
          Kirjoita aihe tai tilanne omin sanoin – ohjaamme sinut oikeaan paikkaan.
        </p>

        <form onSubmit={onSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='esim. "tulityökortti" tai "AI johdolle"'
            className="w-full h-14 pl-12 pr-32 rounded-xl border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            aria-label="Älykäs haku"
          />
          <Button
            type="submit"
            variant="cta"
            size="default"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            disabled={loading || query.trim().length < 2}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hae"}
          </Button>
        </form>

        {/* Esimerkkihakuehdot */}
        <div className="mt-3 flex flex-wrap gap-2">
          {exampleQueries.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onExample(q)}
              className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Pikareitit */}
        <div className="mt-5 pt-5 border-t border-border flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="flex-1 justify-start"
            onClick={() => openWizard()}
          >
            <Compass className="w-4 h-4 mr-2" />
            Tee 15 min reittikartoitus
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            className="flex-1 justify-start"
            onClick={() => openChat("ana")}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Kysy AI-valmentajalta
          </Button>
        </div>
      </div>

      {/* Tulokset */}
      {(matches !== null || error) && (
        <div className="mt-6">
          {error && (
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              {error}
            </div>
          )}

          {matches && matches.length > 0 && (
            <ul className="space-y-3">
              {matches.map((m) => {
                const content = (
                  <div className="group flex items-start gap-4 rounded-xl border border-border bg-background p-4 hover:border-primary hover:shadow-sm transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                          {m.category}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        {m.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">{m.description}</p>
                      {m.reason && (
                        <p className="text-xs italic text-primary/80">{m.reason}</p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                );

                if (isExternal(m.href)) {
                  return (
                    <li key={m.id}>
                      <a href={m.href} target="_blank" rel="noopener noreferrer">
                        {content}
                      </a>
                    </li>
                  );
                }
                if (m.href.includes("#")) {
                  return (
                    <li key={m.id}>
                      <a href={m.href}>{content}</a>
                    </li>
                  );
                }
                return (
                  <li key={m.id}>
                    <Link to={m.href}>{content}</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
