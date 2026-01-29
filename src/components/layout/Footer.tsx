export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="keuda-container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            KeudaPRO – osaamisen ja siirtymien operaattori.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} KeudaPRO. Kaikki oikeudet pidätetään.
          </p>
        </div>
      </div>
    </footer>
  );
}
