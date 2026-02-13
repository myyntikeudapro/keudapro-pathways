import { SectionHeading } from "@/components/shared/SectionHeading";

interface Program {
  title: string;
  description?: string;
  buttonText: string;
  isComingSoon?: boolean;
}

interface Category {
  id: string;
  title: string;
  intro: string;
  programs: Program[];
}

const categories: Category[] = [
  {
    id: "valmennusohjelmat",
    title: "Johtamisen valmennusohjelmat",
    intro: "Valmennusohjelmat strategiseen johtamiseen, esihenkilötyöhön ja osaamisen kehittämiseen.",
    programs: [
      { title: "Osaamisen johtamisen valmennusohjelma", buttonText: "Katso ohjelma" },
      { title: "Johtamisen ja esihenkilötyön valmennukset", buttonText: "Lue lisää" },
      { title: "Räätälöidyt valmennukset kunnille ja yrityksille", buttonText: "Ota yhteyttä" },
      { title: "Puitesopimukset", buttonText: "Lue lisää" },
    ],
  },
  {
    id: "ai-ohjelmat",
    title: "Tekoälypätevyys-ohjelmat",
    intro: "Rakennettu eri rooleille – strategiasta käyttöönottoon.",
    programs: [
      { title: "AI-Director", description: "Strateginen tekoälyjohtaminen", buttonText: "Katso ohjelma" },
      { title: "AI-Manager", description: "Tekoäly johtamistyössä", buttonText: "Katso ohjelma" },
      { title: "AI-Coordinator", description: "Tekoälyn koordinointi ja käyttöönotto", buttonText: "Katso ohjelma" },
      { title: "AI-Kaksonen", description: "Johtajan ja asiantuntijan AI & uudistuminen", buttonText: "Katso ohjelma" },
      { title: "Hyper Engineering", description: "Uusi valmennusohjelma", buttonText: "Lue lisää" },
      { title: "Yrittäjä AI -ohjelma", buttonText: "Ilmoita kiinnostus", isComingSoon: true },
    ],
  },
  {
    id: "turvallisuus",
    title: "Turvallisuusjohtaminen",
    intro: "Turvallisuus osa johtamista ja vastuullista organisaatiota.",
    programs: [
      { title: "Turvallisuuspäällikön valmennusohjelma", buttonText: "Katso ohjelma" },
      { title: "Turvallisuusasiantuntijan valmennusohjelma", buttonText: "Katso ohjelma" },
      { title: "Turvallisuusjohtajan valmennusohjelma (ml. AI)", description: "Tulossa syksyllä 2026", buttonText: "Ilmoita kiinnostus", isComingSoon: true },
    ],
  },
  {
    id: "tutkinnot",
    title: "Tutkintotavoitteiset ratkaisut",
    intro: "Yrityskohtaiset ratkaisut osana tutkintoja.",
    programs: [
      { title: "Johtamisen EAT ja Lähiesimiestyön AT -ratkaisut yrityksille", buttonText: "Lue lisää" },
    ],
  },
];

function ProgramCard({ program }: { program: Program }) {
  return (
    <div className="keuda-card p-5 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-start gap-2">
          <h4 className="text-base font-semibold text-foreground">{program.title}</h4>
          {program.isComingSoon && (
            <span className="keuda-badge text-xs flex-shrink-0">Tulossa</span>
          )}
        </div>
        {program.description && (
          <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          {program.buttonText}
        </a>
      </div>
    </div>
  );
}

export function AlySolutionCategories() {
  return (
    <section className="keuda-section">
      <div className="keuda-container">
        <SectionHeading title="Ratkaisut" />

        <div className="mt-12 space-y-16">
          {categories.map((cat) => (
            <div key={cat.id} id={cat.id}>
              <h3 className="text-xl font-semibold text-foreground mb-2">{cat.title}</h3>
              <p className="text-muted-foreground mb-6">{cat.intro}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.programs.map((program) => (
                  <ProgramCard key={program.title} program={program} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
