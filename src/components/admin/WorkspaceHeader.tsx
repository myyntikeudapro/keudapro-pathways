import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const ghost = "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground";

/** Yhtenäinen tumma työtilan yläpalkki kaikille hallintasivuille. */
export function WorkspaceHeader({ title, subtitle, onSignOut, home = true, actions, children }: {
  title: string; subtitle?: ReactNode; onSignOut?: () => void; home?: boolean; actions?: ReactNode; children?: ReactNode;
}) {
  return <header className="bg-keuda-hero-surface text-primary-foreground">
    <div className="container mx-auto px-4 pt-5 pb-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-keuda-amber">KeudaPRO · Työtila</p>
          <h1 className="text-xl sm:text-2xl font-semibold mt-1 text-primary-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-keuda-hero-muted break-all">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-1 shrink-0">
          {actions}
          {home && <Button asChild variant="ghost" size="sm" className={ghost}><Link to="/admin" aria-label="Tilannekeskus"><Home className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Hallinta</span></Link></Button>}
          {onSignOut && <Button variant="ghost" size="sm" onClick={onSignOut} aria-label="Kirjaudu ulos" className={ghost}><LogOut className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Ulos</span></Button>}
        </div>
      </div>
      {children}
    </div>
  </header>;
}
export const headerGhost = ghost;
