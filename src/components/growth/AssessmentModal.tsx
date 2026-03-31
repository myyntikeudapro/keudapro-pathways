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
      { id: "lv", type: "single", text: "Miten liikevaihto on kehittynyt viimeisen 12 kk aikana?", options: ["Kasvanut selvästi", "Pysynyt samana — ei kasva", "Vaihtelee paljon — ei ennustettava", "Laskenut tai haasteita"] },
      { id: "asiakkaat", type: "single", text: "Mistä uudet asiakkaat pääasiassa tulevat?", options: ["Suosittelut ja verkostot", "Some tai verkkosivut", "Oma aktiivinen myynti", "Ei selvää kanavaa — satunnaisia"] },
      { id: "myynti", type: "multi", text: "Mikä kuvaa myyntiäsi parhaiten? (valitse kaikki sopivat)", options: ["Hintani on selkeä ja perustelen sen", "Myyn usein alennuksella tai tingitään", "En tiedä tarkalleen mikä katteeni on", "Myyn systemaattisesti — on prosessi", "Myyn vain kun on pakko"] },
      { id: "aika", type: "single", text: "Mikä vie eniten aikaasi tällä hetkellä?", options: ["Operatiivinen työ — teen kaiken itse", "Asiakastyö — ei jää aikaa myyntiin", "Hallinto ja juoksevat asiat", "Melko hyvä tasapaino"] },
      { id: "nakyvyys", type: "single", text: "Miten potentiaaliset asiakkaat löytävät sinut?", options: ["Minulla on selkeä someviestintä tai verkkosivut", "Jotain on mutta ei ole systemaattista", "Lähinnä suusanallisesti — ei aktiivista markkinointia", "En tiedä miten asiakkaat löytävät minut"] },
      { id: "kiteys", type: "single", text: "Miten kirkkaasti olet kiteyttänyt mitä myyt ja kenelle?", options: ["Erittäin selkeästi — osaan sanoa sen yhdellä lauseella", "Melko selkeästi mutta viestintä vaihtelee", "Tarjoan monelle mutta ei ole selkeää kohderyhmää", "En ole oikein miettinyt tätä"] },
      { id: "avoin", type: "text", text: "Mikä on se yksi asia johon toivot selkeimmän avun kasvukartoituksessa?" },
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
      { id: "johto", type: "single", text: "Miten yritys toimii ilman sinua — esim. lomasi aikana?", options: ["Hyvin — tiimillä on selkeät vastuut", "Toimii mutta vaatii paljon viestejä minulle", "Käytännössä hidastuu tai pysähtyy", "Ei tiimiä — toimin yksin tai osa-aikaisten kanssa"] },
      { id: "putki", type: "single", text: "Miten uudet asiakasmahdollisuudet syntyvät ja etenevät?", options: ["Selkeä myyntiprosessi — seuraamme aktiivisesti", "Myynti tapahtuu mutta ei ole systemaattista", "Reaktiivista — vastataan tarjouspyyntöihin", "Myyntiputki on pullonkaula — liidejä ei tule"] },
      { id: "prosessit", type: "multi", text: "Mitkä kuvaavat prosessejanne? (valitse kaikki sopivat)", options: ["Toimitusprosessi on dokumentoitu ja toistettava", "Jokaisella projektilla tehdään asiat eri tavalla", "Laskutus ja talous ovat ajantasaiset", "HR-prosessit ovat olemassa", "Hiljainen tieto on pääasiassa vain minulla"] },
      { id: "ai", type: "single", text: "Miten tekoäly tai digitaaliset työkalut näkyvät toiminnassanne?", options: ["Aktiivisessa käytössä — haluamme skaalata", "Yksittäiset henkilöt kokeilevat — ei systemaattista", "Haluaisimme mutta ei aikaa tai osaamista", "Emme ole hyödyntäneet — ei tuntunut ajankohtaiselta"] },
      { id: "hr", type: "single", text: "Miten kuvailisit henkilöstösi sitoutumista ja rekrytointia?", options: ["Tiimi sitoutunut — vähän vaihtuvuutta", "Avainhenkilöt ok mutta muilla on haasteita", "Vaihtuvuus tai rekrytointi on ongelma", "Kasvamme — tarvitsemme rekrytointia lähiaikoina"] },
      { id: "talous", type: "single", text: "Miten hyvin tunnet yrityksesi taloudellisen tilanteen?", options: ["Seuraan kuukausittain — tiedän katteen ja kassavirran", "Seuraan kvartaaleittain tai kirjanpitäjän kautta", "Tiedän myynnin mutta kate on epäselvä", "Talous ei ole vahvuuteni — haluaisin näkyvyyttä"] },
      { id: "avoin", type: "text", text: "Mitä haluaisit valmentajan erityisesti ymmärtävän tilanteestasi?" },
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
      { id: "rooli", type: "single", text: "Miten kuvailisit omaa rooliasi yrityksessäsi tällä hetkellä?", options: ["Strateginen omistaja — johto hoitaa operatiivisen", "Toimitusjohtaja-omistaja — johdan ja teen itse", "Olen yhä liikaa kiinni operatiivisessa arjessa", "Harkitsen oman roolini muuttamista tai vetäytymistä"] },
      { id: "hallitus", type: "single", text: "Miten hallitustyö toimii yrityksessäsi?", options: ["Aktiivinen hallitus — tuo lisäarvoa strategiaan", "Hallitus on olemassa mutta lähinnä muodollinen", "Ei varsinaista hallitusta — teen päätökset yksin", "Harkitsen hallituksen rakentamista tai ulkoista neuvonantajaa"] },
      { id: "ovaihdos", type: "single", text: "Oletko ajatellut omistajanvaihdosta tai liiketoiminnan jatkuvuutta?", options: ["En aktiivisesti — jatkan toistaiseksi", "Olen alkanut miettiä — aikajänne 3–7 vuotta", "Prosessi on jo käynnissä tai käynnistymässä", "Haen sukupolvenvaihdosta tai sisäistä siirtoa"] },
      { id: "tieto", type: "single", text: "Miten hyvin yrityksen osaaminen on dokumentoitu ja siirretty tiimille?", options: ["Hyvin — prosessit ja asiakastieto on dokumentoitu", "Osittain — tärkeimmät asiat tallessa mutta aukkoja on", "Heikosti — kriittinen tieto on vain minulla", "Tiedostamme tähän liittyvän riskin"] },
      { id: "strategia", type: "single", text: "Miten selkeä yrityksesi strateginen suunta on seuraavalle 3–5 vuodelle?", options: ["Erittäin selkeä — kirjattu strategia ja sitoudumme siihen", "Suunnilleen selkeä — suunta tiedossa mutta ei kirjattuna", "Haen suuntaa — toimiala tai markkina on muutoksessa", "Harkitsen merkittävää liiketoimintamallin muutosta"] },
      { id: "tki", type: "single", text: "Miten hyödynnät ulkopuolisia verkostoja tai kehitysmahdollisuuksia?", options: ["Aktiivisesti — kumppanuuksia, hankkeita tai kansainvälisiä yhteyksiä", "Jonkin verran — käymme tapahtumissa mutta ei syvempää", "Vähän — ei ole ollut prioriteetti", "Haemme kansainvälistymistä tai uusia markkinoita"] },
      { id: "avoin", type: "text", text: "Mitä valmentajan on tärkeintä tietää tilanteestasi ennen tapaamista?" },
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
      { id: "nykytila", type: "single", text: "Miten hyvin henkilöstönne osaaminen vastaa nykyisiä ja tulevia tarpeita?", options: ["Hyvin — kehitämme aktiivisesti", "Osittain — joillakin alueilla aukkoja", "Meillä on tarpeita joita emme ole pystyneet täyttämään", "En tiedä tarkalleen — tilannekuva puuttuu"] },
      { id: "tyyppi", type: "multi", text: "Millaista osaamisen kehittämistä etsit? (valitse kaikki sopivat)", options: ["Pakolliset kortit ja pätevyydet (EA, hygienia, työturvallisuus jne.)", "Kieli- ja viestintäosaaminen (suomi, englanti, ruotsi)", "Toimialakohtainen ammatillinen osaaminen", "Johtamis- ja esihenkilöosaaminen", "Tekoäly ja digitaaliset taidot arjessa", "Myynti- ja asiakaspalveluosaaminen"] },
      { id: "kohde", type: "single", text: "Kenelle koulutusta ensisijaisesti haetaan?", options: ["Koko henkilöstölle — yhteinen ohjelma", "Tietylle tiimille tai yksikölle", "Yksittäisille avainhenkilöille", "Itselleni yrittäjänä tai johtajana"] },
      { id: "aikataulu", type: "single", text: "Millä aikataululla koulutus sopisi parhaiten?", options: ["Mahdollisimman pian — tarve on akuutti", "Seuraavan 3–6 kuukauden sisällä", "Kartoitamme vasta — ei kiireellistä", "Jatkuva kehittäminen — haemme pitkäaikaista kumppania"] },
      { id: "rahoitus", type: "single", text: "Onko yrityksellänne tietoa osaamisen kehittämisen rahoitusmahdollisuuksista?", options: ["Kyllä — olemme hakeneet tai hyödyntäneet tukia", "Osittain — tiedämme että tukia on mutta emme tunne niitä hyvin", "Ei — emme tiedä mitä rahoitusta on saatavilla", "Rahoitamme itse — ei tarvetta tuille"] },
      { id: "avoin", type: "text", text: "Kerro lisää osaamistarpeistanne tai erityistoiveistanne koulutuksen suhteen." },
    ],
  },
};

/* ─── Flag generation ─── */
function generateFlags(level: number, answers: Answers): FlagItem[] {
  const flags: FlagItem[] = [];
  const a = answers;
  const includes = (id: string, ...terms: string[]) => {
    const v = a[id];
    if (!v) return false;
    if (Array.isArray(v)) return terms.some((t) => v.some((val) => val.includes(t)));
    return terms.some((t) => v.includes(t));
  };

  if (level === 1) {
    if (includes("lv", "Vaihtelee", "Laskenut")) flags.push({ label: "Kassavirran ennustettavuus", severity: "critical" });
    if (includes("asiakkaat", "satunnaisia")) flags.push({ label: "Asiakashankinnan kanava puuttuu", severity: "development" });
    if (includes("myynti", "alennuksella")) flags.push({ label: "Hinnoittelun perustelu", severity: "development" });
    if (includes("myynti", "katteeni")) flags.push({ label: "Kateanalyysi puuttuu", severity: "development" });
    if (includes("myynti", "pakko")) flags.push({ label: "Systemaattinen myynti", severity: "development" });
    if (includes("nakyvyys", "suusanallisesti", "En tiedä")) flags.push({ label: "Markkinoinnin näkyvyys", severity: "opportunity" });
    if (includes("kiteys", "monelle", "miettinyt")) flags.push({ label: "Palvelun kirkastus ja kohderyhmä", severity: "opportunity" });
  }

  if (level === 2) {
    if (includes("johto", "hidastuu", "pysähtyy", "yksin")) flags.push({ label: "Yrittäjä pullonkaulana — delegointi", severity: "critical" });
    if (includes("putki", "Reaktiivista", "pullonkaula")) flags.push({ label: "Myyntiputki rakentamatta", severity: "development" });
    if (includes("prosessit", "eri tavalla")) flags.push({ label: "Toistettavat prosessit puuttuvat", severity: "development" });
    if (includes("prosessit", "Hiljainen tieto")) flags.push({ label: "Hiljaisen tiedon riski", severity: "development" });
    if (includes("ai", "ei aikaa", "Emme ole")) flags.push({ label: "Tekoälyn käyttöönotto", severity: "opportunity" });
    if (includes("hr", "Vaihtuvuus", "rekrytointia")) flags.push({ label: "HR ja rekrytointi", severity: "development" });
    if (includes("talous", "kate on epäselvä", "vahvuuteni")) flags.push({ label: "Talouden näkyvyys", severity: "development" });
  }

  if (level === 3) {
    if (includes("rooli", "liikaa kiinni", "Harkitsen")) flags.push({ label: "Omistajan rooli — kiireellinen", severity: "critical" });
    if (includes("hallitus", "muodollinen", "yksin")) flags.push({ label: "Hallitustyön kehittäminen", severity: "development" });
    if (includes("ovaihdos", "käynnissä", "3–7")) flags.push({ label: "Omistajanvaihdoksen valmistelu", severity: "critical" });
    if (includes("tieto", "Heikosti", "riskin")) flags.push({ label: "Hiljainen tieto — kriittinen riski", severity: "critical" });
    if (includes("strategia", "Haen suuntaa", "merkittävää")) flags.push({ label: "Strateginen uudelleensuuntaus", severity: "development" });
    if (includes("tki", "kansainvälistymistä")) flags.push({ label: "Kansainvälistymisstrategia", severity: "opportunity" });
    if (includes("tki", "Vähän")) flags.push({ label: "Verkostot ja TKI-mahdollisuudet", severity: "opportunity" });
  }

  if (level === 4) {
    if (includes("nykytila", "aukkoja", "tarpeita", "puuttuu")) flags.push({ label: "Osaamisen aukkoja — kartoitetaan", severity: "development" });
    if (includes("tyyppi", "Pakolliset kortit")) flags.push({ label: "Pakolliset pätevyydet — priorisoidaan", severity: "opportunity" });
    if (includes("tyyppi", "Tekoäly")) flags.push({ label: "Tekoäly- ja digitaidot", severity: "opportunity" });
    if (includes("tyyppi", "Johtamis")) flags.push({ label: "Johtamisosaaminen", severity: "opportunity" });
    if (includes("rahoitus", "Ei —", "Osittain")) flags.push({ label: "Rahoitusmahdollisuudet selvitetään", severity: "development" });
    if (includes("aikataulu", "akuutti")) flags.push({ label: "Kiireellinen — priorisoidaan", severity: "critical" });
  }

  return flags;
}

/* ─── Summary description ─── */
const positiveTexts: Record<number, string> = {
  1: "Hyvä pohja kasvulle — fokus on myynnin systematisoinnissa ja kassavirran kasvattamisessa. Valmentaja auttaa löytämään seuraavan konkreettisen askeleen.",
  2: "Hyvä pohja skaalaukselle — yritys on kasvuvaiheessa ja tarvitsee systematiikkaa. Valmentaja auttaa rakentamaan selkeän skaalauspolun.",
  3: "Yrityksessäsi on vakaa pohja ja selkeä suunta. Asiantuntija auttaa fokusoimaan seuraavan merkittävän siirtymän ja rakentamaan sille polun.",
  4: "Yrityksenne lähestymistapa osaamisen kehittämiseen on harkittu. Koulutusasiantuntija räätälöi teille sopivan kokonaisuuden — myös rahoitusvaihtoehdot selvitetään.",
};

function getSummaryDescription(level: number, flags: FlagItem[]): string {
  const redCount = flags.filter((f) => f.severity === "critical").length;
  const amberCount = flags.filter((f) => f.severity === "development").length;
  const total = redCount + amberCount;

  if (total === 0) return positiveTexts[level] ?? "Hyvä pohja — tarkennetaan tapaamisessa.";

  if (redCount >= 2)
    return `Kartoitus nosti esiin ${total} kehityskohtaa, joista ${redCount} on kiireellistä. Valmentaja auttaa rakentamaan selkeän toimintasuunnitelman — tapaamisessa käydään nämä läpi järjestyksessä.`;

  return `Kartoituksessa tunnistettiin ${total} kehityskohtaa. Näistä käydään valmentajan kanssa läpi ne, jotka vaikuttavat eniten kasvuun ja arkeen.`;
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
    if (currentQ.type === "text") return true; // text fields are optional
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

    if (currentQ.type === "text") {
      return (
        <div className="space-y-3">
          <p className="text-base font-semibold text-foreground">{currentQ.text}</p>
          <Textarea
            value={(a as string) ?? ""}
            onChange={(e) => setOpen(currentQ.id, e.target.value)}
            placeholder="Kirjoita vapaasti..."
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">Valinnainen</p>
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
            if (q.id === "avoin") return null;
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
