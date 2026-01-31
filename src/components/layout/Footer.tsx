import kuumaLogo from "@/assets/logo-kuuma.svg";

export function Footer() {
  return (
    <footer className="border-t border-border">
      {/* KUUMA-seutu Section */}
      <div className="bg-muted/50 py-6">
        <div className="keuda-container">
          <a 
            href="https://kuuma.fi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src={kuumaLogo} 
              alt="KUUMA-seutu" 
              className="h-12 md:h-14"
            />
            <p className="text-xs text-muted-foreground text-center">
              Hyvinkää, Järvenpää, Kerava, Kirkkonummi, Mäntsälä, Nurmijärvi, Pornainen, Sipoo, Tuusula ja Vihti
            </p>
          </a>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-muted/30 py-6">
        <div className="keuda-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
