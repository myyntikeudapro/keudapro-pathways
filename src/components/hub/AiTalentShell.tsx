import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  email?: string | null;
  onSignOut?: () => void;
  crumb?: string;
}

export function AiTalentShell({ children, email, onSignOut, crumb }: Props) {
  useEffect(() => { document.title = "AI Talent · KeudaPRO Hub"; }, []);
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>AI Talent · KeudaPRO Hub</title>
        <meta name="description" content="Nuorten AI-osaamis- ja työllistymisohjelma. Opi, rakenna, näytä, työllisty tai työllistä itsesi." />
        <meta property="og:title" content="AI Talent · KeudaPRO Hub" />
        <meta property="og:description" content="Nuorten AI-osaamis- ja työllistymisohjelma. Opi, rakenna, näytä, työllisty tai työllistä itsesi." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <header className="border-b border-border bg-card">
        <div className="keuda-container flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/hub" className="font-bold text-lg text-[hsl(var(--keuda-blue))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              KeudaPRO <span className="text-keuda-orange">Hub</span>
            </Link>
            <nav aria-label="Murupolku" className="text-sm text-muted-foreground">
              <ol className="flex items-center gap-1.5">
                <li><Link to="/hub" className="hover:text-foreground underline-offset-2 hover:underline">Projektit</Link></li>
                <li aria-hidden>›</li>
                <li><Link to="/hub/ai-talent" aria-current={crumb ? undefined : "page"} className="hover:text-foreground underline-offset-2 hover:underline">AI Talent</Link></li>
                {crumb && (<><li aria-hidden>›</li><li aria-current="page" className="text-foreground">{crumb}</li></>)}
              </ol>
            </nav>
          </div>
          {email && (
            <div className="flex min-w-0 items-center gap-3">
              <span className="truncate text-sm text-muted-foreground max-w-[200px] sm:max-w-none">{email}</span>
              <Button variant="outline" size="sm" onClick={onSignOut}>Kirjaudu ulos</Button>
            </div>
          )}
        </div>
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="bg-[#0B0B0B] text-white/70 text-sm">
        <div className="keuda-container flex flex-col sm:flex-row gap-2 justify-between py-6">
          <span>© Keuda Koulutuspalvelut Oy · KeudaPRO</span>
          <span>
            <a href="https://keudapro.fi" target="_blank" rel="noopener noreferrer" className="hover:text-white underline-offset-2 hover:underline">keudapro.fi</a>
            {" · "}
            <a href="https://www.keuda.fi" target="_blank" rel="noopener noreferrer" className="hover:text-white underline-offset-2 hover:underline">keuda.fi</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
