export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="keuda-container py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="font-bold text-foreground mb-1">KUUMA-seutu</p>
            <p className="text-xs text-muted-foreground">
              Hyvinkää, Järvenpää, Kerava, Kirkkonummi, Mäntsälä, Nurmijärvi, Pornainen, Sipoo, Tuusula ja Vihti
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full pt-4 border-t border-border">
            <p className="text-sm text-foreground">
              <span className="font-bold">KeudaPRO</span> – osaamisen ja siirtymien operaattori.
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} KeudaPRO. Kaikki oikeudet pidätetään.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
