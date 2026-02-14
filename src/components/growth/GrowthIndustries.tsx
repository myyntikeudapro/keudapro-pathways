import { Button } from "@/components/ui/button";
import industriesBg from "@/assets/growth-industries-bg.jpg";

const tiers = [
  {
    id: "ydinmoottorit",
    title: "Ydinmoottorit",
    subtitle: "Kasvun kärki",
    accentColor: "primary",
    items: [
      { label: "Logistiikka", href: "#logistiikka" },
      { label: "Energia & vihreä siirtymä", href: "#energia" },
      { label: "Moderni teollisuus", href: "#teollisuus" },
    ],
  },
  {
    id: "mahdollistajat",
    title: "Kasvun mahdollistajat",
    subtitle: "Rakenteellinen voima",
    accentColor: "secondary",
    items: [
      { label: "Rakentaminen & kiinteistökehitys (MAL)", href: "#rakentaminen" },
      { label: "ICT & digipalvelut", href: "#ict" },
    ],
  },
  {
    id: "perusrakenne",
    title: "Perusrakenne",
    subtitle: "Vakaa pohja",
    accentColor: "muted-foreground",
    items: [
      { label: "Kauppa & palvelut", href: "#kauppa" },
      { label: "Hyvinvointi", href: "#hyvinvointi" },
      { label: "Ruoka-ala", href: "#ruoka" },
    ],
  },
];

const accentStyles: Record<string, { bar: string; card: string; cardHover: string }> = {
  primary: {
    bar: "bg-primary",
    card: "bg-white/15 border-primary/30 hover:border-primary/60",
    cardHover: "hover:shadow-lg",
  },
  secondary: {
    bar: "bg-secondary",
    card: "bg-white/12 border-secondary/25 hover:border-secondary/50",
    cardHover: "hover:shadow-md",
  },
  "muted-foreground": {
    bar: "bg-muted-foreground/60",
    card: "bg-white/10 border-white/15 hover:border-white/30",
    cardHover: "hover:shadow-md",
  },
};

export function GrowthIndustries() {
  return (
    <section className="relative w-full">
      {/* Background image + overlay */}
      <div className="absolute inset-0">
        <img
          src={industriesBg}
          alt="KUUMA-alueen yritysympäristö"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/65" />
      </div>

      <div className="relative z-10 py-16 md:py-24">
        <div className="keuda-container">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Kasvun kartta: KUUMA-alueen kasvualat
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-4">
              Kasvu ei jakaudu tasaisesti. Siksi KeudaPRO kohdistaa kehittämisen
              toimialoihin, joissa murros ja potentiaali ovat suurimmat.
            </p>
            <p className="text-white font-semibold text-sm tracking-wide uppercase">
              Kasvuala ei ole trendisana – se on dataan perustuva suunta.
            </p>
          </div>

          {/* Three tiers */}
          <div className="space-y-8 max-w-5xl mx-auto">
            {tiers.map((tier) => {
              const styles = accentStyles[tier.accentColor];
              return (
                <div key={tier.id}>
                  {/* Tier header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-1 rounded-full ${styles.bar}`} />
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {tier.title}
                      </h3>
                      <span className="text-xs text-white/60 font-medium">
                        {tier.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Industry cards */}
                  <div
                    className={`grid gap-3 ${
                      tier.items.length === 2
                        ? "sm:grid-cols-2"
                        : "sm:grid-cols-3"
                    }`}
                  >
                    {tier.items.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className={`
                          block rounded-xl border backdrop-blur-sm px-5 py-4
                          text-white font-medium text-sm
                          transition-all duration-200
                          hover:-translate-y-0.5
                          ${styles.card} ${styles.cardHover}
                        `}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild className="border-white/40 text-white hover:bg-white/10 hover:text-white">
              <a href="#ratkaisuperheet">Katso toimialakohtaiset ratkaisut</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
