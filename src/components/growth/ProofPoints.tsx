const stats = [
  { value: "150+", label: "yrityksiä mukana" },
  { value: "50+", label: "piloteja toteutettu" },
  { value: "200+", label: "osaamisratkaisuja rakennettu" }
];

export function ProofPoints() {
  return (
    <section className="keuda-section bg-primary/5">
      <div className="keuda-container">
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
