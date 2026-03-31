import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Flag, Send, Calendar, Printer, X } from "lucide-react";

/* ─── Types ─── */
type QuestionType = "single" | "multi" | "text";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

interface FlagItem {
  label: string;
  severity: "critical" | "development" | "opportunity";
}

type Answers = Record<string, string | string[]>;

/* ─── Level config ─── */
interface LevelConfig {
  name: string;
  badge: string;
  heroClass: string;
  progressClass: string;
  badgeClass: string;
  calendarLabel: string;
  questions: Question[];
}

const levelConfigs: Record<number, LevelConfig> = {
  1: {
    name: "Kasvu käyntiin",
    badge: "TASO 1 · KÄYNNISTYS",
    heroClass: "bg-teal-50 border-teal-200",
    progressClass: "[&>div]:bg-teal-500",
    badgeClass: "bg-teal-100 text-teal-800 border-teal-200",
    calendarLabel: "Varaa kasvukartoitusaika",
    questions: [
      {
        id: "revenue_source",
        text: "Mikä on tällä hetkellä suurin tulonlähteesi?",
        type: "single",
        options: ["Yksi pääasiakas", "Muutama säännöllinen asiakas", "Vaihtelevat projektit", "En ole vielä myynyt"],
        required: true,
      },
      {
        id: "biggest_challenge",
        text: "Mikä on suurin haasteesi juuri nyt?",
        type: "multi",
        options: ["Asiakashankinta", "Hinnoittelu", "Näkyvyys ja markkinointi", "Ajan puute", "Osaamisen puute", "Rahoitus"],
        required: true,
      },
      {
        id: "sales_method",
        text: "Miten hankit tällä hetkellä asiakkaita?",
        type: "single",
        options: ["Puskaradio / suositukset", "Some-markkinointi", "Kylmäsoitot / sähköpostit", "En tiedä mistä aloittaa"],
        required: true,
      },
      {
        id: "goal_6mo",
        text: "Mikä on tärkein tavoitteesi seuraavalle 6 kuukaudelle?",
        type: "single",
        options: ["Saada ensimmäiset maksavat asiakkaat", "Kasvattaa myyntiä 50%+", "Palkata ensimmäinen työntekijä", "Saada kassavirta vakaaksi"],
        required: true,
      },
      {
        id: "open_message",
        text: "Onko jotain muuta mitä haluaisit kertoa tilanteestasi?",
        type: "open",
        required: false,
      },
    ],
  },
  2: {
    name: "Skaalaus ja systematisointi",
    badge: "TASO 2 · SKAALAUS",
    heroClass: "bg-blue-50 border-blue-200",
    progressClass: "[&>div]:bg-blue-500",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    calendarLabel: "Varaa skaalaustapaamisaika",
    questions: [
      {
        id: "team_size",
        text: "Kuinka monta henkilöä tiimissäsi työskentelee?",
        type: "single",
        options: ["Vain minä", "2–5 henkeä", "6–15 henkeä", "Yli 15 henkeä"],
        required: true,
      },
      {
        id: "bottleneck",
        text: "Mikä on suurin pullonkaula kasvulle?",
        type: "multi",
        options: ["Olen itse pullonkaula", "Prosessit puuttuvat", "Myyntiputki ei toimi", "Rekrytointi on vaikeaa", "Teknologia puuttuu", "Johtaminen"],
        required: true,
      },
      {
        id: "systems",
        text: "Mitä järjestelmiä käytät liiketoiminnassasi?",
        type: "multi",
        options: ["CRM-järjestelmä", "Taloushallinto-ohjelmisto", "Projektinhallinta", "Markkinointiautomaatio", "Ei mitään näistä"],
        required: true,
      },
      {
        id: "leadership",
        text: "Miten kuvailisit johtamistapaasi?",
        type: "single",
        options: ["Teen kaiken itse", "Delegoin mutta valvon tarkasti", "Tiimillä on selkeät vastuut", "Haluaisin kehittää johtamistani"],
        required: true,
      },
      {
        id: "open_message",
        text: "Kerro vapaasti tilanteestasi tai odotuksistasi?",
        type: "open",
        required: false,
      },
    ],
  },
  3: {
    name: "Teollistuminen ja uudistuminen",
    badge: "TASO 3 · UUDISTUMINEN",
    heroClass: "bg-purple-50 border-purple-200",
    progressClass: "[&>div]:bg-purple-500",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    calendarLabel: "Varaa siirtymäkeskusteluaika",
    questions: [
      {
        id: "transition_type",
        text: "Millaista siirtymää harkitset?",
        type: "multi",
        options: ["Omistajanvaihdos", "Kansainvälistyminen", "Liiketoiminnan uudelleenfokusointi", "Sukupolvenvaihdos", "Yrityskauppa"],
        required: true,
      },
      {
        id: "board_work",
        text: "Onko yrityksessäsi hallitustyöskentelyä?",
        type: "single",
        options: ["Kyllä, aktiivinen hallitus", "Hallitus on muodollinen", "Ei hallitusta", "Harkitsen hallituksen perustamista"],
        required: true,
      },
      {
        id: "knowledge_transfer",
        text: "Miten hiljainen tieto on dokumentoitu yrityksessäsi?",
        type: "single",
        options: ["Hyvin dokumentoitu", "Osittain dokumentoitu", "Ei juurikaan", "Kaikki tieto on minun päässäni"],
        required: true,
      },
      {
        id: "timeline",
        text: "Mikä on siirtymän aikataulu?",
        type: "single",
        options: ["6–12 kuukautta", "1–2 vuotta", "3–5 vuotta", "En ole vielä päättänyt"],
        required: true,
      },
      {
        id: "open_message",
        text: "Mitä muuta haluaisit kertoa tilanteestasi?",
        type: "open",
        required: false,
      },
    ],
  },
  4: {
    name: "Osaaminen käytäntöön",
    badge: "TASO 4 · OSAAMINEN",
    heroClass: "bg-amber-50 border-amber-200",
    progressClass: "[&>div]:bg-amber-500",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    calendarLabel: "Varaa osaamiskeskusteluaika",
    questions: [
      {
        id: "training_need",
        text: "Millaista osaamista tarvitset?",
        type: "multi",
        options: ["Kortit ja pätevyydet", "Kielikoulutus", "Toimialakohtainen osaaminen", "Henkilöstön kehittämisohjelma", "Johtamiskoulutus"],
        required: true,
      },
      {
        id: "participants",
        text: "Kuinka monelle henkilölle koulutusta tarvitaan?",
        type: "single",
        options: ["1–3 henkilöä", "4–10 henkilöä", "11–30 henkilöä", "Yli 30 henkilöä"],
        required: true,
      },
      {
        id: "urgency",
        text: "Millä aikataululla koulutusta tarvitaan?",
        type: "single",
        options: ["Heti / mahdollisimman pian", "1–3 kuukauden sisällä", "Seuraavan puolen vuoden aikana", "Suunnittelemme ensi vuodelle"],
        required: true,
      },
      {
        id: "funding",
        text: "Onko rahoitus jo selvillä?",
        type: "single",
        options: ["Kyllä, budjetti on varattu", "Haluaisin tietoa tukimahdollisuuksista", "En ole vielä miettinyt rahoitusta"],
        required: true,
      },
      {
        id: "open_message",
        text: "Kerro vapaasti osaamistarpeistasi tai toiveistasi?",
        type: "open",
        required: false,
      },
    ],
  },
};

/* ─── Flag generation ─── */
function generateFlags(level: number, answers: Answers): FlagItem[] {
  const flags: FlagItem[] = [];

  if (level === 1) {
    const src = answers.revenue_source;
    if (src === "En ole vielä myynyt") flags.push({ label: "Myynti ei ole vielä alkanut", severity: "critical" });
    if (src === "Yksi pääasiakas") flags.push({ label: "Asiakaskeskittymäriski", severity: "critical" });

    const challenges = answers.biggest_challenge as string[] | undefined;
    if (challenges?.includes("Rahoitus")) flags.push({ label: "Rahoitustilanne epäselvä", severity: "critical" });
    if (challenges?.includes("Hinnoittelu")) flags.push({ label: "Hinnoittelu vaatii kirkastusta", severity: "development" });
    if (challenges?.includes("Näkyvyys ja markkinointi")) flags.push({ label: "Markkinointia on kehitettävä", severity: "development" });
    if (challenges?.includes("Asiakashankinta")) flags.push({ label: "Asiakashankintaprosessi puuttuu", severity: "development" });

    const goal = answers.goal_6mo;
    if (goal === "Palkata ensimmäinen työntekijä") flags.push({ label: "Kasvupotentiaali — ensimmäinen rekrytointi", severity: "opportunity" });
    if (goal === "Kasvattaa myyntiä 50%+") flags.push({ label: "Kunnianhimoinen kasvutavoite", severity: "opportunity" });
  }

  if (level === 2) {
    const bottlenecks = answers.bottleneck as string[] | undefined;
    if (bottlenecks?.includes("Olen itse pullonkaula")) flags.push({ label: "Yrittäjä on pullonkaula", severity: "critical" });
    if (bottlenecks?.includes("Prosessit puuttuvat")) flags.push({ label: "Prosessit puuttuvat", severity: "critical" });
    if (bottlenecks?.includes("Myyntiputki ei toimi")) flags.push({ label: "Myyntiputki vaatii korjausta", severity: "development" });
    if (bottlenecks?.includes("Rekrytointi on vaikeaa")) flags.push({ label: "Rekrytointihaaste", severity: "development" });

    const leadership = answers.leadership;
    if (leadership === "Teen kaiken itse") flags.push({ label: "Delegointi on kehityskohde", severity: "critical" });

    const systems = answers.systems as string[] | undefined;
    if (systems?.includes("Ei mitään näistä")) flags.push({ label: "Digitalisaation mahdollisuus", severity: "opportunity" });
    if (systems?.includes("CRM-järjestelmä") && systems?.includes("Markkinointiautomaatio"))
      flags.push({ label: "Hyvä teknologiapohja — valmis skaalaukseen", severity: "opportunity" });
  }

  if (level === 3) {
    const knowledge = answers.knowledge_transfer;
    if (knowledge === "Kaikki tieto on minun päässäni") flags.push({ label: "Hiljainen tieto dokumentoimatta", severity: "critical" });
    if (knowledge === "Ei juurikaan") flags.push({ label: "Dokumentointi puutteellista", severity: "critical" });

    const board = answers.board_work;
    if (board === "Ei hallitusta") flags.push({ label: "Hallitustyö puuttuu", severity: "development" });

    const timeline = answers.timeline;
    if (timeline === "6–12 kuukautta") flags.push({ label: "Nopea aikataulu — valmistelu kiireellinen", severity: "critical" });

    const transitions = answers.transition_type as string[] | undefined;
    if (transitions?.includes("Kansainvälistyminen")) flags.push({ label: "Kansainvälistymismahdollisuus", severity: "opportunity" });
    if (transitions?.includes("Omistajanvaihdos")) flags.push({ label: "Omistajanvaihdos edessä", severity: "development" });
  }

  if (level === 4) {
    const urgency = answers.urgency;
    if (urgency === "Heti / mahdollisimman pian") flags.push({ label: "Kiireellinen koulutustarve", severity: "critical" });

    const funding = answers.funding;
    if (funding === "En ole vielä miettinyt rahoitusta") flags.push({ label: "Rahoitus selvitettävä", severity: "development" });
    if (funding === "Haluaisin tietoa tukimahdollisuuksista") flags.push({ label: "Tukimahdollisuudet kartoitettavissa", severity: "opportunity" });

    const needs = answers.training_need as string[] | undefined;
    if (needs && needs.length >= 3) flags.push({ label: "Laaja osaamistarve — kokonaisvaltainen ohjelma", severity: "opportunity" });
  }

  return flags;
}

/* ─── Summary description ─── */
function getSummaryDescription(level: number, flags: FlagItem[]): string {
  const criticalCount = flags.filter((f) => f.severity === "critical").length;
  const opportunityCount = flags.filter((f) => f.severity === "opportunity").length;

  if (level === 4) {
    if (criticalCount > 0) return "Osaamistarpeesi ovat kiireelliset — katsotaan yhdessä paras etenemissuunnitelma.";
    return "Hyvä tilannekuva osaamistarpeistasi. Räätälöidään sopiva koulutuskokonaisuus.";
  }

  if (criticalCount >= 2) return "Kartoituksesta nousi useita kriittisiä kohteita — tapaaminen auttaa priorisoimaan.";
  if (criticalCount === 1 && opportunityCount > 0) return "Yksi asia vaatii erityishuomiota, mutta myös mahdollisuuksia on näköpiirissä.";
  if (opportunityCount >= 2) return "Hienot edellytykset kasvulle — sparraus auttaa hyödyntämään mahdollisuudet.";
  return "Hyvä pohja — tarkennetaan suunta tapaamisessa.";
}

/* ─── Flag colors ─── */
const flagStyles: Record<FlagItem["severity"], string> = {
  critical: "border-red-200 bg-red-50 text-red-800",
  development: "border-amber-200 bg-amber-50 text-amber-800",
  opportunity: "border-green-200 bg-green-50 text-green-800",
};

const flagIcons: Record<FlagItem["severity"], string> = {
  critical: "text-red-500",
  development: "text-amber-500",
  opportunity: "text-green-500",
};

/* ─── Question labels for summary ─── */
function getQuestionLabel(qId: string, level: number): string {
  const q = levelConfigs[level]?.questions.find((q) => q.id === qId);
  return q?.text ?? qId;
}

/* ─── Print helper ─── */
function handlePrint(level: number, config: LevelConfig, answers: Answers, flags: FlagItem[]) {
  const w = window.open("", "_blank");
  if (!w) return;

  const lines: string[] = [];
  lines.push(`<h1 style="margin:0 0 4px">${config.badge}</h1>`);
  lines.push(`<h2 style="margin:0 0 16px">Tilannekuva kartoituksesta</h2>`);

  if (flags.length > 0) {
    lines.push(`<h3>Tärkeimmät aiheet tapaamiseen</h3><ul>`);
    flags.forEach((f) => {
      const color = f.severity === "critical" ? "red" : f.severity === "development" ? "#b45309" : "green";
      lines.push(`<li style="color:${color};margin-bottom:4px">${f.label}</li>`);
    });
    lines.push("</ul>");
  }

  lines.push("<h3>Vastauksesi</h3><dl>");
  for (const [key, val] of Object.entries(answers)) {
    if (key === "open_message" && !val) continue;
    const label = getQuestionLabel(key, level);
    const value = Array.isArray(val) ? val.join(", ") : val;
    if (value) lines.push(`<dt style="font-weight:600;margin-top:8px">${label}</dt><dd>${value}</dd>`);
  }
  lines.push("</dl>");

  if (answers.open_message) {
    lines.push(`<h3>Vapaa viesti</h3><p>${answers.open_message}</p>`);
  }

  lines.push(`<p style="color:gray;font-size:12px;margin-top:24px">Tietojasi käytetään vain kartoitustapaamiseen valmistautumiseen.</p>`);

  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kartoitus: ${config.name}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;color:#111}
    @media print{body{margin:20px}}</style></head><body>${lines.join("")}</body></html>`);
  w.document.close();
  w.print();
}

/* ─── Main component ─── */
interface AssessmentModalProps {
  level: 1 | 2 | 3 | 4;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssessmentModal({ level, open, onOpenChange }: AssessmentModalProps) {
  const isMobile = useIsMobile();
  const config = levelConfigs[level];
  const questions = config.questions;
  const totalSteps = questions.length + 1; // +1 for summary

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [validationError, setValidationError] = useState(false);
  const [sent, setSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setStep(0);
    setAnswers({});
    setValidationError(false);
    setSent(false);
  }, []);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) reset();
      onOpenChange(v);
    },
    [onOpenChange, reset],
  );

  const currentQ = questions[step] as Question | undefined;
  const isSummary = step === questions.length;
  const progress = isSummary ? 100 : Math.round((step / questions.length) * 100);

  /* ─── answer handlers ─── */
  const toggleMulti = (qId: string, option: string) => {
    setValidationError(false);
    setAnswers((prev) => {
      const curr = (prev[qId] as string[]) ?? [];
      return { ...prev, [qId]: curr.includes(option) ? curr.filter((o) => o !== option) : [...curr, option] };
    });
  };

  const selectSingle = (qId: string, option: string) => {
    setValidationError(false);
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const setOpen = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  /* ─── navigation ─── */
  const canAdvance = () => {
    if (!currentQ) return true;
    if (!currentQ.required) return true;
    const a = answers[currentQ.id];
    if (currentQ.type === "multi") return Array.isArray(a) && a.length > 0;
    if (currentQ.type === "single") return typeof a === "string" && a.length > 0;
    return true;
  };

  const next = () => {
    if (!canAdvance()) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    setStep((s) => Math.min(s + 1, questions.length));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setValidationError(false);
    setStep((s) => Math.max(s - 1, 0));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ─── summary helpers ─── */
  const flags = generateFlags(level, answers);
  const summaryDesc = getSummaryDescription(level, flags);

  const buildMailtoBody = () => {
    const parts: string[] = [`Taso: ${config.badge}`, ""];
    for (const q of questions) {
      const a = answers[q.id];
      if (!a || (Array.isArray(a) && a.length === 0)) continue;
      parts.push(`${q.text}`);
      parts.push(Array.isArray(a) ? a.join(", ") : a);
      parts.push("");
    }
    if (flags.length > 0) {
      parts.push("--- Tärkeimmät aiheet ---");
      flags.forEach((f) => parts.push(`• ${f.label} (${f.severity === "critical" ? "kriittinen" : f.severity === "development" ? "kehityskohta" : "mahdollisuus"})`));
    }
    return encodeURIComponent(parts.join("\n"));
  };

  const handleSend = () => {
    const subject = encodeURIComponent(`Kartoitus: ${config.name}`);
    const body = buildMailtoBody();
    window.location.href = `mailto:LISAA_SAHKOPOSTIOSOITE_TAHAN?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const handleBooking = () => {
    window.open("https://calendly.com/LISAA-TAHAN", "_blank");
  };

  /* ─── Render question ─── */
  const renderQuestion = () => {
    if (!currentQ) return null;
    const a = answers[currentQ.id];

    if (currentQ.type === "open") {
      return (
        <div className="space-y-3">
          <p className="text-base font-semibold text-foreground">{currentQ.text}</p>
          <Textarea
            value={(a as string) ?? ""}
            onChange={(e) => setOpen(currentQ.id, e.target.value)}
            placeholder="Kirjoita vapaasti..."
            className="min-h-[120px]"
          />
          {!currentQ.required && <p className="text-xs text-muted-foreground">Valinnainen</p>}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-base font-semibold text-foreground">{currentQ.text}</p>
        {currentQ.type === "multi" && <p className="text-xs text-muted-foreground">Valitse yksi tai useampi</p>}
        <div className="grid gap-2">
          {currentQ.options?.map((opt) => {
            const selected =
              currentQ.type === "multi" ? (a as string[] | undefined)?.includes(opt) : a === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => (currentQ.type === "multi" ? toggleMulti(currentQ.id, opt) : selectSingle(currentQ.id, opt))}
                className={cn(
                  "text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all",
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50",
                  validationError && !selected && "border-destructive/50",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {validationError && <p className="text-xs text-destructive">Valitse vähintään yksi vaihtoehto</p>}
      </div>
    );
  };

  /* ─── Render summary ─── */
  const renderSummary = () => (
    <div className="space-y-6">
      {/* Hero card */}
      <div className={cn("rounded-xl border p-5", config.heroClass)}>
        <span className={cn("text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border", config.badgeClass)}>
          {config.badge}
        </span>
        <h3 className="text-lg font-bold text-foreground mt-3">
          {level === 4 ? "Osaamistarpeesi tilannekuva" : "Tilannekuvasi kartoituksesta"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{summaryDesc}</p>
      </div>

      {/* Flags */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">Tärkeimmät aiheet tapaamiseen</h4>
        {flags.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hyvä pohja — tarkennetaan tapaamisessa</p>
        ) : (
          <div className="grid gap-2">
            {flags.map((f) => (
              <div key={f.label} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-sm", flagStyles[f.severity])}>
                <Flag className={cn("w-3.5 h-3.5 flex-shrink-0", flagIcons[f.severity])} />
                {f.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Answers summary */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-foreground">Vastauksesi</h4>
        <dl className="text-xs space-y-2">
          {questions.map((q) => {
            const a = answers[q.id];
            if (!a || (Array.isArray(a) && a.length === 0)) return null;
            if (q.id === "open_message") return null;
            return (
              <div key={q.id}>
                <dt className="font-semibold text-muted-foreground">{q.text}</dt>
                <dd className="text-foreground mt-0.5">{Array.isArray(a) ? a.join(", ") : a}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* Open message */}
      {answers.open_message && (
        <div className="rounded-lg border border-border bg-accent/40 p-4">
          <h4 className="text-sm font-bold text-foreground mb-1">Vapaa viesti</h4>
          <p className="text-sm text-foreground">{answers.open_message as string}</p>
        </div>
      )}

      {/* GDPR */}
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Tietojasi käytetään vain kartoitustapaamiseen valmistautumiseen. Yhteenveto lähetetään valmentajallesi ja sitä käsitellään luottamuksellisesti.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <Button variant="cta" size="lg" className="w-full" onClick={handleSend} disabled={sent}>
          <Send className="w-4 h-4 mr-2" />
          {sent ? "Lähetetty!" : "Lähetä yhteenveto valmentajalle"}
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={handleBooking}>
          <Calendar className="w-4 h-4 mr-2" />
          {config.calendarLabel}
        </Button>
        <Button variant="ghost" size="lg" className="w-full" onClick={() => handlePrint(level, config, answers, flags)}>
          <Printer className="w-4 h-4 mr-2" />
          Tulosta yhteenveto
        </Button>
      </div>
    </div>
  );

  /* ─── Inner content ─── */
  const innerContent = (
    <div ref={scrollRef} className="flex flex-col h-full overflow-y-auto">
      {/* Progress */}
      <div className="px-1 pt-1 pb-4">
        <Progress value={progress} className={cn("h-2", config.progressClass)} />
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0">
        {isSummary ? renderSummary() : renderQuestion()}
      </div>

      {/* Navigation (not on summary) */}
      {!isSummary && (
        <div className="flex items-center justify-between pt-6 mt-auto border-t border-border">
          <Button variant="ghost" size="sm" onClick={prev} disabled={step === 0}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Takaisin
          </Button>
          <span className="text-xs text-muted-foreground">
            Vaihe {step + 1} / {questions.length}
          </span>
          <Button variant="default" size="sm" onClick={next}>
            {step === questions.length - 1 ? "Näytä tilannekuva" : "Seuraava"} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );

  /* ─── Render: Sheet on mobile, Dialog on desktop ─── */
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="h-[100dvh] flex flex-col p-5 pt-4">
          <SheetHeader className="flex-row items-center justify-between pb-2 space-y-0">
            <SheetTitle className="text-base">
              <span className={cn("text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border mr-2", config.badgeClass)}>
                {config.badge}
              </span>
            </SheetTitle>
            <button onClick={() => handleOpenChange(false)} className="rounded-sm opacity-70 hover:opacity-100 transition-opacity">
              <X className="h-5 w-5" />
              <span className="sr-only">Sulje</span>
            </button>
          </SheetHeader>
          <div className="flex-1 min-h-0 overflow-y-auto">{innerContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={cn("text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border", config.badgeClass)}>
              {config.badge}
            </span>
          </DialogTitle>
        </DialogHeader>
        {innerContent}
      </DialogContent>
    </Dialog>
  );
}
