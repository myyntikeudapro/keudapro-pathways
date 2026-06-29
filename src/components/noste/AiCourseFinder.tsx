import { useMemo, useState } from "react";
import {
  Search, ExternalLink, Sparkles, Users, Crown, GraduationCap, X,
  Briefcase, Lightbulb, Calculator, Megaphone, HeartPulse, Wrench,
  ShoppingBag, Shield, Truck, BookOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORY_VISUAL: Record<string, { icon: typeof Sparkles; gradient: string }> = {
  "Johto":                  { icon: Briefcase,  gradient: "from-amber-400 to-orange-500" },
  "Asiantuntijat":          { icon: Lightbulb,  gradient: "from-violet-400 to-fuchsia-500" },
  "Hallinto & talous":      { icon: Calculator, gradient: "from-sky-400 to-blue-600" },
  "Myynti & markkinointi":  { icon: Megaphone,  gradient: "from-pink-400 to-rose-500" },
  "Sote & hyvinvointi":     { icon: HeartPulse, gradient: "from-rose-400 to-red-500" },
  "Tekniikka & tuotanto":   { icon: Wrench,     gradient: "from-slate-500 to-slate-700" },
  "Palvelu & kauppa":       { icon: ShoppingBag,gradient: "from-teal-400 to-emerald-500" },
  "Turva & julkinen":       { icon: Shield,     gradient: "from-indigo-500 to-blue-700" },
  "Logistiikka":            { icon: Truck,      gradient: "from-cyan-400 to-sky-600" },
  "Kasvatus & koulutus":    { icon: BookOpen,   gradient: "from-lime-400 to-green-600" },
};

/* ============================================================
   AI Course Finder — älykäs koulutuksen suunnittelu
   - Valitse pätevyystaso (Coordinator / Manager / Director)
   - Selaa ~50 alan koulutuksia hakukentällä ja kategoriasuotimilla
   - Linkit suoraan Keudan koulutussivuille
   ============================================================ */

type Level = "coordinator" | "manager" | "director";
type Category =
  | "Johto"
  | "Asiantuntijat"
  | "Hallinto & talous"
  | "Myynti & markkinointi"
  | "Sote & hyvinvointi"
  | "Tekniikka & tuotanto"
  | "Palvelu & kauppa"
  | "Turva & julkinen"
  | "Logistiikka"
  | "Kasvatus & koulutus";

type Field = {
  slug: string;
  label: string;
  category: Category;
  keywords?: string[];
};

const FIELDS: Field[] = [
  { slug: "ajoneuvoala", label: "Ajoneuvoala", category: "Tekniikka & tuotanto", keywords: ["auto", "korjaamo"] },
  { slug: "asiakaspalvelu", label: "Asiakaspalvelu", category: "Palvelu & kauppa" },
  { slug: "asiantuntijat", label: "Asiantuntijat", category: "Asiantuntijat" },
  { slug: "elintarvikeala", label: "Elintarvikeala", category: "Tekniikka & tuotanto" },
  { slug: "finanssiala", label: "Finanssiala", category: "Hallinto & talous", keywords: ["pankki", "vakuutus"] },
  { slug: "hallitustyoskentely", label: "Hallitustyöskentely", category: "Johto" },
  { slug: "henkilostohallinto-hr", label: "Henkilöstöhallinto (HR)", category: "Hallinto & talous", keywords: ["hr", "rekry"] },
  { slug: "huolto-ja-kunnossapito", label: "Huolto ja kunnossapito", category: "Tekniikka & tuotanto" },
  { slug: "hyvinvointipalvelut", label: "Hyvinvointipalvelut", category: "Sote & hyvinvointi" },
  { slug: "it-tietoliikenne", label: "IT ja tietoliikenne", category: "Tekniikka & tuotanto", keywords: ["ict", "tietotekniikka"] },
  { slug: "johtaminen", label: "Johtaminen", category: "Johto" },
  { slug: "julkishallinto", label: "Julkishallinto", category: "Turva & julkinen" },
  { slug: "juridiikka-laki", label: "Juridiikka ja laki", category: "Hallinto & talous", keywords: ["lakimies"] },
  { slug: "kansainvalistyminen", label: "Kansainvälistyminen", category: "Asiantuntijat", keywords: ["vienti", "kv"] },
  { slug: "kasvatus-ohjaus", label: "Kasvatus ja ohjaus", category: "Kasvatus & koulutus" },
  { slug: "kauneudenhoitoala", label: "Kauneudenhoitoala", category: "Palvelu & kauppa", keywords: ["kampaamo"] },
  { slug: "kaupan-ala", label: "Kaupan ala", category: "Palvelu & kauppa" },
  { slug: "kiinteisto-ja-isannointi", label: "Kiinteistö ja isännöinti", category: "Hallinto & talous" },
  { slug: "kirjanpito-ja-tilintarkastus", label: "Kirjanpito ja tilintarkastus", category: "Hallinto & talous" },
  { slug: "koulutus", label: "Koulutus", category: "Kasvatus & koulutus", keywords: ["opetus"] },
  { slug: "kunnallishallinto", label: "Kunnallishallinto", category: "Turva & julkinen" },
  { slug: "liikenne-ja-kuljetusala", label: "Liikenne ja kuljetusala", category: "Logistiikka" },
  { slug: "logistiikka", label: "Logistiikka", category: "Logistiikka" },
  { slug: "maa-ja-metsatalous", label: "Maa- ja metsätalous", category: "Tekniikka & tuotanto" },
  { slug: "maahanmuutto", label: "Maahanmuutto", category: "Turva & julkinen", keywords: ["kotoutuminen"] },
  { slug: "markkinointi", label: "Markkinointi", category: "Myynti & markkinointi" },
  { slug: "matkailu", label: "Matkailu", category: "Palvelu & kauppa" },
  { slug: "myymalatyo", label: "Myymälätyö", category: "Palvelu & kauppa" },
  { slug: "myynti", label: "Myynti", category: "Myynti & markkinointi" },
  { slug: "ostotoiminta", label: "Ostotoiminta", category: "Hallinto & talous", keywords: ["hankinta"] },
  { slug: "palvelualat", label: "Palvelualat", category: "Palvelu & kauppa" },
  { slug: "pelastustoimi", label: "Pelastustoimi", category: "Turva & julkinen" },
  { slug: "rahoitus", label: "Rahoitus", category: "Hallinto & talous" },
  { slug: "rakentaminen", label: "Rakentaminen", category: "Tekniikka & tuotanto" },
  { slug: "rekrytointi", label: "Rekrytointi", category: "Hallinto & talous", keywords: ["hr"] },
  { slug: "sahko-ja-energia-ala", label: "Sähkö- ja energia-ala", category: "Tekniikka & tuotanto" },
  { slug: "siivousala", label: "Siivousala", category: "Palvelu & kauppa" },
  { slug: "sosiaali-ja-terveysala", label: "Sosiaali- ja terveysala", category: "Sote & hyvinvointi", keywords: ["sote"] },
  { slug: "sosiaalinen-media", label: "Sosiaalinen media", category: "Myynti & markkinointi", keywords: ["some"] },
  { slug: "taloushallinto", label: "Taloushallinto", category: "Hallinto & talous" },
  { slug: "teollisuusalat", label: "Teollisuusalat", category: "Tekniikka & tuotanto" },
  { slug: "terveydenhuolto", label: "Terveydenhuolto", category: "Sote & hyvinvointi" },
  { slug: "toimitusjohtajat", label: "Toimitusjohtajat", category: "Johto", keywords: ["ceo"] },
  { slug: "tuotannon-suunnittelu", label: "Tuotannon suunnittelu", category: "Tekniikka & tuotanto" },
  { slug: "tuotannonohjaus", label: "Tuotannonohjaus", category: "Tekniikka & tuotanto" },
  { slug: "tuote-ja-palvelukehitys", label: "Tuote- ja palvelukehitys", category: "Asiantuntijat" },
  { slug: "turvallisuusala", label: "Turvallisuusala", category: "Turva & julkinen" },
  { slug: "tyoturvallisuus", label: "Työturvallisuus", category: "Turva & julkinen" },
  { slug: "yrittajat", label: "Yrittäjät", category: "Johto" },
];

const CATEGORIES: Category[] = [
  "Johto",
  "Asiantuntijat",
  "Hallinto & talous",
  "Myynti & markkinointi",
  "Sote & hyvinvointi",
  "Tekniikka & tuotanto",
  "Palvelu & kauppa",
  "Turva & julkinen",
  "Logistiikka",
  "Kasvatus & koulutus",
];

const LEVELS: {
  id: Level;
  name: string;
  short: string;
  tagline: string;
  icon: typeof Sparkles;
  tint: string;
  tintActive: string;
  programUrl?: string;
  programName: string;
}[] = [
  {
    id: "coordinator",
    name: "Tekoälykoordinaattori",
    short: "AI-Coordinator",
    tagline: "Asiantuntijalle — tekoälyn käytännön hyödyntäminen omassa työssä.",
    icon: Sparkles,
    tint: "bg-keuda-blue-light text-primary",
    tintActive: "bg-primary text-primary-foreground",
    programName: "AI-Coordinator",
  },
  {
    id: "manager",
    name: "Tekoälypäällikkö",
    short: "AI-Manager",
    tagline: "Esihenkilölle — tekoälyn käyttöönotto tiimissä ja prosesseissa.",
    icon: Users,
    tint: "bg-keuda-teal-light text-secondary",
    tintActive: "bg-secondary text-secondary-foreground",
    programUrl: "https://www.keuda.fi/koulutus/ai-manager-tekoalypaallikko-koulutusohjelma/",
    programName: "AI-Manager",
  },
  {
    id: "director",
    name: "Tekoälyjohtaja",
    short: "AI-Director",
    tagline: "Johdolle — strateginen tekoälyjohtaminen ja organisaation uudistus.",
    icon: Crown,
    tint: "bg-amber-100 text-amber-700",
    tintActive: "bg-foreground text-background",
    programUrl: "https://www.keuda.fi/koulutus/ai-director-ceo-johtoryhmatason-valmennusohjelma/",
    programName: "AI-Director",
  },
];

function coordinatorUrl(slug: string) {
  return `https://www.keuda.fi/koulutus/${slug}-tekoalyn-ammattiosaaja-tekoalykoordinaattori-ai-coordinator/`;
}

export function AiCourseFinder() {
  const [level, setLevel] = useState<Level>("coordinator");
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState<Category[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FIELDS.filter((f) => {
      if (activeCats.length && !activeCats.includes(f.category)) return false;
      if (!q) return true;
      const hay = `${f.label} ${f.category} ${(f.keywords ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    }).sort((a, b) => a.label.localeCompare(b.label, "fi"));
  }, [query, activeCats]);

  const activeLevel = LEVELS.find((l) => l.id === level)!;

  const toggleCat = (c: Category) =>
    setActiveCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <div className="space-y-8">
      {/* LEVEL SELECTOR */}
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          1. Valitse pätevyysohjelma
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {LEVELS.map((l) => {
            const Icon = l.icon;
            const active = l.id === level;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id)}
                className={cn(
                  "text-left rounded-xl border p-4 transition-all",
                  active
                    ? "border-primary bg-card shadow-card ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                )}
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", l.tint)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                  {l.short}
                </div>
                <div className="font-bold text-foreground mb-1">{l.name}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{l.tagline}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* LEVEL CONTEXT BANNER (for Manager / Director — single national program) */}
      {activeLevel.programUrl && (
        <a
          href={activeLevel.programUrl}
          target="_blank"
          rel="noopener"
          className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-card transition-all"
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", activeLevel.tint)}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Valtakunnallinen ohjelma
              </div>
              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {activeLevel.programName} — {activeLevel.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Alla voit silti selata aloja inspiraationa — varsinainen ohjelma on yhteinen kaikille toimialoille.
              </div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </a>
      )}

      {/* SEARCH + FILTERS */}
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          2. Valitse oma alasi
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hae alaa, ammattia tai avainsanaa — esim. HR, myynti, sote, IT…"
            className="pl-10 pr-10 h-12 text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Tyhjennä haku"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = activeCats.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCat(c)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                )}
              >
                {c}
              </button>
            );
          })}
          {activeCats.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveCats([])}
              className="text-xs font-medium px-3 py-1.5 rounded-full text-primary hover:underline"
            >
              Tyhjennä suotimet
            </button>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-sm text-muted-foreground">
            {filtered.length} / {FIELDS.length} alaa
            {level === "coordinator"
              ? " — linkit suoraan Keudan alakohtaisille koulutussivuille"
              : ` — sovelletaan ohjelmassa ${activeLevel.programName}`}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-muted-foreground">
            Ei osumia. Kokeile toista hakusanaa tai poista suotimet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((f) => {
              const href = level === "coordinator" ? coordinatorUrl(f.slug) : activeLevel.programUrl!;
              return (
                <a
                  key={f.slug}
                  href={href}
                  target="_blank"
                  rel="noopener"
                  className="group flex items-start justify-between gap-3 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary hover:shadow-card transition-all"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                      {f.category}
                    </div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {f.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{activeLevel.short}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
