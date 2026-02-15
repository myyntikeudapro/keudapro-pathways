import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWizard } from "@/contexts/WizardContext";
import { cn } from "@/lib/utils";

type Route = "aly" | "noste" | "kasvu";

interface Option {
  text: string;
  scores: Partial<Record<Route, number>>;
}

interface Question {
  question: string;
  options: Option[];
}

const questions: Question[] = [
  {
    question: "Mikä kuvaa tilannettasi parhaiten?",
    options: [
      { text: "Johdan tiimiä tai organisaatiota ja etsin uusia tapoja tehdä työtä", scores: { aly: 3, kasvu: 1 } },
      { text: "Olen siirtymässä uuteen rooliin, alalle tai yrittäjyyteen", scores: { noste: 3, kasvu: 1 } },
      { text: "Yritykseni tarvitsee kasvua, uudistumista tai lisää osaamista", scores: { kasvu: 3, aly: 1 } },
      { text: "Etsin suuntaa – tilanne on auki", scores: { noste: 2, aly: 1, kasvu: 1 } },
    ],
  },
  {
    question: "Mikä haaste tuntuu tällä hetkellä suurimmalta?",
    options: [
      { text: "Tekoäly ja teknologia muuttavat toimialaani", scores: { aly: 3, noste: 1, kasvu: 1 } },
      { text: "Tarvitsen rohkeutta tai tukea isoon elämänmuutokseen", scores: { noste: 3 } },
      { text: "Yritykseni ei kasva tai uudistu riittävästi", scores: { kasvu: 3 } },
      { text: "Osaamiseni ei vastaa sitä mihin haluan", scores: { noste: 2, kasvu: 2, aly: 1 } },
    ],
  },
  {
    question: "Mitä toivot saavuttavasi seuraavan vuoden aikana?",
    options: [
      { text: "Vahvistan johtajuuttani ja päätöksentekokykyäni", scores: { aly: 3, kasvu: 1 } },
      { text: "Löydän uuden suunnan ja lähden etenemään", scores: { noste: 3 } },
      { text: "Yritykseni liikevaihto tai osaaminen kasvaa merkittävästi", scores: { kasvu: 3 } },
      { text: "Markkina-arvoni ja asiantuntijuuteni tunnistetaan laajemmin", scores: { aly: 2, kasvu: 2, noste: 1 } },
    ],
  },
  {
    question: "Millainen tuki sopii sinulle parhaiten?",
    options: [
      { text: "Sparrauskumppani joka haastaa ajatteluani", scores: { aly: 2, kasvu: 2, noste: 1 } },
      { text: "Valmentaja joka auttaa rakentamaan uskoa ja suuntaa", scores: { noste: 3 } },
      { text: "Asiantuntijaverkosto josta löydän konkreettista apua", scores: { kasvu: 3, noste: 1 } },
      { text: "Strateginen kumppani joka tuntee tekoälyn mahdollisuudet", scores: { aly: 3, kasvu: 1 } },
    ],
  },
  {
    question: "Kuinka nopeasti haluat edetä?",
    options: [
      { text: "Heti – tilanne vaatii toimintaa nyt", scores: { noste: 2, kasvu: 2, aly: 1 } },
      { text: "Harkitusti – haluan ensin ymmärtää kokonaisuuden", scores: { aly: 3, noste: 1, kasvu: 1 } },
      { text: "Prosessina – rakennan askel kerrallaan", scores: { noste: 3, kasvu: 2, aly: 1 } },
      { text: "Pitkäjänteisesti – investoin tulevaisuuteen", scores: { kasvu: 3, aly: 2 } },
    ],
  },
];

const results: Record<Route, { label: string; description: string; path: string }> = {
  aly: {
    label: "ÄLY",
    description: "Sinulle sopii reitti, jossa vahvistat strategista ajatteluasi ja opit hyödyntämään tekoälyä johtamisen tukena.",
    path: "/aly",
  },
  noste: {
    label: "NOSTE",
    description: "Olet siirtymävaiheessa – ja se on voimavara. Reitti NOSTE tukee sinua löytämään suunnan ja ottamaan seuraavan askeleen.",
    path: "/noste",
  },
  kasvu: {
    label: "KASVU",
    description: "Yrityksesi on valmis seuraavaan vaiheeseen. Reitti KASVU yhdistää sinut oikeisiin verkostoihin ja konkreettisiin työkaluihin.",
    path: "/kasvu",
  },
};

export function RouteWizard() {
  const { isOpen, closeWizard } = useWizard();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<Route, number>>({ aly: 0, noste: 0, kasvu: 0 });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const reset = useCallback(() => {
    setStep(0);
    setScores({ aly: 0, noste: 0, kasvu: 0 });
    setSelectedOption(null);
    setShowResult(false);
    setAnimating(false);
  }, []);

  const handleClose = () => {
    closeWizard();
    setTimeout(reset, 300);
  };

  const handleSelect = (optionIndex: number) => {
    if (animating) return;
    setSelectedOption(optionIndex);

    const option = questions[step].options[optionIndex];
    const newScores = { ...scores };
    (Object.entries(option.scores) as [Route, number][]).forEach(([route, pts]) => {
      newScores[route] += pts;
    });
    setScores(newScores);

    setAnimating(true);
    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(step + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
      setAnimating(false);
    }, 400);
  };

  const winningRoute: Route = (Object.entries(scores) as [Route, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  const result = results[winningRoute];
  const progressValue = showResult ? 100 : ((step) / questions.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="px-5 pt-4 pb-1">
          <div className="flex items-center justify-between mb-1">
            <DialogTitle className="text-xs font-medium text-muted-foreground">
              {showResult ? "Tuloksesi" : `Kysymys ${step + 1}/${questions.length}`}
            </DialogTitle>
          </div>
          <Progress value={progressValue} className="h-1" />
        </div>

        <div className="px-5 pb-5 pt-2">
          {!showResult ? (
            <div
              key={step}
              className={cn(
                "transition-all duration-300",
                animating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
              )}
            >
              <h2 className="text-base md:text-lg font-bold text-foreground mb-3 leading-snug line-clamp-2">
                {questions[step].question}
              </h2>
              <div className="space-y-2">
                {questions[step].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={cn(
                      "w-full text-left py-2 px-3 rounded-lg border-2 transition-all duration-200",
                      "hover:border-primary hover:bg-accent/50",
                      selectedOption === i
                        ? "border-primary bg-accent"
                        : "border-border bg-background"
                    )}
                  >
                    <span className="text-sm text-foreground break-words">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <span className="text-xl font-bold text-primary">{result.label[0]}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                Reitti {result.label}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base mb-5 max-w-md mx-auto leading-relaxed">
                {result.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="cta"
                  size="lg"
                  onClick={() => {
                    handleClose();
                    navigate(result.path);
                  }}
                >
                  Siirry reitille {result.label}
                </Button>
                <Button variant="outline" size="lg" onClick={() => { reset(); }}>
                  Tee uudelleen
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
