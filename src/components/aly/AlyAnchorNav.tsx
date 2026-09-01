const links = [
  { id: "tekoalypatevyydet", label: "Tekoälypätevyydet" },
  { id: "vertaa-tasoja", label: "Vertaa tasoja" },
  { id: "loyda-oma-tasosi", label: "Löydä oma tasosi" },
  { id: "organisaatioille", label: "Organisaatioille" },
  { id: "referenssit", label: "Asiakaspalaute" },
  { id: "alkavat-koulutukset", label: "Alkavat koulutukset" },
];

export function AlyAnchorNav() {
  return (
    <nav
      aria-label="Sivun osiot"
      className="border-b border-border bg-background/95 backdrop-blur sticky top-16 z-30 shadow-sm"
    >
      <div className="keuda-container relative">
        <ul className="flex gap-2 overflow-x-auto py-3 text-sm snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((l) => (
            <li key={l.id} className="snap-start shrink-0">
              <a
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(l.id);
                  if (!el) return;
                  const y = el.getBoundingClientRect().top + window.scrollY - 110;
                  window.scrollTo({ top: y, behavior: "smooth" });
                  window.history.replaceState(null, "", `#${l.id}`);
                }}
                className="inline-flex items-center min-h-11 whitespace-nowrap rounded-full border border-border px-4 py-1.5 font-medium text-foreground hover:border-primary hover:text-primary active:bg-accent transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        {/* Vihje vieritettävyydestä mobiilissa */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent md:hidden"
        />
      </div>
    </nav>
  );
}
