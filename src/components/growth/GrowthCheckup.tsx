import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowRight, Calendar, CheckCircle2, Target } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { BOOKING_URL } from "@/lib/booking";
import { cn } from "@/lib/utils";

type Result = {
  summary: string;
  strengths?: string[];
  focus?: string[];
  recommended: "kaynistys" | "skaalaus" | "kasvu-uudistuminen" | "osaaminen";
  recommendedLabel: string;
};

const revenueSteps = [
  0, 40_000, 120_000, 300_000, 600_000, 1_200_000, 3_000_000, 7_000_000, 15_000_000, 30_000_000,
];
const teamSteps = [1, 2, 4, 8, 15, 30, 60, 100, 200, 500];

const focusOptions = [
  { id: "myynti", label: "Myynti & asiakkaat" },
  { id: "skaalaus", label: "Skaalaus & prosessit" },
  { id: "uudistuminen", label: "Uudistuminen & omistajuus" },
  { id: "osaaminen", label: "Osaaminen & pätevyydet" },
  { id: "osaamisen-johtaminen", label: "Osaamisen johtaminen & kasvattaminen" },
];


const fmt = (n: number) =>
  n >= 1000 ? n.toLocaleString("fi-FI").replace(/\s/g, "\u00A0") : String(n);

type Props = {
  onSelectRoute: (id: string) => void;
};

export function GrowthCheckup({ onSelectRoute }: Props) {
  const [revenueIdx, setRevenueIdx] = useState(2); // 120k
  const [teamIdx, setTeamIdx] = useState(1); // 2
  const [growth, setGrowth] = useState(40);
  const [bottleneck, setBottleneck] = useState(70);
  const [focus, setFocus] = useState<string>("myynti");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const revenue = revenueSteps[revenueIdx];
  const team = teamSteps[teamIdx];

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("growth-checkup", {
        body: { revenue, team, growth, bottleneck, focus },
      });
      if (fnError) throw fnError;
      setResult(data as Result);
    } catch (e) {
      console.error(e);
      setError("Yhteenvedon luonti epäonnistui. Yritä hetken kuluttua uudelleen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="alykas-tilannekatsaus" className="max-w-3xl mx-auto scroll-mt-24">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
            Älykäs tilannetsekkaus
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Missä vaiheessa yrityksesi on nyt?
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Säädä neljä mittaria — saat tiiviin yhteenvedon lähtötilanteestasi ja sopivimman kasvureitin.
        </p>
      </div>

      {/* Lomake */}
      <div className="rounded-2xl bg-card border border-border shadow-sm p-6 md:p-8 text-left">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Liikevaihto */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <label className="text-sm font-semibold text-foreground">Liikevaihto</label>
              <span className="text-sm font-bold text-primary">
                {fmt(revenue)} €/v
              </span>
            </div>
            <Slider
              value={[revenueIdx]}
              min={0}
              max={revenueSteps.length - 1}
              step={1}
              onValueChange={(v) => setRevenueIdx(v[0])}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>alku</span>
              <span>30M€+</span>
            </div>
          </div>


          {/* Tiimi */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <label className="text-sm font-semibold text-foreground">Tiimin koko</label>
              <span className="text-sm font-bold text-primary">
                {fmt(team)} {team === 1 ? "henkilö" : "henkilöä"}
              </span>
            </div>
            <Slider
              value={[teamIdx]}
              min={0}
              max={teamSteps.length - 1}
              step={1}
              onValueChange={(v) => setTeamIdx(v[0])}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>yksin</span>
              <span>500+</span>
            </div>

          </div>

          {/* Kasvuvauhti */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <label className="text-sm font-semibold text-foreground">Kasvuvauhti</label>
              <span className="text-sm font-bold text-primary">{growth} / 100</span>
            </div>
            <Slider
              value={[growth]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => setGrowth(v[0])}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>vakaa</span>
              <span>nopea kasvu</span>
            </div>
          </div>

          {/* Pullonkaula */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <label className="text-sm font-semibold text-foreground">
                Olen itse pullonkaula
              </label>
              <span className="text-sm font-bold text-primary">{bottleneck} / 100</span>
            </div>
            <Slider
              value={[bottleneck]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => setBottleneck(v[0])}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>tiimi vetää</span>
              <span>teen kaiken itse</span>
            </div>
          </div>
        </div>

        {/* Painopiste */}
        <div className="mt-7">
          <label className="text-sm font-semibold text-foreground block mb-3">
            Mihin haluat keskittyä seuraavaksi?
          </label>
          <ToggleGroup
            type="single"
            value={focus}
            onValueChange={(v) => v && setFocus(v)}
            className="flex flex-wrap justify-start gap-2"
          >
            {focusOptions.map((o) => (
              <ToggleGroupItem
                key={o.id}
                value={o.id}
                className="rounded-full border border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary px-4 h-9 text-xs font-medium"
              >
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={run}
            disabled={loading}
            size="lg"
            variant="cta"
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Luodaan yhteenvetoa…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Luo älykäs yhteenveto
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
              <Calendar className="w-4 h-4 mr-2" />
              Varaa sparrausaika valmentajalta
            </a>
          </Button>
        </div>
      </div>

      {/* Tulos */}
      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div
          className={cn(
            "mt-6 rounded-2xl border-2 border-primary/30 bg-primary/[0.04] p-6 md:p-7 text-left",
            "animate-in fade-in slide-in-from-bottom-2 duration-500",
          )}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">
                Tilannekuvasi
              </p>
              <p className="text-foreground leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {(result.strengths?.length || result.focus?.length) && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {result.strengths && result.strengths.length > 0 && (
                <div className="rounded-xl bg-background/70 border border-border p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Vahvuutesi
                  </p>
                  <ul className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-foreground">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.focus && result.focus.length > 0 && (
                <div className="rounded-xl bg-background/70 border border-border p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    Painopisteet
                  </p>
                  <ul className="space-y-1.5">
                    {result.focus.map((s, i) => (
                      <li key={i} className="text-sm text-foreground">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-border/70 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Suositeltu polku:{" "}
              <span className="font-semibold text-foreground">{result.recommendedLabel}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => onSelectRoute(result.recommended)}
                variant="cta"
                className="whitespace-nowrap"
              >
                Avaa polku
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button asChild variant="outline" className="whitespace-nowrap">
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="w-4 h-4 mr-2" />
                  Varaa sparraus
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
