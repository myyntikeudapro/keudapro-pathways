import solutionBg from "@/assets/solution-families-bg.jpg";

const families = [
  { title: "Myynti ja asiakashankinta", href: "#myynti" },
  { title: "Markkinointi ja asiakaskokemus", href: "#markkinointi" },
  { title: "Tekoäly ja digitalisaatio", href: "#tekoaly" },
  { title: "Prosessit ja tuottavuus", href: "#prosessit" },
  { title: "Osaamisen kehittäminen", href: "#osaaminen" },
  { title: "Omistajanvaihdos ja siirtymät", href: "#omistajanvaihdos" },
];

export function SolutionFamilies() {
  return (
    <section className="relative w-full">
      {/* Background image + dark overlay */}
      <div className="absolute inset-0">
        <img
          src={solutionBg}
          alt="Kehittämistyöpaja"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 py-20 md:py-32">
        <div className="keuda-container max-w-5xl">
          {/* Kicker */}
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-3">
            Ratkaisuperheet
          </p>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
            Valitse teema – me kokoamme toteutuksen
          </h2>

          {/* Subtitle */}
          <p className="text-white/70 text-lg mb-12">
            Sparraus – pilotointi – valmennus – projekti
          </p>

          {/* Solution family cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {families.map((family) => (
              <a
                key={family.title}
                href={family.href}
                className="group bg-white/95 hover:bg-white rounded-xl px-5 py-5 shadow-sm hover:shadow-lg border border-white/20 transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
              >
                <h3 className="font-semibold text-foreground text-base mb-1.5">
                  {family.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Sparraus – pilotointi – valmennus – projekti
                </p>
                <span className="text-sm font-medium text-primary mt-auto group-hover:underline">
                  Lue lisää →
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
