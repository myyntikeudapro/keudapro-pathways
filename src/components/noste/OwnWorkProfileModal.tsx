import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCoachPanel } from "@/contexts/CoachPanelContext";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Send, Calendar, Sparkles, X } from "lucide-react";

type QType = "single" | "multi" | "text";

interface Question {
  id: string;
  text: string;
  type: QType;
  options?: string[];
  helper?: string;
}

type Answers = Record<string, string | string[]>;

const questions: Question[] = [
  {
    id: "tilanne",
    type: "single",
    text: "Missä vaiheessa oman työn rakentamista olet juuri nyt?",
    options: [
      "Idea kytee – pohdin mahdollisuutta",
      "Olen alkanut testata pienesti rinnalla",
      "Teen jo toimeksiantoja – haluan kasvattaa",
      "Olen yrittäjä mutta haluan uudistaa suuntaa",
    ],
  },
  {
    id: "muoto",
    type: "multi",
    text: "Millaisesta omasta työstä olet kiinnostunut? (valitse kaikki sopivat)",
    options: [
      "Projektit ja toimeksiannot freelancerina",
      "Kevytyrittäjyys tai laskutuspalvelu",
      "Oman yrityksen perustaminen",
      "Konsultointi tai asiantuntijapalvelut",
      "Luova työ, sisällöt tai oma tuote",
      "En vielä tiedä – haluan kartoittaa",
    ],
  },
  {
    id: "osaaminen",
    type: "text",
    text: "Mitä osaamista tai kokemusta haluaisit hyödyntää? Kirjoita lyhyesti omin sanoin.",
    helper: "Esim. ammatti, koulutus, vahvuudet, kiinnostuksen kohteet.",
  },
  {
    id: "kohderyhma",
    type: "single",
    text: "Tiedätkö keille haluaisit työtäsi tarjota?",
    options: [
      "Kyllä, kohderyhmä on melko selvä",
      "Karkea ajatus – tarvitsen tarkennusta",
      "En vielä – tämä on yksi pohdinnan paikka",
    ],
  },
  {
    id: "esteet",
    type: "multi",
    text: "Mikä tällä hetkellä eniten hidastaa etenemistäsi? (valitse kaikki sopivat)",
    options: [
      "Oman osaamisen sanoittaminen",
      "Näkyvyys ja markkinointi",
      "Hinnoittelu ja myynti",
      "Yritysmuoto, paperit ja talous",
      "Verkostot ja asiakkaiden löytäminen",
      "Itseluottamus tai rohkeus aloittaa",
    ],
  },
  {
    id: "tuki",
    type: "single",
    text: "Minkälaista tukea toivoisit eniten?",
    options: [
      "Sparrausta ja keskustelua suunnasta",
      "Konkreettisia työkaluja ja malleja",
      "Verkostoja ja kontakteja",
      "Valmennusohjelma tai koulutus",
    ],
  },
  {
    id: "yhteystieto",
    type: "text",
    text: "Sähköpostisi (vapaaehtoinen) – jätä jos haluat että otamme yhteyttä.",
    helper: "Voit myös jättää tyhjäksi ja lähettää yhteenvedon itse.",
  },
  {
    id: "avoin",
    type: "text",
    text: "Mitä haluaisit kertoa lisää tilanteestasi tai toiveistasi?",
    helper: "Valinnainen.",
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnWorkProfileModal({ open, onOpenChange }: Props) {
  const isMobile = useIsMobile();
  const { openChat } = useCoachPanel();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [validationError, setValidationError] = useState(false);
  const [sent, setSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalSteps = questions.length;
  const isSummary = step === totalSteps;
  const currentQ = questions[step] as Question | undefined;
  const progress = isSummary ? 100 : Math.round((step / totalSteps) * 100);

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

  const setSingle = (qId: string, opt: string) => {
    setValidationError(false);
    setAnswers((p) => ({ ...p, [qId]: opt }));
  };
  const toggleMulti = (qId: string, opt: string) => {
    setValidationError(false);
    setAnswers((p) => {
      const curr = (p[qId] as string[]) ?? [];
      return {
        ...p,
        [qId]: curr.includes(opt) ? curr.filter((o) => o !== opt) : [...curr, opt],
      };
    });
  };
  const setText = (qId: string, val: string) => setAnswers((p) => ({ ...p, [qId]: val }));

  const canAdvance = () => {
    if (!currentQ) return true;
    if (currentQ.type === "text") return true;
    const a = answers[currentQ.id];
    if (currentQ.type === "multi") return Array.isArray(a) && a.length > 0;
    return typeof a === "string" && a.length > 0;
  };

  const next = () => {
    if (!canAdvance()) {
      setValidationError(true);
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setValidationError(false);
    setStep((s) => Math.max(s - 1, 0));
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildSummaryText = () => {
    const parts: string[] = ["Oma yrittäjyys-/työprofiili – yhteenveto", ""];
    for (const q of questions) {
      const a = answers[q.id];
      if (!a || (Array.isArray(a) && a.length === 0)) continue;
      parts.push(q.text);
      parts.push(Array.isArray(a) ? a.join(", ") : (a as string));
      parts.push("");
    }
    parts.push("---");
    parts.push("Toivon että otatte minuun yhteyttä jatkokeskustelua varten.");
    return parts.join("\n");
  };

  const handleSend = () => {
    const subject = encodeURIComponent("Oma profiili – yhteenveto ja yhteydenottopyyntö");
    const body = encodeURIComponent(buildSummaryText());
    window.location.href = `mailto:keudapro@keuda.fi?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const handleBooking = () => {
    handleOpenChange(false);
    openBookingRequest({ source: "Oma profiili – varaa aika" });
  };

  const handleVeli = () => {
    handleOpenChange(false);
    setTimeout(() => openChat("veli"), 250);
  };

  const renderQuestion = () => {
    if (!currentQ) return null;
    const a = answers[currentQ.id];

    if (currentQ.type === "text") {
      return (
        <div className="space-y-3">
          <p className="text-base font-semibold text-foreground">{currentQ.text}</p>
          {currentQ.helper && (
            <p className="text-xs text-muted-foreground">{currentQ.helper}</p>
          )}
          <Textarea
            value={(a as string) ?? ""}
            onChange={(e) => setText(currentQ.id, e.target.value)}
            placeholder="Kirjoita vapaasti..."
            className="min-h-[120px]"
          />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-base font-semibold text-foreground">{currentQ.text}</p>
        {currentQ.type === "multi" && (
          <p className="text-xs text-muted-foreground">Valitse yksi tai useampi</p>
        )}
        <div className="grid gap-2">
          {currentQ.options?.map((opt) => {
            const selected =
              currentQ.type === "multi"
                ? (a as string[] | undefined)?.includes(opt)
                : a === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  currentQ.type === "multi"
                    ? toggleMulti(currentQ.id, opt)
                    : setSingle(currentQ.id, opt)
                }
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
        {validationError && (
          <p className="text-xs text-destructive">Valitse vähintään yksi vaihtoehto.</p>
        )}
      </div>
    );
  };

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border border-primary/40 text-primary">
          OMA PROFIILI · YHTEENVETO
        </span>
        <h3 className="text-lg font-bold text-foreground mt-3">
          Hieno alku – tästä lähdetään liikkeelle
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Voit lähettää yhteenvedon KeudaPRO:lle ja pyytää yhteydenottoa, varata ajan
          ihmisvalmentajalle, tai jatkaa profiilin hahmottamista Veli-valmentajan kanssa.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold text-foreground">Vastauksesi</h4>
        <dl className="text-xs space-y-2">
          {questions.map((q) => {
            const a = answers[q.id];
            if (!a || (Array.isArray(a) && a.length === 0)) return null;
            return (
              <div key={q.id}>
                <dt className="font-semibold text-muted-foreground">{q.text}</dt>
                <dd className="text-foreground mt-0.5 whitespace-pre-wrap">
                  {Array.isArray(a) ? a.join(", ") : (a as string)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Tietojasi käytetään vain yhteydenottoa ja valmistautumista varten. Yhteenveto
        lähetetään KeudaPRO:n valmentajalle ja sitä käsitellään luottamuksellisesti.
      </p>

      <div className="flex flex-col gap-2">
        <Button variant="cta" size="lg" className="w-full" onClick={handleSend} disabled={sent}>
          <Send className="w-4 h-4 mr-2" />
          {sent ? "Lähetetty!" : "Lähetä yhteenveto KeudaPRO:lle"}
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={handleBooking}>
          <Calendar className="w-4 h-4 mr-2" />
          Varaa aika ihmisvalmentajalle
        </Button>
        <Button variant="outline-primary" size="lg" className="w-full" onClick={handleVeli}>
          <Sparkles className="w-4 h-4 mr-2" />
          Jatka suunnittelua Veli-valmentajan kanssa
        </Button>
      </div>
    </div>
  );

  const innerContent = (
    <div ref={scrollRef} className="flex flex-col h-full overflow-y-auto">
      <div className="px-1 pt-1 pb-4">
        <Progress value={progress} className="h-2" />
      </div>

      {!isSummary && (
        <div className="mb-4 rounded-lg border border-border bg-accent/30 p-3 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            Haluatko hahmotella profiilia yhdessä Veli-valmentajan kanssa?{" "}
            <button
              onClick={handleVeli}
              className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Avaa Veli-chat
            </button>
            {" "}— voit palata lomakkeeseen myöhemmin.
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0">{isSummary ? renderSummary() : renderQuestion()}</div>

      {!isSummary && (
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
          <Button variant="ghost" size="sm" onClick={prev} disabled={step === 0}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Takaisin
          </Button>
          <span className="text-xs text-muted-foreground">
            Vaihe {step + 1} / {totalSteps}
          </span>
          <Button variant="default" size="sm" onClick={next}>
            {step === totalSteps - 1 ? "Näytä yhteenveto" : "Seuraava"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="h-[100dvh] flex flex-col p-5 pt-4">
          <SheetHeader className="flex-row items-center justify-between pb-2 space-y-0">
            <SheetTitle className="text-base">Rakenna oma profiilisi</SheetTitle>
            <button
              onClick={() => handleOpenChange(false)}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
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
          <DialogTitle>Rakenna oma profiilisi</DialogTitle>
        </DialogHeader>
        {innerContent}
      </DialogContent>
    </Dialog>
  );
}
