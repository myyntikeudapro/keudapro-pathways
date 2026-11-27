import { ArrowRight, Clock3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { NextStepState } from '@/lib/workspaceNextStep';
import { readinessLabel } from '@/lib/companyTrainingWorkflow';
import { STAGE_LABEL, type Stage } from '@/lib/productionBoard';

export function NextStep({ step, owner }: { step: NextStepState; owner?: string | null }) {
  const location = useLocation();
  const destination = (href: string) => {
    const u = new URL(href, 'https://workspace.invalid');
    if (location.pathname.startsWith('/admin/asiakkaat')) u.searchParams.set('paluuKortti', location.pathname + location.search);
    else {
      const back = new URLSearchParams(location.search).get('paluuKortti');
      if (back?.startsWith('/admin/asiakkaat')) u.searchParams.set('paluuKortti', back);
    }
    return u.pathname + u.search;
  };
  return <section aria-label="Seuraava vaihe" className="min-w-0 space-y-2 border-y border-border bg-muted/40 px-3 py-3">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-semibold text-muted-foreground">Seuraava vaihe</p>
        <p className="break-words font-semibold text-keuda-navy-section">{STAGE_LABEL[step.stage as Stage] ?? step.stage}</p>
        <p className="break-words text-xs text-muted-foreground">{step.waiting && <Clock3 className="mr-1 inline h-3 w-3" />}{step.waiting ? `Odottaa vastuuhenkilöä – ${step.role}` : step.role}{owner ? ` · ${owner}` : step.ownerId ? ' · Nimi ei saatavilla' : ' · Vastuuhenkilö puuttuu'}</p>
      </div>
      {step.action && <Button asChild className="h-auto max-w-full shrink-0 whitespace-normal py-2 text-left sm:max-w-72"><Link to={destination(step.action.href)}>{step.action.label}<ArrowRight className="ml-2 h-4 w-4 shrink-0" /></Link></Button>}
    </div>
    {!!step.issues.length && <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Tarkistettavaa ({step.issues.length})</summary><ul className="mt-2 list-disc space-y-1 pl-4">{step.issues.map((s, i) => <li key={i} className="break-words">{readinessLabel(s)}</li>)}</ul></details>}
    {step.billingHref && <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2 text-xs text-muted-foreground"><span>Sopimuslaskutus etenee erikseen: alkaessa, osissa tai päättyessä.</span><Button asChild variant="link" size="sm" className="h-auto whitespace-normal p-0 text-xs"><Link to={destination(step.billingHref)}>Avaa laskutussuunnitelma</Link></Button></div>}
  </section>;
}