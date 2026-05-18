import { useState, FormEvent, MouseEvent } from "react";
import { Search, Loader2, ArrowRight, Sparkles, MessageCircle, Compass, ExternalLink } from "lucide-react";

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
      {/* Hakulaatikko – vaalea valkoinen kortti Pätevyydet-sivun tyyliin */}
      <div className="relative rounded-3xl bg-white shadow-sm border border-teal-100 p-6 md:p-10">
        <div className="flex items-center gap-2 mb-3 text-teal-700">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Älykäs haku</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Mitä etsit?</h2>
        <p className="text-muted-foreground mb-6 md:text-lg">
          Kirjoita aihe tai tilanne omin sanoin – ohjaamme sinut oikeaan paikkaan.
        </p>

        <form onSubmit={onSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='esim. "tulityökortti" tai "AI johdolle"'
            className="w-full h-14 pl-12 pr-28 rounded-2xl bg-[#F5FBFA] text-foreground placeholder:text-muted-foreground border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            aria-label="Älykäs haku"
          />
          <Button
            type="submit"
            variant="cta"
            size="default"
            className="absolute right-2 top-1/2 -translate-y-1/2 shadow-md"
            disabled={loading || query.trim().length < 2}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hae"}
          </Button>
        </form>

        {/* Esimerkkihakuehdot */}
        <div className="mt-4 flex flex-wrap gap-2">
          {exampleQueries.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onExample(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Pikareitit */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => openWizard()}
            className="flex-1 flex items-center gap-3 rounded-xl bg-[#F5FBFA] hover:bg-teal-50 border border-teal-100 px-4 py-3 transition-colors text-left"
          >
            <Compass className="w-5 h-5 text-teal-700 shrink-0" />
            <span className="text-sm font-medium text-foreground">Tee 15 min reittikartoitus</span>
          </button>
          <button
            type="button"
            onClick={() => openChat("ana")}
            className="flex-1 flex items-center gap-3 rounded-xl bg-[#F5FBFA] hover:bg-teal-50 border border-teal-100 px-4 py-3 transition-colors text-left"
          >
            <MessageCircle className="w-5 h-5 text-teal-700 shrink-0" />
            <span className="text-sm font-medium text-foreground">Kysy AI-valmentajalta</span>
          </button>
        </div>
      </div>

      {/* Tulokset */}
      {(matches !== null || error) && (
        <div className="mt-8">
          {error && (
            <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground shadow-sm">
              {error}
            </div>
          )}

          {matches && matches.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Parhaat osumat
              </p>
              <ul className="space-y-3">
                {matches.map((m) => {
                  const content = (
                    <div className="group flex items-stretch gap-0 rounded-2xl overflow-hidden border border-border bg-background hover:border-primary hover:shadow-lg transition-all">
                      {/* Pieni kuva */}
                      <div className="relative w-24 sm:w-32 shrink-0 overflow-hidden">
                        <img
                          src={m.image}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/10" />
                      </div>

                      {/* Sisältö */}
                      <div className="flex-1 min-w-0 p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              {m.category}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-foreground mb-1 truncate">
                            {m.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {m.description}
                          </p>
                          {m.reason && (
                            <p className="text-xs italic text-secondary mt-1">{m.reason}</p>
                          )}
                          {m.externalHref && (
                            <a
                              href={m.externalHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e: MouseEvent) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-teal-700 hover:text-teal-900 hover:underline"
                            >
                              Lue Keudan sivulla
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
