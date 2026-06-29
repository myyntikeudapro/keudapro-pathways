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

// Alakohtainen realistinen kuva (Unsplash) — jokaiseen ammattialaan oma aiheenmukainen valokuva.
const FIELD_IMAGE: Record<string, string> = {
  "ajoneuvoala": "photo-1486262715619-67b85e0b08d3",
  "asiakaspalvelu": "photo-1556745753-b2904692b3cd",
  "asiantuntijat": "photo-1542744173-8e7e53415bb0",
  "elintarvikeala": "photo-1488459716781-31db52582fe9",
  "finanssiala": "photo-1554224155-6726b3ff858f",
  "hallitustyoskentely": "photo-1556761175-5973dc0f32e7",
  "henkilostohallinto-hr": "photo-1573496359142-b8d87734a5a2",
  "huolto-ja-kunnossapito": "photo-1581092918056-0c4c3acd3789",
  "hyvinvointipalvelut": "photo-1544161515-4ab6ce6db874",
  "it-tietoliikenne": "photo-1518770660439-4636190af475",
  "johtaminen": "photo-1521737604893-d14cc237f11d",
  "julkishallinto": "photo-1541872703-74c5e44368f4",
  "juridiikka-laki": "photo-1589994965851-a8f479c573a9",
  "kansainvalistyminen": "photo-1526778548025-fa2f459cd5c1",
  "kasvatus-ohjaus": "photo-1503676260728-1c00da094a0b",
  "kauneudenhoitoala": "photo-1560066984-138dadb4c035",
  "kaupan-ala": "photo-1481437156560-3205f6a55735",
  "kiinteisto-ja-isannointi": "photo-1560518883-ce09059eeffa",
  "kirjanpito-ja-tilintarkastus": "photo-1454165804606-c3d57bc86b40",
  "koulutus": "photo-1497486751825-1233686d5d80",
  "kunnallishallinto": "photo-1591115765373-5207764f72e7",
  "liikenne-ja-kuljetusala": "photo-1601584115197-04ecc0da31d7",
  "logistiikka": "photo-1553413077-190dd305871c",
  "maa-ja-metsatalous": "photo-1500382017468-9049fed747ef",
  "maahanmuutto": "photo-1529390079861-591de354faf5",
  "markkinointi": "photo-1533750349088-cd871a92f312",
  "matkailu": "photo-1488646953014-85cb44e25828",
  "myymalatyo": "photo-1573855619003-97b4799dcd8b",
  "myynti": "photo-1556740738-b6a63e27c4df",
  "ostotoiminta": "photo-1556761175-b413da4baf72",
  "palvelualat": "photo-1552566626-52f8b828add9",
  "pelastustoimi": "photo-1599689019288-67e652b6e2e9",
  "rahoitus": "photo-1579621970795-87facc2f976d",
  "rakentaminen": "photo-1503387762-592deb58ef4e",
  "rekrytointi": "photo-1565688534245-05d6b5be184a",
  "sahko-ja-energia-ala": "photo-1473341304170-971dccb5ac1e",
  "siivousala": "photo-1581578731548-c64695cc6952",
  "sosiaali-ja-terveysala": "photo-1576091160550-2173dba999ef",
  "sosiaalinen-media": "photo-1611162617213-7d7a39e9b1d7",
  "taloushallinto": "photo-1554224154-26032ffc0d07",
  "teollisuusalat": "photo-1565939995-3b22d4a4c9a3",
  "terveydenhuolto": "photo-1579684385127-1ef15d508118",
  "toimitusjohtajat": "photo-1573497019940-1c28c88b4f3e",
  "tuotannon-suunnittelu": "photo-1581091226825-a6a2a5aee158",
  "tuotannonohjaus": "photo-1565374790065-aaf9aa39e055",
  "tuote-ja-palvelukehitys": "photo-1559136555-9303baea8ebd",
  "turvallisuusala": "photo-1582139329536-e7284fece509",
  "tyoturvallisuus": "photo-1581094794329-c8112a89af12",
  "yrittajat": "photo-1556761175-4b46a572b786",
};

const fieldImageUrl = (slug: string) => {
  const id = FIELD_IMAGE[slug];
  return id
    ? `https://images.unsplash.com/${id}?auto=format&fit=crop&w=240&h=240&q=70`
    : null;
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
  bannerLabel: string;
  bannerNote: string;
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
    bannerLabel: "Alakohtainen koulutus",
    bannerNote:
      "Valitse oma alasi alta — pääset suoraan oman alasi Tekoälykoordinaattori-koulutuksen sivulle Keudan verkkosivuilla.",
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
    bannerLabel: "Valtakunnallinen ohjelma",
    bannerNote:
      "Alla voit silti selata aloja inspiraationa — varsinainen ohjelma on yhteinen kaikille toimialoille.",
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
    bannerLabel: "Valtakunnallinen ohjelma",
    bannerNote:
      "Alla voit silti selata aloja inspiraationa — varsinainen ohjelma on yhteinen kaikille toimialoille.",
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
              const visual = CATEGORY_VISUAL[f.category];
              const Icon = visual.icon;
              return (
                <a
                  key={f.slug}
                  href={href}
                  target="_blank"
                  rel="noopener"
                  className="group flex items-stretch gap-3 bg-card border border-border rounded-xl overflow-hidden hover:border-primary hover:shadow-card transition-all"
                >
                  <div
                    className={cn(
                      "relative w-20 shrink-0 bg-gradient-to-br overflow-hidden",
                      visual.gradient
                    )}
                  >
                    {fieldImageUrl(f.slug) && (
                      <img
                        src={fieldImageUrl(f.slug)!}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    )}
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40 mix-blend-multiply", visual.gradient)} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-1.5 left-1.5 w-7 h-7 rounded-md bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <Icon className="w-4 h-4 text-foreground" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 flex items-start justify-between gap-2 py-3 pr-3">
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
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
