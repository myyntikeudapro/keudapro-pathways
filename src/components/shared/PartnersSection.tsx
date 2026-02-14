export function PartnersSection() {
  const partners = [
    "Keuda",
    "RTK Henkilöstöpalvelu",
    "Valo-Valmennusyhdistys",
    "Cleodia Group",
    "Pohjamonni",
    "Wulff PRO",
    "Linduistics",
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

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {partners.map((partner) => (
            <div
              key={partner}
              className="keuda-card-enhanced flex items-center justify-center p-5 md:p-6 text-center min-h-[72px]"
            >
              <p className="text-sm md:text-base font-medium text-foreground">{partner}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
