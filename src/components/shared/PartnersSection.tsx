export function PartnersSection() {
  const partners = [
    { name: "Keuda", desc: "Koulutus ja osaamisen kehittäminen siirtymän tueksi." },
    { name: "RTK Henkilöstöpalvelu", desc: "Työllistymisväylät ja henkilöstövuokrausratkaisut." },
    { name: "Valo-Valmennusyhdistys", desc: "Yksilöllinen valmennus ja tuki työelämäsiirtymissä." },
    { name: "Cleodia Group", desc: "Yrittäjyyden ja liiketoiminnan käynnistämisen tuki." },
    { name: "Pohjamonni", desc: "Verkostot ja alustat kevytyrittäjille ja toimeksiantojen tekijöille." },
    { name: "Wulff PRO", desc: "Työelämän käytännön työkalut ja palveluratkaisut." },
    { name: "Linduistics", desc: "Kieli- ja viestintäosaaminen työelämään ja työnhakuun." },
  ];

  return (
    <section className="py-16 md:py-20 bg-accent/30">
      <div className="keuda-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Toimijat</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ratkaisut toteutetaan yhteistyössä kokeneiden toimijoiden ja asiantuntijoiden kanssa.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="keuda-card-enhanced flex flex-col items-center justify-center p-5 md:p-6 text-center min-h-[100px]"
            >
              <p className="text-sm md:text-base font-medium text-foreground mb-1">{partner.name}</p>
              <p className="text-xs text-muted-foreground leading-snug">{partner.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
