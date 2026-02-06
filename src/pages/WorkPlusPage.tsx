import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { 
  Compass, 
  Lightbulb, 
  Rocket, 
  Eye, 
  FileText, 
  MessageSquare, 
  Map, 
  Brain, 
  Users, 
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Clock,
  Target,
  Sparkles
} from "lucide-react";

// Polkujen data
const paths = [
  {
    id: "polku1",
    title: "Etsin suuntaa",
    subtitle: "Rinnalla kulkeva valmennus",
    description: "Kun työnhakutaidot tai työelämävalmiudet vaativat vahvaa ja pitkäjänteistä tukea.",
    icon: Compass,
    bullets: ["Työelämätaidot", "Arjen rytmi", "Motivaatio", "Valmentajan tuki"],
    content: {
      items: [
        "Työelämätaidot",
        "Arjen rytmi",
        "Motivaatio",
        "Perusvalmiudet",
        "Valmentajan tuki",
        "Ohjatut siirtymäpolut (1–3 kk)"
      ],
      ctaText: "Aloita kartoituksella",
      ctaHref: "https://example.com/kartoitus"
    }
  },
  {
    id: "polku2",
    title: "Suunta kirkkaaksi",
    subtitle: "AI + valmennus",
    description: "Kun osaaminen on olemassa mutta suunta, profiili tai pitchaus vaatii kirkastamista.",
    icon: Lightbulb,
    bullets: ["Osaamisen kirkastus", "Profiili", "Pitchaus", "CV & LinkedIn", "AI-työkalut"],
    content: {
      items: [
        "Osaamisen kirkastus",
        "Profiili",
        "Pitchaus",
        "CV & LinkedIn",
        "AI-työkalupakki + sparraus (ryhmä/yksilö)"
      ],
      ctaText: "Katso ratkaisut",
      ctaHref: "#ratkaisutarjotin"
    }
  },
  {
    id: "polku3",
    title: "Suoraan työelämään",
    subtitle: "Nopea ratkaisu",
    description: "Kun tavoitteena on nopea työllistyminen ja käytännön työkalut sekä työllistymiskanavat.",
    icon: Rocket,
    bullets: ["CV/pitchaus-työkalu", "Osaamiskartoitus", "Hakemukset", "Haastattelusparraus", "Henkilöstöratkaisut"],
    content: {
      items: [
        "CV / Pitchaus-työkalu",
        "Osaamiskartoitus",
        "Hakemukset nopeasti",
        "Haastattelusparraus",
        "Henkilöstöratkaisut (Wulff PRO / RTK-Henkilöstöpalvelu / Cleodia Group, Pohjanmonni)"
      ],
      ctaText: "Siirry suoraan ratkaisuihin",
      ctaHref: "#ratkaisutarjotin"
    }
  }
];

// Ratkaisukategoriat
const solutionCategories = [
  {
    id: "osaaminen",
    title: "Osaaminen näkyväksi",
    icon: Eye,
    solutions: ["Osaamiskartoitus", "Osaamisen tunnistaminen", "Portfolio-valmennus", "Näyttöjen valmistelu"]
  },
  {
    id: "cv-linkedin",
    title: "CV & LinkedIn kuntoon",
    icon: FileText,
    solutions: ["CV-paja", "LinkedIn-profiili", "Digitaalinen portfolio", "Personal branding"]
  },
  {
    id: "haastattelut",
    title: "Haastattelut ja itseluottamus",
    icon: MessageSquare,
    solutions: ["Haastattelusparraus", "Pitchaus-valmennus", "Esiintymistaito", "Itseluottamus-valmennus"]
  },
  {
    id: "urakartoitus",
    title: "Uusi suunta / urakartoitus",
    icon: Map,
    solutions: ["Uravalmennus", "Suuntakartoitus", "Alanvaihto-ohjaus", "Tavoitteiden kirkastus"]
  },
  {
    id: "ai-osaaminen",
    title: "AI-osaaminen ja markkina-arvon nosto",
    icon: Brain,
    solutions: ["AI-perusteet", "AI arjessa ja työssä", "Tekoälypätevyys", "Digitaidot"]
  },
  {
    id: "verkostot",
    title: "Verkostot ja kontaktit",
    icon: Users,
    solutions: ["Verkostoitumistapahtumat", "Mentorointi", "Työnantajakontaktit", "Alumni-verkostot"]
  },
  {
    id: "siirtymapolut",
    title: "Ohjatut siirtymäpolut",
    icon: Target,
    solutions: ["Muutosturva-ohjelmat", "Siirtymävalmennus", "Työllistymispolut", "Jatkopolut"]
  },
  {
    id: "koulutus",
    title: "Koulutus ja mikrokoulutukset",
    icon: GraduationCap,
    solutions: ["Mikrokoulutukset", "Täsmäkoulutukset", "Sertifikaatit", "Lyhytkoulutukset"]
  }
];

// Toimijaverkoston kumppanit
const networkPartners = [
  { name: "Keuda", logo: null },
  { name: "KeudaPRO", logo: null },
  { name: "Wulff PRO", logo: null },
  { name: "RTK-Henkilöstöpalvelu", logo: null },
  { name: "Cleodia Group", logo: null },
  { name: "Pohjanmonni", logo: null }
];

const WorkPlusPage = () => {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [openSolution, setOpenSolution] = useState<string | null>(null);
  const pathsSectionRef = useRef<HTMLElement>(null);

  const scrollToPaths = () => {
    pathsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const togglePath = (pathId: string) => {
    setOpenPath(openPath === pathId ? null : pathId);
  };

  const toggleSolution = (solutionId: string) => {
    setOpenSolution(openSolution === solutionId ? null : solutionId);
  };

  return (
    <Layout>
      {/* 1) HERO-OSIO */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-accent/60 via-accent/30 to-background overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-secondary blur-3xl" />
        </div>
        
        <div className="keuda-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Reitti työhön ja uuteen suuntaan</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              NOSTE
            </h1>
            
            <p className="text-xl md:text-2xl font-medium text-foreground mb-4">
              Löydä tilanteeseesi sopiva reitti työhön tai uuteen suuntaan
            </p>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Valitse polku ja löydä valmiit ratkaisut. Nopea tapa löytää tuki, työkalut ja toteuttajat.
            </p>
            
            <Button 
              variant="cta" 
              size="xl" 
              onClick={scrollToPaths}
              className="group"
            >
              Aloita valitsemalla polku
              <ChevronDown className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* 2) VALITSE SIIRTYMÄREITTI */}
      <section ref={pathsSectionRef} className="py-16 md:py-20 bg-muted/30">
        <div className="keuda-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Valitse siirtymäreitti
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kolme polkua erilaisiin tilanteisiin – valitse omasi ja löydä sopivat ratkaisut.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {paths.map((path) => {
              const IconComponent = path.icon;
              const isOpen = openPath === path.id;
              
              return (
                <div key={path.id} className="flex flex-col">
                  {/* Kortti */}
                  <button
                    onClick={() => togglePath(path.id)}
                    className={`keuda-card-enhanced text-left flex flex-col h-full transition-all ${
                      isOpen ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10">
                        <IconComponent className="w-7 h-7 text-primary" />
                      </div>
                      <div className={`p-2 rounded-full transition-colors ${isOpen ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {path.title}
                    </h3>
                    <p className="text-sm font-medium text-primary mb-3">
                      {path.subtitle}
                    </p>
                    <p className="text-muted-foreground mb-4 flex-1">
                      {path.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {path.bullets.slice(0, 3).map((bullet, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
                          {bullet}
                        </span>
                      ))}
                      {path.bullets.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          +{path.bullets.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* 3) POLKUJEN SISÄLLÖT */}
          {openPath && (
            <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
              {paths.filter(p => p.id === openPath).map((path) => {
                const IconComponent = path.icon;
                return (
                  <div key={path.id} className="bg-card rounded-2xl border-2 border-primary/30 p-8 md:p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{path.title}</h3>
                        <p className="text-primary font-medium">{path.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                      {path.content.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-accent/50">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <span className="text-secondary-foreground font-semibold text-sm">{idx + 1}</span>
                          </div>
                          <span className="text-foreground font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-center">
                      <Button variant="cta" size="lg" asChild>
                        <a href={path.content.ctaHref}>
                          {path.content.ctaText}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4) RATKAISUTARJOTIN */}
      <section id="ratkaisutarjotin" className="py-16 md:py-20">
        <div className="keuda-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ratkaisutarjotin – valitse tarpeesi
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Valmiit ratkaisut kategorioittain. Klikkaa ja löydä sopivat palvelut.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutionCategories.map((category) => {
              const IconComponent = category.icon;
              const isOpen = openSolution === category.id;
              
              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleSolution(category.id)}
                    className={`w-full keuda-card-enhanced text-left transition-all ${
                      isOpen ? "ring-2 ring-secondary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10">
                        <IconComponent className="w-6 h-6 text-secondary" />
                      </div>
                      <div className={`p-1.5 rounded-full transition-colors ${isOpen ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                    <h4 className="text-base font-semibold text-foreground leading-tight">
                      {category.title}
                    </h4>
                  </button>
                  
                  {isOpen && (
                    <div className="mt-3 p-4 bg-accent/50 rounded-xl border border-border animate-in fade-in slide-in-from-top-2 duration-200">
                      <ul className="space-y-2">
                        {category.solutions.map((solution, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            {solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5) TOIMIJAVERKOSTO */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="keuda-container">
          <div className="text-center mb-10">
            <SectionHeading 
              title="Toimijaverkosto ja toteuttajat" 
              subtitle="NOSTE-reitin ratkaisut toteutetaan yhdessä laajan toimijaverkoston kanssa."
              centered
            />
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-10">
            {networkPartners.map((partner, idx) => (
              <div 
                key={idx} 
                className="px-6 py-3 bg-card rounded-lg border border-border shadow-sm"
              >
                <span className="font-medium text-foreground">{partner.name}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline-primary" size="lg" asChild>
              <a href="/kumppanit">
                Tutustu toimijaverkostoon
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-accent/50">
        <div className="keuda-container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">15 minuuttia</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Etkö tiedä mistä aloittaa?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Tee nopea reittikartoitus ja löydä tilanteeseesi sopivat ratkaisut.
          </p>
          <Button variant="cta" size="lg" asChild>
            <a href="https://example.com/kartoitus" target="_blank" rel="noopener noreferrer">
              Tee 15 min reittikartoitus
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default WorkPlusPage;
