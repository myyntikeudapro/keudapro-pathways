import { Badge } from "@/components/ui/badge";
import industriesBg from "@/assets/growth-industries-bg.jpg";

const tiers = [
  {
    id: "ydinmoottorit",
    label: "YDINMOOTTORIT",
    subtitle: "Kasvun kärki",
    dotColor: "bg-primary",
    items: [
      { label: "Logistiikka", href: "#logistiikka" },
      { label: "Energia & vihreä siirtymä", href: "#energia" },
      { label: "Moderni teollisuus", href: "#teollisuus" },
    ],
  },
  {
    id: "mahdollistajat",
    label: "KASVUN MAHDOLLISTAJAT",
    subtitle: "Rakenteellinen voima",
    dotColor: "bg-secondary",
    items: [
      { label: "Rakentaminen & kiinteistökehitys (MAL)", href: "#rakentaminen" },
      { label: "ICT & digipalvelut", href: "#ict" },
    ],
  },
  {
    id: "perusrakenne",
    label: "PERUSRAKENNE",
    subtitle: "Vakaa pohja",
    dotColor: "bg-yellow-400",
    items: [
      { label: "Kauppa & palvelut", href: "#kauppa" },
      { label: "Hyvinvointi", href: "#hyvinvointi" },
      { label: "Ruoka-ala", href: "#ruoka" },
    ],
  },
];

export function GrowthIndustries() {
  return (
    <section className="relative w-full">
      {/* Background image + dark overlay */}
      <div className="absolute inset-0">
        <img
          src={industriesBg}
          alt="KUUMA-alueen yritysympäristö"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 py-20 md:py-32">
        <div className="keuda-container text-center">
          {/* Kicker */}
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-3">
            Kasvun kartta
          </p>

          {/* Main heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            KUUMA-alueen kasvualat
          </h2>

          {/* Intro */}
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-2">
            Kasvu ei jakaudu tasaisesti – siksi kohdistamme kehittämisen
            toimialoihin, joissa murros ja potentiaali ovat suurimmat.
          </p>

          {/* Highlighted phrase */}
          <p className="text-white font-semibold text-sm tracking-wide mb-12">
            Dataan perustuva suunta.
          </p>

          {/* Three tier groups with pill tags */}
          <div className="space-y-8">
            {tiers.map((tier) => (
              <div key={tier.id}>
                {/* Tier label with color dot */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${tier.dotColor} shrink-0`} />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/70">
                    {tier.label}
                  </span>
                  <span className="text-xs text-white/40 ml-1">— {tier.subtitle}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2">
                  {tier.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="inline-flex items-center rounded-full bg-white/90 hover:bg-white text-foreground px-4 py-2 text-sm font-medium shadow-sm border border-white/20 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
