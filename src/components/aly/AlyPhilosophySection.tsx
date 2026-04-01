import { ArrowRight } from "lucide-react";

const steps = [
  { emoji: "💡", title: "Ajattelu", text: "Näet ja johdat eri tavalla" },
  { emoji: "⚙️", title: "Toiminta", text: "Viet opit suoraan omaan työhösi" },
  { emoji: "🤖", title: "Työkalut", text: "Otat modernit työkalut – myös tekoälyn – käyttöön" },
  { emoji: "🌱", title: "Kulttuuri", text: "Vaikutat tiimiin ja koko organisaatioon" },
];

export function AlyPhilosophySection() {
  return (
    <section className="py-12 md:py-16 bg-accent/50">
      <div className="keuda-container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Näin kehität osaamistasi – ei vain opi uutta
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-[620px] mx-auto leading-relaxed">
            Koulutuksemme eivät ole irrallisia kursseja. Ne rakentavat osaamista
            vaiheittain – ajattelusta käytäntöön ja kulttuuriin.
          </p>
        </div>

        {/* Desktop: horizontal process */}
        <div className="hidden md:flex items-start justify-center gap-0 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-start">
              <div className="flex flex-col items-center text-center w-44">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl mb-3">
                  {step.emoji}
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed px-2">{step.text}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center pt-6 px-1">
                  <div className="w-8 h-px bg-border" />
                  <ArrowRight className="w-4 h-4 text-primary/50 -ml-1" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: stacked */}
        <div className="flex md:hidden flex-col items-center gap-4 max-w-xs mx-auto">
          {steps.map((step, i) => (
            <div key={step.title}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl flex-shrink-0">
                  {step.emoji}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="w-px h-4 bg-border" />
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm italic text-muted-foreground mt-8">
          Kehitys ei jää yksilötasolle – se näkyy tavassa toimia.
        </p>
      </div>
    </section>
  );
}
