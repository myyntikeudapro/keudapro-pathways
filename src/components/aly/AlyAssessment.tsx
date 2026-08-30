import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AI_LEVELS, LEVEL_BY_ID, LevelId } from "./aiLevels";
import { trackEvent } from "@/lib/analytics";

type Weights = Partial<Record<LevelId, number>>;

type Option = { label: string; w: Weights };
type Question = { id: string; title: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    id: "rooli",
    title: "1. Mikä kuvaa rooliasi parhaiten?",
    options: [
      { label: "Asiantuntija", w: { coordinator: 2 } },
      { label: "Esihenkilö", w: { coordinator: 2, manager: 1 } },
      { label: "Kehittäjä / projektipäällikkö", w: { coordinator: 1, manager: 2 } },
      { label: "Päällikkö / liiketoimintavastuullinen", w: { manager: 3, director: 1 } },
      { label: "Johtoryhmän jäsen", w: { director: 3, manager: 1 } },
      { label: "Toimitusjohtaja", w: { director: 4 } },
      { label: "Muu", w: { coordinator: 1 } },
    ],
  },
  {
    id: "kaytto",
    title: "2. Miten käytät tekoälyä tällä hetkellä?",
    options: [
      { label: "En juuri käytä", w: { coordinator: 2 } },
      { label: "Kokeilen yksittäisiä työkaluja", w: { coordinator: 2 } },
      { label: "Käytän säännöllisesti", w: { coordinator: 2, manager: 1 } },
      { label: "Rakennan omia työnkulkuja tai apureita", w: { coordinator: 2, manager: 2 } },
      { label: "Kehitän tekoälyn käyttöä myös muille", w: { manager: 3, director: 1 } },
    ],
  },
  {
    id: "tavoite",
    title: "3. Mitä haluat ensisijaisesti saada aikaan?",
    options: [
      { label: "Tehostaa omaa työtäni", w: { coordinator: 3 } },
      { label: "Rakentaa käytännön AI-ratkaisuja", w: { coordinator: 3, manager: 1 } },
      { label: "Auttaa omaa tiimiäni", w: { coordinator: 2, manager: 1 } },
      { label: "Kehittää organisaation toimintaa", w: { manager: 3 } },
      { label: "Johtaa tekoälyn käyttöönottoa", w: { manager: 4, director: 1 } },
      { label: "Tehdä strategisia päätöksiä", w: { director: 4 } },
    ],
  },
  {
    id: "vastuu",
    title: "4. Kuinka laaja vastuusi on?",
    options: [
      { label: "Oma työ", w: { coordinator: 3 } },
      { label: "Oma tiimi", w: { coordinator: 2, manager: 1 } },
      { label: "Useita tiimejä", w: { manager: 3 } },
      { label: "Koko organisaatio", w: { manager: 2, director: 3 } },
      { label: "Strateginen päätöksenteko", w: { director: 4 } },
    ],
  },
  {
    id: "paamaara",
    title: "5. Mikä kuvaa tavoitettasi parhaiten?",
    options: [
      { label: "Haluan käyttää tekoälyä", w: { coordinator: 3 } },
      { label: "Haluan soveltaa ja rakentaa", w: { coordinator: 3, manager: 1 } },
      { label: "Haluan kehittää ja johtaa käyttöönottoa", w: { manager: 4 } },
      { label: "Haluan johtaa organisaatiota tekoälyaikakaudella", w: { director: 4 } },
    ],
  },
];

const NEXT_STEP: Partial<Record<LevelId, LevelId>> = {
  coordinator: "manager",
  manager: "director",
};

function score(answers: Record<string, number>) {
  const totals: Record<LevelId, number> = { coordinator: 0, manager: 0, director: 0 };
  QUESTIONS.forEach((q) => {
    const idx = answers[q.id];
    if (idx === undefined) return;
    // vastuun laajuus, kehittämisvastuu ja tavoite painavat eniten
    const weight = q.id === "vastuu" || q.id === "tavoite" || q.id === "paamaara" ? 1.5 : 1;
    const opt = q.options[idx];
    (Object.keys(opt.w) as LevelId[]).forEach((k) => {
      totals[k] += (opt.w[k] ?? 0) * weight;
    });
  });
  return totals;
}

function reasoning(level: LevelId, answers: Record<string, number>) {
  const roolI = QUESTIONS[0].options[answers.rooli]?.label.toLowerCase();
  const vastuu = QUESTIONS[3].options[answers.vastuu]?.label.toLowerCase();
  const tavoite = QUESTIONS[2].options[answers.tavoite]?.label.toLowerCase();
  const base = `Vastaustesi perusteella roolisi (${roolI}) ja vastuusi laajuus (${vastuu}) sekä tavoitteesi (${tavoite}) ohjaavat tähän tasoon.`;
  if (level === "coordinator")
    return `${base} Painopisteesi on omassa työssä ja käytännön soveltamisessa: tekoälyn käyttökohteiden tunnistamisessa, ratkaisujen rakentamisessa ja muiden tukemisessa.`;
  if (level === "manager")
    return `${base} Vastuusi ulottuu useisiin ihmisiin, prosesseihin tai toimintoihin, jolloin olennaista on käyttöönoton johtaminen, prosessien kehittäminen ja osaamisen rakentaminen.`;
  return `${base} Kysymys on koko organisaatiota koskevista päätöksistä, investoinneista ja linjauksista, jolloin näkökulma on strateginen.`;
}

export function AlyAssessment() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<LevelId | null>(null);

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);

  const submit = () => {
    const totals = score(answers);
    const best = (Object.keys(totals) as LevelId[]).reduce((a, b) =>
      totals[b] > totals[a] ? b : a,
    );
    setResult(best);
    trackEvent("ai_assessment_complete", { result: best });
    trackEvent(`ai_result_${best}`);
    requestAnimationFrame(() => {
      const el = document.getElementById("aly-testin-tulos");
      if (el)
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 110,
          behavior: "smooth",
        });
    });
  };

  const level = result ? LEVEL_BY_ID[result] : null;
  const next = result ? NEXT_STEP[result] : undefined;

  return (
    <section id="loyda-oma-tasosi" style={{ scrollMarginTop: 110 }} className="py-14 md:py-20 bg-[#E4F0EE]">
      <div className="keuda-container max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Mikä tekoälyrooli sinulle sopii?
        </h2>
        <p className="text-muted-foreground mb-8">
          Viisi kysymystä antaa suuntaa-antavan suosituksen lähtötasosta. Kyseessä ei ole
          sertifioiva osaamisen arviointi.
        </p>

        <div className="flex flex-col gap-6">
          {QUESTIONS.map((q) => (
            <fieldset key={q.id} className="rounded-xl border border-border bg-card p-4 md:p-5">
              <legend className="font-semibold text-foreground px-1">{q.title}</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i;
                  return (
                    <label
                      key={opt.label}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-primary",
                        selected
                          ? "border-primary bg-primary/10 font-semibold text-foreground"
                          : "border-border hover:border-primary/40 text-muted-foreground",
                      )}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        className="accent-[hsl(var(--primary))]"
                        checked={selected}
                        onChange={() => setAnswers((p) => ({ ...p, [q.id]: i }))}
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="cta" size="lg" onClick={submit} disabled={!allAnswered}>
            Näytä suositus
          </Button>
          {!allAnswered && (
            <p className="text-sm text-muted-foreground" role="status">
              Vastaa kaikkiin viiteen kysymykseen, niin saat suosituksen.
            </p>
          )}
        </div>

        {level && (
          <div
            id="aly-testin-tulos"
            role="status"
            aria-live="polite"
            style={{ scrollMarginTop: 110 }}
            className="mt-8 rounded-2xl border-2 border-primary bg-card p-5 md:p-7"
          >
            <p className="text-sm font-semibold text-primary mb-1">Suositeltu lähtötasosi</p>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {level.name} – {level.fi}
            </h3>

            <h4 className="font-bold text-foreground mb-1">Miksi tämä taso?</h4>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {reasoning(level.id, answers)}
            </p>

            <h4 className="font-bold text-foreground mb-1">Mitä ohjelmassa opitaan</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5 mb-4 space-y-1">
              {level.content.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>

            <h4 className="font-bold text-foreground mb-1">Kenelle se sopii</h4>
            <p className="text-sm text-muted-foreground mb-4">{level.audience.join(", ")}.</p>

            <p className="text-xs text-muted-foreground mb-4">
              Ajankohtaiset kesto-, laajuus- ja aikataulutiedot löytyvät koulutuksen omalta sivulta.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button variant="cta" asChild>
                <a
                  href={level.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent(level.event, { source: "assessment" });
                    trackEvent("course_registration_click", { level: level.id });
                  }}
                >
                  {level.cta} →
                </a>
              </Button>
              {next && (
                <Button variant="outline-primary" asChild>
                  <a
                    href={LEVEL_BY_ID[next].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent(LEVEL_BY_ID[next].event, { source: "assessment_next" })}
                  >
                    Seuraava mahdollinen askel: {LEVEL_BY_ID[next].name} →
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        <p className="sr-only">
          Tekoälypätevyyksien tasot: {AI_LEVELS.map((l) => `${l.name} (${l.fi})`).join(", ")}.
        </p>
      </div>
    </section>
  );
}
